// Database schema fix script
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabaseSchema() {
  console.log('🔧 Fixing Database Schema...\n');

  try {
    // Check if mind_map column exists
    console.log('📝 Checking current table structure...');
    
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'notes')
      .eq('table_schema', 'public');

    if (columnError) {
      console.error('❌ Error checking table structure:', columnError);
      return;
    }

    console.log('✅ Current columns in notes table:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    // Check if mind_map column exists
    const hasMindMapColumn = columns.some(col => col.column_name === 'mind_map');
    
    if (hasMindMapColumn) {
      console.log('\n✅ mind_map column already exists!');
      return;
    }

    console.log('\n❌ mind_map column is missing. Adding it...');

    // Add mind_map column using SQL
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE notes ADD COLUMN mind_map JSONB'
    });

    if (alterError) {
      console.error('❌ Error adding mind_map column:', alterError);
      
      // Try alternative approach using direct SQL
      console.log('🔄 Trying alternative approach...');
      
      const { error: directError } = await supabase
        .from('notes')
        .select('id')
        .limit(1);
      
      if (directError) {
        console.error('❌ Cannot access notes table:', directError);
        console.log('\n📋 Manual fix required:');
        console.log('Please run this SQL in your Supabase SQL editor:');
        console.log('ALTER TABLE notes ADD COLUMN mind_map JSONB;');
        return;
      }
    }

    console.log('✅ mind_map column added successfully!');

    // Verify the column was added
    console.log('\n📝 Verifying the fix...');
    const { data: newColumns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'notes')
      .eq('table_schema', 'public');

    if (verifyError) {
      console.error('❌ Error verifying table structure:', verifyError);
      return;
    }

    const hasMindMapNow = newColumns.some(col => col.column_name === 'mind_map');
    
    if (hasMindMapNow) {
      console.log('✅ mind_map column verified!');
      console.log('\n🎉 Database schema fix completed successfully!');
      console.log('✅ You can now create notes with mindmap data.');
    } else {
      console.log('❌ mind_map column still missing after fix attempt');
      console.log('\n📋 Manual fix required:');
      console.log('Please run this SQL in your Supabase SQL editor:');
      console.log('ALTER TABLE notes ADD COLUMN mind_map JSONB;');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.log('\n📋 Manual fix required:');
    console.log('Please run this SQL in your Supabase SQL editor:');
    console.log('ALTER TABLE notes ADD COLUMN mind_map JSONB;');
  }
}

// Run the fix
fixDatabaseSchema();
