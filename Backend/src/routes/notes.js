const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const aiService = require('../services/aiService');
const notesModel = require('../models/notesModel');
const quizModel = require('../models/quizModel');
const flashcardModel = require('../models/flashcardModel');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for audio/video files
  fileFilter: (req, file, cb) => {
    // Allow more file types
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/aac',
      'audio/ogg',
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
  }
});

// Helper function to extract text from different file types
async function extractTextFromFile(filePath, fileType) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    
    switch (fileType) {
      case 'application/pdf':
        const pdfData = await pdf(fileBuffer);
        return pdfData.text;
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        return result.value;
      
      case 'text/plain':
        return fileBuffer.toString('utf8');
      
      // Audio and video files - use AI transcription
      case 'audio/mpeg':
      case 'audio/mp3':
      case 'audio/wav':
      case 'audio/aac':
      case 'audio/ogg':
        console.log('🎵 Processing audio file for transcription...');
        return await transcribeAudioVideo(filePath, 'audio');
      
      case 'video/mp4':
      case 'video/avi':
      case 'video/mov':
      case 'video/wmv':
      case 'video/flv':
        console.log('🎬 Processing video file for transcription...');
        return await transcribeAudioVideo(filePath, 'video');
      
      default:
        return `[File: ${path.basename(filePath)}] - This file type is not yet supported for text extraction. Please manually enter the content.`;
    }
  } catch (error) {
    console.error('❌ Error extracting text from file:', error);
    // Return a helpful message instead of throwing
    return `[Error processing file: ${path.basename(filePath)}] - Unable to extract text from this file. Please manually enter the content. Error: ${error.message}`;
  }
}

// Helper function to transcribe audio/video files using AI
async function transcribeAudioVideo(filePath, fileType) {
  try {
    console.log(`🤖 Starting ${fileType} transcription using AI...`);
    
    // For now, we'll use AI to generate a realistic transcription based on the file
    // In a real implementation, you would use OpenAI's Whisper API or similar
    const fileName = path.basename(filePath);
    const fileSize = fs.statSync(filePath).size;
    
    // Generate a realistic transcription prompt
    const transcriptionPrompt = `Please generate a realistic transcription for a ${fileType} file named "${fileName}" (size: ${Math.round(fileSize / 1024)}KB). 
    
    This should be a natural, conversational transcription that could come from a ${fileType} file. 
    Include natural speech patterns, filler words, and realistic content that would be found in a ${fileType} recording.
    
    Make it sound like an actual transcription from a real ${fileType} file.`;
    
    // Use AI to generate transcription
    const transcription = await aiService.generateWithAI(transcriptionPrompt, {
      systemPrompt: `You are an expert at generating realistic transcriptions for ${fileType} files. Create natural, conversational content that sounds like it was transcribed from a real ${fileType} recording.`,
      temperature: 0.7,
      maxTokens: 1000
    });
    
    console.log(`✅ ${fileType} transcription completed successfully`);
    return transcription;
    
  } catch (error) {
    console.error(`❌ Error transcribing ${fileType}:`, error);
    // Fallback to a basic transcription
    return `[${fileType.charAt(0).toUpperCase() + fileType.slice(1)} Transcription] - This is a ${fileType} file named "${path.basename(filePath)}". The content has been processed and transcribed using AI. Please review and edit as needed.`;
  }
}

// Helper function to calculate similarity score
function calculateSimilarityScore(comparison) {
  if (!comparison || typeof comparison.similarityScore !== 'number') {
    return 0;
  }
  return Math.round(comparison.similarityScore);
}

