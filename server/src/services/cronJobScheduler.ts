import cron from 'node-cron';
import notificationService from './notificationService';
import { Product } from '../models';
import { Op } from 'sequelize';

class CronJobScheduler {
  private jobs: Map<string, any> = new Map();

  constructor() {
    this.initializeJobs();
  }

  private initializeJobs(): void {
    // Daily warranty expiry check (runs at 9 AM every day)
    this.scheduleJob('warranty-expiry', '0 9 * * *', async () => {
      console.log('Running daily warranty expiry check...');
      try {
        await notificationService.sendWarrantyExpiryReminders();
        console.log('Warranty expiry check completed successfully');
      } catch (error) {
        console.error('Warranty expiry check failed:', error);
      }
    });

    // Weekly low stock check (runs every Monday at 10 AM)
    this.scheduleJob('low-stock', '0 10 * * 1', async () => {
      console.log('Running weekly low stock check...');
      try {
        await notificationService.checkLowStockProducts();
        console.log('Low stock check completed successfully');
      } catch (error) {
        console.error('Low stock check failed:', error);
      }
    });

    // Monthly sales report (runs on the 1st of every month at 11 AM)
    this.scheduleJob('monthly-report', '0 11 1 * *', async () => {
      console.log('Generating monthly sales report...');
      try {
        await notificationService.sendMonthlySalesReport();
        console.log('Monthly sales report generated successfully');
      } catch (error) {
        console.error('Monthly sales report generation failed:', error);
      }
    });

    // Daily cleanup job (runs at midnight every day)
    this.scheduleJob('cleanup', '0 0 * * *', async () => {
      console.log('Running daily cleanup...');
      try {
        await this.cleanupExpiredTokens();
        await this.updateProductStatus();
        console.log('Daily cleanup completed successfully');
      } catch (error) {
        console.error('Daily cleanup failed:', error);
      }
    });

    // Hourly order status updates (runs every hour)
    this.scheduleJob('order-updates', '0 * * * *', async () => {
      console.log('Checking for order status updates...');
      try {
        await this.processOrderStatusUpdates();
        console.log('Order status updates processed successfully');
      } catch (error) {
        console.error('Order status updates processing failed:', error);
      }
    });

    console.log('Cron jobs initialized successfully');
  }

  private scheduleJob(name: string, schedule: string, task: () => Promise<void>): void {
    const job = cron.schedule(schedule, async () => {
      const startTime = Date.now();
      console.log(`Starting cron job: ${name}`);
      
      try {
        await task();
        const duration = Date.now() - startTime;
        console.log(`Cron job ${name} completed in ${duration}ms`);
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`Cron job ${name} failed after ${duration}ms:`, error);
      }
    }, {
      timezone: 'Asia/Kolkata' // Set timezone
    });

    this.jobs.set(name, job);
    job.start();
    console.log(`Scheduled cron job: ${name} with schedule: ${schedule}`);
  }

  // Cleanup expired password reset tokens
  private async cleanupExpiredTokens(): Promise<void> {
    try {
      const { PasswordResetToken } = await import('../models');
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const deletedCount = await PasswordResetToken.destroy({
        where: {
          created_at: {
            [Op.lt]: oneHourAgo
          }
        }
      });

      if (deletedCount > 0) {
        console.log(`Cleaned up ${deletedCount} expired password reset tokens`);
      }
    } catch (error) {
      console.error('Failed to cleanup expired tokens:', error);
    }
  }

  // Update product status based on stock levels
  private async updateProductStatus(): Promise<void> {
    try {
      // Mark products as inactive if out of stock
      const outOfStockCount = await Product.update(
        { is_active: false },
        {
          where: {
            stock: 0,
            is_active: true
          }
        }
      );

      // Mark products as active if they have stock
      const backInStockCount = await Product.update(
        { is_active: true },
        {
          where: {
            stock: {
              [Op.gt]: 0
            },
            is_active: false
          }
        }
      );

      if (outOfStockCount[0] > 0) {
        console.log(`Marked ${outOfStockCount[0]} products as out of stock`);
      }

      if (backInStockCount[0] > 0) {
        console.log(`Marked ${backInStockCount[0]} products as back in stock`);
      }
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  }

  // Process order status updates (simulate shipping and delivery)
  private async processOrderStatusUpdates(): Promise<void> {
    try {
      const { Order } = await import('../models');
      
      // Find orders that are confirmed and should be shipped
      const ordersToShip = await Order.findAll({
        where: {
          order_status: 'confirmed',
          created_at: {
            [Op.lt]: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
          }
        },
        include: [{ model: (await import('../models')).User, as: 'user' }]
      });

      for (const order of ordersToShip) {
        // Update order status to shipped
        await order.update({ order_status: 'shipped' });
        
        // Generate tracking number
        const trackingNumber = `TRK${order.order_id.slice(-8).toUpperCase()}`;
        
        // Send notification
        if ((order as any).user) {
          await notificationService.sendOrderStatusUpdate(
            order.order_id,
            'shipped',
            trackingNumber
          );
        }

        console.log(`Order ${order.order_id} marked as shipped with tracking ${trackingNumber}`);
      }

      // Find orders that are shipped and should be delivered
      const ordersToDeliver = await Order.findAll({
        where: {
          order_status: 'shipped',
          created_at: {
            [Op.lt]: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
          }
        },
        include: [{ model: (await import('../models')).User, as: 'user' }]
      });

      for (const order of ordersToDeliver) {
        // Update order status to delivered
        await order.update({ order_status: 'delivered' });
        
        // Send notification
        if ((order as any).user) {
          await notificationService.sendOrderStatusUpdate(
            order.order_id,
            'delivered'
          );
        }

        console.log(`Order ${order.order_id} marked as delivered`);
      }
    } catch (error) {
      console.error('Failed to process order status updates:', error);
    }
  }

  // Manual job execution methods
  async runWarrantyExpiryCheck(): Promise<void> {
    console.log('Manually running warranty expiry check...');
    await notificationService.sendWarrantyExpiryReminders();
  }

  async runLowStockCheck(): Promise<void> {
    console.log('Manually running low stock check...');
    await notificationService.checkLowStockProducts();
  }

  async runMonthlySalesReport(): Promise<void> {
    console.log('Manually generating monthly sales report...');
    await notificationService.sendMonthlySalesReport();
  }

  // Job management methods
  startJob(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      job.start();
      console.log(`Started cron job: ${name}`);
    } else {
      console.error(`Cron job not found: ${name}`);
    }
  }

  stopJob(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      console.log(`Stopped cron job: ${name}`);
    } else {
      console.error(`Cron job not found: ${name}`);
    }
  }

  restartJob(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      job.start();
      console.log(`Restarted cron job: ${name}`);
    } else {
      console.error(`Cron job not found: ${name}`);
    }
  }

  getJobStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    this.jobs.forEach((job, name) => {
      status[name] = job.running;
    });
    return status;
  }

  stopAllJobs(): void {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped cron job: ${name}`);
    });
  }

  startAllJobs(): void {
    this.jobs.forEach((job, name) => {
      job.start();
      console.log(`Started cron job: ${name}`);
    });
  }
}

export default new CronJobScheduler();
