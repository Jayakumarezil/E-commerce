import emailService from './emailService';
import { Warranty, Claim, Order, User, Product, OrderItem } from '../models';
import { Op } from 'sequelize';

class NotificationService {
  // Order-related notifications
  async sendOrderConfirmation(orderId: string): Promise<void> {
    try {
      const order = await Order.findByPk(orderId, {
        include: [
          { model: User, as: 'user' },
          { 
            model: OrderItem, 
            as: 'orderItems',
            include: [{ model: Product, as: 'product' }]
          }
        ]
      });

      if (!order || !(order as any).user) {
        throw new Error('Order or user not found');
      }

      await emailService.sendOrderConfirmationEmail(
        (order as any).user.email,
        (order as any).user.name,
        order.order_id,
        typeof order.total_price === 'string' ? parseFloat(order.total_price) : order.total_price,
        order,
        (order as any).orderItems || []
      );

      // Send admin notification
      await emailService.sendAdminAlert(
        'New Order Received',
        `A new order has been placed by ${(order as any).user.name}`,
        {
          orderId: order.order_id,
          customerEmail: (order as any).user.email,
          totalAmount: order.total_price,
          itemsCount: (order as any).orderItems?.length || 0
        }
      );

      console.log(`Order confirmation email sent for order ${orderId}`);
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
      throw error;
    }
  }

  async sendOrderStatusUpdate(orderId: string, status: string, trackingNumber?: string): Promise<void> {
    try {
      const order = await Order.findByPk(orderId, {
        include: [{ model: User, as: 'user' }]
      });

      if (!order || !(order as any).user) {
        throw new Error('Order or user not found');
      }

      await emailService.sendOrderStatusUpdate(
        (order as any).user.email,
        (order as any).user.name,
        order.order_id,
        status,
        trackingNumber
      );

      console.log(`Order status update email sent for order ${orderId}`);
    } catch (error) {
      console.error('Failed to send order status update:', error);
      throw error;
    }
  }

  // Warranty-related notifications
  async sendWarrantyRegistrationConfirmation(warrantyId: string): Promise<void> {
    try {
      const warranty = await Warranty.findByPk(warrantyId, {
        include: [
          { model: User, as: 'user' },
          { model: Product, as: 'product' }
        ]
      });

      if (!warranty || !(warranty as any).user || !(warranty as any).product) {
        throw new Error('Warranty, user, or product not found');
      }

      await emailService.sendWarrantyRegistrationConfirmation(
        (warranty as any).user.email,
        (warranty as any).user.name,
        warranty,
        (warranty as any).product
      );

      console.log(`Warranty registration confirmation sent for warranty ${warrantyId}`);
    } catch (error) {
      console.error('Failed to send warranty registration confirmation:', error);
      throw error;
    }
  }

  async sendWarrantyExpiryReminder(warrantyId: string): Promise<void> {
    try {
      const warranty = await Warranty.findByPk(warrantyId, {
        include: [
          { model: User, as: 'user' },
          { model: Product, as: 'product' }
        ]
      });

      if (!warranty || !(warranty as any).user || !(warranty as any).product) {
        throw new Error('Warranty, user, or product not found');
      }

      const expiryDate = new Date(warranty.expiry_date);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      await emailService.sendWarrantyExpiryReminder(
        (warranty as any).user.email,
        (warranty as any).user.name,
        warranty,
        (warranty as any).product,
        daysUntilExpiry
      );

      console.log(`Warranty expiry reminder sent for warranty ${warrantyId}`);
    } catch (error) {
      console.error('Failed to send warranty expiry reminder:', error);
      throw error;
    }
  }

  // Claim-related notifications
  async sendClaimStatusUpdate(claimId: string, status: string, notes?: string): Promise<void> {
    try {
      const claim = await Claim.findByPk(claimId, {
        include: [
          { model: User, as: 'user' },
          { model: Product, as: 'product' }
        ]
      });

      if (!claim || !(claim as any).user || !(claim as any).product) {
        throw new Error('Claim, user, or product not found');
      }

      await emailService.sendClaimStatusUpdate(
        (claim as any).user.email,
        (claim as any).user.name,
        claim,
        (claim as any).product,
        status,
        notes
      );

      // Send admin notification for new claims
      if (status === 'pending') {
        await emailService.sendAdminAlert(
          'New Warranty Claim',
          `A new warranty claim has been submitted by ${(claim as any).user.name}`,
          {
            claimId: claim.claim_id,
            customerEmail: (claim as any).user.email,
            productName: (claim as any).product.name,
            issueDescription: claim.issue_description
          }
        );
      }

      console.log(`Claim status update email sent for claim ${claimId}`);
    } catch (error) {
      console.error('Failed to send claim status update:', error);
      throw error;
    }
  }

