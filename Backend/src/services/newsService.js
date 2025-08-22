const Parser = require('rss-parser');
const cheerio = require('cheerio');
const aiService = require('./aiService');
const newsModel = require('../models/newsModel');

class NewsService {
  constructor() {
    this.parser = new Parser();
    this.rssFeeds = {
      theHindu: {
        main: 'https://www.thehindu.com/feeder/default.rss',
        world: 'https://www.thehindu.com/news/international/feeder/default.rss',
        national: 'https://www.thehindu.com/news/national/feeder/default.rss',
        business: 'https://www.thehindu.com/business/Economy/feeder/default.rss',
        sciTech: 'https://www.thehindu.com/sci-tech/feeder/default.rss',
        environment: 'https://www.thehindu.com/sci-tech/energy-and-environment/feeder/default.rss',
        education: 'https://www.thehindu.com/education/feeder/default.rss'
      },
      timesOfIndia: {
        main: 'https://timesofindia.indiatimes.com/rss.cms',
        topStories: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms'
      }
    };
    
    this.categories = [
      'Polity & Governance',
      'Economy',
      'Environment & Ecology',
      'Science & Technology',
      'International Relations',
      'Current Affairs'
    ];

    // 🎯 TOKEN OPTIMIZATION: Settings for output generation only
    this.optimizationSettings = {
      maxMCQs: 3,                    // Reduce from 5 to 3
      maxFlashcards: 3,              // Reduce from 5 to 3
      maxSummaryLength: 200,         // Reduce from 300 to 200
      batchSize: 5,                  // Process in batches
      temperature: 0.3,              // Lower temperature for consistency
      importantKeywords: [
        'government', 'policy', 'economy', 'environment', 'technology',
        'international', 'supreme court', 'parliament', 'ministry',
        'budget', 'election', 'climate', 'digital', 'health', 'covid',
        'india', 'china', 'usa', 'russia', 'europe', 'asia', 'africa',
        'constitution', 'amendment', 'bill', 'act', 'scheme', 'program',
        'development', 'infrastructure', 'education', 'healthcare',
        'agriculture', 'industry', 'trade', 'finance', 'banking'
      ]
    };
  }

  // 🎯 TOKEN OPTIMIZATION: Smart importance detection using full content
  isImportantArticle(category, title, fullContent) {
    const text = `${title} ${fullContent}`.toLowerCase();
    
    // Check for important keywords in FULL content
    const keywordMatches = this.optimizationSettings.importantKeywords.filter(keyword => 
      text.includes(keyword)
    );
    
    // Score based on multiple factors
    const keywordScore = keywordMatches.length;
    const categoryScore = category !== 'Current Affairs' ? 2 : 0;
    const contentLengthScore = fullContent.length > 1000 ? 1 : 0;
    const titleScore = this.hasImportantTitle(title) ? 1 : 0;
    
    const totalScore = keywordScore + categoryScore + contentLengthScore + titleScore;
    
    // Only process articles with score >= 2 (lowered threshold)
    return totalScore >= 2;
  }

  // Check if title contains important keywords
  hasImportantTitle(title) {
    const importantTitleKeywords = [
      'government', 'policy', 'supreme court', 'parliament', 'ministry',
      'budget', 'election', 'constitution', 'amendment', 'bill',
      'india', 'china', 'usa', 'russia', 'europe'
    ];
    
    const titleLower = title.toLowerCase();
    return importantTitleKeywords.some(keyword => titleLower.includes(keyword));
  }

  // Fetch and parse RSS feeds
  async fetchRSSFeeds() {
    const allArticles = [];
    
    try {
      console.log('📰 Fetching RSS feeds...');
      
      // Fetch from The Hindu feeds
      for (const [feedName, feedUrl] of Object.entries(this.rssFeeds.theHindu)) {
        try {
          console.log(`📰 Fetching The Hindu ${feedName} feed...`);
          const feed = await this.parser.parseURL(feedUrl);
          
          for (const item of feed.items.slice(0, 8)) { // Reduced from 10 to 8
            const article = await this.processRSSItem(item, 'The Hindu', feedName);
            if (article) {
              allArticles.push(article);
            }
          }
        } catch (error) {
          console.error(`❌ Error fetching The Hindu ${feedName} feed:`, error.message);
        }
      }

      // Fetch from Times of India feeds
      for (const [feedName, feedUrl] of Object.entries(this.rssFeeds.timesOfIndia)) {
        try {
          console.log(`📰 Fetching TOI ${feedName} feed...`);
          const feed = await this.parser.parseURL(feedUrl);
          
          for (const item of feed.items.slice(0, 8)) { // Reduced from 10 to 8
            const article = await this.processRSSItem(item, 'Times of India', feedName);
            if (article) {
              allArticles.push(article);
            }
          }
        } catch (error) {
          console.error(`❌ Error fetching TOI ${feedName} feed:`, error.message);
        }
      }

      console.log(`✅ Fetched ${allArticles.length} articles from RSS feeds`);
      return allArticles;
    } catch (error) {
      console.error('❌ Error fetching RSS feeds:', error);
      throw error;
    }
  }

