import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Warranty from '../models/Warranty';
import Claim from '../models/Claim';
import Product from '../models/Product';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import User from '../models/User';
import { handleValidationErrors } from '../middleware/validationHandler';
import notificationService from '../services/notificationService';
import emailService from '../services/emailService';

// Register warranty manually
export const registerWarranty = async (req: Request, res: Response) => {
  try {
    const { product_id, purchase_date, serial_number, invoice_url } = req.body;
    const user_id = (req as any).user.user_id;

    // Check if product exists and is active
    const product = await Product.findByPk(product_id);
    if (!product || !product.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if warranty already exists for this serial number
    const existingWarranty = await Warranty.findOne({
      where: { serial_number },
    });

    if (existingWarranty) {
      return res.status(400).json({
        success: false,
        message: 'Warranty already registered for this serial number',
      });
    }

    // Calculate expiry date
    const purchaseDate = new Date(purchase_date);
    const expiryDate = new Date(purchaseDate);
    expiryDate.setMonth(expiryDate.getMonth() + product.warranty_months);

    const warranty = await Warranty.create({
      user_id,
      product_id,
      purchase_date: purchaseDate,
      expiry_date: expiryDate,
      serial_number,
      invoice_url,
      registration_type: 'manual',
    });

    // Send warranty registration confirmation email
    try {
      await notificationService.sendWarrantyRegistrationConfirmation(warranty.warranty_id);
    } catch (emailError) {
      console.error('Failed to send warranty registration email:', emailError);
      // Don't fail the warranty registration if email fails
    }

    return res.status(201).json({
      success: true,
      message: 'Warranty registered successfully',
      data: { warranty },
    });
  } catch (error) {
    console.error('Register warranty error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register warranty',
    });
  }
};

// Auto-register warranty from order
export const autoRegisterWarranty = async (req: Request, res: Response) => {
  try {
    const { order_id } = req.body;
    const user_id = (req as any).user.user_id;

    // Get order with items
    const order = await Order.findOne({
      where: { order_id, user_id },
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'product',
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const warranties = [];

    // Create warranty for each product in the order
    for (const orderItem of (order as any).orderItems) {
      const product = orderItem.product;
      
      // Calculate expiry date
      const purchaseDate = new Date(order.created_at);
      const expiryDate = new Date(purchaseDate);
      expiryDate.setMonth(expiryDate.getMonth() + product.warranty_months);

      // Generate serial number if not provided
      const serialNumber = `AUTO-${order_id}-${product.product_id}-${Date.now()}`;

      const warranty = await Warranty.create({
        user_id,
        product_id: product.product_id,
        purchase_date: purchaseDate,
        expiry_date: expiryDate,
        serial_number: serialNumber,
        invoice_url: undefined,
        registration_type: 'auto',
      });

      warranties.push(warranty);
    }

    return res.status(201).json({
      success: true,
      message: 'Warranties auto-registered successfully',
      data: { warranties },
    });
  } catch (error) {
    console.error('Auto-register warranty error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to auto-register warranties',
    });
  }
};

// Get all warranties (admin only)
export const getAllWarranties = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};

    // Add status filter
    if (status === 'active') {
      whereClause.expiry_date = { [Op.gte]: new Date() };
    } else if (status === 'expired') {
      whereClause.expiry_date = { [Op.lt]: new Date() };
    }

    const { count, rows: warranties } = await Warranty.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['product_id', 'name', 'description', 'warranty_months'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'name', 'email'],
        },
      ],
      limit: Number(limit),
      offset,
      order: [['expiry_date', 'ASC']], // Sort by expiry date ascending
    });

    const totalPages = Math.ceil(count / Number(limit));

    return res.json({
      success: true,
      data: {
        warranties,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalItems: count,
          itemsPerPage: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get all warranties error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch warranties',
    });
  }
};

// Get user's warranties
export const getUserWarranties = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = { user_id: userId };

    // Add status filter
    if (status === 'active') {
      whereClause.expiry_date = { [Op.gte]: new Date() };
    } else if (status === 'expired') {
      whereClause.expiry_date = { [Op.lt]: new Date() };
    }
    // Note: status === 'all' or undefined means no date filter

    const { count, rows: warranties } = await Warranty.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['product_id', 'name', 'description', 'warranty_months'],
        },
      ],
      limit: Number(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    const totalPages = Math.ceil(count / Number(limit));

    return res.json({
      success: true,
      data: {
        warranties,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalItems: count,
          itemsPerPage: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get user warranties error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch warranties',
    });
  }
};

