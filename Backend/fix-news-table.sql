-- Fix news_articles table - Add missing columns and update structure
-- Run this if you get "column date does not exist" error

-- First, let's check if the table exists and what columns it has
-- If the table doesn't exist, create it completely
DO $$ 
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'news_articles') THEN
        -- Create the complete table
        CREATE TABLE news_articles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            content TEXT,
            link TEXT,
            source TEXT NOT NULL,
            feed_type TEXT,
            category TEXT NOT NULL,
            summary TEXT,
            mcqs JSONB DEFAULT '[]',
            flashcards JSONB DEFAULT '[]',
            mindmap JSONB DEFAULT '{}',
            pub_date TIMESTAMP WITH TIME ZONE,
            date DATE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created news_articles table with all columns';
    ELSE
        -- Table exists, check and add missing columns
        RAISE NOTICE 'Table news_articles already exists, checking for missing columns...';
        
        -- Add date column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'news_articles' AND column_name = 'date') THEN
            ALTER TABLE news_articles ADD COLUMN date DATE;
            RAISE NOTICE 'Added date column';
        END IF;
        
        -- Add pub_date column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'news_articles' AND column_name = 'pub_date') THEN
            ALTER TABLE news_articles ADD COLUMN pub_date TIMESTAMP WITH TIME ZONE;
            RAISE NOTICE 'Added pub_date column';
        END IF;
        
        -- Add feed_type column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'news_articles' AND column_name = 'feed_type') THEN
            ALTER TABLE news_articles ADD COLUMN feed_type TEXT;
            RAISE NOTICE 'Added feed_type column';
        END IF;
        
        -- Add summary column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'news_articles' AND column_name = 'summary') THEN
            ALTER TABLE news_articles ADD COLUMN summary TEXT;
            RAISE NOTICE 'Added summary column';
        END IF;
        
        -- Add mcqs column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'news_articles' AND column_name = 'mcqs') THEN
            ALTER TABLE news_articles ADD COLUMN mcqs JSONB DEFAULT '[]';
            RAISE NOTICE 'Added mcqs column';
        END IF;
        
        -- Add flashcards column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'news_articles' AND column_name = 'flashcards') THEN
            ALTER TABLE news_articles ADD COLUMN flashcards JSONB DEFAULT '[]';
            RAISE NOTICE 'Added flashcards column';
        END IF;
        
        -- Add mindmap column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'news_articles' AND column_name = 'mindmap') THEN
            ALTER TABLE news_articles ADD COLUMN mindmap JSONB DEFAULT '{}';
            RAISE NOTICE 'Added mindmap column';
        END IF;
        
        -- Add updated_at column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'news_articles' AND column_name = 'updated_at') THEN
            ALTER TABLE news_articles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added updated_at column';
        END IF;
    END IF;
END $$;

-- Create indexes (will skip if they already exist)
CREATE INDEX IF NOT EXISTS idx_news_articles_date ON news_articles(date);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_articles_created_at ON news_articles(created_at);
CREATE INDEX IF NOT EXISTS idx_news_articles_title_source ON news_articles(title, source);

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS update_news_articles_updated_at ON news_articles;
CREATE TRIGGER update_news_articles_updated_at 
    BEFORE UPDATE ON news_articles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Allow all operations on news_articles" ON news_articles;
CREATE POLICY "Allow all operations on news_articles" ON news_articles
    FOR ALL USING (true);

-- Create or replace views
CREATE OR REPLACE VIEW daily_news_summary AS
SELECT 
    date,
    COUNT(*) as total_articles,
    COUNT(CASE WHEN mcqs != '[]' THEN 1 END) as articles_with_mcqs,
    COUNT(CASE WHEN flashcards != '[]' THEN 1 END) as articles_with_flashcards,
    COUNT(CASE WHEN mindmap != '{}' THEN 1 END) as articles_with_mindmap,
    COUNT(DISTINCT category) as categories_covered,
    COUNT(DISTINCT source) as sources_covered
FROM news_articles
GROUP BY date
ORDER BY date DESC;

CREATE OR REPLACE VIEW category_stats AS
SELECT 
    category,
    COUNT(*) as article_count,
    COUNT(CASE WHEN mcqs != '[]' THEN 1 END) as articles_with_mcqs,
    COUNT(CASE WHEN flashcards != '[]' THEN 1 END) as articles_with_flashcards,
    COUNT(CASE WHEN mindmap != '{}' THEN 1 END) as articles_with_mindmap,
    AVG(LENGTH(content)) as avg_content_length
FROM news_articles
GROUP BY category
ORDER BY article_count DESC;

-- Grant permissions
GRANT ALL ON news_articles TO authenticated;
GRANT ALL ON news_articles TO anon;
GRANT ALL ON daily_news_summary TO authenticated;
GRANT ALL ON daily_news_summary TO anon;
GRANT ALL ON category_stats TO authenticated;
GRANT ALL ON category_stats TO anon;

-- Insert sample data (only if table is empty)
INSERT INTO news_articles (title, description, content, link, source, feed_type, category, date)
SELECT 
    'Sample Article 1', 
    'This is a sample article for testing', 
    'Sample content for testing purposes', 
    'https://example.com/1', 
    'The Hindu', 
    'main', 
    'Polity & Governance', 
    CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM news_articles LIMIT 1);

INSERT INTO news_articles (title, description, content, link, source, feed_type, category, date)
SELECT 
    'Sample Article 2', 
    'Another sample article for testing', 
    'More sample content for testing', 
    'https://example.com/2', 
    'Times of India', 
    'main', 
    'Economy', 
    CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM news_articles WHERE title = 'Sample Article 2');

-- Show the final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'news_articles' 
ORDER BY ordinal_position;
