import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { membershipService, Membership, CreateMembershipRequest, UpdateMembershipRequest } from '../../services/membershipService';

interface MembershipState {
  memberships: Membership[];
  searchedMembership: Membership | null;
  selectedMembership: Membership | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;
}

const initialMembershipState: MembershipState = {
  memberships: [],
  searchedMembership: null,
  selectedMembership: null,
  loading: false,
  error: null,
  pagination: null,
};

// Async thunks
export const searchMembership = createAsyncThunk(
  'membership/searchMembership',
  async (searchTerm: string, { rejectWithValue }) => {
    try {
      const membership = await membershipService.searchMembership(searchTerm);
      return membership;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllMemberships = createAsyncThunk(
  'membership/fetchAllMemberships',
  async ({ page = 1, limit = 20, search, status }: { page?: number; limit?: number; search?: string; status?: string }, { rejectWithValue }) => {
    try {
      const response = await membershipService.getAllMemberships(page, limit, search, status);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMembershipById = createAsyncThunk(
  'membership/fetchMembershipById',
  async (id: number, { rejectWithValue }) => {
    try {
      const membership = await membershipService.getMembershipById(id);
      return membership;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createMembership = createAsyncThunk(
  'membership/createMembership',
  async (membershipData: CreateMembershipRequest, { rejectWithValue }) => {
    try {
      const membership = await membershipService.createMembership(membershipData);
      return membership;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMembership = createAsyncThunk(
  'membership/updateMembership',
  async ({ id, membershipData }: { id: number; membershipData: UpdateMembershipRequest }, { rejectWithValue }) => {
    try {
      const membership = await membershipService.updateMembership(id, membershipData);
      return membership;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMembership = createAsyncThunk(
  'membership/deleteMembership',
  async (id: number, { rejectWithValue }) => {
    try {
      await membershipService.deleteMembership(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const exportMemberships = createAsyncThunk(
  'membership/exportMemberships',
  async (_, { rejectWithValue }) => {
    try {
      const blob = await membershipService.exportMemberships();
      return blob;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const membershipSlice = createSlice({
  name: 'membership',
  initialState: initialMembershipState,
  reducers: {
    clearSearchedMembership: (state) => {
      state.searchedMembership = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSelectedMembership: (state, action: PayloadAction<Membership | null>) => {
      state.selectedMembership = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Search membership
    builder
      .addCase(searchMembership.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMembership.fulfilled, (state, action) => {
        state.loading = false;
        state.searchedMembership = action.payload;
      })
      .addCase(searchMembership.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.searchedMembership = null;
      });

    // Fetch all memberships
    builder
      .addCase(fetchAllMemberships.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMemberships.fulfilled, (state, action) => {
        state.loading = false;
        state.memberships = action.payload.memberships;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllMemberships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch membership by ID
    builder
      .addCase(fetchMembershipById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembershipById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMembership = action.payload;
      })
      .addCase(fetchMembershipById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create membership
    builder
      .addCase(createMembership.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMembership.fulfilled, (state, action) => {
        state.loading = false;
        state.memberships.unshift(action.payload);
      })
      .addCase(createMembership.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update membership
    builder
      .addCase(updateMembership.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMembership.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.memberships.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.memberships[index] = action.payload;
        }
        if (state.selectedMembership?.id === action.payload.id) {
          state.selectedMembership = action.payload;
        }
      })
      .addCase(updateMembership.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete membership
    builder
      .addCase(deleteMembership.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMembership.fulfilled, (state, action) => {
        state.loading = false;
        state.memberships = state.memberships.filter((m) => m.id !== action.payload);
        if (state.selectedMembership?.id === action.payload) {
          state.selectedMembership = null;
        }
      })
      .addCase(deleteMembership.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Export memberships
    builder
      .addCase(exportMemberships.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportMemberships.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportMemberships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSearchedMembership, clearError, setSelectedMembership } = membershipSlice.actions;
export default membershipSlice.reducer;

