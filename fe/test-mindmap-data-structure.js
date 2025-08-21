// Test script to check mindmap data structure
const API_BASE_URL = 'http://192.168.1.7:3000/api';

async function testMindmapDataStructure() {
  console.log('🧠 Testing Mindmap Data Structure...\n');

  try {
    // Test 1: Generate custom mindmap and check structure
    console.log('📝 Test 1: Generating custom mindmap...');
    const customMindmapResponse = await fetch(`${API_BASE_URL}/notes/mindmap/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: 'The Maratha Empire (1674–1818) was a Hindu empire that ruled large portions of the Indian subcontinent. It was founded by Shivaji Bhonsle and expanded under various rulers including Peshwas. The empire included territories in Maharashtra, Karnataka, Tamil Nadu, and other regions. Key aspects include military campaigns, administrative systems, and cultural contributions.'
      })
    });

    const customMindmapData = await customMindmapResponse.json();
    console.log('✅ Custom mindmap response status:', customMindmapResponse.status);
    console.log('✅ Custom mindmap response:', customMindmapData);
    
    if (customMindmapData.data) {
      console.log('\n📊 Mindmap Data Structure Analysis:');
      console.log('✅ Topic:', customMindmapData.data.topic);
      console.log('✅ Subtopics count:', customMindmapData.data.subtopics?.length || 0);
      
      if (customMindmapData.data.subtopics) {
        console.log('\n📋 Subtopics Details:');
        customMindmapData.data.subtopics.forEach((subtopic, index) => {
          console.log(`  ${index + 1}. Name: ${subtopic.name}`);
          console.log(`     Children: ${subtopic.children?.length || 0}`);
          if (subtopic.children && subtopic.children.length > 0) {
            subtopic.children.forEach((child, childIndex) => {
              console.log(`       ${childIndex + 1}. ${child.name}`);
            });
          }
        });
      }
      
      console.log('\n🔍 Full JSON Structure:');
      console.log(JSON.stringify(customMindmapData.data, null, 2));
    } else {
      console.log('❌ No data in response');
    }

    // Test 2: Check if the data structure matches what frontend expects
    console.log('\n📝 Test 2: Checking frontend compatibility...');
    const mindmapData = customMindmapData.data;
    
    if (mindmapData) {
      // Check if it has the expected structure for MindMapViewer
      const hasTopic = !!mindmapData.topic;
      const hasSubtopics = Array.isArray(mindmapData.subtopics);
      const hasNameField = mindmapData.subtopics?.every(st => typeof st.name === 'string');
      
      console.log('✅ Has topic field:', hasTopic);
      console.log('✅ Has subtopics array:', hasSubtopics);
      console.log('✅ All subtopics have name field:', hasNameField);
      
      if (hasTopic && hasSubtopics && hasNameField) {
        console.log('✅ Data structure is compatible with frontend!');
      } else {
        console.log('❌ Data structure has issues for frontend display');
      }
    }

    console.log('\n🎉 Mindmap data structure test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Error details:', error.message);
  }
}

// Run the test
testMindmapDataStructure();
