import cron from 'node-cron';
import { Op } from 'sequelize';
import Warranty from '../models/Warranty';
import emailService from './emailService';

class WarrantyCronService {
  constructor() {
    this.setupCronJobs();
  }

  private setupCronJobs() {
    // Run every day at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('Running warranty expiry reminder job...');
      await this.sendExpiryReminders();
    });

    // Run every Monday at 10:00 AM for weekly reports
    cron.schedule('0 10 * * 1', async () => {
      console.log('Running weekly warranty report job...');
      await this.generateWeeklyReport();
    });
  }

  // Send expiry reminders for warranties expiring in 15 days
  private async sendExpiryReminders(): Promise<void> {
    try {
      const fifteenDaysFromNow = new Date();
      fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      // Find warranties expiring in 15 days
      const expiringWarranties = await Warranty.findAll({
        where: {
          expiry_date: {
            [Op.between]: [sevenDaysFromNow, fifteenDaysFromNow],
          },
        },
        include: [
          {
            model: require('../models/Product').default,
            as: 'product',
            attributes: ['product_id', 'name', 'warranty_months'],
          },
          {
            model: require('../models/User').default,
            as: 'user',
            attributes: ['user_id', 'name', 'email'],
          },
        ],
      });

      console.log(`Found ${expiringWarranties.length} warranties expiring soon`);

      for (const warranty of expiringWarranties) {
        try {
          const warrantyData = warranty as any;
          const user = warrantyData.user;
          const product = warrantyData.product;
          const expiryDate = new Date(warrantyData.expiry_date);
          const today = new Date();
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          await emailService.sendWarrantyExpiryReminder(
            user.email,
            user.name,
            warranty,
            product,
            daysUntilExpiry
          );
          console.log(`Expiry reminder sent for warranty ${warrantyData.warranty_id}`);
        } catch (error) {
          console.error(`Failed to send expiry reminder for warranty ${(warranty as any).warranty_id}:`, error);
        }
      }

      console.log('Warranty expiry reminder job completed');
    } catch (error) {
      console.error('Error in warranty expiry reminder job:', error);
    }
  }

  // Generate weekly warranty report
  private async generateWeeklyReport(): Promise<void> {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const now = new Date();

      // Get statistics for the past week
      const [
        newWarranties,
        expiringWarranties,
        expiredWarranties,
        totalActiveWarranties,
      ] = await Promise.all([
        // New warranties registered in the past week
        Warranty.count({
          where: {
            created_at: {
              [Op.gte]: oneWeekAgo,
            },
          },
        }),

        // Warranties expiring in the next 30 days
        Warranty.count({
          where: {
            expiry_date: {
              [Op.between]: [now, new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)],
            },
          },
        }),

        // Warranties that expired in the past week
        Warranty.count({
          where: {
            expiry_date: {
              [Op.between]: [oneWeekAgo, now],
            },
          },
        }),

        // Total active warranties
        Warranty.count({
          where: {
            expiry_date: {
              [Op.gte]: now,
            },
          },
        }),
      ]);

      const report = {
        period: 'Past Week',
        newWarranties,
        expiringWarranties,
        expiredWarranties,
        totalActiveWarranties,
        generatedAt: new Date().toISOString(),
      };

      console.log('Weekly Warranty Report:', report);

      // You can extend this to send the report to administrators
      // await emailService.sendWeeklyReport(report);

    } catch (error) {
      console.error('Error generating weekly warranty report:', error);
    }
  }

  // Manual trigger for testing
  public async triggerExpiryReminders(): Promise<void> {
    console.log('Manually triggering expiry reminders...');
    await this.sendExpiryReminders();
  }

  public async triggerWeeklyReport(): Promise<void> {
    console.log('Manually triggering weekly report...');
    await this.generateWeeklyReport();
  }
}

export default new WarrantyCronService();
