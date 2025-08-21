const express = require('express');
const aiService = require('../services/aiService');

const router = express.Router();

// Compare two pieces of content
router.post('/content', async (req, res) => {
  try {
    const { content1, content2 } = req.body;
    
    if (!content1 || !content2) {
      return res.status(400).json({ error: 'Both content1 and content2 are required' });
    }

    console.log('🤖 Comparing two pieces of content');
    const comparison = await aiService.compareContent(content1, content2);
    
    res.json(comparison);
  } catch (error) {
    console.error('❌ Error in POST /compare/content:', error);
    res.status(500).json({ error: 'Failed to compare content' });
  }
});

module.exports = router;

