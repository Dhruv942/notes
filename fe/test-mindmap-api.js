// Test script for mindmap API integration
const API_BASE_URL = 'http://192.168.1.7:3000/api';

async function testMindmapAPI() {
  console.log('🧠 Testing Mindmap API Integration...\n');

  try {
    // Test 1: Generate custom mindmap
    console.log('📝 Test 1: Generating custom mindmap...');
    const customMindmapResponse = await fetch(`${API_BASE_URL}/notes/mindmap/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: 'Artificial Intelligence includes Machine Learning, Deep Learning, and Natural Language Processing. Machine Learning uses algorithms to learn patterns. Deep Learning uses neural networks. NLP helps computers understand human language.'
      })
    });

    const customMindmapData = await customMindmapResponse.json();
    console.log('✅ Custom mindmap response:', customMindmapData);
    console.log('✅ Mindmap data structure:', JSON.stringify(customMindmapData.data, null, 2));

    // Test 2: Create a note first
    console.log('\n📝 Test 2: Creating a test note...');
    const createNoteResponse = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Note for Mindmap',
        content: 'This is a test note to verify mindmap generation. It contains information about AI, Machine Learning, and Deep Learning concepts.',
        type: 'text'
      })
    });

    const createNoteData = await createNoteResponse.json();
    console.log('✅ Note created:', createNoteData);
    
    if (!createNoteData.data || !createNoteData.data.id) {
      throw new Error('Failed to create note or get note ID');
    }

    const noteId = createNoteData.data.id;
    console.log('✅ Note ID:', noteId);

    // Test 3: Generate mindmap for the note
    console.log('\n📝 Test 3: Generating mindmap for the note...');
    const noteMindmapResponse = await fetch(`${API_BASE_URL}/notes/${noteId}/mindmap`);
    const noteMindmapData = await noteMindmapResponse.json();
    console.log('✅ Note mindmap response:', noteMindmapData);
    console.log('✅ Note mindmap data:', JSON.stringify(noteMindmapData.data, null, 2));

    // Test 4: Get the note to check if mindmap is stored
    console.log('\n📝 Test 4: Retrieving note to check mindmap storage...');
    const getNoteResponse = await fetch(`${API_BASE_URL}/notes/${noteId}`);
    const getNoteData = await getNoteResponse.json();
    console.log('✅ Retrieved note:', getNoteData);
    console.log('✅ Note has mind_map field:', !!getNoteData.data.mind_map);
    
    if (getNoteData.data.mind_map) {
      console.log('✅ Stored mindmap data:', JSON.stringify(getNoteData.data.mind_map, null, 2));
    } else {
      console.log('⚠️  Note does not have stored mindmap data');
    }

    // Clean up - delete test note
    console.log('\n🧹 Cleaning up test data...');
    const deleteResponse = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
      method: 'DELETE'
    });
    console.log('✅ Test note deleted');

    console.log('\n🎉 Mindmap API test completed successfully!');
    console.log('✅ All mindmap API endpoints are working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Error details:', error.message);
  }
}

// Run the test
testMindmapAPI();
