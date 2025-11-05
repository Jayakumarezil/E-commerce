import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { adminService } from '../../services/adminService';

// Types
export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalSales: number;
  activeWarranties: number;
  pendingClaims: number;
  totalProducts: number;
  salesGrowth: number;
  currentMonthSales: number;
  lastMonthSales: number;
}

export interface SalesData {
  month: string;
  sales: number;
}

export interface TopProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
  total_quantity: number;
  total_revenue: number;
}

export interface Order {
  id: string;
  user_id: string;
  total_price: number;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  user: {
    user_id: string;
    name: string;
    email: string;
  };
  orderItems: Array<{
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      price: number;
    };
  }>;
}

export interface AdminState {
  stats: DashboardStats | null;
  salesData: SalesData[];
  topProducts: TopProduct[];
  orders: Order[];
  ordersPagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  loading: {
    stats: boolean;
    salesData: boolean;
    topProducts: boolean;
    orders: boolean;
  };
  error: string | null;
}

const initialState: AdminState = {
  stats: null,
  salesData: [],
  topProducts: [],
  orders: [],
  ordersPagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  },
  loading: {
    stats: false,
    salesData: false,
    topProducts: false,
    orders: false
  },
  error: null
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getDashboardStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchMonthlySales = createAsyncThunk(
  'admin/fetchMonthlySales',
  async (year?: number, { rejectWithValue }) => {
    try {
      const response = await adminService.getMonthlySales(year);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch monthly sales');
    }
  }
);

export const fetchTopSellingProducts = createAsyncThunk(
  'admin/fetchTopSellingProducts',
  async (limit?: number, { rejectWithValue }) => {
    try {
      const response = await adminService.getTopSellingProducts(limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch top products');
    }
  }
);

export const fetchAllOrders = createAsyncThunk(
  'admin/fetchAllOrders',
  async (params: {
    page?: number;
    limit?: number;
    status?: string;
    payment_status?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await adminService.getAllOrders(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ orderId, status }: { orderId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateOrderStatus(orderId, status);
      return { orderId, status, order: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

// Slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearStats: (state) => {
      state.stats = null;
    },
    clearSalesData: (state) => {
      state.salesData = [];
    },
    clearTopProducts: (state) => {
      state.topProducts = [];
    },
    clearOrders: (state) => {
      state.orders = [];
      state.ordersPagination = {
        total: 0,
        page: 1,
        limit: 20,
        pages: 0
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading.stats = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error = action.payload as string;
      })
      
      // Monthly Sales
      .addCase(fetchMonthlySales.pending, (state) => {
        state.loading.salesData = true;
        state.error = null;
      })
      .addCase(fetchMonthlySales.fulfilled, (state, action) => {
        state.loading.salesData = false;
        state.salesData = action.payload;
      })
      .addCase(fetchMonthlySales.rejected, (state, action) => {
        state.loading.salesData = false;
        state.error = action.payload as string;
      })
      
      // Top Products
      .addCase(fetchTopSellingProducts.pending, (state) => {
        state.loading.topProducts = true;
        state.error = null;
      })
      .addCase(fetchTopSellingProducts.fulfilled, (state, action) => {
        state.loading.topProducts = false;
        state.topProducts = action.payload;
      })
      .addCase(fetchTopSellingProducts.rejected, (state, action) => {
        state.loading.topProducts = false;
        state.error = action.payload as string;
      })
      
      // Orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading.orders = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading.orders = false;
        state.orders = action.payload.orders;
        state.ordersPagination = action.payload.pagination;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading.orders = false;
        state.error = action.payload as string;
      })
      
      // Update Order Status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const { orderId, status } = action.payload;
        const orderIndex = state.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = status;
        }
      });
  }
});

export const { clearError, clearStats, clearSalesData, clearTopProducts, clearOrders } = adminSlice.actions;
export default adminSlice.reducer;
