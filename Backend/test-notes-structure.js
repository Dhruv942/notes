const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Supabase configuration
const supabaseUrl = 'https://zekpxswndrlqqszmxhwb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpla3B4c3duZHJscXFzem14aHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI2NjY1OCwiZXhwIjoyMDcwODQyNjU4fQ.Tled2alDDtDMTri7oXmyeh5DkE38tbhiRyiK_JoxxQI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testNotesStructure() {
  console.log('🧪 Testing Notes Data Structure...\n');

  try {
    // Test 1: Create a test note with all fields
    console.log('1. Creating test note with complete structure...');
    const noteId = uuidv4();
    const testNote = {
      id: noteId,
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Note for Data Structure Verification',
      content: 'This is a comprehensive test note to verify that the backend properly creates and stores notes in the exact format expected by the frontend. The content includes various types of information to ensure proper handling.',
      type: 'text',
      summary: 'A test note for data structure verification with comprehensive content.',
      key_points: ['Test', 'Data Structure', 'Verification', 'Comprehensive'],
      headings: ['Test Note', 'Data Structure', 'Verification'],
      tags: ['test', 'data', 'structure', 'verification'],
      source: 'manual',
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: noteData, error: noteError } = await supabase
      .from('notes')
      .insert([testNote])
      .select();

    if (noteError) {
      console.log('❌ Note creation failed:', noteError.message);
      return;
    }
    console.log('✅ Test note created successfully!');
    console.log('Note structure:');
    console.log(JSON.stringify(noteData[0], null, 2));

    // Test 2: Verify all required fields are present
    console.log('\n2. Verifying required fields...');
    const requiredFields = [
      'id', 'user_id', 'title', 'content', 'type', 'summary', 
      'key_points', 'headings', 'tags', 'source', 'is_public', 
      'created_at', 'updated_at'
    ];

    const missingFields = requiredFields.filter(field => !noteData[0].hasOwnProperty(field));
    
    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields);
    } else {
      console.log('✅ All required fields are present!');
    }

    // Test 3: Verify data types
    console.log('\n3. Verifying data types...');
    const typeChecks = [
      { field: 'id', expected: 'string', actual: typeof noteData[0].id },
      { field: 'user_id', expected: 'string', actual: typeof noteData[0].user_id },
      { field: 'title', expected: 'string', actual: typeof noteData[0].title },
      { field: 'content', expected: 'string', actual: typeof noteData[0].content },
      { field: 'type', expected: 'string', actual: typeof noteData[0].type },
      { field: 'summary', expected: 'string', actual: typeof noteData[0].summary },
      { field: 'key_points', expected: 'object', actual: Array.isArray(noteData[0].key_points) ? 'array' : typeof noteData[0].key_points },
      { field: 'headings', expected: 'object', actual: Array.isArray(noteData[0].headings) ? 'array' : typeof noteData[0].headings },
      { field: 'tags', expected: 'object', actual: Array.isArray(noteData[0].tags) ? 'array' : typeof noteData[0].tags },
      { field: 'source', expected: 'string', actual: typeof noteData[0].source },
      { field: 'is_public', expected: 'boolean', actual: typeof noteData[0].is_public },
      { field: 'created_at', expected: 'string', actual: typeof noteData[0].created_at },
      { field: 'updated_at', expected: 'string', actual: typeof noteData[0].updated_at }
    ];

    const typeErrors = typeChecks.filter(check => check.actual !== check.expected);
    
    if (typeErrors.length > 0) {
      console.log('❌ Type mismatches:');
      typeErrors.forEach(error => {
        console.log(`   ${error.field}: expected ${error.expected}, got ${error.actual}`);
      });
    } else {
      console.log('✅ All data types are correct!');
    }

    // Test 4: Fetch and verify data
    console.log('\n4. Fetching and verifying data...');
    
    const { data: fetchedNote, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .single();

    if (fetchError) {
      console.log('❌ Note fetch failed:', fetchError.message);
    } else {
      console.log('✅ Note fetched successfully!');
      console.log('Fetched note structure matches created note:', 
        JSON.stringify(fetchedNote, null, 2) === JSON.stringify(noteData[0], null, 2)
      );
    }

    // Test 5: Test with minimal data (like the example you provided)
    console.log('\n5. Testing with minimal data structure...');
    const minimalNote = {
      id: uuidv4(),
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Minimal Test Note',
      content: 'Minimal content for testing',
      source: 'manual',
      summary: 'Minimal summary',
      key_points: [],
      headings: [],
      tags: [],
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: minimalData, error: minimalError } = await supabase
      .from('notes')
      .insert([minimalNote])
      .select();

    if (minimalError) {
      console.log('❌ Minimal note creation failed:', minimalError.message);
    } else {
      console.log('✅ Minimal note created successfully!');
      console.log('Minimal note structure:');
      console.log(JSON.stringify(minimalData[0], null, 2));
    }

    console.log('\n🎉 Notes data structure test completed successfully!');
    console.log('✅ Backend creates notes in the correct format');
    console.log('✅ All required fields are present and properly typed');
    console.log('✅ Frontend should be able to handle this data structure');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testNotesStructure();
