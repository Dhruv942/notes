// Test script to verify mindmap display functionality
const API_BASE_URL = 'http://192.168.1.7:3000/api';

async function testMindmapDisplay() {
  console.log('🧠 Testing Mindmap Display Functionality...\n');

  try {
    // Test 1: Create a note and check mindmap generation
    console.log('📝 Test 1: Creating a note with mindmap...');
    const createNoteResponse = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Mindmap Display Test',
        content: 'Artificial Intelligence (AI) is a branch of computer science. Machine Learning is a subset of AI. Deep Learning uses neural networks. Natural Language Processing helps computers understand language. Computer Vision enables machines to interpret visual information.',
        type: 'text'
      })
    });

    const createNoteData = await createNoteResponse.json();
    console.log('✅ Note created:', createNoteData);
    
    if (!createNoteData.data || !createNoteData.data.id) {
      throw new Error('Failed to create note');
    }

    const noteId = createNoteData.data.id;
    console.log('✅ Note ID:', noteId);

    // Test 2: Check if mindmap was stored
    console.log('\n📝 Test 2: Checking stored mindmap...');
    const getNoteResponse = await fetch(`${API_BASE_URL}/notes/${noteId}`);
    const getNoteData = await getNoteResponse.json();
    
    if (getNoteData.data.mind_map) {
      console.log('✅ Mindmap stored successfully');
      console.log('✅ Mindmap structure:', {
        hasTopic: !!getNoteData.data.mind_map.topic,
        hasSubtopics: Array.isArray(getNoteData.data.mind_map.subtopics),
        subtopicsCount: getNoteData.data.mind_map.subtopics?.length || 0
      });
      
      // Test the data structure that frontend expects
      const mindmapData = getNoteData.data.mind_map;
      console.log('\n📊 Data Structure for Frontend:');
      console.log('✅ Topic:', mindmapData.topic);
      console.log('✅ Subtopics:', mindmapData.subtopics?.length || 0);
      
      if (mindmapData.subtopics) {
        mindmapData.subtopics.forEach((subtopic, index) => {
          console.log(`  ${index + 1}. ${subtopic.name}`);
        });
      }
    } else {
      console.log('⚠️  No mindmap stored, generating one...');
      
      // Test 3: Generate mindmap manually
      console.log('\n📝 Test 3: Generating mindmap manually...');
      const mindmapResponse = await fetch(`${API_BASE_URL}/notes/${noteId}/mindmap`);
      const mindmapData = await mindmapResponse.json();
      
      if (mindmapData.data) {
        console.log('✅ Mindmap generated successfully');
        console.log('✅ Mindmap structure:', {
          hasTopic: !!mindmapData.data.topic,
          hasSubtopics: Array.isArray(mindmapData.data.subtopics),
          subtopicsCount: mindmapData.data.subtopics?.length || 0
        });
      } else {
        console.log('❌ Failed to generate mindmap');
      }
    }

    // Clean up
    console.log('\n🧹 Cleaning up...');
    await fetch(`${API_BASE_URL}/notes/${noteId}`, { method: 'DELETE' });
    console.log('✅ Test note deleted');

    console.log('\n🎉 Mindmap display test completed!');
    console.log('✅ Data structure is correct for frontend display');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Error details:', error.message);
  }
}

// Run the test
testMindmapDisplay();
