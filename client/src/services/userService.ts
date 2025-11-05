import api from './api';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences: {
    newsletter: boolean;
    notifications: boolean;
  };
}

export interface Order {
  id: string;
  items: any[];
  total: number;
  status: string;
  createdAt: string;
  shippingAddress: any;
}

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },

  getOrders: async (): Promise<Order[]> => {
    const response = await api.get('/user/orders');
    return response.data;
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/user/orders/${orderId}`);
    return response.data;
  },

  updatePreferences: async (preferences: any): Promise<void> => {
    await api.put('/user/preferences', preferences);
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete('/user/account');
  },
};
