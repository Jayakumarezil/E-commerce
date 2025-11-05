import api from './api';

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

export interface CreateOrderRequest {
  shipping_address: {
    name: string;
    address: string;
    city: string;
    pincode: string;
    phone?: string;
  };
  payment_method?: 'razorpay' | 'upi' | 'netbanking';
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export const orderService = {
  // Create order from cart
  createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
    const response = await api.post<ApiResponse<{ order: Order }>>('/orders/create', orderData);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!.order;
  },

  // Get user's orders
  getUserOrders: async (page: number = 1, limit: number = 10, status?: string): Promise<OrdersResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status && status !== 'all') {
      params.append('status', status);
    }
    
    const response = await api.get<ApiResponse<OrdersResponse>>(`/orders?${params}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!;
  },

  // Get order by ID
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await api.get<ApiResponse<{ order: Order }>>(`/orders/${orderId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!.order;
  },

  // Admin: manual order creation
  createManualOrder: async (payload: {
    user_id: string;
    items: Array<{ product_id: string; quantity: number; warranty_months?: number }>;
    shipping_address: any;
    payment_method?: string;
    markPaid?: boolean;
  }): Promise<Order> => {
    const response = await api.post<ApiResponse<{ order: Order }>>('/orders/admin/manual', payload);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data!.order;
  },

  // Update order status (admin only)
  updateOrderStatus: async (orderId: string, orderStatus?: string, paymentStatus?: string): Promise<Order> => {
    const response = await api.put<ApiResponse<{ order: Order }>>(`/orders/${orderId}/status`, {
      order_status: orderStatus,
      payment_status: paymentStatus,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!.order;
  },

  // Cancel order
  cancelOrder: async (orderId: string): Promise<Order> => {
    const response = await api.put<ApiResponse<{ order: Order }>>(`/orders/${orderId}/cancel`);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!.order;
  },

  // User payment confirmation (for QR/manual)
  confirmPayment: async (orderId: string): Promise<Order> => {
    const response = await api.post<ApiResponse<{ order: Order }>>(`/orders/${orderId}/confirm-payment`);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data!.order;
  },
};
