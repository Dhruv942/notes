const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Supabase configuration
const supabaseUrl = 'https://zekpxswndrlqqszmxhwb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpla3B4c3duZHJscXFzem14aHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI2NjY1OCwiZXhwIjoyMDcwODQyNjU4fQ.Tled2alDDtDMTri7oXmyeh5DkE38tbhiRyiK_JoxxQI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDataStructure() {
  console.log('🧪 Testing Data Structure for Flashcards and Quizzes...\n');

  try {
    // Test 1: Create a test note first
    console.log('1. Creating test note...');
    const noteId = uuidv4();
    const testNote = {
      id: noteId,
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Note for Data Structure',
      content: 'This is a test note to verify flashcard and quiz data structure.',
      type: 'text',
      summary: 'Test note for data structure verification',
      key_points: ['Test', 'Data', 'Structure'],
      headings: ['Test Note'],
      tags: ['test', 'data'],
      source: 'manual',
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: noteData, error: noteError } = await supabase
      .from('notes')
      .insert([testNote])
      .select();

    if (noteError) {
      console.log('❌ Note creation failed:', noteError.message);
      return;
    }
    console.log('✅ Test note created successfully!');

    // Test 2: Create flashcards with exact structure
    console.log('\n2. Creating flashcards with exact structure...');
    const testFlashcards = [
      {
        id: uuidv4(),
        note_id: noteId,
        question: "What is the capital of France?",
        answer: "Paris is the capital of France.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        note_id: noteId,
        question: "What is 2 + 2?",
        answer: "2 + 2 equals 4.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const { data: flashcardData, error: flashcardError } = await supabase
      .from('flashcards')
      .insert(testFlashcards)
      .select();

    if (flashcardError) {
      console.log('❌ Flashcard creation failed:', flashcardError.message);
    } else {
      console.log('✅ Flashcards created successfully!');
      console.log('Flashcard structure:');
      console.log(JSON.stringify(flashcardData[0], null, 2));
    }

    // Test 3: Create quizzes with exact structure
    console.log('\n3. Creating quizzes with exact structure...');
    const testQuizzes = [
      {
        id: uuidv4(),
        note_id: noteId,
        question: "What is the capital of France?",
        options: [
          "A. London",
          "B. Paris", 
          "C. Berlin",
          "D. Madrid"
        ],
        correct_answer: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        note_id: noteId,
        question: "What is 2 + 2?",
        options: [
          "A. 3",
          "B. 4",
          "C. 5", 
          "D. 6"
        ],
        correct_answer: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert(testQuizzes)
      .select();

    if (quizError) {
      console.log('❌ Quiz creation failed:', quizError.message);
    } else {
      console.log('✅ Quizzes created successfully!');
      console.log('Quiz structure:');
      console.log(JSON.stringify(quizData[0], null, 2));
    }

    // Test 4: Fetch and verify data
    console.log('\n4. Fetching and verifying data...');
    
    const { data: fetchedFlashcards, error: fetchFlashcardError } = await supabase
      .from('flashcards')
      .select('*')
      .eq('note_id', noteId);

    if (fetchFlashcardError) {
      console.log('❌ Flashcard fetch failed:', fetchFlashcardError.message);
    } else {
      console.log('✅ Flashcards fetched successfully!');
      console.log(`Found ${fetchedFlashcards.length} flashcards`);
    }

    const { data: fetchedQuizzes, error: fetchQuizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('note_id', noteId);

    if (fetchQuizError) {
      console.log('❌ Quiz fetch failed:', fetchQuizError.message);
    } else {
      console.log('✅ Quizzes fetched successfully!');
      console.log(`Found ${fetchedQuizzes.length} quizzes`);
    }

    console.log('\n🎉 Data structure test completed successfully!');
    console.log('The backend should now save data in the exact format expected by Supabase.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDataStructure();
