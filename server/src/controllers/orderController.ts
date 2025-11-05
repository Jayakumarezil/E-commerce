import { Request, Response } from 'express';
import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import CartItem from '../models/CartItem';
import Product from '../models/Product';
import Warranty from '../models/Warranty';
import User from '../models/User';
import { handleValidationErrors } from '../middleware/validationHandler';
import notificationService from '../services/notificationService';
import emailService from '../services/emailService';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: User;
}

// Type for CartItem with product included
interface CartItemWithProduct extends CartItem {
  product: Product;
}

// Type for OrderItem with product included
interface OrderItemWithProduct extends OrderItem {
  product: Product;
}

// Create order from cart
export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const user_id = req.user?.user_id;
    const { shipping_address, payment_method = 'razorpay' } = req.body;

    if (!user_id) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Validate shipping address
    if (!shipping_address || !shipping_address.name || !shipping_address.address || !shipping_address.city || !shipping_address.pincode) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required',
      });
    }

    // Get cart items
    const cartItems = await CartItem.findAll({
      where: { user_id },
      include: [{ model: Product, as: 'product' }],
      transaction,
    });

    if (cartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const cartItem of cartItems) {
      // Check stock availability
      const cartItemWithProduct = cartItem as CartItemWithProduct;
      if (cartItemWithProduct.product.stock < cartItemWithProduct.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${cartItemWithProduct.product.name}. Available: ${cartItemWithProduct.product.stock}`,
        });
      }

      const itemTotal = cartItemWithProduct.quantity * parseFloat(cartItemWithProduct.product.price.toString());
      subtotal += itemTotal;

      orderItems.push({
        product_id: cartItemWithProduct.product_id,
        quantity: cartItemWithProduct.quantity,
        price_at_purchase: cartItemWithProduct.product.price,
      });
    }

    const tax = 0; // GST disabled
    const shipping = subtotal > 1000 ? 0 : 50; // Free shipping above ₹1000
    const total = subtotal + shipping;

    // Create order
    const order = await Order.create({
      user_id,
      total_price: total,
      payment_status: 'pending',
      order_status: 'pending',
      shipping_address_json: shipping_address,
    }, { transaction });

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        order_id: order.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase,
      }, { transaction });
    }

    // Update product stock
    for (const cartItem of cartItems) {
      const cartItemWithProduct = cartItem as CartItemWithProduct;
      await Product.update(
        { stock: cartItemWithProduct.product.stock - cartItemWithProduct.quantity },
        { where: { product_id: cartItemWithProduct.product_id }, transaction }
      );
    }

    // Clear cart
    await CartItem.destroy({ where: { user_id }, transaction });

    await transaction.commit();

    // Get complete order with items
    const completeOrder = await Order.findByPk(order.order_id, {
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });

    // Send order confirmation email
    try {
      await notificationService.sendOrderConfirmation(order.order_id);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: completeOrder },
    });
    return;
  } catch (error) {
    await transaction.rollback();
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
    });
    return;
  }
};

// Admin: Create manual order for any user (includes payment and warranty auto-registration)
export const createManualOrderAdmin = async (req: AuthenticatedRequest, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();
  try {
    // Only admins (middleware should enforce), but double-check
    // @ts-ignore
    if (req.user?.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { user_id, items, shipping_address, payment_method = 'manual', markPaid = true } = req.body as {
      user_id: string;
      items: Array<{ product_id: string; quantity: number; warranty_months?: number }>;
      shipping_address: any;
      payment_method?: string;
      markPaid?: boolean;
    };

    if (!user_id || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'user_id and items are required' });
    }

    // Compute totals
    let subtotal = 0;
    const orderItemsPayload: Array<{ product_id: string; quantity: number; price_at_purchase: number; warranty_months?: number }> = [];

    for (const it of items) {
      const product = await Product.findByPk(it.product_id);
      if (!product || !product.is_active) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: `Invalid product ${it.product_id}` });
      }
      if (product.stock < it.quantity) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      const price = typeof product.price === 'string' ? parseFloat(product.price) : (product.price as unknown as number);
      subtotal += it.quantity * price;
      orderItemsPayload.push({ product_id: product.product_id, quantity: it.quantity, price_at_purchase: price, warranty_months: it.warranty_months });
    }

    const tax = 0; // GST disabled
    const shipping = subtotal > 1000 ? 0 : 50;
    const total = subtotal + shipping;

    // Create order
    const order = await Order.create(
      {
        user_id,
        total_price: total,
        payment_status: markPaid ? 'paid' : 'pending',
        order_status: 'confirmed',
        shipping_address_json: shipping_address,
      },
      { transaction }
    );

    // Create order items and update stock
    for (const oi of orderItemsPayload) {
      await OrderItem.create(
        { order_id: order.order_id, product_id: oi.product_id, quantity: oi.quantity, price_at_purchase: oi.price_at_purchase },
        { transaction }
      );
      const prod = await Product.findByPk(oi.product_id);
      if (prod) {
        await Product.update({ stock: prod.stock - oi.quantity }, { where: { product_id: oi.product_id }, transaction });
      }
    }

    // Auto-register warranties immediately
    for (const oi of orderItemsPayload) {
      const prod = await Product.findByPk(oi.product_id);
      const months = oi.warranty_months ?? prod?.warranty_months ?? 0;
      if (prod && months > 0) {
        const purchaseDate = new Date();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + months);
        await Warranty.create(
          {
            user_id,
            product_id: oi.product_id,
            purchase_date: purchaseDate,
            expiry_date: expiryDate,
            registration_type: 'auto',
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    // Notifications (non-blocking)
    try {
      await notificationService.sendOrderConfirmation(order.order_id);
    } catch (e) {
      console.error('Manual order: failed to send confirmation', e);
    }

    const completeOrder = await Order.findByPk(order.order_id, {
      include: [
        { model: OrderItem, as: 'orderItems', include: [{ model: Product, as: 'product' }] },
        { model: User, as: 'user' },
      ],
    });

    return res.status(201).json({ success: true, message: 'Manual order created successfully', data: { order: completeOrder } });
  } catch (error) {
    await transaction.rollback();
    console.error('Create manual order error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create manual order' });
  }
};

// Get user's orders
export const getUserOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user_id = req.user?.user_id;
    const { page = 1, limit = 10, status } = req.query;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const offset = (Number(page) - 1) * Number(limit);
    const whereClause: any = { user_id };

    if (status && status !== 'all') {
      whereClause.order_status = status;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{ model: Product, as: 'product' }],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset,
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(count / Number(limit)),
          totalItems: count,
          itemsPerPage: Number(limit),
        },
      },
    });
    return;
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
    });
    return;
  }
};

// Get order by ID
export const getOrderById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{ model: Product, as: 'product' }],
        },
        { model: User, as: 'user' },
      ],
    });

    if (!order || order.user_id !== user_id) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: { order },
    });
    return;
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
    });
    return;
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { order_status, payment_status } = req.body;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const updateData: any = {};
    if (order_status) updateData.order_status = order_status;
    if (payment_status) updateData.payment_status = payment_status;

    await order.update(updateData);

    // If order is delivered, auto-register warranties
    if (order_status === 'delivered') {
      const orderItems = await OrderItem.findAll({
        where: { order_id: id },
        include: [{ model: Product, as: 'product' }],
      });

      for (const item of orderItems) {
        const orderItemWithProduct = item as OrderItemWithProduct;
        if (orderItemWithProduct.product.warranty_months > 0) {
          const purchaseDate = new Date();
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + orderItemWithProduct.product.warranty_months);

          await Warranty.create({
            user_id: order.user_id,
            product_id: orderItemWithProduct.product_id,
            purchase_date: purchaseDate,
            expiry_date: expiryDate,
            registration_type: 'auto',
          });
        }
      }
    }

  // Send notifications
  try {
    if (order_status) {
      await notificationService.sendOrderStatusUpdate(order.order_id, order_status);
      await emailService.sendAdminAlert(
        'Order Status Changed',
        `Order ${order.order_id} status updated to ${order_status}.`,
        {
          orderId: order.order_id,
          userId: order.user_id,
          newStatus: order_status,
          paymentStatus: payment_status || order.payment_status,
        }
      );
    }
  } catch (notifyErr) {
    console.error('Failed to send order status notifications:', notifyErr);
  }

  res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order },
    });
    return;
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
    });
    return;
  }
};

// Cancel order
export const cancelOrder = async (req: AuthenticatedRequest, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const user_id = req.user?.user_id;

    if (!user_id) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const order = await Order.findByPk(id, { transaction });

    if (!order || order.user_id !== user_id) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.order_status === 'delivered' || order.order_status === 'cancelled') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled',
      });
    }

    // Restore product stock
    const orderItems = await OrderItem.findAll({
      where: { order_id: id },
      include: [{ model: Product, as: 'product' }],
      transaction,
    });

    for (const item of orderItems) {
      const orderItemWithProduct = item as OrderItemWithProduct;
      await Product.update(
        { stock: orderItemWithProduct.product.stock + orderItemWithProduct.quantity },
        { where: { product_id: orderItemWithProduct.product_id }, transaction }
      );
    }

    // Update order status
    await order.update({ order_status: 'cancelled' }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order },
    });
    return;
  } catch (error) {
    await transaction.rollback();
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
    });
    return;
  }
};

// User: Confirm payment for an order (used for QR/manual payments)
export const confirmPaymentByUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const order = await Order.findByPk(id);
    if (!order || order.user_id !== user_id) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await order.update({ payment_status: 'paid', order_status: order.order_status === 'pending' ? 'confirmed' : order.order_status });

    // Notify user (optional) and possibly admin
    try {
      await notificationService.sendOrderStatusUpdate(order.order_id, order.order_status);
    } catch (e) {
      console.error('Failed to send payment confirmation notification:', e);
    }

    return res.json({ success: true, message: 'Payment confirmed', data: { order } });
  } catch (error) {
    console.error('Confirm payment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to confirm payment' });
  }
};