  // Process individual RSS item
  async processRSSItem(item, source, feedType) {
    try {
      // Extract content from RSS item
      const title = item.title || '';
      const description = item.contentSnippet || item.content || '';
      const link = item.link || '';
      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
      
      // Skip if no title or description
      if (!title || !description) {
        return null;
      }

      // Check for duplicates
      const exists = await newsModel.articleExists(title, source);
      if (exists) {
        console.log(`⏭️ Skipping duplicate article: ${title}`);
        return null;
      }

      // Get full content if possible
      let fullContent = description;
      if (link) {
        try {
          const content = await this.fetchFullContent(link);
          if (content) {
            fullContent = content;
          }
        } catch (error) {
          console.log(`⚠️ Could not fetch full content for ${link}: ${error.message}`);
        }
      }

      // Categorize the article using full content
      const category = await this.categorizeArticle(title, fullContent);
      
      // Generate AI content for important articles (using full content for analysis)
      let mcqs = [];
      let flashcards = [];
      let mindmap = [];
      let summary = '';

      if (this.isImportantArticle(category, title, fullContent)) {
        console.log(`🤖 Generating AI content for: ${title}`);
        
        try {
          // 🎯 TOKEN OPTIMIZATION: Use full content for analysis but optimize output generation
          // Generate summary with reduced length
          summary = await aiService.generateSummary(fullContent, this.optimizationSettings.maxSummaryLength);
          
          // Generate fewer MCQs
          mcqs = await this.generateUPSCMCQs(fullContent);
          
          // Generate fewer flashcards
          flashcards = await this.generateFlashcards(fullContent);
          
          // Generate mindmap
          mindmap = await this.generateMindMap(fullContent);
        } catch (error) {
          console.error(`❌ Error generating AI content for ${title}:`, error.message);
        }
      } else {
        console.log(`⏭️ Skipping AI processing for: ${title} (not important enough)`);
        // Create basic summary without AI
        summary = fullContent.substring(0, this.optimizationSettings.maxSummaryLength) + '...';
      }

      return {
        title,
        content: fullContent, // Keep full content for analysis
        source_url: link,
        source,
        feed_type: feedType,
        category,
        summary,
        mcqs,
        flashcards,
        mindmap,
        published_date: pubDate.toISOString(),
        date: pubDate.toISOString().split('T')[0],
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error processing RSS item:', error);
      return null;
    }
  }

  // Fetch full content from article URL
  async fetchFullContent(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Remove script and style elements
      $('script').remove();
      $('style').remove();
      
      // Extract text content (customize selectors based on the website)
      let content = '';
      
      // The Hindu selectors
      if (url.includes('thehindu.com')) {
        content = $('.intro, .article, .story-content, .content').text();
      }
      // Times of India selectors
      else if (url.includes('timesofindia.indiatimes.com')) {
        content = $('.article_content, .content, .story-content').text();
      }
      
      // Fallback to body text if specific selectors don't work
      if (!content) {
        content = $('body').text();
      }
      
      // Clean up the content
      content = content.replace(/\s+/g, ' ').trim();
      
      return content.length > 100 ? content : null;
    } catch (error) {
      console.error(`❌ Error fetching content from ${url}:`, error.message);
      return null;
    }
  }

