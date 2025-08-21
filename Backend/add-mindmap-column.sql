-- Add mind_map column to notes table
-- Run this in your Supabase SQL Editor

-- Check if mind_map column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'mind_map'
        AND table_schema = 'public'
    ) THEN
        -- Add the mind_map column
        ALTER TABLE notes ADD COLUMN mind_map JSONB;
        RAISE NOTICE 'mind_map column added successfully';
    ELSE
        RAISE NOTICE 'mind_map column already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'notes' 
AND table_schema = 'public'
ORDER BY ordinal_position;