// Get warranty details
export const getWarrantyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const warranty = await Warranty.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['product_id', 'name', 'description', 'warranty_months'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'name', 'email'],
        },
        {
          model: Claim,
          as: 'claims',
          order: [['created_at', 'DESC']],
        },
      ],
    });

    if (!warranty) {
      return res.status(404).json({
        success: false,
        message: 'Warranty not found',
      });
    }

    return res.json({
      success: true,
      data: { warranty },
    });
  } catch (error) {
    console.error('Get warranty by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch warranty',
    });
  }
};

// Submit warranty claim
export const createClaim = async (req: Request, res: Response) => {
  try {
    console.log('Create claim request body:', JSON.stringify(req.body, null, 2));
    console.log('Create claim request user:', (req as any).user);
    
    const { warranty_id, issue_description, image_url } = req.body;
    const user_id = (req as any).user?.user_id;

    console.log('Parsed values - user_id:', user_id, 'warranty_id:', warranty_id, 'issue_description length:', issue_description?.length);

    if (!user_id) {
      console.log('ERROR: user_id is missing');
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!warranty_id) {
      console.log('ERROR: warranty_id is missing');
      return res.status(400).json({
        success: false,
        message: 'Warranty ID is required',
        received_data: req.body,
      });
    }

    if (!issue_description || issue_description.trim().length < 10) {
      console.log('ERROR: issue_description validation failed');
      return res.status(400).json({
        success: false,
        message: 'Issue description must be at least 10 characters',
        received_data: {
          has_issue_description: !!issue_description,
          length: issue_description?.length || 0,
        },
      });
    }

    // Verify warranty belongs to user
    const warranty = await Warranty.findOne({
      where: { warranty_id, user_id },
    });

    if (!warranty) {
      return res.status(404).json({
        success: false,
        message: 'Warranty not found',
      });
    }

    // Check if warranty is still valid
    if (new Date() > warranty.expiry_date) {
      return res.status(400).json({
        success: false,
        message: 'Warranty has expired',
      });
    }

    const claim = await Claim.create({
      warranty_id,
      issue_description,
      image_url,
      status: 'pending',
    });

    // Notify admin about new claim
    try {
      const fullWarranty = await Warranty.findByPk(warranty_id, {
        include: [
          { model: Product, as: 'product', attributes: ['name', 'product_id'] },
          { model: User, as: 'user', attributes: ['name', 'email'] },
        ],
      });

      await emailService.sendAdminAlert(
        'New Warranty Claim Submitted',
        `A new warranty claim has been submitted by ${(fullWarranty as any)?.user?.name || 'Unknown User'}.`,
        {
          claimId: claim.claim_id,
          warrantyId: warranty_id,
          customerName: (fullWarranty as any)?.user?.name,
          customerEmail: (fullWarranty as any)?.user?.email,
          productName: (fullWarranty as any)?.product?.name,
          issueDescription: issue_description,
        }
      );
    } catch (notifyErr) {
      console.error('Failed to send admin new-claim alert:', notifyErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Claim submitted successfully',
      data: { claim },
    });
  } catch (error) {
    console.error('Create claim error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit claim',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Get user's claims
export const getUserClaims = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};

    // Add status filter
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const { count, rows: claims } = await Claim.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Warranty,
          as: 'warranty',
          where: { user_id: userId },
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['product_id', 'name'],
            },
          ],
        },
      ],
      limit: Number(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    const totalPages = Math.ceil(count / Number(limit));

    return res.json({
      success: true,
      data: {
        claims,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalItems: count,
          itemsPerPage: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get user claims error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch claims',
    });
  }
};

// Update claim status (admin only)
export const updateClaimStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const claim = await Claim.findByPk(id, {
      include: [
        {
          model: Warranty,
          as: 'warranty',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['user_id', 'name', 'email'],
            },
          ],
        },
      ],
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      });
    }

    await claim.update({
      status,
      admin_notes,
    });

    // Send claim status update email
    try {
      await notificationService.sendClaimStatusUpdate(claim.claim_id, status, admin_notes);
    } catch (emailError) {
      console.error('Failed to send claim status update email:', emailError);
      // Don't fail the claim update if email fails
    }

    return res.json({
      success: true,
      message: 'Claim status updated successfully',
      data: { claim },
    });
  } catch (error) {
    console.error('Update claim status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update claim status',
    });
  }
};

// Get all claims (admin only)
export const getAllClaims = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};

    // Add status filter
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const { count, rows: claims } = await Claim.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Warranty,
          as: 'warranty',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['product_id', 'name'],
            },
            {
              model: User,
              as: 'user',
              attributes: ['user_id', 'name', 'email'],
            },
          ],
        },
      ],
      limit: Number(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    const totalPages = Math.ceil(count / Number(limit));

    return res.json({
      success: true,
      data: {
        claims,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalItems: count,
          itemsPerPage: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get all claims error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch claims',
    });
  }
};
