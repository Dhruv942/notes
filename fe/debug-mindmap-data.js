// Debug script to see exact mindmap data structure
const API_BASE_URL = 'http://192.168.1.7:3000/api';

async function debugMindmapData() {
  console.log('🔍 Debugging Mindmap Data Structure...\n');

  try {
    // Generate custom mindmap to see the structure
    console.log('📝 Generating mindmap...');
    const response = await fetch(`${API_BASE_URL}/notes/mindmap/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: 'The Maratha Empire (1674–1818) was a Hindu empire that ruled large portions of the Indian subcontinent. It was founded by Shivaji Bhonsle and expanded under various rulers including Peshwas.'
      })
    });

    const data = await response.json();
    console.log('✅ Response status:', response.status);
    console.log('✅ Full response:', data);
    
    if (data.data) {
      console.log('\n📊 EXACT DATA STRUCTURE:');
      console.log('Topic:', data.data.topic);
      console.log('Subtopics count:', data.data.subtopics?.length || 0);
      
      if (data.data.subtopics) {
        console.log('\n📋 SUBTOPICS DETAILS:');
        data.data.subtopics.forEach((subtopic, index) => {
          console.log(`\nSubtopic ${index + 1}:`);
          console.log('  Raw object:', subtopic);
          console.log('  Keys:', Object.keys(subtopic));
          console.log('  Type:', typeof subtopic);
          
          // Check if it's a string or object
          if (typeof subtopic === 'string') {
            console.log('  Value (string):', subtopic);
          } else if (typeof subtopic === 'object') {
            console.log('  Name field:', subtopic.name);
            console.log('  Topic field:', subtopic.topic);
            console.log('  Children:', subtopic.children);
          }
        });
      }
      
      console.log('\n🔍 FULL JSON STRUCTURE:');
      console.log(JSON.stringify(data.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugMindmapData();
