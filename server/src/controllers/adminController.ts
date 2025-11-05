import { Request, Response } from 'express';
import { Op, QueryTypes } from 'sequelize';
import { Order, OrderItem, Product, User, Warranty, Claim } from '../models';
import sequelize from '../config/database';
// Remove OrderStatus import as it's not exported

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalSales,
      activeWarranties,
      pendingClaims,
      totalProducts
    ] = await Promise.all([
      User.count(),
      Order.count(),
      Order.sum('total_price', { where: { order_status: { [Op.ne]: 'cancelled' } } }) || 0,
      Warranty.count(),
      Claim.count({ where: { status: 'pending' } }),
      Product.count()
    ]);

    // Calculate monthly growth
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    
    const [currentMonthSales, lastMonthSales] = await Promise.all([
      Order.sum('total_price', {
        where: {
          order_status: { [Op.ne]: 'cancelled' },
          created_at: {
            [Op.gte]: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
          }
        }
      }) || 0,
      Order.sum('total_price', {
        where: {
          order_status: { [Op.ne]: 'cancelled' },
          created_at: {
            [Op.gte]: lastMonth,
            [Op.lt]: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
          }
        }
      }) || 0
    ]);

    const salesGrowth = (lastMonthSales || 0) > 0 
      ? (((currentMonthSales || 0) - (lastMonthSales || 0)) / (lastMonthSales || 0) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalSales: parseFloat((totalSales || 0).toFixed(2)),
        activeWarranties,
        pendingClaims,
        totalProducts,
        salesGrowth: parseFloat(salesGrowth.toFixed(2)),
        currentMonthSales: parseFloat((currentMonthSales || 0).toFixed(2)),
        lastMonthSales: parseFloat((lastMonthSales || 0).toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

export const getMonthlySales = async (req: Request, res: Response) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const monthlyData = await Order.findAll({
      attributes: [
        [Order.sequelize!.fn('DATE_TRUNC', 'month', Order.sequelize!.col('created_at')), 'month'],
        [Order.sequelize!.fn('SUM', Order.sequelize!.col('total_price')), 'total_sales']
      ],
      where: {
        order_status: { [Op.ne]: 'cancelled' },
        created_at: {
          [Op.gte]: new Date(Number(year), 0, 1),
          [Op.lt]: new Date(Number(year) + 1, 0, 1)
        }
      },
      group: [Order.sequelize!.fn('DATE_TRUNC', 'month', Order.sequelize!.col('created_at'))],
      order: [[Order.sequelize!.fn('DATE_TRUNC', 'month', Order.sequelize!.col('created_at')), 'ASC']]
    });

    // Format data for charts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesData = months.map((month, index) => {
      const monthData = monthlyData.find((item: any) => {
        const date = new Date(item.dataValues.month);
        return date.getMonth() === index;
      });
      return {
        month,
        sales: monthData ? parseFloat((monthData as any).dataValues.total_sales) : 0
      };
    });

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly sales data'
    });
  }
};

