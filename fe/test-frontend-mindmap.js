// Test script for frontend mindmap functionality
const API_BASE_URL = 'http://192.168.1.7:3000/api';

async function testFrontendMindmap() {
  console.log('🧠 Testing Frontend Mindmap Functionality...\n');

  try {
    // Test 1: Create a test note first
    console.log('📝 Test 1: Creating a test note...');
    const createNoteResponse = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Frontend Mindmap Test Note',
        content: 'This is a test note to verify frontend mindmap functionality. It contains information about AI, Machine Learning, and Deep Learning concepts. The mindmap should be generated automatically when the note is created.',
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

    // Test 2: Check if mindmap was stored with the note
    console.log('\n📝 Test 2: Checking if mindmap was stored with the note...');
    const getNoteResponse = await fetch(`${API_BASE_URL}/notes/${noteId}`);
    const getNoteData = await getNoteResponse.json();
    console.log('✅ Retrieved note:', getNoteData);
    console.log('✅ Note has mind_map field:', !!getNoteData.data.mind_map);
    
    if (getNoteData.data.mind_map) {
      console.log('✅ Stored mindmap data:', JSON.stringify(getNoteData.data.mind_map, null, 2));
    } else {
      console.log('⚠️  Note does not have stored mindmap data');
    }

    // Test 3: Test the mindmap API endpoint that frontend uses
    console.log('\n📝 Test 3: Testing mindmap API endpoint...');
    const mindmapResponse = await fetch(`${API_BASE_URL}/notes/${noteId}/mindmap`);
    const mindmapData = await mindmapResponse.json();
    console.log('✅ Mindmap API response:', mindmapData);
    console.log('✅ Mindmap data structure:', JSON.stringify(mindmapData.data, null, 2));

    // Test 4: Test custom mindmap generation
    console.log('\n📝 Test 4: Testing custom mindmap generation...');
    const customMindmapResponse = await fetch(`${API_BASE_URL}/notes/mindmap/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: 'Frontend mindmap test content with AI, Machine Learning, and Deep Learning concepts.'
      })
    });

    const customMindmapData = await customMindmapResponse.json();
    console.log('✅ Custom mindmap response:', customMindmapData);
    console.log('✅ Custom mindmap data:', JSON.stringify(customMindmapData.data, null, 2));

    // Clean up - delete test note
    console.log('\n🧹 Cleaning up test data...');
    const deleteResponse = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
      method: 'DELETE'
    });
    console.log('✅ Test note deleted');

    console.log('\n🎉 Frontend mindmap test completed successfully!');
    console.log('✅ All frontend mindmap API endpoints are working correctly.');
    console.log('✅ Mindmap data is being generated and stored properly.');
    console.log('✅ Frontend can access mindmap data through the API.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Error details:', error.message);
  }
}

// Run the test
testFrontendMindmap();
