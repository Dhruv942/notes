const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const aiService = require('../services/aiService');
const notesModel = require('../models/notesModel');
const quizModel = require('../models/quizModel');
const flashcardModel = require('../models/flashcardModel');

const router = express.Router();

// Extract content from website URL
router.post('/process-url', async (req, res) => {
  try {
    const { url, title } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log('🌐 Processing website URL:', url);
    
    // Fetch website content
    let websiteContent;
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // Remove script and style elements
      $('script').remove();
      $('style').remove();
      $('nav').remove();
      $('header').remove();
      $('footer').remove();
      
      // Extract text content
      const textContent = $('body').text().replace(/\s+/g, ' ').trim();
      const titleContent = $('title').text().trim();
      
      websiteContent = {
        title: titleContent,
        content: textContent.substring(0, 5000) // Limit content length
      };
      
    } catch (fetchError) {
      console.error('❌ Error fetching website:', fetchError.message);
      return res.status(500).json({ 
        error: 'Failed to fetch website content',
        message: fetchError.message 
      });
    }

    // Generate AI features
    console.log('🤖 Generating AI features for website content...');
    
    let summary = 'AI summary will be generated when API key is available';
    let keyPoints = ['Key points will be generated when API key is available'];
    let headings = ['Headings will be generated when API key is available'];
    let mindMap = null;
    
    try {
      [summary, keyPoints, headings, mindMap] = await Promise.all([
        aiService.generateSummary(websiteContent.content),
        aiService.generateKeyPoints(websiteContent.content),
        aiService.generateHeadings(websiteContent.content),
        aiService.generateMindMap(websiteContent.content)
      ]);
      console.log('✅ AI features generated successfully');
    } catch (aiError) {
      console.log('⚠️ AI features failed - using fallback content');
      console.error('❌ AI Error:', aiError.message);
    }

    // Create note from website content
    const noteData = {
      title: title || websiteContent.title || 'Website Content',
      content: websiteContent.content,
      summary,
      key_points: keyPoints,
      headings,
      mind_map: mindMap,
      source: 'website',
      url: url,
      created_at: new Date().toISOString()
    };

    const newNote = await notesModel.createNote(noteData);
    console.log('✅ Website note created successfully');

    // Automatically generate quizzes and flashcards
    console.log('🤖 Automatically generating quizzes and flashcards for website...');
    try {
      const [quizQuestions, flashcards] = await Promise.all([
        aiService.generateQuizQuestions(websiteContent.content),
        aiService.generateFlashcards(websiteContent.content)
      ]);
      
      // Save quizzes to database with Promise.all
      const quizPromises = quizQuestions.map(quiz => 
        quizModel.createQuiz({
          note_id: newNote.id,
          question: quiz.question,
          options: quiz.options,
          correct_answer: quiz.correct_answer
        })
      );
      
      // Save flashcards to database with Promise.all
      const flashcardPromises = flashcards.map(flashcard => 
        flashcardModel.createFlashcard({
          note_id: newNote.id,
          question: flashcard.question,
          answer: flashcard.answer
        })
      );
      
      // Wait for all database operations to complete
      await Promise.all([...quizPromises, ...flashcardPromises]);
      
      console.log(`✅ Generated ${quizQuestions.length} quizzes and ${flashcards.length} flashcards automatically`);
    } catch (aiError) {
      console.error('⚠️ Error generating quizzes/flashcards:', aiError);
      // Don't fail the note creation if AI generation fails
    }

    res.status(201).json({ 
      data: newNote,
      message: 'Website processed successfully',
      url: url,
      originalTitle: websiteContent.title
    });
    
  } catch (error) {
    console.error('❌ Error in POST /website/process-url:', error);
    res.status(500).json({ 
      error: 'Failed to process website',
      message: error.message 
    });
  }
});

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

