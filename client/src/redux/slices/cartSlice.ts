import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

export interface CartState {
  items: CartItem[];
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  itemCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  subtotal: '0.00',
  tax: '0.00',
  shipping: '0.00',
  total: '0.00',
  itemCount: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add to cart
    addToCartStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addToCartSuccess: (state, action: PayloadAction<{ cartItem: CartItem }>) => {
      state.loading = false;
      const { cartItem } = action.payload;
      
      // Calculate itemTotal if not present
      if (!cartItem.itemTotal) {
        const price = typeof cartItem.product.price === 'string' 
          ? parseFloat(cartItem.product.price) 
          : cartItem.product.price;
        cartItem.itemTotal = cartItem.quantity * price;
      }
      
      // Check if item already exists
      const existingItemIndex = state.items.findIndex(
        item => item.product_id === cartItem.product_id
      );
      
      if (existingItemIndex >= 0) {
        // Update existing item
        state.items[existingItemIndex] = cartItem;
      } else {
        // Add new item
        state.items.push(cartItem);
      }
      
      state.itemCount = state.items.length;
      
      // Recalculate totals
      let subtotal = 0;
      state.items.forEach(item => {
        const itemPrice = typeof item.product.price === 'string' 
          ? parseFloat(item.product.price) 
          : item.product.price;
        subtotal += item.quantity * itemPrice;
      });
      
      const tax = 0;
      const shipping = subtotal > 1000 ? 0 : 50;
      const total = subtotal + shipping;
      
      state.subtotal = subtotal.toFixed(2);
      state.tax = tax.toFixed(2);
      state.shipping = shipping.toFixed(2);
      state.total = total.toFixed(2);
    },
    addToCartFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch cart
    fetchCartStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCartSuccess: (state, action: PayloadAction<{
      items: CartItem[];
      subtotal: string;
      tax: string;
      shipping: string;
      total: string;
      itemCount: number;
    }>) => {
      state.loading = false;
      state.items = action.payload.items;
      state.subtotal = action.payload.subtotal;
      state.tax = action.payload.tax;
      state.shipping = action.payload.shipping;
      state.total = action.payload.total;
      state.itemCount = action.payload.itemCount;
    },
    fetchCartFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update cart item
    updateCartItemStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateCartItemSuccess: (state, action: PayloadAction<{ cartItem: CartItem }>) => {
      state.loading = false;
      // Success callback - no longer needed since we use optimistic updates
      // Keeping for compatibility
    },
    updateCartItemFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Remove from cart
    removeFromCartStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    removeFromCartSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.items = state.items.filter(item => item.cart_id !== action.payload);
      state.itemCount = state.items.length;
      
      // Recalculate totals
      let subtotal = 0;
      state.items.forEach(item => {
        const itemPrice = typeof item.product.price === 'string' 
          ? parseFloat(item.product.price) 
          : item.product.price;
        subtotal += item.quantity * itemPrice;
      });
      
      const tax = 0;
      const shipping = subtotal > 1000 ? 0 : 50;
      const total = subtotal + shipping;
      
      state.subtotal = subtotal.toFixed(2);
      state.tax = tax.toFixed(2);
      state.shipping = shipping.toFixed(2);
      state.total = total.toFixed(2);
    },
    removeFromCartFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear cart
    clearCartStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    clearCartSuccess: (state) => {
      state.loading = false;
      state.items = [];
      state.subtotal = '0.00';
      state.tax = '0.00';
      state.shipping = '0.00';
      state.total = '0.00';
      state.itemCount = 0;
    },
    clearCartFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Update cart totals (for local updates)
    updateCartTotals: (state, action: PayloadAction<{
      subtotal: string;
      tax: string;
      shipping: string;
      total: string;
    }>) => {
      state.subtotal = action.payload.subtotal;
      state.tax = action.payload.tax;
      state.shipping = action.payload.shipping;
      state.total = action.payload.total;
    },

    // Optimistic update (update UI immediately without API call)
    updateCartItemOptimistic: (state, action: PayloadAction<{ cartItemId: string; quantity: number }>) => {
      const { cartItemId, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item.cart_id === cartItemId);
      
      if (itemIndex >= 0) {
        // Update item quantity
        state.items[itemIndex].quantity = quantity;
        
        // Recalculate itemTotal
        const item = state.items[itemIndex];
        const price = typeof item.product.price === 'string' 
          ? parseFloat(item.product.price) 
          : item.product.price;
        item.itemTotal = quantity * price;
        
        // Recalculate all totals locally
        let subtotal = 0;
        state.items.forEach(item => {
          const itemPrice = typeof item.product.price === 'string' 
            ? parseFloat(item.product.price) 
            : item.product.price;
          subtotal += item.quantity * itemPrice;
        });
        
        const tax = 0;
        const shipping = subtotal > 1000 ? 0 : 50;
        const total = subtotal + shipping;
        
        state.subtotal = subtotal.toFixed(2);
        state.tax = tax.toFixed(2);
        state.shipping = shipping.toFixed(2);
        state.total = total.toFixed(2);
      }
    },
  },
});

export const {
  addToCartStart,
  addToCartSuccess,
  addToCartFailure,
  fetchCartStart,
  fetchCartSuccess,
  fetchCartFailure,
  updateCartItemStart,
  updateCartItemSuccess,
  updateCartItemFailure,
  updateCartItemOptimistic,
  removeFromCartStart,
  removeFromCartSuccess,
  removeFromCartFailure,
  clearCartStart,
  clearCartSuccess,
  clearCartFailure,
  clearError,
  updateCartTotals,
} = cartSlice.actions;

export default cartSlice.reducer;