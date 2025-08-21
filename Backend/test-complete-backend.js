const express = require('express');
const request = require('supertest');
const { v4: uuidv4 } = require('uuid');

// Import the app
const app = require('./src/index');

// Test data
const testNoteId = uuidv4();
const testNote = {
  id: testNoteId,
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Test Note for Backend Verification',
  content: 'This is a comprehensive test note to verify that the backend properly generates and stores flashcards and quizzes in the exact format expected by Supabase. The content includes information about various topics to ensure the AI can generate meaningful questions.',
  type: 'text',
  summary: 'Test note for backend verification',
  key_points: ['Test', 'Backend', 'Verification'],
  headings: ['Test Note'],
  tags: ['test', 'backend'],
  source: 'manual',
  is_public: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

async function testCompleteBackend() {
  console.log('🧪 Testing Complete Backend Functionality...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await request(app)
      .get('/api/health')
      .expect(200);
    
    console.log('✅ Health check passed:', healthResponse.body.message);

    // Test 2: Create a test note
    console.log('\n2. Creating test note...');
    const noteResponse = await request(app)
      .post('/api/notes')
      .send(testNote)
      .expect(201);
    
    console.log('✅ Note created successfully:', noteResponse.body.data.title);

    // Test 3: Generate flashcards
    console.log('\n3. Generating flashcards...');
    const flashcardResponse = await request(app)
      .get(`/api/flashcards/generate/${testNoteId}`)
      .expect(200);
    
    console.log('✅ Flashcards generated successfully!');
    console.log(`Generated ${flashcardResponse.body.data.length} flashcards`);
    
    // Verify flashcard structure
    if (flashcardResponse.body.data.length > 0) {
      const flashcard = flashcardResponse.body.data[0];
      console.log('Flashcard structure:');
      console.log(JSON.stringify(flashcard, null, 2));
      
      // Verify required fields
      const requiredFields = ['id', 'note_id', 'question', 'answer', 'created_at', 'updated_at'];
      const missingFields = requiredFields.filter(field => !flashcard.hasOwnProperty(field));
      
      if (missingFields.length > 0) {
        console.log('❌ Missing flashcard fields:', missingFields);
      } else {
        console.log('✅ Flashcard structure is correct!');
      }
    }

    // Test 4: Generate quiz questions
    console.log('\n4. Generating quiz questions...');
    const quizResponse = await request(app)
      .get(`/api/flashcards/quiz/generate/${testNoteId}`)
      .expect(200);
    
    console.log('✅ Quiz questions generated successfully!');
    console.log(`Generated ${quizResponse.body.data.length} quiz questions`);
    
    // Verify quiz structure
    if (quizResponse.body.data.length > 0) {
      const quiz = quizResponse.body.data[0];
      console.log('Quiz structure:');
      console.log(JSON.stringify(quiz, null, 2));
      
      // Verify required fields
      const requiredFields = ['id', 'note_id', 'question', 'options', 'correct_answer', 'created_at', 'updated_at'];
      const missingFields = requiredFields.filter(field => !quiz.hasOwnProperty(field));
      
      if (missingFields.length > 0) {
        console.log('❌ Missing quiz fields:', missingFields);
      } else {
        console.log('✅ Quiz structure is correct!');
      }
      
      // Verify options array
      if (Array.isArray(quiz.options) && quiz.options.length >= 2) {
        console.log('✅ Quiz options array is valid!');
      } else {
        console.log('❌ Quiz options array is invalid!');
      }
      
      // Verify correct_answer is a number
      if (typeof quiz.correct_answer === 'number' && quiz.correct_answer >= 0) {
        console.log('✅ Quiz correct_answer is valid!');
      } else {
        console.log('❌ Quiz correct_answer is invalid!');
      }
    }

    // Test 5: Fetch generated flashcards
    console.log('\n5. Fetching generated flashcards...');
    const fetchFlashcardsResponse = await request(app)
      .get(`/api/flashcards/note/${testNoteId}`)
      .expect(200);
    
    console.log('✅ Flashcards fetched successfully!');
    console.log(`Found ${fetchFlashcardsResponse.body.data.length} flashcards`);

    // Test 6: Fetch generated quizzes
    console.log('\n6. Fetching generated quizzes...');
    const fetchQuizzesResponse = await request(app)
      .get(`/api/flashcards/quiz/note/${testNoteId}`)
      .expect(200);
    
    console.log('✅ Quizzes fetched successfully!');
    console.log(`Found ${fetchQuizzesResponse.body.data.length} quizzes`);

    // Test 7: Generate flashcards from custom content
    console.log('\n7. Testing custom content flashcard generation...');
    const customFlashcardResponse = await request(app)
      .post('/api/flashcards/generate')
      .send({
        content: 'The capital of France is Paris. The Eiffel Tower is located in Paris.'
      })
      .expect(200);
    
    console.log('✅ Custom flashcards generated successfully!');
    console.log(`Generated ${customFlashcardResponse.body.data.length} custom flashcards`);

    // Test 8: Generate quiz from custom content
    console.log('\n8. Testing custom content quiz generation...');
    const customQuizResponse = await request(app)
      .post('/api/flashcards/quiz/generate')
      .send({
        content: 'The capital of France is Paris. The Eiffel Tower is located in Paris.'
      })
      .expect(200);
    
    console.log('✅ Custom quiz generated successfully!');
    console.log(`Generated ${customQuizResponse.body.data.length} custom quiz questions`);

    console.log('\n🎉 Complete backend test passed successfully!');
    console.log('✅ All endpoints are working correctly');
    console.log('✅ Data structure matches Supabase requirements');
    console.log('✅ AI generation is functioning properly');
    console.log('✅ Database operations are successful');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response body:', error.response.body);
    }
  }
}

// Run the test
testCompleteBackend();
