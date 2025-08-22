# UPSC/GPSC News Service

A comprehensive news service for UPSC/GPSC preparation that automatically fetches, categorizes, and processes news articles with AI-generated content.

## Features

### 📰 News Sources
- **The Hindu RSS Feeds:**
  - Main Feed: https://www.thehindu.com/feeder/default.rss
  - World News: https://www.thehindu.com/news/international/feeder/default.rss
  - National News: https://www.thehindu.com/news/national/feeder/default.rss
  - Business/Economy: https://www.thehindu.com/business/Economy/feeder/default.rss
  - Science & Tech: https://www.thehindu.com/sci-tech/feeder/default.rss
  - Environment: https://www.thehindu.com/sci-tech/energy-and-environment/feeder/default.rss
  - Education: https://www.thehindu.com/education/feeder/default.rss

- **Times of India RSS Feeds:**
  - Main Feed: https://timesofindia.indiatimes.com/rss.cms
  - Top Stories: https://timesofindia.indiatimes.com/rssfeedstopstories.cms

### 🏷️ Categories
- Polity & Governance
- Economy
- Environment & Ecology
- Science & Technology
- International Relations
- Current Affairs

### 🤖 AI-Generated Content
For each important article, the service generates:
- **5 UPSC/GPSC-style MCQs** with explanations
- **5 Educational Flashcards** (front/back format)
- **Mindmap Summary** with key concepts and interconnections
- **Concise Summary** (300 characters)

### ⏰ Automated Processing
- **Daily News Fetching:** 6:00 AM IST (automated)
- **Weekly Cleanup:** Sunday 2:00 AM IST (removes articles older than 30 days)
- **Deduplication:** Prevents duplicate articles
- **Manual Triggers:** Available for immediate processing

## API Endpoints

### Get Daily News
```http
GET /api/news/daily-news?date=2024-01-15
```
Returns all news articles for a specific date with AI-generated content.

### Get News by Category
```http
GET /api/news/category/Polity%20%26%20Governance
```
Returns all articles in a specific category.

### Get News Statistics
```http
GET /api/news/stats
```
Returns statistics about articles, categories, and AI content generation.

### Manual News Processing
```http
POST /api/news/process
```
Manually triggers news fetching and processing.

### Cleanup Old Articles
```http
DELETE /api/news/cleanup
```
Removes articles older than 30 days.

### Get Available Categories
```http
GET /api/news/categories
```
Returns list of available news categories.

## Database Schema

### news_articles Table
```sql
CREATE TABLE news_articles (
    id UUID PRIMARY KEY,
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
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install rss-parser node-cron cheerio
```

### 2. Create Database Tables
Run the SQL script in `create-news-tables.sql` in your Supabase database.

### 3. Configure Environment
Ensure your OpenAI API key is configured in `src/config/aiClient.js`.

### 4. Start the Server
```bash
npm start
```

The cron jobs will automatically start and schedule:
- Daily news processing at 6:00 AM IST
- Weekly cleanup at 2:00 AM IST on Sundays

## Testing

### Run Service Tests
```bash
node test-news-service.js
```

### Test API Endpoints
```bash
# Get daily news
curl http://localhost:3000/api/news/daily-news

# Get news by category
curl http://localhost:3000/api/news/category/Polity%20%26%20Governance

# Get statistics
curl http://localhost:3000/api/news/stats

# Manual processing
curl -X POST http://localhost:3000/api/news/process
```

## Response Format

### Daily News Response
```json
{
  "date": "2024-01-15",
  "news": [
    {
      "id": "uuid",
      "title": "Article Title",
      "category": "Polity & Governance",
      "summary": "Brief summary...",
      "source": "The Hindu",
      "link": "https://article-url.com",
      "mcqs": [
        {
          "question": "Question text?",
          "options": ["A", "B", "C", "D"],
          "correct_answer": 0,
          "explanation": "Explanation..."
        }
      ],
      "flashcards": [
        {
          "front": "Question/Concept",
          "back": "Answer/Explanation"
        }
      ],
      "mindmap": {
        "topic": "Main Topic",
        "subtopics": [
          {
            "name": "Subtopic",
            "children": [{"name": "Key Point"}]
          }
        ]
      },
      "created_at": "2024-01-15T06:00:00Z"
    }
  ]
}
```

## Architecture

### Services
- **NewsService:** Main service handling RSS feeds, AI processing, and data management
- **CronService:** Manages scheduled tasks for news processing and cleanup
- **NewsModel:** Database operations for news articles

### Key Components
1. **RSS Parser:** Fetches and parses RSS feeds from multiple sources
2. **Content Extractor:** Uses Cheerio to extract full article content
3. **AI Categorizer:** Uses OpenAI to categorize articles into UPSC/GPSC categories
4. **Content Generator:** Creates MCQs, flashcards, and mindmaps using AI
5. **Deduplication:** Prevents duplicate articles based on title and source
6. **Scheduler:** Automated daily processing and weekly cleanup

## Monitoring

### Logs
The service provides detailed logging for:
- RSS feed fetching
- Article processing
- AI content generation
- Database operations
- Cron job execution

### Statistics
Track article counts, category distribution, and AI content generation success rates.

## Customization

### Adding New RSS Feeds
Edit the `rssFeeds` object in `src/services/newsService.js`:
```javascript
this.rssFeeds = {
  newSource: {
    main: 'https://news-source.com/rss',
    category: 'https://news-source.com/category/rss'
  }
};
```

### Modifying Categories
Update the `categories` array in `src/services/newsService.js`:
```javascript
this.categories = [
  'Your Category 1',
  'Your Category 2'
];
```

### Adjusting AI Processing
Modify the `isImportantArticle` method to change which articles get AI processing.

## Troubleshooting

### Common Issues
1. **RSS Feed Errors:** Check feed URLs and network connectivity
2. **AI Processing Failures:** Verify OpenAI API key and rate limits
3. **Database Errors:** Ensure Supabase connection and table permissions
4. **Cron Job Issues:** Check timezone settings and server time

### Debug Mode
Enable detailed logging by setting environment variables:
```bash
DEBUG=true npm start
```

## Performance Considerations

- RSS feeds are fetched with rate limiting
- AI processing is limited to important articles
- Database queries are optimized with indexes
- Old articles are automatically cleaned up
- Content is cached to reduce API calls

## Security

- Row Level Security (RLS) enabled on database
- Input validation on all API endpoints
- Rate limiting for AI API calls
- Secure handling of API keys
