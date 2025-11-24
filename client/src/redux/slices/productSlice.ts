import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Product {
  product_id: string;
  name: string;
  description: string;
  price: number;
  category: string | { name: string }; // Can be string or object
  stock: number;
  warranty_months: number;
  images_json: string[];
  images?: Array<{
    image_id: string;
    image_url: string;
    alt_text?: string;
    display_order: number;
    is_primary: boolean;
  }>;
  is_active: boolean;
  created_at: string;
}

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  categories: (string | { name: string })[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    category: string;
    minPrice: number;
    maxPrice: number;
    search: string;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
    warranty: string;
    page?: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  categories: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  filters: {
    category: '',
    minPrice: 0,
    maxPrice: 10000,
    search: '',
    sortBy: 'created_at',
    sortOrder: 'DESC',
    warranty: '',
  },
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    fetchProductsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProductsSuccess: (state, action: PayloadAction<{ products: Product[]; pagination: ProductState['pagination'] }>) => {
      state.isLoading = false;
      state.products = action.payload.products;
      state.pagination = action.payload.pagination;
      state.error = null;
    },
    fetchProductsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchFeaturedProductsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchFeaturedProductsSuccess: (state, action: PayloadAction<Product[]>) => {
      state.isLoading = false;
      state.featuredProducts = action.payload;
      state.error = null;
    },
    fetchFeaturedProductsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchCategoriesStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchCategoriesSuccess: (state, action: PayloadAction<string[]>) => {
      state.isLoading = false;
      state.categories = action.payload;
      state.error = null;
    },
    fetchCategoriesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchProductByIdStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProductByIdSuccess: (state, action: PayloadAction<Product>) => {
      state.isLoading = false;
      state.currentProduct = action.payload;
      state.error = null;
    },
    fetchProductByIdFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    createProductStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createProductSuccess: (state, action: PayloadAction<Product>) => {
      state.isLoading = false;
      state.products.unshift(action.payload);
      state.error = null;
    },
    createProductFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateProductStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateProductSuccess: (state, action: PayloadAction<Product>) => {
      state.isLoading = false;
      const index = state.products.findIndex(p => p.product_id === action.payload.product_id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
      if (state.currentProduct?.product_id === action.payload.product_id) {
        state.currentProduct = action.payload;
      }
      state.error = null;
    },
    updateProductFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    deleteProductStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteProductSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.products = state.products.filter(p => p.product_id !== action.payload);
      if (state.currentProduct?.product_id === action.payload) {
        state.currentProduct = null;
      }
      state.error = null;
    },
    deleteProductFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<ProductState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action: PayloadAction<Partial<ProductState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  fetchFeaturedProductsStart,
  fetchFeaturedProductsSuccess,
  fetchFeaturedProductsFailure,
  fetchCategoriesStart,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  fetchProductByIdStart,
  fetchProductByIdSuccess,
  fetchProductByIdFailure,
  createProductStart,
  createProductSuccess,
  createProductFailure,
  updateProductStart,
  updateProductSuccess,
  updateProductFailure,
  deleteProductStart,
  deleteProductSuccess,
  deleteProductFailure,
  setFilters,
  setPagination,
  clearCurrentProduct,
  clearError,
} = productSlice.actions;

export default productSlice.reducer;
