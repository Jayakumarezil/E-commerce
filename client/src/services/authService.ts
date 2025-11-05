import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface AuthResponse {
  user: {
    user_id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
  };
  token: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Login failed');
  },

  register: async (email: string, password: string, firstName: string, lastName: string, phone: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', {
      name: `${firstName} ${lastName}`,
      email,
      password,
      phone,
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Registration failed');
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  updateProfile: async (profileData: any): Promise<any> => {
    const response = await api.put('/auth/update-profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData: { currentPassword: string; newPassword: string }): Promise<any> => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, password });
  },
};
