import api from './api';

export interface Category {
  category_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export const categoryService = {
  // Get all categories (public - for filters, etc.)
  getCategories: async (activeOnly: boolean = true): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/categories', {
      params: { active_only: activeOnly.toString() },
    });
    return response.data.data;
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<Category> => {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  },

  // Create category (admin only)
  createCategory: async (categoryData: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post<ApiResponse<Category>>('/categories', categoryData);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create category');
    }
    return response.data.data;
  },

  // Update category (admin only)
  updateCategory: async (id: string, categoryData: UpdateCategoryRequest): Promise<Category> => {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, categoryData);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update category');
    }
    return response.data.data;
  },

  // Delete category (admin only)
  deleteCategory: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse<void>>(`/categories/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete category');
    }
  },

  // Toggle category status (admin only)
  toggleCategoryStatus: async (id: string): Promise<Category> => {
    const response = await api.patch<ApiResponse<Category>>(`/categories/${id}/toggle-status`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to toggle category status');
    }
    return response.data.data;
  },
};

