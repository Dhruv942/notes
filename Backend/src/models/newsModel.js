const supabase = require('../config/supabase');

class NewsModel {
  constructor() {
    this.tableName = 'news_articles';
  }

  // Create news article
  async createArticle(articleData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([articleData])
        .select();

      if (error) {
        console.error('❌ Error creating news article:', error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('❌ NewsModel.createArticle error:', error);
      throw error;
    }
  }

  // Get articles by date
  async getArticlesByDate(date) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('date', date)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching articles by date:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ NewsModel.getArticlesByDate error:', error);
      throw error;
    }
  }

  // Get articles by category
  async getArticlesByCategory(category) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching articles by category:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ NewsModel.getArticlesByCategory error:', error);
      throw error;
    }
  }

  // Check if article exists (for deduplication)
  async articleExists(title, source) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('title', title)
        .eq('source', source)
        .limit(1);

      if (error) {
        console.error('❌ Error checking article existence:', error);
        throw error;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('❌ NewsModel.articleExists error:', error);
      throw error;
    }
  }

  // Get latest articles
  async getLatestArticles(limit = 50) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching latest articles:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ NewsModel.getLatestArticles error:', error);
      throw error;
    }
  }

  // Delete old articles (cleanup)
  async deleteOldArticles(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data, error } = await supabase
        .from(this.tableName)
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select();

      if (error) {
        console.error('❌ Error deleting old articles:', error);
        throw error;
      }

      console.log(`🗑️ Deleted ${data?.length || 0} old articles`);
      return data;
    } catch (error) {
      console.error('❌ NewsModel.deleteOldArticles error:', error);
      throw error;
    }
  }

  // Get article statistics
  async getArticleStats() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('category, created_at');

      if (error) {
        console.error('❌ Error fetching article stats:', error);
        throw error;
      }

      const stats = {
        total: data.length,
        byCategory: {},
        byDate: {}
      };

      data.forEach(article => {
        // Count by category
        stats.byCategory[article.category] = (stats.byCategory[article.category] || 0) + 1;
        
        // Count by date
        const date = article.created_at.split('T')[0];
        stats.byDate[date] = (stats.byDate[date] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('❌ NewsModel.getArticleStats error:', error);
      throw error;
    }
  }
}

module.exports = new NewsModel();
