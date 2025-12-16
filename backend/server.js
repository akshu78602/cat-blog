const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory data store
let photos = [
  { id: '1', name: 'test.jpg', title: 'Muffin Portrait', likes: 0 },
  { id: '2', name: '4am.jpg', title: '4 AM Adventure', likes: 0 }
];

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
app.get('/api/photos', (req, res) => {
  res.json({ photos });
});

// Get photo by ID
app.get('/api/photos/:id', (req, res) => {
  const photo = photos.find(p => p.id === req.params.id);
  if (!photo) {
    return res.status(404).json({ error: 'Photo not found' });
  }
  res.json({ photo });
});

// Like a photo
app.post('/api/photos/:id/like', (req, res) => {
  const photo = photos.find(p => p.id === req.params.id);
  if (!photo) {
    return res.status(404).json({ error: 'Photo not found' });
  }
  photo.likes = (photo.likes || 0) + 1;
  res.json({ photo });
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


