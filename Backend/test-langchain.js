require('dotenv').config();
const aiService = require('./src/services/aiService');

async function testLangChain() {
  console.log('🧪 Testing LangChain Integration...\n');
  
  const testContent = `Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines that work and react like humans. Some of the activities computers with artificial intelligence are designed for include speech recognition, learning, planning, and problem solving. AI has applications in various fields including healthcare, finance, transportation, and entertainment. Machine learning, a subset of AI, enables computers to learn and improve from experience without being explicitly programmed.`;

  try {
    console.log('📝 Test Content:');
    console.log(testContent);
    console.log('\n' + '='.repeat(50) + '\n');

    // Test summary generation
    console.log('🤖 Testing Summary Generation...');
    const summary = await aiService.generateSummary(testContent);
    console.log('✅ Summary:', summary);
    console.log('\n' + '-'.repeat(30) + '\n');

    // Test key points generation
    console.log('🤖 Testing Key Points Generation...');
    const keyPoints = await aiService.generateKeyPoints(testContent);
    console.log('✅ Key Points:', keyPoints);
    console.log('\n' + '-'.repeat(30) + '\n');

    // Test mind map generation
    console.log('🤖 Testing Mind Map Generation...');
    const mindMap = await aiService.generateMindMap(testContent);
    console.log('✅ Mind Map:', JSON.stringify(mindMap, null, 2));
    console.log('\n' + '-'.repeat(30) + '\n');

    // Test flashcards generation
    console.log('🤖 Testing Flashcards Generation...');
    const flashcards = await aiService.generateFlashcards(testContent);
    console.log('✅ Flashcards:', JSON.stringify(flashcards, null, 2));
    console.log('\n' + '-'.repeat(30) + '\n');

    // Test quiz questions generation
    console.log('🤖 Testing Quiz Questions Generation...');
    const quizQuestions = await aiService.generateQuizQuestions(testContent);
    console.log('✅ Quiz Questions:', JSON.stringify(quizQuestions, null, 2));
    console.log('\n' + '-'.repeat(30) + '\n');

    console.log('🎉 All LangChain tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testLangChain();