  // User-related notifications
  async sendWelcomeEmail(userId: string): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      await emailService.sendWelcomeEmail(user.email, user.name);
      console.log(`Welcome email sent to user ${userId}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(userId: string, resetToken: string): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
      console.log(`Password reset email sent to user ${userId}`);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw error;
    }
  }

  async sendPasswordResetConfirmation(userId: string): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      await emailService.sendPasswordResetConfirmation(user.email, user.name);
      console.log(`Password reset confirmation sent to user ${userId}`);
    } catch (error) {
      console.error('Failed to send password reset confirmation:', error);
      throw error;
    }
  }

  // Admin notifications
  async sendLowStockAlert(productId: string): Promise<void> {
    try {
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      await emailService.sendAdminAlert(
        'Low Stock Alert',
        `Product "${product.name}" is running low on stock`,
        {
          productId: product.product_id,
          productName: product.name,
          currentStock: product.stock,
          threshold: 10 // You can make this configurable
        }
      );

      console.log(`Low stock alert sent for product ${productId}`);
    } catch (error) {
      console.error('Failed to send low stock alert:', error);
      throw error;
    }
  }

  async sendMonthlySalesReport(): Promise<void> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      const orders = await Order.findAll({
        where: {
          created_at: {
            [Op.between]: [startOfMonth, endOfMonth]
          },
          order_status: { [Op.ne]: 'cancelled' }
        },
        include: [
          { model: User, as: 'user' },
          { 
            model: OrderItem, 
            as: 'orderItems',
            include: [{ model: Product, as: 'product' }]
          }
        ]
      });

      const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total_price.toString()), 0);
      const totalOrders = orders.length;
      const totalCustomers = new Set(orders.map(order => order.user_id)).size;

      // Top selling products
      const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
      orders.forEach(order => {
        (order as any).orderItems?.forEach((item: any) => {
          const productId = item.product_id;
          if (!productSales[productId]) {
            productSales[productId] = {
              name: item.product?.name || 'Unknown Product',
              quantity: 0,
              revenue: 0
            };
          }
          productSales[productId].quantity += item.quantity;
          productSales[productId].revenue += item.quantity * parseFloat(item.price_at_purchase);
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      await emailService.sendAdminAlert(
        'Monthly Sales Report',
        `Sales report for ${startOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        {
          period: `${startOfMonth.toLocaleDateString()} - ${endOfMonth.toLocaleDateString()}`,
          totalSales: totalSales.toFixed(2),
          totalOrders,
          totalCustomers,
          topProducts
        }
      );

      console.log('Monthly sales report sent');
    } catch (error) {
      console.error('Failed to send monthly sales report:', error);
      throw error;
    }
  }

  // Bulk operations
  async sendWarrantyExpiryReminders(): Promise<void> {
    try {
      const fifteenDaysFromNow = new Date();
      fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

      const warranties = await Warranty.findAll({
        where: {
          expiry_date: {
            [Op.between]: [new Date(), fifteenDaysFromNow]
          }
        },
        include: [
          { model: User, as: 'user' },
          { model: Product, as: 'product' }
        ]
      });

      for (const warranty of warranties) {
        if ((warranty as any).user && (warranty as any).product) {
          const expiryDate = new Date(warranty.expiry_date);
          const today = new Date();
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          await emailService.sendWarrantyExpiryReminder(
            (warranty as any).user.email,
            (warranty as any).user.name,
            warranty,
            (warranty as any).product,
            daysUntilExpiry
          );
        }
      }

      console.log(`Warranty expiry reminders sent for ${warranties.length} warranties`);
    } catch (error) {
      console.error('Failed to send warranty expiry reminders:', error);
      throw error;
    }
  }

  async checkLowStockProducts(): Promise<void> {
    try {
      const lowStockProducts = await Product.findAll({
        where: {
          stock: {
            [Op.lte]: 10 // Products with 10 or fewer items
          },
          is_active: true
        }
      });

      for (const product of lowStockProducts) {
        await this.sendLowStockAlert(product.product_id);
      }

      console.log(`Low stock alerts sent for ${lowStockProducts.length} products`);
    } catch (error) {
      console.error('Failed to check low stock products:', error);
      throw error;
    }
  }
}

export default new NotificationService();
