import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Membership from '../models/Membership';
import sequelize from '../config/database';

// Public search endpoint - search by IMEI, mobile, or membership ID
export const searchMembership = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    if (!search || typeof search !== 'string' || search.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide IMEI number, mobile number, or membership ID',
      });
    }

    const searchTerm = search.trim();

    // Search across all three fields using OR logic
    const membership = await Membership.findOne({
      where: {
        [Op.or]: [
          { imei_number: searchTerm },
          { mobile_primary: searchTerm },
          { unique_membership_id: searchTerm },
        ],
      },
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'No membership record found.',
        data: null,
      });
    }

    // Check if membership is active
    const isActive = membership.isActive();

    return res.json({
      success: true,
      message: 'Membership found',
      data: {
        membership: {
          ...membership.toJSON(),
          status: isActive ? 'Active' : 'Expired',
        },
      },
    });
  } catch (error) {
    console.error('Search membership error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search membership',
    });
  }
};

// Admin: Get all memberships with pagination and filters
export const getAllMemberships = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      status 
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const whereClause: any = {};

    // Search filter
    if (search) {
      const searchTerm = `%${search}%`;
      whereClause[Op.or] = [
        { full_name: { [Op.iLike]: searchTerm } },
        { mobile_primary: { [Op.iLike]: searchTerm } },
        { imei_number: { [Op.iLike]: searchTerm } },
        { unique_membership_id: { [Op.iLike]: searchTerm } },
      ];
    }

    // Status filter
    if (status === 'active') {
      whereClause.expiry_date = { [Op.gte]: new Date() };
    } else if (status === 'expired') {
      whereClause.expiry_date = { [Op.lt]: new Date() };
    }

    const { count, rows: memberships } = await Membership.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    // Add status to each membership
    const membershipsWithStatus = memberships.map((membership) => ({
      ...membership.toJSON(),
      status: membership.isActive() ? 'Active' : 'Expired',
    }));

    const totalPages = Math.ceil(count / Number(limit));

    return res.json({
      success: true,
      data: {
        memberships: membershipsWithStatus,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalItems: count,
          itemsPerPage: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get all memberships error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch memberships',
    });
  }
};

// Admin: Get membership by ID
export const getMembershipById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const membership = await Membership.findByPk(id);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found',
      });
    }

    return res.json({
      success: true,
      data: {
        membership: {
          ...membership.toJSON(),
          status: membership.isActive() ? 'Active' : 'Expired',
        },
      },
    });
  } catch (error) {
    console.error('Get membership by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch membership',
    });
  }
};

// Admin: Create new membership
export const createMembership = async (req: Request, res: Response) => {
  try {
    const {
      full_name,
      dob,
      mobile_primary,
      membership_start_date,
      expiry_date,
      payment_mode,
      amount,
      phone_brand_model,
      imei_number,
    } = req.body;

    // Validate required fields (Only full_name, mobile_primary, and imei_number are required)
    if (!full_name || !mobile_primary || !imei_number) {
      return res.status(400).json({
        success: false,
        message: 'Full name, mobile number, and IMEI number are required',
      });
    }
    
    // Set default values for optional fields
    const finalMembershipStartDate = membership_start_date || new Date().toISOString().split('T')[0];
    const finalExpiryDate = expiry_date || (() => {
      const start = new Date(finalMembershipStartDate);
      start.setMonth(start.getMonth() + 12); // Default 12 months
      return start.toISOString().split('T')[0];
    })();
    const finalPaymentMode = payment_mode || 'Cash';
    const finalAmount = amount !== undefined ? amount : 0;
    const finalPhoneBrandModel = phone_brand_model || '';

    // Check if IMEI already exists
    const existingIMEI = await Membership.findOne({
      where: { imei_number },
    });

    if (existingIMEI) {
      return res.status(400).json({
        success: false,
        message: 'IMEI number already exists',
      });
    }

    // Generate unique membership ID (incremental)
    const lastMembership = await Membership.findOne({
      order: [['id', 'DESC']],
      attributes: ['unique_membership_id'],
    });

    let nextMembershipId = 'MEM001';
    if (lastMembership) {
      const lastId = lastMembership.unique_membership_id;
      const lastNumber = parseInt(lastId.replace('MEM', ''), 10);
      const nextNumber = lastNumber + 1;
      nextMembershipId = `MEM${nextNumber.toString().padStart(3, '0')}`;
    }

    const membership = await Membership.create({
      full_name,
      dob: dob || null,
      mobile_primary,
      membership_start_date: finalMembershipStartDate,
      expiry_date: finalExpiryDate,
      payment_mode: finalPaymentMode,
      amount: finalAmount,
      unique_membership_id: nextMembershipId,
      phone_brand_model: finalPhoneBrandModel,
      imei_number,
    });

    return res.status(201).json({
      success: true,
      message: 'Membership created successfully',
      data: {
        membership: {
          ...membership.toJSON(),
          status: membership.isActive() ? 'Active' : 'Expired',
        },
      },
    });
  } catch (error: any) {
    console.error('Create membership error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      errors: error.errors,
      stack: error.stack,
    });
    
    // Handle unique constraint violations
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry: IMEI number or membership ID already exists',
      });
    }

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors?.map((err: any) => err.message).join(', ') || 'Validation failed';
      return res.status(400).json({
        success: false,
        message: `Validation error: ${validationErrors}`,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create membership',
    });
  }
};

