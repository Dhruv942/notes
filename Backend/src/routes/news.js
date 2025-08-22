const express = require('express');
const aiService = require('../services/aiService');
const newsService = require('../services/newsService');

const router = express.Router();

// Generate news summary from content
router.post('/summarize', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    console.log('🤖 Generating news summary');
    const summary = await aiService.generateSummary(content, 300);
    
    res.json({ summary });
  } catch (error) {
    console.error('❌ Error in POST /news/summarize:', error);
    res.status(500).json({ error: 'Failed to generate news summary' });
  }
});

// Generate key points from news content
router.post('/key-points', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    console.log('🤖 Generating news key points');
    const keyPoints = await aiService.generateKeyPoints(content);
    
    res.json({ keyPoints });
  } catch (error) {
    console.error('❌ Error in POST /news/key-points:', error);
    res.status(500).json({ error: 'Failed to generate key points' });
  }
});

// Get daily news with AI content
router.get('/daily-news', async (req, res) => {
  try {
    const { date } = req.query;
    console.log('📰 Fetching daily news for date:', date || 'today');
    
    const dailyNews = await newsService.getDailyNews(date);
    
    res.json(dailyNews);
  } catch (error) {
    console.error('❌ Error in GET /news/daily-news:', error);
    res.status(500).json({ error: 'Failed to fetch daily news' });
  }
});

// Get news by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    console.log('📰 Fetching news for category:', category);
    
    const news = await newsService.getNewsByCategory(category);
    
    res.json({ category, news });
  } catch (error) {
    console.error('❌ Error in GET /news/category/:category:', error);
    res.status(500).json({ error: 'Failed to fetch news by category' });
  }
});

// Get news statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 Fetching news statistics');
    
    const stats = await newsService.getNewsStats();
    
    res.json(stats);
  } catch (error) {
    console.error('❌ Error in GET /news/stats:', error);
    res.status(500).json({ error: 'Failed to fetch news statistics' });
  }
});

// Process and save new articles (manual trigger)
router.post('/process', async (req, res) => {
  try {
    console.log('🚀 Manually triggering news processing');
    
    const savedCount = await newsService.processAndSaveArticles();
    
    res.json({ 
      message: 'News processing completed successfully',
      savedCount 
    });
  } catch (error) {
    console.error('❌ Error in POST /news/process:', error);
    res.status(500).json({ error: 'Failed to process news' });
  }
});

// Cleanup old articles
router.delete('/cleanup', async (req, res) => {
  try {
    console.log('🗑️ Cleaning up old articles');
    
    const deletedCount = await newsService.cleanupOldArticles();
    
    res.json({ 
      message: 'Cleanup completed successfully',
      deletedCount: deletedCount?.length || 0
    });
  } catch (error) {
    console.error('❌ Error in DELETE /news/cleanup:', error);
    res.status(500).json({ error: 'Failed to cleanup old articles' });
  }
});

// Get available categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      'Polity & Governance',
      'Economy',
      'Environment & Ecology',
      'Science & Technology',
      'International Relations',
      'Current Affairs'
    ];
    
    res.json({ categories });
  } catch (error) {
    console.error('❌ Error in GET /news/categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;

