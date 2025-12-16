const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// DynamoDB Configuration
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  // Credentials will be picked up from IAM role in EKS, or AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY for local
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Table names from environment variables
const PHOTOS_TABLE = process.env.PHOTOS_TABLE || 'cat-blog-photos';
const COMMENTS_TABLE = process.env.COMMENTS_TABLE || 'cat-blog-comments';
const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE || 'cat-blog-analytics';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'cat-blog-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Get all photos
app.get('/api/photos', async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: PHOTOS_TABLE
    }));
    
    const photos = result.Items || [];
    // Ensure likes is a number, default to 0
    photos.forEach(photo => {
      photo.likes = photo.likes || 0;
    });
    
    res.json({ photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// Get photo by ID
app.get('/api/photos/:id', async (req, res) => {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: PHOTOS_TABLE,
      Key: { id: req.params.id }
    }));
    
    if (!result.Item) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    const photo = result.Item;
    photo.likes = photo.likes || 0;
    res.json({ photo });
  } catch (error) {
    console.error('Error fetching photo:', error);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
});

// Like a photo
app.post('/api/photos/:id/like', async (req, res) => {
  try {
    // First, check if photo exists
    const getResult = await docClient.send(new GetCommand({
      TableName: PHOTOS_TABLE,
      Key: { id: req.params.id }
    }));
    
    if (!getResult.Item) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    // Increment likes using UpdateCommand
    const updateResult = await docClient.send(new UpdateCommand({
      TableName: PHOTOS_TABLE,
      Key: { id: req.params.id },
      UpdateExpression: 'SET likes = if_not_exists(likes, :zero) + :inc',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':zero': 0
      },
      ReturnValues: 'ALL_NEW'
    }));
    
    const photo = updateResult.Attributes;
    photo.likes = photo.likes || 0;
    
    res.json({ photo });
  } catch (error) {
    console.error('Error liking photo:', error);
    res.status(500).json({ error: 'Failed to like photo' });
  }
});

// Get comments for a photo
app.get('/api/photos/:id/comments', async (req, res) => {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: COMMENTS_TABLE,
      IndexName: 'photoId-index', // GSI on photoId
      KeyConditionExpression: 'photoId = :photoId',
      ExpressionAttributeValues: {
        ':photoId': req.params.id
      }
    }));
    
    const comments = result.Items || [];
    // Sort by timestamp (newest first)
    comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({ comments });
  } catch (error) {
    // If GSI doesn't exist, fall back to scan and filter
    if (error.name === 'ResourceNotFoundException' || error.message.includes('index')) {
      try {
        const scanResult = await docClient.send(new ScanCommand({
          TableName: COMMENTS_TABLE,
          FilterExpression: 'photoId = :photoId',
          ExpressionAttributeValues: {
            ':photoId': req.params.id
          }
        }));
        
        const comments = scanResult.Items || [];
        comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        res.json({ comments });
      } catch (scanError) {
        console.error('Error fetching comments:', scanError);
        res.status(500).json({ error: 'Failed to fetch comments' });
      }
    } else {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  }
});

// Add a comment
app.post('/api/photos/:id/comments', async (req, res) => {
  try {
    const { author, text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    // Verify photo exists
    const photoResult = await docClient.send(new GetCommand({
      TableName: PHOTOS_TABLE,
      Key: { id: req.params.id }
    }));
    
    if (!photoResult.Item) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const comment = {
      id: uuidv4(),
      photoId: req.params.id,
      author: author || 'Anonymous',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: COMMENTS_TABLE,
      Item: comment
    }));

    res.status(201).json({ comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get visitor count
app.get('/api/analytics/visitors', async (req, res) => {
  try {
    const result = await docClient.send(new UpdateCommand({
      TableName: ANALYTICS_TABLE,
      Key: { id: 'visitor-count' },
      UpdateExpression: 'SET #count = if_not_exists(#count, :zero) + :inc',
      ExpressionAttributeNames: {
        '#count': 'count'
      },
      ExpressionAttributeValues: {
        ':inc': 1,
        ':zero': 0
      },
      ReturnValues: 'ALL_NEW'
    }));
    
    const count = result.Attributes?.count || 0;
    res.json({ count });
  } catch (error) {
    console.error('Error updating visitor count:', error);
    res.status(500).json({ error: 'Failed to update visitor count' });
  }
});

// Get analytics summary
app.get('/api/analytics/summary', async (req, res) => {
  try {
    // Get all photos
    const photosResult = await docClient.send(new ScanCommand({
      TableName: PHOTOS_TABLE
    }));
    const photos = photosResult.Items || [];
    const totalLikes = photos.reduce((sum, p) => sum + (p.likes || 0), 0);
    
    // Get all comments
    const commentsResult = await docClient.send(new ScanCommand({
      TableName: COMMENTS_TABLE
    }));
    const totalComments = commentsResult.Items?.length || 0;
    
    // Get visitor count
    const visitorResult = await docClient.send(new GetCommand({
      TableName: ANALYTICS_TABLE,
      Key: { id: 'visitor-count' }
    }));
    const totalVisitors = visitorResult.Item?.count || 0;
    
    res.json({
      totalPhotos: photos.length,
      totalLikes,
      totalComments,
      totalVisitors
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Muffin\'s Cat Blog API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      photos: '/api/photos',
      analytics: '/api/analytics/visitors'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🐱 Cat Blog API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;

