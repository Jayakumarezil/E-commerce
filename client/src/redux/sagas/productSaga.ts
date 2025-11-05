import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { productService, ProductFilters } from '../../services/productService';
import {
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
} from '../slices/productSlice';

function* fetchProductsSaga(action: PayloadAction<ProductFilters>) {
  try {
    const response = yield call(productService.getProducts, action.payload);
    yield put(fetchProductsSuccess(response));
  } catch (error: any) {
    yield put(fetchProductsFailure(error.message || 'Failed to fetch products'));
  }
}

function* fetchFeaturedProductsSaga() {
  try {
    const response = yield call(productService.getFeaturedProducts);
    yield put(fetchFeaturedProductsSuccess(response));
  } catch (error: any) {
    yield put(fetchFeaturedProductsFailure(error.message || 'Failed to fetch featured products'));
  }
}

function* fetchCategoriesSaga() {
  try {
    const response = yield call(productService.getCategories);
    yield put(fetchCategoriesSuccess(response));
  } catch (error: any) {
    yield put(fetchCategoriesFailure(error.message || 'Failed to fetch categories'));
  }
}

function* fetchProductByIdSaga(action: PayloadAction<string>) {
  try {
    // Guard against undefined or invalid IDs
    if (!action.payload || action.payload === 'undefined' || action.payload.trim() === '') {
      yield put(fetchProductByIdFailure('Invalid product ID'));
      return;
    }
    
    const response = yield call(productService.getProductById, action.payload);
    yield put(fetchProductByIdSuccess(response));
  } catch (error: any) {
    yield put(fetchProductByIdFailure(error.message || 'Failed to fetch product'));
  }
}

function* createProductSaga(action: PayloadAction<any>) {
  try {
    const response = yield call(productService.createProduct, action.payload);
    yield put(createProductSuccess(response));
  } catch (error: any) {
    yield put(createProductFailure(error.message || 'Failed to create product'));
  }
}

function* updateProductSaga(action: PayloadAction<{ id: string; data: any }>) {
  try {
    const response = yield call(productService.updateProduct, action.payload.id, action.payload.data);
    yield put(updateProductSuccess(response));
  } catch (error: any) {
    yield put(updateProductFailure(error.message || 'Failed to update product'));
  }
}

function* deleteProductSaga(action: PayloadAction<string>) {
  try {
    yield call(productService.deleteProduct, action.payload);
    yield put(deleteProductSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteProductFailure(error.message || 'Failed to delete product'));
  }
}

export default function* productSaga() {
  yield takeLatest(fetchProductsStart.type, fetchProductsSaga);
  yield takeLatest(fetchFeaturedProductsStart.type, fetchFeaturedProductsSaga);
  yield takeLatest(fetchCategoriesStart.type, fetchCategoriesSaga);
  yield takeLatest(fetchProductByIdStart.type, fetchProductByIdSaga);
  yield takeLatest(createProductStart.type, createProductSaga);
  yield takeLatest(updateProductStart.type, updateProductSaga);
  yield takeLatest(deleteProductStart.type, deleteProductSaga);
}
