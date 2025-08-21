const { createClient } = require('@supabase/supabase-js');

// Hard-coded Supabase configuration with correct project ID
const supabaseUrl = 'https://zekpxswndrlqqszmxhwb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpla3B4c3duZHJscXFzem14aHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI2NjY1OCwiZXhwIjoyMDcwODQyNjU4fQ.Tled2alDDtDMTri7oXmyeh5DkE38tbhiRyiK_JoxxQI';

console.log('🔗 Initializing Supabase client with project ID: zekpxswndrlqqszmxhwb');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;

