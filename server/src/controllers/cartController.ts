import { Request, Response } from 'express';
import { Op } from 'sequelize';
import CartItem from '../models/CartItem';
import Product from '../models/Product';
import User from '../models/User';
import { handleValidationErrors } from '../middleware/validationHandler';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: User;
}

// Type for CartItem with product included
interface CartItemWithProduct extends CartItem {
  product: Product;
}

// Add item to cart
export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if product exists and is active
    const product = await Product.findByPk(product_id);
    if (!product || !product.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable',
      });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await CartItem.findOne({
      where: { user_id, product_id },
    });

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`,
        });
      }

      await existingCartItem.update({ quantity: newQuantity });
      
      const updatedItem = await CartItem.findByPk(existingCartItem.cart_id, {
        include: [{ model: Product, as: 'product' }],
      });

      return res.json({
        success: true,
        message: 'Item quantity updated in cart',
        data: { cartItem: updatedItem },
      });
    } else {
      // Create new cart item
      const cartItem = await CartItem.create({
        user_id,
        product_id,
        quantity,
      });

      const newCartItem = await CartItem.findByPk(cartItem.cart_id, {
        include: [{ model: Product, as: 'product' }],
      });

      return res.status(201).json({
        success: true,
        message: 'Item added to cart',
        data: { cartItem: newCartItem },
      });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
    });
    return;
  }
};

// Get user's cart items
export const getCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const cartItems = await CartItem.findAll({
      where: { user_id },
      include: [
        {
          model: Product,
          as: 'product',
          where: { is_active: true },
          required: false, // Change to false to not fail if product is inactive
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // Filter out cart items with inactive products
    const activeCartItems = cartItems.filter(item => {
      const cartItemWithProduct = item as CartItemWithProduct;
      return cartItemWithProduct.product && cartItemWithProduct.product.is_active;
    });

    // Calculate totals
    let subtotal = 0;
    const items = activeCartItems.map(item => {
      const cartItemWithProduct = item as CartItemWithProduct;
      // Handle price as either string or number
      const price = typeof cartItemWithProduct.product.price === 'string' 
        ? parseFloat(cartItemWithProduct.product.price) 
        : cartItemWithProduct.product.price;
      const itemTotal = cartItemWithProduct.quantity * price;
      subtotal += itemTotal;
      
      return {
        ...cartItemWithProduct.toJSON(),
        itemTotal,
      };
    });

    const tax = subtotal * 0.18; // 18% GST
    const shipping = subtotal > 1000 ? 0 : 50; // Free shipping above ₹1000
    const total = subtotal + tax + shipping;

    res.json({
      success: true,
      data: {
        items,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2),
        itemCount: activeCartItems.length,
      },
    });
    return;
  } catch (error: any) {
    console.error('Get cart error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch cart items',
    });
    return;
  }
};

// Update cart item quantity
export const updateCartItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const cartItem = await CartItem.findByPk(id, {
      include: [{ model: Product, as: 'product' }],
    });

    if (!cartItem || cartItem.user_id !== user_id) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0',
      });
    }

    // Check stock availability
    const cartItemWithProduct = cartItem as CartItemWithProduct;
    if (cartItemWithProduct.product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${cartItemWithProduct.product.stock} items available in stock`,
      });
    }

    await cartItem.update({ quantity });

    const updatedItem = await CartItem.findByPk(id, {
      include: [{ model: Product, as: 'product' }],
    });

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: { cartItem: updatedItem },
    });
    return;
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
    });
    return;
  }
};

// Remove item from cart
export const removeFromCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const cartItem = await CartItem.findByPk(id);

    if (!cartItem || cartItem.user_id !== user_id) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
    }

    await cartItem.destroy();

    res.json({
      success: true,
      message: 'Item removed from cart',
    });
    return;
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
    });
    return;
  }
};

// Clear entire cart
export const clearCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    await CartItem.destroy({ where: { user_id } });

    res.json({
      success: true,
      message: 'Cart cleared successfully',
    });
    return;
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
    });
    return;
  }
};