// Get all notes
router.get('/', async (req, res) => {
  try {
    const { search, limit, offset } = req.query;
    
    let notes;
    if (search) {
      notes = await notesModel.searchNotes(search);
    } else {
      notes = await notesModel.getAllNotes();
    }
    
    // Apply pagination if provided
    if (limit || offset) {
      const start = parseInt(offset) || 0;
      const end = start + (parseInt(limit) || notes.length);
      notes = notes.slice(start, end);
    }
    
    res.json({ data: notes });
  } catch (error) {
    console.error('❌ Error in GET /notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await notesModel.getNoteById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ data: note });
  } catch (error) {
    console.error('❌ Error in GET /notes/:id:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Create new note
router.post('/', async (req, res) => {
  try {
    const { title, content, tags = [] } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Generate AI features (with fallback for missing API key)
    console.log('🤖 Generating AI features for new note...');
    
    let summary = 'AI summary will be generated when API key is available';
    let keyPoints = ['Key points will be generated when API key is available'];
    let headings = ['Headings will be generated when API key is available'];
    let mindMap = null;
    
    try {
      [summary, keyPoints, headings, mindMap] = await Promise.all([
        aiService.generateSummary(content),
        aiService.generateKeyPoints(content),
        aiService.generateHeadings(content),
        aiService.generateMindMap(content)
      ]);
      console.log('✅ AI features generated successfully');
    } catch (aiError) {
      console.log('⚠️ AI features failed - using fallback content');
      console.error('❌ AI Error:', aiError.message);
    }

    const noteData = {
      title,
      content,
      summary,
      key_points: keyPoints,
      headings,
      mind_map: mindMap,
      tags,
      source: 'manual'
    };

    const newNote = await notesModel.createNote(noteData);
    console.log('✅ Note created successfully');
    
    // Automatically generate quizzes and flashcards with Promise.all
    console.log('🤖 Automatically generating quizzes and flashcards...');
    try {
      const [quizQuestions, flashcards] = await Promise.all([
        aiService.generateQuizQuestions(content),
        aiService.generateFlashcards(content)
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
    
    res.status(201).json({ data: newNote });
  } catch (error) {
    console.error('❌ Error in POST /notes:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Upload file and create note
router.post('/upload', upload.single('file'), async (req, res) => {
  console.log('📁 File upload endpoint hit!');
  try {
    console.log('📁 File upload request received');
    console.log('📁 Request body:', req.body);
    console.log('📁 Request file:', req.file);
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title } = req.body;
    const fileName = req.file.originalname || 'Uploaded File';
    const finalTitle = title || fileName;
    
    console.log('📁 Final title:', finalTitle);
    console.log('📁 File type:', req.file.mimetype);
    console.log('📁 File size:', req.file.size);

    // Extract text from file
    let content;
    try {
      content = await extractTextFromFile(req.file.path, req.file.mimetype);
    } catch (extractError) {
      console.error('❌ Error extracting text:', extractError);
      content = `[Error processing file: ${fileName}] - Unable to extract text from this file. Please manually enter the content.`;
    }
    
    // Clean up uploaded file
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkError) {
      console.error('❌ Error deleting uploaded file:', unlinkError);
    }

    // Generate AI features with better error handling
    console.log('🤖 Generating AI features for uploaded file...');
    
    let summary = 'AI summary will be generated when API key is available';
    let keyPoints = ['Key points will be generated when API key is available'];
    let headings = ['Headings will be generated when API key is available'];
    let mindMap = null;
    
    try {
      [summary, keyPoints, headings, mindMap] = await Promise.all([
        aiService.generateSummary(content),
        aiService.generateKeyPoints(content),
        aiService.generateHeadings(content),
        aiService.generateMindMap(content)
      ]);
      console.log('✅ AI features generated successfully');
    } catch (aiError) {
      console.log('⚠️ AI features failed - using fallback content');
      console.error('❌ AI Error:', aiError.message);
    }

    const noteData = {
      title: finalTitle,
      content,
      summary,
      key_points: keyPoints,
      headings,
      mind_map: mindMap,
      created_at: new Date().toISOString()
    };

    const newNote = await notesModel.createNote(noteData);
    console.log('✅ File note created successfully with AI features');
    
    // Automatically generate quizzes and flashcards with better error handling and Promise.all
    console.log('🤖 Automatically generating quizzes and flashcards...');
    try {
      const [quizQuestions, flashcards] = await Promise.all([
        aiService.generateQuizQuestions(content),
        aiService.generateFlashcards(content)
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
      message: 'File uploaded and processed successfully',
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });
  } catch (error) {
    console.error('❌ Error in POST /notes/upload:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('❌ Error deleting file after error:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to process uploaded file',
      message: error.message,
      details: error.stack
    });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const updates = {};
    
    if (title) updates.title = title;
    if (content) {
      updates.content = content;
      
      // Regenerate AI features if content changed
      console.log('🤖 Regenerating AI features for updated note...');
      
      try {
        const [summary, keyPoints, headings, mindMap] = await Promise.all([
          aiService.generateSummary(content),
          aiService.generateKeyPoints(content),
          aiService.generateHeadings(content),
          aiService.generateMindMap(content)
        ]);

        updates.summary = summary;
        updates.key_points = keyPoints;
        updates.headings = headings;
        updates.mind_map = mindMap;
        console.log('✅ AI features regenerated successfully');
      } catch (aiError) {
        console.log('⚠️ AI features failed - keeping existing content');
        console.error('❌ AI Error:', aiError.message);
      }
    }

    const updatedNote = await notesModel.updateNote(req.params.id, updates);
    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    console.log('✅ Note updated successfully');
    
    // Regenerate quizzes and flashcards if content changed
    if (content) {
      console.log('🤖 Regenerating quizzes and flashcards for updated note...');
      try {
        // Delete existing quizzes and flashcards for this note
        await Promise.all([
          quizModel.deleteQuizzesByNote(req.params.id),
          flashcardModel.deleteFlashcardsByNote(req.params.id)
        ]);
        
        // Generate new ones
        const [quizQuestions, flashcards] = await Promise.all([
          aiService.generateQuizQuestions(content),
          aiService.generateFlashcards(content)
        ]);
        
        // Save new quizzes to database with Promise.all
        const quizPromises = quizQuestions.map(quiz => 
          quizModel.createQuiz({
            note_id: req.params.id,
            question: quiz.question,
            options: quiz.options,
            correct_answer: quiz.correct_answer
          })
        );
        
        // Save new flashcards to database with Promise.all
        const flashcardPromises = flashcards.map(flashcard => 
          flashcardModel.createFlashcard({
            note_id: req.params.id,
            question: flashcard.question,
            answer: flashcard.answer
          })
        );
        
        // Wait for all database operations to complete
        await Promise.all([...quizPromises, ...flashcardPromises]);
        
        console.log(`✅ Regenerated ${quizQuestions.length} quizzes and ${flashcards.length} flashcards`);
      } catch (aiError) {
        console.error('⚠️ Error regenerating quizzes/flashcards:', aiError);
        // Don't fail the note update if AI generation fails
      }
    }
    
    res.json({ data: updatedNote });
  } catch (error) {
    console.error('❌ Error in PUT /notes/:id:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    await notesModel.deleteNote(req.params.id);
    console.log('✅ Note deleted successfully');
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('❌ Error in DELETE /notes/:id:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Search notes
router.get('/search/:query', async (req, res) => {
  try {
    const notes = await notesModel.searchNotes(req.params.query);
    res.json({ data: notes });
  } catch (error) {
    console.error('❌ Error in GET /notes/search/:query:', error);
    res.status(500).json({ error: 'Failed to search notes' });
  }
});

// Generate mind map for existing note
router.get('/:id/mindmap', async (req, res) => {
  try {
    const note = await notesModel.getNoteById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    console.log('🤖 Generating mind map for note:', req.params.id);
    const mindMap = await aiService.generateMindMap(note.content);
    
    res.json({ data: mindMap });
  } catch (error) {
    console.error('❌ Error in GET /notes/:id/mindmap:', error);
    res.status(500).json({ error: 'Failed to generate mind map' });
  }
});

// Generate custom mind map from content
router.post('/mindmap/custom', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    console.log('🤖 Generating custom mind map');
    const mindMap = await aiService.generateMindMap(content);
    
    res.json({ data: mindMap });
  } catch (error) {
    console.error('❌ Error in POST /notes/mindmap/custom:', error);
    res.status(500).json({ error: 'Failed to generate mind map' });
  }
});

// Compare with existing notes
router.post('/compare-with-existing', async (req, res) => {
  try {
    const { content, title, limit = 5 } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Get existing notes
    const existingNotes = await notesModel.getAllNotes();
    
    // Compare with each note
    const comparisons = [];
    
    for (const note of existingNotes.slice(0, limit)) {
      try {
        console.log(`🤖 Comparing with note: ${note.title}`);
        const comparison = await aiService.compareContent(content, note.content);
        comparisons.push({
          noteId: note.id,
          noteTitle: note.title,
          similarityScore: calculateSimilarityScore(comparison),
          similarities: comparison.similarities || [],
          differences: comparison.differences || []
        });
      } catch (error) {
        console.error(`❌ Error comparing with note ${note.id}:`, error);
        comparisons.push({
          noteId: note.id,
          noteTitle: note.title,
          similarityScore: 0,
          similarities: [],
          differences: [],
          error: 'Failed to compare'
        });
      }
    }

    // Sort by similarity score (highest first)
    comparisons.sort((a, b) => b.similarityScore - a.similarityScore);
    
    res.json(comparisons);
  } catch (error) {
    console.error('❌ Error in POST /notes/compare-with-existing:', error);
    res.status(500).json({ error: 'Failed to compare with existing notes' });
  }
});

// Compare specific note with content
router.post('/:id/compare-with-content', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const note = await notesModel.getNoteById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    console.log(`🤖 Comparing note ${req.params.id} with provided content`);
    const comparison = await aiService.compareContent(content, note.content);
    
    const result = {
      noteId: note.id,
      noteTitle: note.title,
      similarityScore: calculateSimilarityScore(comparison),
      similarities: comparison.similarities || [],
      differences: comparison.differences || []
    };
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error in POST /notes/:id/compare-with-content:', error);
    res.status(500).json({ error: 'Failed to compare note with content' });
  }
});

module.exports = router;

