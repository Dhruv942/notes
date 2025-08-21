const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8081', 'http://192.168.1.7:3000', 'http://192.168.1.7:8081', 'exp://192.168.1.7:8081'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Note Taking Backend is running!' });
});

// Import routes
const notesRoutes = require('./routes/notes');
const highlightsRoutes = require('./routes/highlights');
const flashcardsRoutes = require('./routes/flashcards');
const newsRoutes = require('./routes/news');
const websiteRoutes = require('./routes/website');
const compareRoutes = require('./routes/compare');

// Use routes
app.use('/api/notes', notesRoutes);
app.use('/api/highlights', highlightsRoutes);
app.use('/api/flashcards', flashcardsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/website', websiteRoutes);
app.use('/api/compare', compareRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 External access: http://192.168.1.7:${PORT}/api/health`);
});

