-- Create news_articles table for UPSC/GPSC news service
CREATE TABLE IF NOT EXISTS news_articles (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_articles_date ON news_articles(date);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_articles_created_at ON news_articles(created_at);
CREATE INDEX IF NOT EXISTS idx_news_articles_title_source ON news_articles(title, source);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_news_articles_updated_at 
    BEFORE UPDATE ON news_articles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can customize this based on your needs)
CREATE POLICY "Allow all operations on news_articles" ON news_articles
    FOR ALL USING (true);

-- Create a view for daily news summary
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

-- Create a view for category statistics
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

-- Insert sample categories for reference
INSERT INTO news_articles (title, description, content, link, source, feed_type, category, date)
VALUES 
    ('Sample Article 1', 'This is a sample article for testing', 'Sample content for testing purposes', 'https://example.com/1', 'The Hindu', 'main', 'Polity & Governance', CURRENT_DATE),
    ('Sample Article 2', 'Another sample article for testing', 'More sample content for testing', 'https://example.com/2', 'Times of India', 'main', 'Economy', CURRENT_DATE)
ON CONFLICT (title, source) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON news_articles TO authenticated;
GRANT ALL ON news_articles TO anon;
GRANT ALL ON daily_news_summary TO authenticated;
GRANT ALL ON daily_news_summary TO anon;
GRANT ALL ON category_stats TO authenticated;
GRANT ALL ON category_stats TO anon;
