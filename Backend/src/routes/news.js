const express = require('express');
const aiService = require('../services/aiService');

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

module.exports = router;

