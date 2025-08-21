const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Supabase configuration
const supabaseUrl = 'https://zekpxswndrlqqszmxhwb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpla3B4c3duZHJscXFzem14aHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI2NjY1OCwiZXhwIjoyMDcwODQyNjU4fQ.Tled2alDDtDMTri7oXmyeh5DkE38tbhiRyiK_JoxxQI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSupabase() {
  console.log('🧪 Testing Supabase Connection...\n');

  try {
    // Test 1: Check if we can connect to Supabase
    console.log('1. Testing connection...');
    const { data: testData, error: testError } = await supabase
      .from('notes')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('❌ Connection failed:', testError.message);
      return;
    }

    console.log('✅ Supabase connection successful!');

    // Test 2: Check if tables exist
    console.log('\n2. Checking tables...');
    
    // Check notes table
    const { data: notesData, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .limit(1);

    if (notesError) {
      console.log('❌ Notes table error:', notesError.message);
    } else {
      console.log('✅ Notes table exists');
      console.log(`   Found ${notesData.length} notes`);
    }

    // Test 3: Create test user with proper UUID
    console.log('\n3. Creating test user...');
    const userId = uuidv4();
    const testUser = {
      id: userId,
      email: 'test@example.com',
      password: 'test_password_hash',
      created_at: new Date().toISOString()
    };

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([testUser])
      .select();

    if (userError) {
      console.log('❌ User creation failed:', userError.message);
    } else {
      console.log('✅ Test user created successfully!');
      console.log('   User ID:', userData[0].id);
    }

    // Test 4: Create test note
    console.log('\n4. Creating test note...');
    const noteId = uuidv4();
         const testNote = {
       id: noteId,
       user_id: '123e4567-e89b-12d3-a456-426614174000',
       title: 'Test Note from Backend',
       content: 'This is a test note created by the backend to verify the API is working.',
       type: 'text',
       summary: 'A test note for API verification',
       key_points: ['Test', 'API', 'Verification'],
       headings: ['Test Note'],
       tags: ['test', 'api'],
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
    } else {
      console.log('✅ Test note created successfully!');
      console.log('   Note ID:', noteData[0].id);
      console.log('   Title:', noteData[0].title);
    }

    // Test 5: Fetch all notes
    console.log('\n5. Fetching all notes...');
    const { data: allNotes, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.log('❌ Fetch failed:', fetchError.message);
    } else {
      console.log('✅ Successfully fetched notes!');
      console.log(`   Total notes: ${allNotes.length}`);
      allNotes.forEach((note, index) => {
        console.log(`   ${index + 1}. ${note.title} (${note.id})`);
      });
    }

    console.log('\n🎉 Supabase test completed successfully!');
    console.log('Your backend should now be able to connect and fetch data.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSupabase();
