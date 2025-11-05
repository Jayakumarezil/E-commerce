import api from './api';

export interface CartItem {
  cart_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product: {
    product_id: string;
    name: string;
    description: string;
    price: string;
    category: string;
    stock: number;
    warranty_months: number;
    images_json: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  itemTotal?: number;
}

export interface CartResponse {
  items: CartItem[];
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  itemCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export const cartService = {
  // Add item to cart
  addToCart: async (productId: string, quantity: number = 1): Promise<CartItem> => {
    const response = await api.post<ApiResponse<{ cartItem: CartItem }>>('/cart/add', {
      product_id: productId,
      quantity,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!.cartItem;
  },

  // Get user's cart
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get<ApiResponse<CartResponse>>('/cart');
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!;
  },

  // Update cart item quantity
  updateCartItem: async (cartItemId: string, quantity: number): Promise<CartItem> => {
    const response = await api.put<ApiResponse<{ cartItem: CartItem }>>(`/cart/${cartItemId}`, {
      quantity,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!.cartItem;
  },

  // Remove item from cart
  removeFromCart: async (cartItemId: string): Promise<void> => {
    const response = await api.delete<ApiResponse<void>>(`/cart/${cartItemId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
  },

  // Clear entire cart
  clearCart: async (): Promise<void> => {
    const response = await api.delete<ApiResponse<void>>('/cart');
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
  },
};