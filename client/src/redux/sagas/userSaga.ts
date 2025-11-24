import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { userService } from '../../services/userService';
import {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
} from '../slices/userSlice';

function* fetchProfileSaga(): Generator<any, void, any> {
  try {
    const response: any = yield call(userService.getProfile);
    yield put(fetchProfileSuccess(response));
  } catch (error: any) {
    yield put(fetchProfileFailure(error.message || 'Failed to fetch profile'));
  }
}

function* updateProfileSaga(action: PayloadAction<any>): Generator<any, void, any> {
  try {
    const response: any = yield call(userService.updateProfile, action.payload);
    yield put(updateProfileSuccess(response));
  } catch (error: any) {
    yield put(updateProfileFailure(error.message || 'Failed to update profile'));
  }
}

function* fetchOrdersSaga(): Generator<any, void, any> {
  try {
    const response: any = yield call(userService.getOrders);
    yield put(fetchOrdersSuccess(response));
  } catch (error: any) {
    yield put(fetchOrdersFailure(error.message || 'Failed to fetch orders'));
  }
}

export default function* userSaga() {
  yield takeLatest(fetchProfileStart.type, fetchProfileSaga);
  yield takeLatest(updateProfileStart.type, updateProfileSaga);
  yield takeLatest(fetchOrdersStart.type, fetchOrdersSaga);
}
