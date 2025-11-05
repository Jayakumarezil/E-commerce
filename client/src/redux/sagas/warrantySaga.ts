import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  registerWarranty,
  autoRegisterWarranty,
  fetchUserWarranties,
  fetchWarrantyById,
  fetchUserClaims,
  fetchAllClaims,
  updateClaimStatus,
} from '../slices/warrantySlice';
import { warrantyService } from '../../services/warrantyService';

// Register warranty saga
function* registerWarrantySaga(action: PayloadAction<{
  product_id: string;
  purchase_date: string;
  serial_number: string;
  invoice_url?: string;
}>) {
  try {
    // Placeholder - will be implemented later with actual API calls
    const warranty = {
      warranty_id: `warranty_${Date.now()}`,
      user_id: 'current_user',
      product_id: action.payload.product_id,
      purchase_date: action.payload.purchase_date,
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      serial_number: action.payload.serial_number,
      invoice_url: action.payload.invoice_url,
      registration_type: 'manual' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    yield put(registerWarranty.fulfilled(warranty, action.type, action.payload));
  } catch (error: any) {
    yield put(registerWarranty.rejected(error.message, action.type, action.payload));
  }
}

// Auto-register warranty saga
function* autoRegisterWarrantySaga(action: PayloadAction<string>) {
  try {
    // Placeholder - will be implemented later with actual API calls
    const warranties: any[] = [];
    yield put(autoRegisterWarranty.fulfilled(warranties, action.type, action.payload));
  } catch (error: any) {
    yield put(autoRegisterWarranty.rejected(error.message, action.type, action.payload));
  }
}

// Fetch user warranties saga
function* fetchUserWarrantiesSaga(action: PayloadAction<{
  userId: string;
  page?: number;
  limit?: number;
  status?: string;
}>) {
  try {
    // Placeholder - will be implemented later with actual API calls
    const response = {
      warranties: [],
      pagination: {
        currentPage: action.payload.page || 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: action.payload.limit || 10,
      },
    };
    yield put(fetchUserWarranties.fulfilled(response, action.type, action.payload));
  } catch (error: any) {
    yield put(fetchUserWarranties.rejected(error.message, action.type, action.payload));
  }
}

// Fetch warranty by ID saga
function* fetchWarrantyByIdSaga(action: PayloadAction<string>) {
  try {
    // Placeholder - will be implemented later with actual API calls
    const warranty = null;
    yield put(fetchWarrantyById.fulfilled(warranty, action.type, action.payload));
  } catch (error: any) {
    yield put(fetchWarrantyById.rejected(error.message, action.type, action.payload));
  }
}

// Create claim is now handled directly by the async thunk, no saga needed

// Fetch user claims saga
function* fetchUserClaimsSaga(action: PayloadAction<{
  userId: string;
  page?: number;
  limit?: number;
  status?: string;
}>) {
  try {
    const response = yield call(
      warrantyService.getUserClaims,
      action.payload.userId,
      action.payload.page || 1,
      action.payload.limit || 10,
      action.payload.status
    );
    yield put(fetchUserClaims.fulfilled(response, action.type, action.payload));
  } catch (error: any) {
    yield put(fetchUserClaims.rejected(error.message, action.type, action.payload));
  }
}

// Fetch all claims saga (admin)
function* fetchAllClaimsSaga(action: PayloadAction<{
  page?: number;
  limit?: number;
  status?: string;
}>) {
  try {
    const response = yield call(
      warrantyService.getAllClaims,
      action.payload.page || 1,
      action.payload.limit || 20,
      action.payload.status
    );
    yield put(fetchAllClaims.fulfilled(response, action.type, action.payload));
  } catch (error: any) {
    yield put(fetchAllClaims.rejected(error.message, action.type, action.payload));
  }
}

// Update claim status saga (admin)
function* updateClaimStatusSaga(action: PayloadAction<{
  claimId: string;
  statusData: {
    status: 'pending' | 'approved' | 'rejected' | 'resolved';
    admin_notes?: string;
  };
}>) {
  try {
    console.log('Saga: updateClaimStatusSaga called with:', action.payload);
    const claim = yield call(
      warrantyService.updateClaimStatus,
      action.payload.claimId,
      action.payload.statusData
    );
    console.log('Saga: updateClaimStatus response:', claim);
    yield put(updateClaimStatus.fulfilled(claim, action.type, action.payload));
  } catch (error: any) {
    console.error('Saga: updateClaimStatus error:', error);
    yield put(updateClaimStatus.rejected(error.message, action.type, action.payload));
  }
}

// Root warranty saga
export default function* warrantySaga() {
  yield takeLatest(registerWarranty.pending.type, registerWarrantySaga);
  yield takeLatest(autoRegisterWarranty.pending.type, autoRegisterWarrantySaga);
  yield takeLatest(fetchUserWarranties.pending.type, fetchUserWarrantiesSaga);
  yield takeLatest(fetchWarrantyById.pending.type, fetchWarrantyByIdSaga);
  // createClaim is handled by the thunk itself, no saga needed
  // yield takeLatest(createClaim.pending.type, createClaimSaga);
  yield takeLatest(fetchUserClaims.pending.type, fetchUserClaimsSaga);
  yield takeLatest(fetchAllClaims.pending.type, fetchAllClaimsSaga);
  yield takeLatest(updateClaimStatus.pending.type, updateClaimStatusSaga);
}