export const getTopSellingProducts = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    console.log('Fetching top selling products with limit:', limit);

    // First check if there are any orders
    const orderCount = await Order.count({
      where: { order_status: { [Op.ne]: 'cancelled' } }
    });

    console.log('Order count:', orderCount);

    if (orderCount === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Use raw SQL query to avoid GROUP BY issues
    const query = `
      SELECT 
        oi.product_id,
        p.name,
        p.price,
        p.images_json::text as images_json,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.price_at_purchase * oi.quantity) as total_revenue
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.product_id
      INNER JOIN orders o ON oi.order_id = o.order_id
      WHERE o.order_status != 'cancelled'
      GROUP BY oi.product_id, p.name, p.price, p.images_json::text
      ORDER BY total_quantity DESC
      LIMIT :limit
    `;

    const results = await sequelize.query(query, {
      replacements: { limit: Number(limit) },
      type: QueryTypes.SELECT
    });

    const formattedProducts = ((results || []) as any[]).map((item: any) => {
      // Parse images_json if it's a string (from ::text cast)
      let images: any[] = [];
      try {
        if (typeof item.images_json === 'string') {
          images = JSON.parse(item.images_json);
        } else if (Array.isArray(item.images_json)) {
          images = item.images_json;
        }
      } catch (e) {
        console.error('Error parsing images_json:', e);
        images = [];
      }
      
      const imageUrl = images.length > 0 ? images[0] : null;
      
      return {
        id: item.product_id,
        name: item.name || 'Unknown Product',
        price: parseFloat(item.price || 0),
        image_url: imageUrl,
        total_quantity: parseInt(item.total_quantity || 0),
        total_revenue: parseFloat(item.total_revenue || 0)
      };
    });

    console.log('Top products found:', formattedProducts.length);

    return res.json({
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch top selling products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      payment_status, 
      start_date, 
      end_date,
      search 
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const whereClause: any = {};

    // Apply filters
    if (status) whereClause.order_status = status;
    if (payment_status) whereClause.payment_status = payment_status;
    
    if (start_date || end_date) {
      whereClause.created_at = {};
      if (start_date) whereClause.created_at[Op.gte] = new Date(start_date as string);
      if (end_date) whereClause.created_at[Op.lte] = new Date(end_date as string);
    }

    if (search) {
      whereClause[Op.or] = [
        { order_id: { [Op.iLike]: `%${search}%` } },
        { '$user.name$': { [Op.iLike]: `%${search}%` } },
        { '$user.email$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'name', 'email']
      }, {
        model: OrderItem,
        as: 'orderItems',
        include: [{
        model: Product,
        as: 'product',
        attributes: ['product_id', 'name', 'price']
        }]
      }],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset
    });

    // Add warranty information to each order
    const Warranty = (await import('../models/Warranty')).default;
    const ordersWithWarrantyInfo = await Promise.all(
      orders.map(async (order: any) => {
        const orderData = order.toJSON();
        const warranties = await Warranty.findAll({
          where: { user_id: order.user_id },
          attributes: ['warranty_id', 'expiry_date', 'product_id']
        });
        
        // Get warranties for products in this order
        const orderProductIds = order.orderItems.map((item: any) => item.product_id);
        const orderWarranties = warranties.filter((w: any) => 
          orderProductIds.includes(w.product_id)
        );
        
        // Determine warranty status
        const now = new Date();
        const hasActiveWarranty = orderWarranties.some((w: any) => new Date(w.expiry_date) > now);
        const hasExpiredWarranty = orderWarranties.some((w: any) => new Date(w.expiry_date) <= now);
        const hasNoWarranty = orderWarranties.length === 0;
        
        let warrantyStatus = 'No Warranty';
        let warrantyColor = 'default';
        
        if (hasActiveWarranty) {
          warrantyStatus = 'Active';
          warrantyColor = 'green';
        } else if (hasExpiredWarranty) {
          warrantyStatus = 'Expired';
          warrantyColor = 'red';
        } else if (hasNoWarranty) {
          warrantyStatus = 'Not Registered';
          warrantyColor = 'orange';
        }
        
        return {
          ...orderData,
          warrantyStatus,
          warrantyColor,
          warrantyCount: orderWarranties.length
        };
      })
    );

    return res.json({
      success: true,
      data: {
        orders: ordersWithWarrantyInfo,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findOne({ where: { order_id: id } });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.update({ order_status: status });
    
    return res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

export const exportReports = async (req: Request, res: Response) => {
  try {
    const { type, format, start_date, end_date } = req.query;

    // This is a placeholder for report generation
    // In a real application, you would generate CSV/PDF reports here
    
    return res.json({
      success: true,
      message: 'Report export functionality will be implemented',
      data: {
        type,
        format,
        start_date,
        end_date,
        download_url: `/api/admin/reports/download/${type}-${Date.now()}.${format}`
      }
    });
  } catch (error) {
    console.error('Error exporting reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export reports'
    });
  }
};

// List all registered users (admin)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: ['user_id', 'name', 'email', 'role', 'created_at']
    });

    return res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};
