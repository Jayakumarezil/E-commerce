import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Simple interfaces
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
}

// Warranty slice
interface WarrantyState {
  warranties: Warranty[];
  selectedWarranty: Warranty | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;
}

const initialWarrantyState: WarrantyState = {
  warranties: [],
  selectedWarranty: null,
  loading: false,
  error: null,
  pagination: null,
};

// Async thunks
export const registerWarranty = createAsyncThunk(
  'warranty/registerWarranty',
  async (warrantyData: any, { rejectWithValue }) => {
    try {
      return warrantyData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserWarranties = createAsyncThunk(
  'warranty/fetchUserWarranties',
  async ({ userId, page = 1, limit = 10, status }: any, { rejectWithValue }) => {
    try {
      return { warranties: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 } };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const warrantySlice = createSlice({
  name: 'warranty',
  initialState: initialWarrantyState,
  reducers: {
    clearWarrantyError: (state) => {
      state.error = null;
    },
    setSelectedWarranty: (state, action: PayloadAction<Warranty | null>) => {
      state.selectedWarranty = action.payload;
    },
    clearWarranties: (state) => {
      state.warranties = [];
      state.selectedWarranty = null;
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerWarranty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerWarranty.fulfilled, (state, action) => {
        state.loading = false;
        state.warranties.unshift(action.payload);
      })
      .addCase(registerWarranty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserWarranties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserWarranties.fulfilled, (state, action) => {
        state.loading = false;
        state.warranties = action.payload.warranties;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUserWarranties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Claim slice
interface ClaimState {
  claims: Claim[];
  selectedClaim: Claim | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;
}

const initialClaimState: ClaimState = {
  claims: [],
  selectedClaim: null,
  loading: false,
  error: null,
  pagination: null,
};

export const createClaim = createAsyncThunk(
  'claim/createClaim',
  async (claimData: any, { rejectWithValue }) => {
    try {
      return claimData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserClaims = createAsyncThunk(
  'claim/fetchUserClaims',
  async ({ userId, page = 1, limit = 10, status }: any, { rejectWithValue }) => {
    try {
      return { claims: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 } };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllClaims = createAsyncThunk(
  'claim/fetchAllClaims',
  async ({ page = 1, limit = 20, status }: any, { rejectWithValue }) => {
    try {
      return { claims: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 } };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateClaimStatus = createAsyncThunk(
  'claim/updateClaimStatus',
  async ({ claimId, statusData }: any, { rejectWithValue }) => {
    try {
      return { claim_id: claimId, ...statusData };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const claimSlice = createSlice({
  name: 'claim',
  initialState: initialClaimState,
  reducers: {
    clearClaimError: (state) => {
      state.error = null;
    },
    setSelectedClaim: (state, action: PayloadAction<Claim | null>) => {
      state.selectedClaim = action.payload;
    },
    clearClaims: (state) => {
      state.claims = [];
      state.selectedClaim = null;
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createClaim.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClaim.fulfilled, (state, action) => {
        state.loading = false;
        state.claims.unshift(action.payload);
      })
      .addCase(createClaim.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserClaims.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserClaims.fulfilled, (state, action) => {
        state.loading = false;
        state.claims = action.payload.claims;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUserClaims.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAllClaims.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllClaims.fulfilled, (state, action) => {
        state.loading = false;
        state.claims = action.payload.claims;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllClaims.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateClaimStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClaimStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.claims.findIndex(claim => claim.claim_id === action.payload.claim_id);
        if (index !== -1) {
          state.claims[index] = action.payload;
        }
      })
      .addCase(updateClaimStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearWarrantyError, setSelectedWarranty, clearWarranties } = warrantySlice.actions;
export const { clearClaimError, setSelectedClaim, clearClaims } = claimSlice.actions;

export { warrantySlice, claimSlice };
export default { warrantySlice, claimSlice };
