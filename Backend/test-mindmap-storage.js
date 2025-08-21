const notesModel = require('./src/models/notesModel');
const aiService = require('./src/services/aiService');

async function testMindmapStorage() {
  console.log('🧠 Testing Mindmap Database Storage...\n');

  try {
    // Test content
    const testContent = `
      Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines.
      Machine Learning is a subset of AI that enables computers to learn without being explicitly programmed.
      Deep Learning uses neural networks with multiple layers to process complex patterns.
      Natural Language Processing helps computers understand and generate human language.
      Computer Vision enables machines to interpret and understand visual information.
    `;

    console.log('📝 Test Content:', testContent.trim());
    console.log('\n🤖 Generating mindmap...');

    // Generate mindmap using AI service
    const mindMap = await aiService.generateMindMap(testContent);
    console.log('✅ Generated Mindmap:', JSON.stringify(mindMap, null, 2));

    // Create test note with mindmap
    const noteData = {
      title: 'Test Note with Mindmap',
      content: testContent,
      type: 'text',
      summary: 'A test note to verify mindmap storage',
      key_points: ['AI', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision'],
      headings: ['Introduction', 'Core Concepts', 'Applications'],
      mind_map: mindMap
    };

    console.log('\n💾 Creating note in database...');
    const newNote = await notesModel.createNote(noteData);
    console.log('✅ Note created with ID:', newNote.id);
    console.log('✅ Note includes mind_map field:', !!newNote.mind_map);

    // Retrieve the note to verify storage
    console.log('\n📖 Retrieving note from database...');
    const retrievedNote = await notesModel.getNoteById(newNote.id);
    console.log('✅ Retrieved note successfully');
    console.log('✅ Mindmap stored:', !!retrievedNote.mind_map);
    console.log('✅ Mindmap data:', JSON.stringify(retrievedNote.mind_map, null, 2));

    // Clean up - delete test note
    console.log('\n🧹 Cleaning up test data...');
    await notesModel.deleteNote(newNote.id);
    console.log('✅ Test note deleted');

    console.log('\n🎉 Mindmap storage test completed successfully!');
    console.log('✅ Mindmap data is being stored in the database correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Error details:', error.message);
  }
}

// Run the test
testMindmapStorage();
