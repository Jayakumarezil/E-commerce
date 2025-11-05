import nodemailer from 'nodemailer';
import { Warranty, Claim, Order, User, Product } from '../models';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure SMTP transporter - Only use environment variables for security
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️  SMTP credentials not configured. Email sending will fail.');
      console.warn('⚠️  Please set SMTP_USER and SMTP_PASS in .env file');
    }

    // Get credentials from environment variables
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    
    // Remove spaces from App Password if present
    const cleanAppPassword = smtpPass ? smtpPass.replace(/\s+/g, '') : '';

    if (!smtpUser || !cleanAppPassword) {
      console.warn('⚠️  SMTP credentials not configured. Email sending will fail.');
      console.warn('⚠️  Please set SMTP_USER and SMTP_PASS in .env file');
      console.warn('⚠️  Gmail users need to use App Password, not regular password');
    }

    const emailConfig: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: smtpUser || '',
        pass: cleanAppPassword,
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  // Verify SMTP connection
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }

  // Send email with HTML template
  private async sendEmail(to: string, subject: string, html: string, attachments?: any[]): Promise<void> {
    try {
    const mailOptions = {
        from: `"E-Commerce Store" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  // 1. Order Confirmation Email
  async sendOrderConfirmationEmail(
    email: string,
    name: string,
    orderId: string,
    totalPrice: number,
    order: Order,
    orderItems: any[]
  ): Promise<void> {
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-size: 18px; font-weight: bold; color: #2c3e50; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
          .btn { display: inline-block; background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for your purchase, ${name}!</p>
          </div>
          <div class="content">
            <div class="order-details">
              <h2>Order Details</h2>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
              <p><strong>Estimated Delivery:</strong> ${estimatedDelivery.toLocaleDateString()}</p>
            </div>
            
            <div class="order-details">
              <h3>Items Ordered</h3>
              ${orderItems.map(item => `
                <div class="item">
                  <div>
                    <strong>${item.product?.name}</strong><br>
                    <small>Quantity: ${item.quantity} × ₹${item.price_at_purchase}</small>
                  </div>
                  <div>₹${(item.quantity * parseFloat(item.price_at_purchase)).toFixed(2)}</div>
                </div>
              `).join('')}
              
              <div class="item total">
                <div>Total Amount:</div>
                <div>₹${totalPrice.toFixed(2)}</div>
              </div>
            </div>

            <div class="order-details">
              <h3>Shipping Address</h3>
              <p>${(() => {
                try {
                  const address = JSON.parse(order.shipping_address_json);
                  // Handle both old and new address formats
                  if (address.firstName && address.lastName) {
                    return `${address.firstName} ${address.lastName}<br>${address.address}<br>${address.city}, ${address.state} ${address.zipCode}<br>${address.country}`;
                  } else if (address.name) {
                    return `${address.name}<br>${address.address}<br>${address.city}, ${address.pincode}<br>${address.phone ? `Phone: ${address.phone}` : ''}`;
                  }
                  return JSON.stringify(address);
                } catch (e) {
                  return JSON.stringify(order.shipping_address_json);
                }
              })()}</p>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/orders" class="btn">Track Your Order</a>
            </div>
          </div>
          <div class="footer">
            <p>Questions? Contact us at support@ecommerce.com</p>
            <p>© 2024 E-Commerce Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, `Order Confirmation - ${orderId}`, html);
  }

  // 2. Order Status Updates
  async sendOrderStatusUpdate(
    email: string,
    name: string,
    orderId: string,
    status: string,
    trackingNumber?: string
  ): Promise<void> {
    const statusMessages: { [key: string]: string } = {
      'shipped': 'Your order has been shipped!',
      'delivered': 'Your order has been delivered!',
      'cancelled': 'Your order has been cancelled.',
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Order Status Update</h1>
            <p>Hello ${name}!</p>
          </div>
          <div class="content">
            <div class="status-box">
              <h2>${statusMessages[status] || 'Your order status has been updated'}</h2>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Status:</strong> ${status.toUpperCase()}</p>
              ${trackingNumber ? `
                <div class="tracking">
                  <h3>Tracking Information</h3>
                  <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
                  <p>You can track your package using this number on our website.</p>
                </div>
              ` : ''}
            </div>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/orders" style="display: inline-block; background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Track Your Order</a>
            </div>
          </div>
          <div class="footer">
            <p>Questions? Contact us at support@ecommerce.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, `Order Status Update - ${orderId}`, html);
  }

  // 3. Warranty Registration Confirmation
  async sendWarrantyRegistrationConfirmation(
    email: string,
    name: string,
    warranty: any,
    product: Product
  ): Promise<void> {
    const expiryDate = new Date(warranty.expiry_date);
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Warranty Registration Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .warranty-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .terms { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; font-size: 14px; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ Warranty Registered!</h1>
            <p>Your product warranty has been successfully registered</p>
          </div>
          <div class="content">
            <div class="warranty-details">
              <h2>Warranty Details</h2>
              <p><strong>Product:</strong> ${product.name}</p>
              <p><strong>Warranty ID:</strong> ${warranty.warranty_id}</p>
              <p><strong>Registration Date:</strong> ${new Date(warranty.created_at).toLocaleDateString()}</p>
              <p><strong>Expiry Date:</strong> ${expiryDate.toLocaleDateString()}</p>
              <p><strong>Duration:</strong> ${warranty.warranty_months} months</p>
            </div>
            
            <div class="terms">
              <h3>Warranty Terms & Conditions</h3>
              <ul>
                <li>Warranty covers manufacturing defects only</li>
                <li>Physical damage due to misuse is not covered</li>
                <li>Keep your purchase receipt for warranty claims</li>
                <li>Contact support for warranty-related queries</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/warranties" style="display: inline-block; background: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">View My Warranties</a>
            </div>
          </div>
          <div class="footer">
            <p>Questions? Contact us at support@ecommerce.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, `Warranty Registration Confirmation - ${product.name}`, html);
  }

  // 4. Warranty Expiry Reminders
  async sendWarrantyExpiryReminder(
    email: string,
    name: string,
    warranty: any,
    product: Product,
    daysUntilExpiry: number
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Warranty Expiry Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .warranty-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Warranty Expiry Reminder</h1>
            <p>Your warranty expires in ${daysUntilExpiry} days!</p>
          </div>
          <div class="content">
            <div class="warning">
              <h3>⚠️ Important Notice</h3>
              <p>Your product warranty will expire in <strong>${daysUntilExpiry} days</strong>. Make sure to register any claims before the expiry date.</p>
            </div>
            
            <div class="warranty-details">
              <h2>Warranty Details</h2>
              <p><strong>Product:</strong> ${product.name}</p>
              <p><strong>Warranty ID:</strong> ${warranty.warranty_id}</p>
              <p><strong>Expiry Date:</strong> ${new Date(warranty.expiry_date).toLocaleDateString()}</p>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/claims/submit" style="display: inline-block; background: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 5px;">Submit Claim</a>
              <a href="${process.env.FRONTEND_URL}/warranties" style="display: inline-block; background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 5px;">View Warranties</a>
            </div>
          </div>
          <div class="footer">
            <p>Questions? Contact us at support@ecommerce.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, `Warranty Expiry Reminder - ${product.name}`, html);
  }

  // 5. Claim Status Updates
  async sendClaimStatusUpdate(
    email: string,
    name: string,
    claim: any,
    product: Product,
    status: string,
    notes?: string
  ): Promise<void> {
    const statusMessages: { [key: string]: string } = {
      'pending': 'Your claim is being reviewed',
      'approved': 'Your claim has been approved!',
      'rejected': 'Your claim has been rejected',
      'processing': 'Your claim is being processed',
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Claim Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .claim-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .notes { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Claim Status Update</h1>
            <p>${statusMessages[status] || 'Your claim status has been updated'}</p>
          </div>
          <div class="content">
            <div class="claim-details">
              <h2>Claim Details</h2>
              <p><strong>Claim ID:</strong> ${claim.claim_id}</p>
              <p><strong>Product:</strong> ${product.name}</p>
              <p><strong>Status:</strong> ${status.toUpperCase()}</p>
              <p><strong>Submitted:</strong> ${new Date(claim.created_at).toLocaleDateString()}</p>
              ${notes ? `
                <div class="notes">
                  <h3>Notes:</h3>
                  <p>${notes}</p>
                </div>
              ` : ''}
            </div>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/claims" style="display: inline-block; background: #9b59b6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">View My Claims</a>
            </div>
          </div>
          <div class="footer">
            <p>Questions? Contact us at support@ecommerce.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, `Claim Status Update - ${claim.claim_id}`, html);
  }

  // 6. Admin Alerts
  async sendAdminAlert(
    subject: string,
    message: string,
    data?: any
  ): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ecommerce.com';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Admin Alert</h1>
            <p>System Notification</p>
          </div>
          <div class="content">
            <div class="alert-details">
              <h2>${subject}</h2>
              <p>${message}</p>
              ${data ? `
                <h3>Additional Information:</h3>
                <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto;">${JSON.stringify(data, null, 2)}</pre>
              ` : ''}
            </div>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/admin/dashboard" style="display: inline-block; background: #34495e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Admin Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated system notification</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(adminEmail, `Admin Alert: ${subject}`, html);
  }

  // Welcome email for new users
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to E-Commerce Store</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .welcome-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to E-Commerce Store!</h1>
            <p>Hello ${name}!</p>
          </div>
          <div class="content">
            <div class="welcome-box">
              <h2>Thank you for joining us!</h2>
              <p>We're excited to have you as part of our community. Here's what you can do:</p>
              <ul>
                <li>Browse our extensive product catalog</li>
                <li>Enjoy secure and fast checkout</li>
                <li>Track your orders in real-time</li>
                <li>Register product warranties</li>
                <li>Submit warranty claims easily</li>
              </ul>
            </div>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/products" style="display: inline-block; background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Start Shopping</a>
            </div>
          </div>
          <div class="footer">
            <p>Questions? Contact us at support@ecommerce.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, 'Welcome to E-Commerce Store!', html);
  }

  // Password reset email
  async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .reset-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
            <p>Hello ${name}!</p>
          </div>
          <div class="content">
            <div class="reset-box">
              <h2>Reset Your Password</h2>
              <p>You requested a password reset for your account. Click the button below to reset your password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
              </div>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request this password reset, please ignore this email.</p>
            </div>
          </div>
          <div class="footer">
            <p>Questions? Contact us at support@ecommerce.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, 'Password Reset Request', html);
  }

  // Password reset confirmation
  async sendPasswordResetConfirmation(email: string, name: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .confirmation-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Reset Successful</h1>
            <p>Hello ${name}!</p>
          </div>
          <div class="content">
            <div class="confirmation-box">
              <h2>Password Successfully Changed</h2>
              <p>Your password has been successfully updated. If you made this change, no further action is required.</p>
              <p>If you didn't make this change, please contact our support team immediately.</p>
            </div>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Login to Your Account</a>
            </div>
          </div>
          <div class="footer">
            <p>Questions? Contact us at support@ecommerce.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, 'Password Reset Confirmation', html);
  }
}

export default new EmailService();