// Admin: Update membership
export const updateMembership = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      dob,
      mobile_primary,
      membership_start_date,
      expiry_date,
      payment_mode,
      amount,
      phone_brand_model,
      imei_number,
    } = req.body;

    const membership = await Membership.findByPk(id);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found',
      });
    }

    // Check if IMEI is being changed and if it already exists
    if (imei_number && imei_number !== membership.imei_number) {
      const existingIMEI = await Membership.findOne({
        where: { imei_number },
      });

      if (existingIMEI) {
        return res.status(400).json({
          success: false,
          message: 'IMEI number already exists',
        });
      }
    }

    // Update fields (only update provided fields)
    if (full_name) membership.full_name = full_name;
    if (dob !== undefined) membership.dob = dob || null;
    if (mobile_primary) membership.mobile_primary = mobile_primary;
    if (membership_start_date) membership.membership_start_date = membership_start_date;
    if (expiry_date) membership.expiry_date = expiry_date;
    if (payment_mode) membership.payment_mode = payment_mode;
    if (amount !== undefined) membership.amount = amount;
    if (phone_brand_model !== undefined) membership.phone_brand_model = phone_brand_model || '';
    if (imei_number) membership.imei_number = imei_number;

    await membership.save();

    return res.json({
      success: true,
      message: 'Membership updated successfully',
      data: {
        membership: {
          ...membership.toJSON(),
          status: membership.isActive() ? 'Active' : 'Expired',
        },
      },
    });
  } catch (error: any) {
    console.error('Update membership error:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry: IMEI number already exists',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update membership',
    });
  }
};

// Admin: Delete membership
export const deleteMembership = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const membership = await Membership.findByPk(id);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found',
      });
    }

    await membership.destroy();

    return res.json({
      success: true,
      message: 'Membership deleted successfully',
    });
  } catch (error) {
    console.error('Delete membership error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete membership',
    });
  }
};

// Admin: Export memberships to CSV
export const exportMemberships = async (req: Request, res: Response) => {
  try {
    const memberships = await Membership.findAll({
      order: [['created_at', 'DESC']],
    });

    // Convert to CSV format
    const headers = [
      'ID',
      'Full Name',
      'DOB',
      'Mobile Primary',
      'Membership Start Date',
      'Expiry Date',
      'Payment Mode',
      'Amount',
      'Unique Membership ID',
      'Phone Brand & Model',
      'IMEI Number',
      'Status',
      'Created At',
      'Updated At',
    ];

    const csvRows = [
      headers.join(','),
      ...memberships.map((membership) => {
        const isActive = membership.isActive();
        return [
          membership.id,
          `"${membership.full_name}"`,
          membership.dob,
          membership.mobile_primary,
          membership.membership_start_date,
          membership.expiry_date,
          membership.payment_mode,
          membership.amount,
          membership.unique_membership_id,
          `"${membership.phone_brand_model}"`,
          membership.imei_number,
          isActive ? 'Active' : 'Expired',
          membership.created_at,
          membership.updated_at,
        ].join(',');
      }),
    ];

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=memberships.csv');
    return res.send(csvContent);
  } catch (error) {
    console.error('Export memberships error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export memberships',
    });
  }
};

