const { v4: uuidv4 } = require('uuid');

class DataValidator {
  // Validate and format flashcard data
  static validateFlashcard(flashcardData) {
    const validated = {
      ...flashcardData,
      id: flashcardData.id || uuidv4(),
      created_at: flashcardData.created_at || new Date().toISOString(),
      updated_at: flashcardData.updated_at || new Date().toISOString()
    };

    // Ensure required fields
    if (!validated.question || !validated.answer) {
      throw new Error('Question and answer are required for flashcards');
    }

    // Ensure note_id is present
    if (!validated.note_id) {
      throw new Error('Note ID is required for flashcards');
    }

    return validated;
  }

  // Validate and format quiz data
  static validateQuiz(quizData) {
    const validated = {
      ...quizData,
      id: quizData.id || uuidv4(),
      created_at: quizData.created_at || new Date().toISOString(),
      updated_at: quizData.updated_at || new Date().toISOString()
    };

    // Ensure required fields
    if (!validated.question) {
      throw new Error('Question is required for quizzes');
    }

    if (!validated.options || !Array.isArray(validated.options)) {
      throw new Error('Options array is required for quizzes');
    }

    if (validated.options.length < 2) {
      throw new Error('Quiz must have at least 2 options');
    }

    // Ensure correct_answer is a number and within range
    if (validated.correct_answer === undefined || validated.correct_answer === null) {
      throw new Error('Correct answer is required for quizzes');
    }

    validated.correct_answer = parseInt(validated.correct_answer);
    
    if (validated.correct_answer < 0 || validated.correct_answer >= validated.options.length) {
      throw new Error('Correct answer index is out of range');
    }

    // Ensure note_id is present
    if (!validated.note_id) {
      throw new Error('Note ID is required for quizzes');
    }

    return validated;
  }

  // Validate and format note data
  static validateNote(noteData) {
    const validated = {
      ...noteData,
      id: noteData.id || uuidv4(),
      user_id: noteData.user_id || '123e4567-e89b-12d3-a456-426614174000', // Mock user ID
      created_at: noteData.created_at || new Date().toISOString(),
      updated_at: noteData.updated_at || new Date().toISOString()
    };

    // Ensure required fields
    if (!validated.title) {
      throw new Error('Title is required for notes');
    }

    if (!validated.content) {
      throw new Error('Content is required for notes');
    }

    // Set default values for optional fields
    validated.summary = validated.summary || '';
    validated.key_points = validated.key_points || [];
    validated.headings = validated.headings || [];
    validated.mind_map = validated.mind_map || null;
    validated.tags = validated.tags || [];
    validated.source = validated.source || 'manual';
    validated.is_public = validated.is_public || false;

    return validated;
  }
}

module.exports = DataValidator;
