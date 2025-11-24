import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  updateProfile,
} from '../slices/authSlice';

function* loginSaga(action: PayloadAction<{ email: string; password: string }>): Generator<any, void, any> {
  try {
    const { email, password } = action.payload;
    const response: any = yield call(authService.login, email, password);
    
    yield put(loginSuccess({
      user: response.user,
      token: response.token,
    }));
  } catch (error: any) {
    yield put(loginFailure(error.message || 'Login failed'));
  }
}

function* registerSaga(action: PayloadAction<{ email: string; password: string; firstName: string; lastName: string }>): Generator<any, void, any> {
  try {
    const { email, password, firstName, lastName } = action.payload;
    const response: any = yield call(authService.register as any, email, password, firstName, lastName);
    
    yield put(loginSuccess({
      user: response.user,
      token: response.token,
    }));
  } catch (error: any) {
    yield put(loginFailure(error.message || 'Registration failed'));
  }
}

function* logoutSaga(): Generator<any, void, any> {
  try {
    yield call(authService.logout);
  } catch (error) {
    console.error('Logout error:', error);
  }
}

function* updateProfileSaga(action: PayloadAction<any>): Generator<any, void, any> {
  try {
    const response: any = yield call(authService.updateProfile, action.payload);
    yield put(updateProfile(response));
  } catch (error: any) {
    console.error('Update profile error:', error);
  }
}

export default function* authSaga() {
  yield takeLatest(loginStart.type, loginSaga);
  yield takeLatest('auth/registerStart', registerSaga);
  yield takeLatest('auth/logout', logoutSaga);
  yield takeLatest('auth/updateProfile', updateProfileSaga);
}
