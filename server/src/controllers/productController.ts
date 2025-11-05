import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Product from '../models/Product';
import ProductImage from '../models/ProductImage';
import { handleValidationErrors } from '../middleware/validationHandler';

// Get all products with pagination, filtering, and search
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      warranty,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const whereClause: any = {
      is_active: true,
    };

    // Add category filter
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = Number(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = Number(maxPrice);
    }

    // Add warranty filter
    if (warranty) {
      whereClause.warranty_months = {};
      if (warranty === '6') whereClause.warranty_months[Op.gte] = 6;
      if (warranty === '12') whereClause.warranty_months[Op.gte] = 12;
      if (warranty === '24') whereClause.warranty_months[Op.gte] = 24;
      if (warranty === '36') whereClause.warranty_months[Op.gte] = 36;
    }

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['image_id', 'image_url', 'alt_text', 'display_order', 'is_primary'],
          order: [['display_order', 'ASC']],
        },
      ],
      limit: Number(limit),
      offset,
      order: [[sortBy as string, sortOrder as string]],
    });

    const totalPages = Math.ceil(count / Number(limit));

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalItems: count,
          itemsPerPage: Number(limit),
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
};

// Get single product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['image_id', 'image_url', 'alt_text', 'display_order', 'is_primary'],
          order: [['display_order', 'ASC']],
        },
      ],
    });

    if (!product || !product.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: { product },
    });
    return;
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
    });
    return;
  }
};

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    // Get unique categories from products
    const products = await Product.findAll({
      where: { is_active: true },
      attributes: ['category'],
      group: ['category'],
      order: [['category', 'ASC']],
    });

    const categories = products.map(p => ({ name: p.category }));

    res.json({
      success: true,
      data: { categories },
    });
    return;
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
    });
    return;
  }
};

// Create new product (admin only)
export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      warranty_months,
      images_json,
    } = req.body;

    console.log('Creating product with data:', {
      name,
      price,
      category,
      stock,
      images_json
    });

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      warranty_months: Number(warranty_months) || 12,
      images_json: images_json ? (Array.isArray(images_json) ? images_json : JSON.parse(images_json)) : null,
      is_active: true,
    });

    console.log('Product created successfully:', product.product_id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
    });
    return;
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
};

// Update product (admin only)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('Updating product:', id, 'with data:', updateData);

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Convert numeric fields
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.stock) updateData.stock = Number(updateData.stock);
    if (updateData.warranty_months) updateData.warranty_months = Number(updateData.warranty_months);

    // Handle images_json field
    if (updateData.images_json !== undefined) {
      updateData.images_json = Array.isArray(updateData.images_json) 
        ? updateData.images_json 
        : updateData.images_json ? JSON.parse(updateData.images_json) : null;
    }

    await product.update(updateData);

    console.log('Product updated successfully:', product.product_id);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product },
    });
    return;
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
};

// Soft delete product (admin only)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Soft delete by setting is_active to false
    await product.update({ is_active: false });

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
    return;
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
    });
    return;
  }
};


// Get featured products
export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll({
      where: { is_active: true },
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['image_id', 'image_url', 'alt_text', 'display_order', 'is_primary'],
          order: [['display_order', 'ASC']],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: 8,
    });

    res.json({
      success: true,
      data: { products },
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
    });
  }
};
