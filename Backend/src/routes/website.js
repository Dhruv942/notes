const express = require('express');
const aiService = require('../services/aiService');

const router = express.Router();

// Extract and process website content
router.post('/extract', async (req, res) => {
  try {
    const { content, url } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    console.log('🤖 Processing website content from:', url || 'unknown URL');
    
    // Generate AI features for website content
    const [summary, keyPoints, headings, mindMap] = await Promise.all([
      aiService.generateSummary(content),
      aiService.generateKeyPoints(content),
      aiService.generateHeadings(content),
      aiService.generateMindMap(content)
    ]);

    const result = {
      url,
      summary,
      keyPoints,
      headings,
      mindMap,
      originalContent: content
    };
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error in POST /website/extract:', error);
    res.status(500).json({ error: 'Failed to process website content' });
  }
});

module.exports = router;

