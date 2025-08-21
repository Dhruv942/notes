const express = require('express');
const aiService = require('../services/aiService');
const notesModel = require('../models/notesModel');

const router = express.Router();

// Mock highlights data for now (since we don't have a highlights model yet)
let mockHighlights = [
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    note_id: null,
    text: 'This is a sample highlight',
    start_position: 0,
    end_position: 25,
    color: '#ffeb3b',
    notes: 'Sample note',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Generate highlights for a specific note
router.get('/generate/:noteId', async (req, res) => {
  try {
    const note = await notesModel.getNoteById(req.params.noteId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    console.log('🤖 Generating highlights for note:', req.params.noteId);
    const highlights = await aiService.generateHighlights(note.content);
    
    res.json(highlights);
  } catch (error) {
    console.error('❌ Error in GET /highlights/generate/:noteId:', error);
    res.status(500).json({ error: 'Failed to generate highlights' });
  }
});

// Generate highlights from custom content
router.post('/generate', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    console.log('🤖 Generating highlights from custom content');
    const highlights = await aiService.generateHighlights(content);
    
    res.json(highlights);
  } catch (error) {
    console.error('❌ Error in POST /highlights/generate:', error);
    res.status(500).json({ error: 'Failed to generate highlights' });
  }
});

// Get user highlights
router.get('/user', async (req, res) => {
  try {
    const { limit, offset } = req.query;
    
    let highlights = [...mockHighlights];
    
    // Apply pagination if provided
    if (limit || offset) {
      const start = parseInt(offset) || 0;
      const end = start + (parseInt(limit) || highlights.length);
      highlights = highlights.slice(start, end);
    }
    
    res.json({ data: highlights });
  } catch (error) {
    console.error('❌ Error in GET /highlights/user:', error);
    res.status(500).json({ error: 'Failed to fetch highlights' });
  }
});

// Create highlight
router.post('/create', async (req, res) => {
  try {
    const { content, note, source } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const newHighlight = {
      id: `123e4567-e89b-12d3-a456-${(mockHighlights.length + 1).toString().padStart(12, '0')}`,
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      note_id: null,
      text: content,
      start_position: 0,
      end_position: content.length,
      color: '#ffeb3b',
      notes: note || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockHighlights.push(newHighlight);
    
    res.status(201).json(newHighlight);
  } catch (error) {
    console.error('❌ Error in POST /highlights/create:', error);
    res.status(500).json({ error: 'Failed to create highlight' });
  }
});

module.exports = router;

