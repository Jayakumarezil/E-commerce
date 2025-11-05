import api from './api';

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface PaymentQR {
  qrCode: string;
  amount: number;
  orderId: string;
  merchantName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export const paymentService = {
  // Create Razorpay order
  createRazorpayOrder: async (orderId: string): Promise<RazorpayOrder> => {
    const response = await api.post<ApiResponse<{ razorpayOrder: RazorpayOrder }>>('/payment/razorpay/create-order', {
      order_id: orderId,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!.razorpayOrder;
  },

  // Verify payment
  verifyPayment: async (orderId: string, paymentId: string, signature: string): Promise<any> => {
    const response = await api.post<ApiResponse<{ order: any }>>('/payment/verify', {
      order_id: orderId,
      payment_id: paymentId,
      signature,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!.order;
  },

  // Handle payment failure
  handlePaymentFailure: async (orderId: string, errorCode?: string, errorDescription?: string): Promise<any> => {
    const response = await api.post<ApiResponse<{ order: any }>>('/payment/failure', {
      order_id: orderId,
      error_code: errorCode,
      error_description: errorDescription,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!.order;
  },

  // Generate payment QR code
  generatePaymentQR: async (orderId: string): Promise<PaymentQR> => {
    const response = await api.post<ApiResponse<PaymentQR>>('/payment/qr', {
      order_id: orderId,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!;
  },

  // Get available payment methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await api.get<ApiResponse<{ paymentMethods: PaymentMethod[] }>>('/payment/methods');
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!.paymentMethods;
  },
};