  // Categorize article using AI (with full content)
  async categorizeArticle(title, content) {
    try {
      const prompt = `Categorize this news article into one of these UPSC/GPSC-relevant categories:
- Polity & Governance
- Economy
- Environment & Ecology
- Science & Technology
- International Relations
- Current Affairs

Title: ${title}
Content: ${content.substring(0, 800)}... (showing first 800 chars for categorization)

Return only the category name:`;

      const category = await aiService.generateWithAI(prompt, {
        systemPrompt: 'You are an expert at categorizing news articles for UPSC/GPSC preparation. Return only the category name.',
        temperature: this.optimizationSettings.temperature
      });

      // Clean up the response
      const cleanCategory = category.trim().replace(/['"]/g, '');
      
      // Validate category
      if (this.categories.includes(cleanCategory)) {
        return cleanCategory;
      }
      
      return 'Current Affairs'; // Default category
    } catch (error) {
      console.error('❌ Error categorizing article:', error);
      return 'Current Affairs';
    }
  }

  // Generate UPSC-style MCQs (optimized for fewer questions)
  async generateUPSCMCQs(content) {
    try {
      const prompt = `Generate ${this.optimizationSettings.maxMCQs} UPSC/GPSC-style multiple choice questions from this content. 
Each question should have 4 options (A, B, C, D) and include an explanation for the correct answer.

Content: ${content}

Return as JSON array with this structure:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "explanation": "Brief explanation"
  }
]`;

      const response = await aiService.generateWithAI(prompt, {
        systemPrompt: 'You are an expert at creating UPSC/GPSC-style multiple choice questions. Return only valid JSON.',
        temperature: this.optimizationSettings.temperature
      });

      const cleanedResponse = aiService.cleanJsonResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('❌ Error generating MCQs:', error);
      return [];
    }
  }

  // Generate flashcards (optimized for fewer cards)
  async generateFlashcards(content) {
    try {
      const prompt = `Create ${this.optimizationSettings.maxFlashcards} educational flashcards from this content for UPSC/GPSC preparation.
Each flashcard should have a question/concept on the front and detailed answer/explanation on the back.

Content: ${content}

Return as JSON array with this structure:
[
  {
    "front": "Question or concept",
    "back": "Detailed answer or explanation"
  }
]`;

      const response = await aiService.generateWithAI(prompt, {
        systemPrompt: 'You are an expert at creating educational flashcards for UPSC/GPSC preparation. Return only valid JSON.',
        temperature: this.optimizationSettings.temperature
      });

      const cleanedResponse = aiService.cleanJsonResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('❌ Error generating flashcards:', error);
      return [];
    }
  }

  // Generate mindmap
  async generateMindMap(content) {
    try {
      const prompt = `Create a mind map structure from this content for UPSC/GPSC preparation.
Focus on key concepts, facts, and their interconnections.

Content: ${content}

Return as JSON object with this structure:
{
  "topic": "Main Topic",
  "subtopics": [
    {
      "name": "Subtopic 1",
      "children": [
        {"name": "Key point 1"},
        {"name": "Key point 2"}
      ]
    }
  ]
}`;

      const response = await aiService.generateWithAI(prompt, {
        systemPrompt: 'You are an expert at creating mind maps for UPSC/GPSC preparation. Return only valid JSON.',
        temperature: this.optimizationSettings.temperature
      });

      const cleanedResponse = aiService.cleanJsonResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('❌ Error generating mindmap:', error);
      return { topic: 'Main Topic', subtopics: [] };
    }
  }

  // Process and save all articles with batch optimization
  async processAndSaveArticles() {
    try {
      console.log('🚀 Starting optimized news processing...');
      
      const articles = await this.fetchRSSFeeds();
      let savedCount = 0;
      
      // 🎯 TOKEN OPTIMIZATION: Process in batches
      const batches = [];
      for (let i = 0; i < articles.length; i += this.optimizationSettings.batchSize) {
        batches.push(articles.slice(i, i + this.optimizationSettings.batchSize));
      }
      
      for (const batch of batches) {
        console.log(`📦 Processing batch of ${batch.length} articles...`);
        
        // Process batch
        for (const article of batch) {
          try {
            await newsModel.createArticle(article);
            savedCount++;
            console.log(`✅ Saved: ${article.title}`);
          } catch (error) {
            console.error(`❌ Error saving article ${article.title}:`, error.message);
          }
        }
        
        // Add delay between batches to avoid rate limits
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      console.log(`🎉 Successfully processed and saved ${savedCount} articles`);
      return savedCount;
    } catch (error) {
      console.error('❌ Error in processAndSaveArticles:', error);
      throw error;
    }
  }

  // Get daily news with AI content
  async getDailyNews(date = null) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const articles = await newsModel.getArticlesByDate(targetDate);
      
      return {
        date: targetDate,
        news: articles.map(article => ({
          id: article.id,
          title: article.title,
          category: article.category,
          summary: article.summary,
          source: article.source,
          link: article.source_url,
          mcqs: article.mcqs || [],
          flashcards: article.flashcards || [],
          mindmap: article.mindmap || {},
          created_at: article.created_at
        }))
      };
    } catch (error) {
      console.error('❌ Error getting daily news:', error);
      throw error;
    }
  }

  // Get news by category
  async getNewsByCategory(category) {
    try {
      const articles = await newsModel.getArticlesByCategory(category);
      
      return articles.map(article => ({
        id: article.id,
        title: article.title,
        category: article.category,
        summary: article.summary,
        source: article.source,
        link: article.source_url,
        mcqs: article.mcqs || [],
        flashcards: article.flashcards || [],
        mindmap: article.mindmap || {},
        created_at: article.created_at
      }));
    } catch (error) {
      console.error('❌ Error getting news by category:', error);
      throw error;
    }
  }

  // Get news statistics
  async getNewsStats() {
    try {
      return await newsModel.getArticleStats();
    } catch (error) {
      console.error('❌ Error getting news stats:', error);
      throw error;
    }
  }

  // Cleanup old articles
  async cleanupOldArticles() {
    try {
      return await newsModel.deleteOldArticles(30);
    } catch (error) {
      console.error('❌ Error cleaning up old articles:', error);
      throw error;
    }
  }
}

module.exports = new NewsService();
