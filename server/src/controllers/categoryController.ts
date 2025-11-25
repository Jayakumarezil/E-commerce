import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Category from '../models/Category';
import { handleValidationErrors } from '../middleware/validationHandler';

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { active_only = 'true' } = req.query;
    
    const whereClause: any = {};
    if (active_only === 'true') {
      whereClause.is_active = true;
    }

    const categories = await Category.findAll({
      where: whereClause,
      order: [['name', 'ASC']],
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
};

// Get category by ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message,
    });
  }
};

// Create new category (admin only)
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, is_active = true } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({
      where: { name: name.trim() },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists',
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || null,
      is_active: is_active !== false,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error: any) {
    console.error('Create category error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message,
    });
  }
};

// Update category (admin only)
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if name is being changed and if it conflicts with existing category
    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({
        where: {
          name: name.trim(),
          category_id: { [Op.ne]: id },
        },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists',
        });
      }
    }

    // Update category
    if (name !== undefined) category.name = name.trim();
    if (description !== undefined) category.description = description?.trim() || null;
    if (is_active !== undefined) category.is_active = is_active;

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error: any) {
    console.error('Update category error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message,
    });
  }
};

// Delete category (admin only)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if category is used by any products
    const { Product } = await import('../models');
    const productsWithCategory = await Product.count({
      where: { category: category.name },
    });

    if (productsWithCategory > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It is used by ${productsWithCategory} product(s). Please update or remove those products first.`,
      });
    }

    await category.destroy();

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message,
    });
  }
};

// Toggle category active status (admin only)
export const toggleCategoryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    category.is_active = !category.is_active;
    await category.save();

    res.json({
      success: true,
      message: `Category ${category.is_active ? 'activated' : 'deactivated'} successfully`,
      data: category,
    });
  } catch (error: any) {
    console.error('Toggle category status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle category status',
      error: error.message,
    });
  }
};

