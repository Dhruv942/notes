// Test script to verify mindmap generation fix
const aiService = require('./src/services/aiService');

async function testMindmapFix() {
  console.log('🧠 Testing Mindmap Generation Fix...\n');

  try {
    const content = 'The Maratha Empire (1674–1818) was a Hindu empire that ruled large portions of the Indian subcontinent. It was founded by Shivaji Bhonsle and expanded under various rulers including Peshwas. The empire included territories in Maharashtra, Karnataka, Tamil Nadu, and other regions. Key aspects include military campaigns, administrative systems, and cultural contributions.';

    console.log('📝 Generating mindmap...');
    const mindmap = await aiService.generateMindMap(content);
    
    console.log('✅ Mindmap generated successfully!');
    console.log('\n📊 Mindmap Structure:');
    console.log('Topic:', mindmap.topic);
    console.log('Subtopics count:', mindmap.subtopics?.length || 0);
    
    if (mindmap.subtopics) {
      console.log('\n📋 Subtopics Details:');
      mindmap.subtopics.forEach((subtopic, index) => {
        console.log(`\n${index + 1}. Subtopic:`, subtopic);
        console.log('   Type:', typeof subtopic);
        console.log('   Has name:', !!subtopic.name);
        console.log('   Name value:', subtopic.name);
        console.log('   Children count:', subtopic.children?.length || 0);
        
        if (subtopic.children && subtopic.children.length > 0) {
          subtopic.children.forEach((child, childIndex) => {
            console.log(`     ${childIndex + 1}. Child:`, child.name);
          });
        }
      });
    }
    
    console.log('\n🔍 Full JSON Structure:');
    console.log(JSON.stringify(mindmap, null, 2));
    
    // Test frontend compatibility
    console.log('\n✅ Frontend Compatibility Check:');
    const hasTopic = !!mindmap.topic;
    const hasSubtopics = Array.isArray(mindmap.subtopics);
    const hasNameFields = mindmap.subtopics?.every(st => typeof st === 'object' && st.name);
    
    console.log('✅ Has topic:', hasTopic);
    console.log('✅ Has subtopics array:', hasSubtopics);
    console.log('✅ All subtopics have name field:', hasNameFields);
    
    if (hasTopic && hasSubtopics && hasNameFields) {
      console.log('🎉 Mindmap is compatible with frontend!');
    } else {
      console.log('❌ Mindmap has compatibility issues');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Error details:', error.message);
  }
}

// Run the test
testMindmapFix();
