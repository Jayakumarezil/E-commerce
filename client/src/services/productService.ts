import api from './api';

export interface Product {
  product_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  warranty_months: number;
  images_json: string[];
  is_active: boolean;
  created_at: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  warranty?: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const productService = {
  getProducts: async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
    const response = await api.get<ApiResponse<ProductsResponse>>('/products', { params: filters });
    return response.data.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get<ApiResponse<{ product: Product }>>(`/products/${id}`);
    return response.data.data.product;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await api.get<ApiResponse<{ products: Product[] }>>('/products/featured');
    return response.data.data.products;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await api.get<ApiResponse<{ categories: string[] }>>('/products/categories');
    return response.data.data.categories;
  },

  createProduct: async (productData: Omit<Product, 'product_id' | 'created_at'>): Promise<Product> => {
    const response = await api.post<ApiResponse<{ product: Product }>>('/products', productData);
    return response.data.data.product;
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    const response = await api.put<ApiResponse<{ product: Product }>>(`/products/${id}`, productData);
    return response.data.data.product;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  searchProducts: async (query: string, filters: ProductFilters = {}): Promise<ProductsResponse> => {
    const response = await api.get<ApiResponse<ProductsResponse>>('/products', {
      params: { search: query, ...filters },
    });
    return response.data.data;
  },
};
