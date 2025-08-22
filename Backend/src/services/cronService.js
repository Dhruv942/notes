const cron = require('node-cron');
const newsService = require('./newsService');

class CronService {
  constructor() {
    this.jobs = [];
  }

  // Initialize all cron jobs
  init() {
    console.log('⏰ Initializing cron jobs...');
    
    // Daily news processing at 6 AM IST (12:30 AM UTC)
    this.scheduleNewsProcessing();
    
    // Weekly cleanup of old articles on Sunday at 2 AM IST (8:30 PM UTC Saturday)
    this.scheduleCleanup();
    
    console.log('✅ Cron jobs initialized successfully');
  }

  // Schedule daily news processing
  scheduleNewsProcessing() {
    const job = cron.schedule('30 0 * * *', async () => {
      console.log('⏰ Running scheduled news processing...');
      try {
        const savedCount = await newsService.processAndSaveArticles();
        console.log(`✅ Scheduled news processing completed. Saved ${savedCount} articles.`);
      } catch (error) {
        console.error('❌ Error in scheduled news processing:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    this.jobs.push({ name: 'news-processing', job });
    console.log('📅 Scheduled daily news processing at 6:00 AM IST');
  }

  // Schedule weekly cleanup
  scheduleCleanup() {
    const job = cron.schedule('30 20 * * 0', async () => {
      console.log('⏰ Running scheduled cleanup...');
      try {
        const deletedCount = await newsService.cleanupOldArticles();
        console.log(`✅ Scheduled cleanup completed. Deleted ${deletedCount?.length || 0} old articles.`);
      } catch (error) {
        console.error('❌ Error in scheduled cleanup:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    this.jobs.push({ name: 'cleanup', job });
    console.log('📅 Scheduled weekly cleanup on Sunday at 2:00 AM IST');
  }

  // Manually trigger news processing
  async triggerNewsProcessing() {
    console.log('🚀 Manually triggering news processing...');
    try {
      const savedCount = await newsService.processAndSaveArticles();
      console.log(`✅ Manual news processing completed. Saved ${savedCount} articles.`);
      return savedCount;
    } catch (error) {
      console.error('❌ Error in manual news processing:', error);
      throw error;
    }
  }

  // Manually trigger cleanup
  async triggerCleanup() {
    console.log('🗑️ Manually triggering cleanup...');
    try {
      const deletedCount = await newsService.cleanupOldArticles();
      console.log(`✅ Manual cleanup completed. Deleted ${deletedCount?.length || 0} old articles.`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Error in manual cleanup:', error);
      throw error;
    }
  }

  // Get cron job status
  getJobStatus() {
    return this.jobs.map(job => ({
      name: job.name,
      running: job.job.running,
      nextDate: job.job.nextDate()
    }));
  }

  // Stop all cron jobs
  stop() {
    console.log('⏹️ Stopping all cron jobs...');
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      console.log(`⏹️ Stopped job: ${name}`);
    });
  }
}

module.exports = new CronService();
