const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// DynamoDB Configuration (only for likes)
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  // Credentials will be picked up from IAM role in EKS, or AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY for local
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Table name for photos (only used for likes)
const PHOTOS_TABLE = process.env.PHOTOS_TABLE || 'cat-blog-photos';

// In-memory photo list (photos are static, only likes are in DynamoDB)
const photos = [
  { id: '1', name: 'test.jpg', title: 'Muffin Portrait', likes: 0 },
  { id: '2', name: '4am.jpg', title: '4 AM Adventure', likes: 0 },
  { id: '3', name: 'images/placeholder3.jpg', title: 'Playful Moment', likes: 0 },
  { id: '4', name: 'images/placeholder4.jpg', title: 'Curious Stare', likes: 0 },
  { id: '5', name: 'IMG_6113.PNG', title: 'Muffin\'s Majesty', likes: 0 },
  { id: '6', name: 'IMG_6114.PNG', title: 'Regal Pose', likes: 0 },
  { id: '7', name: 'de1622f2-9bd1-43a2-b8eb-a238fb50391e.jpg', title: 'Muffin\'s Adventure', likes: 0 },
  { id: '8', name: 'IMG-20241022-WA0009.jpg', title: 'Muffin\'s Moment', likes: 0 }
];

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

// Get all photos (with likes from DynamoDB)
app.get('/api/photos', async (req, res) => {
  try {
    // Get likes from DynamoDB for each photo
    const photosWithLikes = await Promise.all(photos.map(async (photo) => {
      try {
        const result = await docClient.send(new GetCommand({
          TableName: PHOTOS_TABLE,
          Key: { id: photo.id }
        }));
        return {
          ...photo,
          likes: result.Item?.likes || 0
        };
      } catch (error) {
        // If photo doesn't exist in DynamoDB yet, return with 0 likes
        return { ...photo, likes: 0 };
      }
    }));
    
    res.json({ photos: photosWithLikes });
  } catch (error) {
    console.error('Error fetching photos:', error);
    // Fallback to in-memory photos if DynamoDB fails
    res.json({ photos });
  }
});

// Get photo by ID (with likes from DynamoDB)
app.get('/api/photos/:id', async (req, res) => {
  try {
    const photo = photos.find(p => p.id === req.params.id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    // Get likes from DynamoDB
    try {
      const result = await docClient.send(new GetCommand({
        TableName: PHOTOS_TABLE,
        Key: { id: req.params.id }
      }));
      photo.likes = result.Item?.likes || 0;
    } catch (error) {
      photo.likes = 0;
    }
    
    res.json({ photo });
  } catch (error) {
    console.error('Error fetching photo:', error);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
});

// Like a photo
app.post('/api/photos/:id/like', async (req, res) => {
  try {
    // First, verify photo exists in our list
    const photo = photos.find(p => p.id === req.params.id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    // Increment likes using UpdateCommand (creates item if doesn't exist)
    const updateResult = await docClient.send(new UpdateCommand({
      TableName: PHOTOS_TABLE,
      Key: { id: req.params.id },
      UpdateExpression: 'SET likes = if_not_exists(likes, :zero) + :inc, #name = if_not_exists(#name, :name), #title = if_not_exists(#title, :title)',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#title': 'title'
      },
      ExpressionAttributeValues: {
        ':inc': 1,
        ':zero': 0,
        ':name': photo.name,
        ':title': photo.title
      },
      ReturnValues: 'ALL_NEW'
    }));
    
    const updatedPhoto = {
      ...photo,
      likes: updateResult.Attributes?.likes || 0
    };
    
    res.json({ photo: updatedPhoto });
  } catch (error) {
    console.error('Error liking photo:', error);
    res.status(500).json({ error: 'Failed to like photo' });
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
      like: '/api/photos/:id/like'
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

