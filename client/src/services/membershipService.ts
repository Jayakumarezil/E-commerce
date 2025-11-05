import api from './api';

export interface Membership {
  id: number;
  full_name: string;
  dob: string | null;
  mobile_primary: string;
  membership_start_date: string;
  expiry_date: string;
  payment_mode: 'Cash' | 'GPay';
  amount: number;
  unique_membership_id: string;
  phone_brand_model: string;
  imei_number: string;
  created_at: string;
  updated_at: string;
  status?: 'Active' | 'Expired';
}

export interface CreateMembershipRequest {
  full_name: string;
  dob?: string;
  mobile_primary: string;
  membership_start_date: string;
  expiry_date: string;
  payment_mode: 'Cash' | 'GPay';
  amount: number;
  phone_brand_model: string;
  imei_number: string;
}

export interface UpdateMembershipRequest {
  full_name?: string;
  dob?: string;
  mobile_primary?: string;
  membership_start_date?: string;
  expiry_date?: string;
  payment_mode?: 'Cash' | 'GPay';
  amount?: number;
  phone_brand_model?: string;
  imei_number?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface MembershipsResponse {
  memberships: Membership[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const membershipService = {
  // Public: Search membership by IMEI, mobile, or membership ID
  searchMembership: async (searchTerm: string): Promise<Membership> => {
    const params = new URLSearchParams({ search: searchTerm });

    const response = await api.get<ApiResponse<{ membership: Membership }>>(`/memberships/search?${params}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!.membership;
  },

  // Admin: Get all memberships
  getAllMemberships: async (page: number = 1, limit: number = 20, search?: string, status?: string): Promise<MembershipsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }
    
    if (status && status !== 'all') {
      params.append('status', status);
    }
    
    const response = await api.get<ApiResponse<MembershipsResponse>>(`/memberships?${params}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!;
  },

  // Admin: Get membership by ID
  getMembershipById: async (id: number): Promise<Membership> => {
    const response = await api.get<ApiResponse<{ membership: Membership }>>(`/memberships/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!.membership;
  },

  // Admin: Create membership
  createMembership: async (membershipData: CreateMembershipRequest): Promise<Membership> => {
    const response = await api.post<ApiResponse<{ membership: Membership }>>('/memberships', membershipData);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!.membership;
  },

  // Admin: Update membership
  updateMembership: async (id: number, membershipData: UpdateMembershipRequest): Promise<Membership> => {
    const response = await api.put<ApiResponse<{ membership: Membership }>>(`/memberships/${id}`, membershipData);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!.membership;
  },

  // Admin: Delete membership
  deleteMembership: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse<void>>(`/memberships/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
  },

  // Admin: Export memberships to CSV
  exportMemberships: async (): Promise<Blob> => {
    const response = await api.get('/memberships/export', {
      responseType: 'blob',
    });
    
    return response.data;
  },
};

