import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService';

export interface OrderItem {
  item_id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: string;
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
}

export interface Order {
  order_id: string;
  user_id: string;
  total_price: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  order_status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address_json: {
    name: string;
    address: string;
    city: string;
    pincode: string;
    phone?: string;
  };
  created_at: string;
  updated_at: string;
  orderItems?: OrderItem[];
  user?: {
    user_id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'customer' | 'admin';
  };
}

export interface OrderState {
  currentOrder: Order | null;
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  currentOrder: null,
  orders: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  loading: false,
  error: null,
};

// Async thunks
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: {
    shipping_address: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    payment_method: string;
    total_price: number;
    upi_id?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrder({
        shipping_address: {
          name: `${orderData.shipping_address.firstName} ${orderData.shipping_address.lastName}`,
          address: orderData.shipping_address.address,
          city: orderData.shipping_address.city,
          pincode: orderData.shipping_address.zipCode,
          phone: orderData.shipping_address.phone,
        },
        payment_method: orderData.payment_method as 'razorpay' | 'upi' | 'netbanking',
      });
      return { data: { order: response } };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderById(orderId);
      return { data: { order: response } };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.getUserOrders(1, 100);
      return { data: response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Create order
    createOrderStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createOrderSuccess: (state, action: PayloadAction<{ order: Order }>) => {
      state.loading = false;
      state.currentOrder = action.payload.order;
      state.orders.unshift(action.payload.order);
      state.pagination.totalItems += 1;
    },
    createOrderFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch user orders
    fetchUserOrdersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUserOrdersSuccess: (state, action: PayloadAction<{
      orders: Order[];
      pagination: OrderState['pagination'];
    }>) => {
      state.loading = false;
      state.orders = action.payload.orders;
      state.pagination = action.payload.pagination;
    },
    fetchUserOrdersFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch order by ID
    fetchOrderByIdStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrderByIdSuccess: (state, action: PayloadAction<{ order: Order }>) => {
      state.loading = false;
      state.currentOrder = action.payload.order;
    },
    fetchOrderByIdFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update order status
    updateOrderStatusStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateOrderStatusSuccess: (state, action: PayloadAction<{ order: Order }>) => {
      state.loading = false;
      const { order } = action.payload;
      
      // Update in orders list
      const orderIndex = state.orders.findIndex(o => o.order_id === order.order_id);
      if (orderIndex >= 0) {
        state.orders[orderIndex] = order;
      }
      
      // Update current order if it's the same
      if (state.currentOrder?.order_id === order.order_id) {
        state.currentOrder = order;
      }
    },
    updateOrderStatusFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Cancel order
    cancelOrderStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    cancelOrderSuccess: (state, action: PayloadAction<{ order: Order }>) => {
      state.loading = false;
      const { order } = action.payload;
      
      // Update in orders list
      const orderIndex = state.orders.findIndex(o => o.order_id === order.order_id);
      if (orderIndex >= 0) {
        state.orders[orderIndex] = order;
      }
      
      // Update current order if it's the same
      if (state.currentOrder?.order_id === order.order_id) {
        state.currentOrder = order;
      }
    },
    cancelOrderFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear current order
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<Partial<OrderState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data?.order || null;
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data?.order || null;
        state.error = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch user orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data?.orders || [];
        state.pagination = action.payload.data?.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  createOrderStart,
  createOrderSuccess,
  createOrderFailure,
  fetchUserOrdersStart,
  fetchUserOrdersSuccess,
  fetchUserOrdersFailure,
  fetchOrderByIdStart,
  fetchOrderByIdSuccess,
  fetchOrderByIdFailure,
  updateOrderStatusStart,
  updateOrderStatusSuccess,
  updateOrderStatusFailure,
  cancelOrderStart,
  cancelOrderSuccess,
  cancelOrderFailure,
  clearCurrentOrder,
  clearError,
  setPagination,
} = orderSlice.actions;

export default orderSlice.reducer;
