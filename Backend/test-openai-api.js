const aiService = require('./src/services/aiService');

async function testOpenAIAPI() {
  console.log('🤖 Testing OpenAI API with gpt-4o-mini...\n');

  try {
    // Test 1: Generate a simple summary
    console.log('📝 Test 1: Generating summary...');
    const testContent = 'Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines. Machine Learning is a subset of AI that enables computers to learn without being explicitly programmed. Deep Learning uses neural networks with multiple layers to process complex patterns.';
    
    const summary = await aiService.generateSummary(testContent);
    console.log('✅ Summary generated:', summary);

    // Test 2: Generate key points
    console.log('\n📝 Test 2: Generating key points...');
    const keyPoints = await aiService.generateKeyPoints(testContent);
    console.log('✅ Key points generated:', keyPoints);

    // Test 3: Generate headings
    console.log('\n📝 Test 3: Generating headings...');
    const headings = await aiService.generateHeadings(testContent);
    console.log('✅ Headings generated:', headings);

    // Test 4: Generate mindmap
    console.log('\n📝 Test 4: Generating mindmap...');
    const mindMap = await aiService.generateMindMap(testContent);
    console.log('✅ Mindmap generated:', JSON.stringify(mindMap, null, 2));

    console.log('\n🎉 All OpenAI API tests completed successfully!');
    console.log('✅ API key is working correctly with gpt-4o-mini model.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Error details:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Make sure to set the OPENAI_API_KEY environment variable or update the aiClient.js file.');
    }
  }
}

// Run the test
testOpenAIAPI();
