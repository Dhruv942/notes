// Debug script to test quiz connection
const API_BASE_URL = 'http://192.168.1.7:3000/api';

async function testQuizConnection() {
  console.log('🧪 Testing Quiz Connection...');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test 2: Get quizzes for a specific note (using one of your note IDs)
    const noteId = 'a252a987-07ce-49d2-8d08-58bb9680d7ee'; // From your data
    console.log(`2. Testing get quizzes for note: ${noteId}`);
    
    const quizResponse = await fetch(`${API_BASE_URL}/flashcards/quiz/note/${noteId}`);
    console.log('Quiz response status:', quizResponse.status);
    console.log('Quiz response ok:', quizResponse.ok);
    
    if (quizResponse.ok) {
      const quizData = await quizResponse.json();
      console.log('✅ Quiz data received:', quizData);
      console.log('📊 Number of quizzes:', quizData.data?.length || 0);
    } else {
      const errorData = await quizResponse.json();
      console.log('❌ Quiz fetch error:', errorData);
    }
    
    // Test 3: Generate new quiz
    console.log('3. Testing quiz generation...');
    const generateResponse = await fetch(`${API_BASE_URL}/flashcards/quiz/generate/${noteId}`);
    console.log('Generate response status:', generateResponse.status);
    
    if (generateResponse.ok) {
      const generateData = await generateResponse.json();
      console.log('✅ Quiz generation successful:', generateData);
    } else {
      const errorData = await generateResponse.json();
      console.log('❌ Quiz generation error:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    console.error('Error details:', error.message);
  }
}

// Run the test
testQuizConnection()
  .then(() => {
    console.log('✅ Quiz connection test completed!');
  })
  .catch((error) => {
    console.error('❌ Quiz connection test failed:', error);
  });

