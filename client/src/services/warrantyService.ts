import api from './api';

export interface Warranty {
  warranty_id: string;
  user_id: string;
  product_id: string;
  purchase_date: string;
  expiry_date: string;
  serial_number: string;
  invoice_url?: string;
  registration_type: 'auto' | 'manual';
  created_at: string;
  updated_at: string;
  product?: {
    product_id: string;
    name: string;
    description: string;
    warranty_months: number;
  };
  user?: {
    user_id: string;
    name: string;
    email: string;
  };
  claims?: Claim[];
}

export interface Claim {
  claim_id: string;
  warranty_id: string;
  issue_description: string;
  image_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  warranty?: Warranty;
}

export interface RegisterWarrantyRequest {
  product_id: string;
  purchase_date: string;
  serial_number: string;
  invoice_url?: string;
}

export interface AutoRegisterWarrantyRequest {
  order_id: string;
}

export interface CreateClaimRequest {
  warranty_id: string;
  issue_description: string;
  image_url?: string;
}

export interface UpdateClaimStatusRequest {
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  admin_notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface WarrantiesResponse {
  warranties: Warranty[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ClaimsResponse {
  claims: Claim[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const warrantyService = {
  // Register warranty manually
  registerWarranty: async (warrantyData: RegisterWarrantyRequest): Promise<Warranty> => {
    const response = await api.post<ApiResponse<{ warranty: Warranty }>>('/warranties/register', warrantyData);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!.warranty;
  },

  // Auto-register warranty from order
  autoRegisterWarranty: async (orderData: AutoRegisterWarrantyRequest): Promise<Warranty[]> => {
    const response = await api.post<ApiResponse<{ warranties: Warranty[] }>>('/warranties/auto-register', orderData);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!.warranties;
  },

  // Get user's warranties
  getUserWarranties: async (userId: string, page: number = 1, limit: number = 10, status?: string): Promise<WarrantiesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status && status !== 'all') {
      params.append('status', status);
    }
    
    const response = await api.get<ApiResponse<WarrantiesResponse>>(`/warranties/user/${userId}?${params}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!;
  },

  // Get warranty details
  getWarrantyById: async (warrantyId: string): Promise<Warranty> => {
    const response = await api.get<ApiResponse<{ warranty: Warranty }>>(`/warranties/${warrantyId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!.warranty;
  },

  // Submit warranty claim
  createClaim: async (claimData: CreateClaimRequest): Promise<Claim> => {
    console.log('warrantyService: Sending POST request to /warranties/claims/create with data:', claimData);
    
    try {
      const response = await api.post<ApiResponse<{ claim: Claim }>>('/warranties/claims/create', claimData);
      
      console.log('warrantyService: Response received:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      return response.data.data!.claim;
    } catch (error: any) {
      console.error('warrantyService: Error response:', error.response?.data);
      throw error;
    }
  },

  // Get user's claims
  getUserClaims: async (userId: string, page: number = 1, limit: number = 10, status?: string): Promise<ClaimsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status && status !== 'all') {
      params.append('status', status);
    }
    
    const response = await api.get<ApiResponse<ClaimsResponse>>(`/warranties/claims/user/${userId}?${params}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!;
  },

  // Update claim status (admin only)
  updateClaimStatus: async (claimId: string, statusData: UpdateClaimStatusRequest): Promise<Claim> => {
    const response = await api.put<ApiResponse<{ claim: Claim }>>(`/warranties/claims/${claimId}/update-status`, statusData);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!.claim;
  },

  // Get all claims (admin only)
  getAllClaims: async (page: number = 1, limit: number = 20, status?: string): Promise<ClaimsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status && status !== 'all') {
      params.append('status', status);
    }
    
    const response = await api.get<ApiResponse<ClaimsResponse>>(`/warranties/claims/all?${params}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!;
  },
};
