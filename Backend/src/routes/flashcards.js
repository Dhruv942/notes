const express = require('express');
const aiService = require('../services/aiService');
const notesModel = require('../models/notesModel');
const quizModel = require('../models/quizModel');
const flashcardModel = require('../models/flashcardModel');

const router = express.Router();

// Get existing flashcards for a specific note
router.get('/note/:noteId', async (req, res) => {
  try {
    console.log('📚 Fetching existing flashcards for note:', req.params.noteId);
    const flashcards = await flashcardModel.getFlashcardsByNote(req.params.noteId);
    
    res.json({ data: flashcards });
  } catch (error) {
    console.error('❌ Error in GET /flashcards/note/:noteId:', error);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// Get all flashcards for user
router.get('/user', async (req, res) => {
  try {
    const { limit, offset } = req.query;
    
    let flashcards = await flashcardModel.getAllFlashcards();
    
    // Apply pagination if provided
    if (limit || offset) {
      const start = parseInt(offset) || 0;
      const end = start + (parseInt(limit) || flashcards.length);
      flashcards = flashcards.slice(start, end);
    }
    
    res.json({ data: flashcards });
  } catch (error) {
    console.error('❌ Error in GET /flashcards/user:', error);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// Generate flashcards for a specific note
router.get('/generate/:noteId', async (req, res) => {
  try {
    const note = await notesModel.getNoteById(req.params.noteId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    console.log('🤖 Generating flashcards for note:', req.params.noteId);
    const flashcards = await aiService.generateFlashcards(note.content);
    
    // Save flashcards to database
    const savedFlashcards = [];
    for (const flashcard of flashcards) {
      try {
        const savedFlashcard = await flashcardModel.createFlashcard({
          note_id: req.params.noteId,
          question: flashcard.question,
          answer: flashcard.answer
        });
        savedFlashcards.push(savedFlashcard);
      } catch (saveError) {
        console.error('❌ Error saving flashcard:', saveError);
      }
    }
    
    res.json({ data: savedFlashcards });
  } catch (error) {
    console.error('❌ Error in GET /flashcards/generate/:noteId:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

// Generate flashcards from custom content
router.post('/generate', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    console.log('🤖 Generating flashcards from custom content');
    const flashcards = await aiService.generateFlashcards(content);
    
    res.json({ data: flashcards });
  } catch (error) {
    console.error('❌ Error in POST /flashcards/generate:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

// Get existing quizzes for a specific note
router.get('/quiz/note/:noteId', async (req, res) => {
  try {
    console.log('📚 Fetching existing quizzes for note:', req.params.noteId);
    const quizzes = await quizModel.getQuizzesByNote(req.params.noteId);
    
    res.json({ data: quizzes });
  } catch (error) {
    console.error('❌ Error in GET /flashcards/quiz/note/:noteId:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Get all quizzes for user
router.get('/quiz/user', async (req, res) => {
  try {
    const { limit, offset } = req.query;
    
    let quizzes = await quizModel.getAllQuizzes();
    
    // Apply pagination if provided
    if (limit || offset) {
      const start = parseInt(offset) || 0;
      const end = start + (parseInt(limit) || quizzes.length);
      quizzes = quizzes.slice(start, end);
    }
    
    res.json({ data: quizzes });
  } catch (error) {
    console.error('❌ Error in GET /flashcards/quiz/user:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Generate quiz questions for a specific note
router.get('/quiz/generate/:noteId', async (req, res) => {
  try {
    const note = await notesModel.getNoteById(req.params.noteId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    console.log('🤖 Generating quiz questions for note:', req.params.noteId);
    const quizQuestions = await aiService.generateQuizQuestions(note.content);
    
    // Save quiz questions to database
    const savedQuizzes = [];
    for (const quiz of quizQuestions) {
      try {
        const savedQuiz = await quizModel.createQuiz({
          note_id: req.params.noteId,
          question: quiz.question,
          options: quiz.options,
          correct_answer: quiz.correct_answer
        });
        savedQuizzes.push(savedQuiz);
      } catch (saveError) {
        console.error('❌ Error saving quiz:', saveError);
      }
    }
    
    res.json({ data: savedQuizzes });
  } catch (error) {
    console.error('❌ Error in GET /flashcards/quiz/generate/:noteId:', error);
    res.status(500).json({ error: 'Failed to generate quiz questions' });
  }
});

// Generate quiz questions from custom content
router.post('/quiz/generate', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    console.log('🤖 Generating quiz questions from custom content');
    const quizQuestions = await aiService.generateQuizQuestions(content);
    
    res.json({ data: quizQuestions });
  } catch (error) {
    console.error('❌ Error in POST /flashcards/quiz/generate:', error);
    res.status(500).json({ error: 'Failed to generate quiz questions' });
  }
});

module.exports = router;

