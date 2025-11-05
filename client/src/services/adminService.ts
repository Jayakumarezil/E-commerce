import api from './api';

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

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  payment_status?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export const adminService = {
  getDashboardStats: async (): Promise<{ data: DashboardStats }> => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  getMonthlySales: async (year?: number): Promise<{ data: SalesData[] }> => {
    const params = year ? { year } : {};
    const response = await api.get('/admin/sales/monthly', { params });
    return response.data;
  },

  getTopSellingProducts: async (limit?: number): Promise<{ data: TopProduct[] }> => {
    const params = limit ? { limit } : {};
    const response = await api.get('/admin/products/top-selling', { params });
    return response.data;
  },

  getAllOrders: async (filters: OrderFilters = {}): Promise<{ data: OrdersResponse }> => {
    const response = await api.get('/admin/orders', { params: filters });
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<{ data: Order }> => {
    const response = await api.put(`/admin/orders/${orderId}/status`, { status });
    return response.data;
  },

  exportReports: async (type: string, format: string, startDate?: string, endDate?: string): Promise<{ data: any }> => {
    const params = { type, format, start_date: startDate, end_date: endDate };
    const response = await api.get('/admin/reports/export', { params });
    return response.data;
  },

  getAllUsers: async (): Promise<{ data: Array<{ user_id: string; name: string; email: string; role: string; created_at: string }> }> => {
    const response = await api.get('/admin/users');
    return response.data;
  }
};
