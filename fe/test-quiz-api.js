import apiService from './src/services/api';

async function testQuizAPI() {
  console.log('🧪 Testing Quiz API from Frontend...');
  
  try {
    // Test quiz generation from custom content
    console.log('1. Testing quiz generation from custom content...');
    const quizResponse = await apiService.generateCustomQuiz(
      'Artificial Intelligence is a branch of computer science that aims to create intelligent machines.'
    );
    console.log('✅ Quiz generation response:', quizResponse);
    
    // Test flashcard generation from custom content
    console.log('2. Testing flashcard generation from custom content...');
    const flashcardResponse = await apiService.generateCustomFlashcards(
      'Machine Learning is a subset of AI that enables computers to learn from experience.'
    );
    console.log('✅ Flashcard generation response:', flashcardResponse);
    
  } catch (error) {
    console.error('❌ Quiz API test failed:', error);
    console.error('❌ Error details:', error.message);
  }
}

// Run the test
testQuizAPI()
  .then(() => {
    console.log('✅ Quiz API test completed!');
  })
  .catch((error) => {
    console.error('❌ Quiz API test failed:', error);
  });

