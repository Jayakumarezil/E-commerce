import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { cartService } from '../../services/cartService';
import {
  addToCartStart,
  addToCartSuccess,
  addToCartFailure,
  fetchCartStart,
  fetchCartSuccess,
  fetchCartFailure,
  updateCartItemStart,
  updateCartItemSuccess,
  updateCartItemFailure,
  removeFromCartStart,
  removeFromCartSuccess,
  removeFromCartFailure,
  clearCartStart,
  clearCartSuccess,
  clearCartFailure,
  updateCartTotals,
} from '../slices/cartSlice';

// Add to cart saga
function* addToCartSaga(action: PayloadAction<{ productId: string; quantity: number }>) {
  try {
    const { productId, quantity } = action.payload;
    const cartItem = yield call(cartService.addToCart, productId, quantity);
    yield put(addToCartSuccess({ cartItem }));
    
    // Fetch updated cart totals after adding item
    const cartData = yield call(cartService.getCart);
    yield put(updateCartTotals({
      subtotal: cartData.subtotal,
      tax: cartData.tax,
      shipping: cartData.shipping,
      total: cartData.total,
    }));
  } catch (error: any) {
    yield put(addToCartFailure(error.message || 'Failed to add item to cart'));
  }
}

// Fetch cart saga
function* fetchCartSaga() {
  try {
    const cartData = yield call(cartService.getCart);
    yield put(fetchCartSuccess(cartData));
  } catch (error: any) {
    yield put(fetchCartFailure(error.message || 'Failed to fetch cart'));
  }
}

// Update cart item saga
function* updateCartItemSaga(action: PayloadAction<{ cartItemId: string; quantity: number }>) {
  try {
    const { cartItemId, quantity } = action.payload;
    const cartItem = yield call(cartService.updateCartItem, cartItemId, quantity);
    yield put(updateCartItemSuccess({ cartItem }));
    
    // Fetch updated cart totals after updating item
    const cartData = yield call(cartService.getCart);
    yield put(updateCartTotals({
      subtotal: cartData.subtotal,
      tax: cartData.tax,
      shipping: cartData.shipping,
      total: cartData.total,
    }));
  } catch (error: any) {
    yield put(updateCartItemFailure(error.message || 'Failed to update cart item'));
  }
}

// Remove from cart saga
function* removeFromCartSaga(action: PayloadAction<string>) {
  try {
    const cartItemId = action.payload;
    yield call(cartService.removeFromCart, cartItemId);
    yield put(removeFromCartSuccess(cartItemId));
     
    // Fetch updated cart totals after removing item
    const cartData = yield call(cartService.getCart);
    yield put(updateCartTotals({
      subtotal: cartData.subtotal,
      tax: cartData.tax,
      shipping: cartData.shipping,
      total: cartData.total,
    }));
  } catch (error: any) {
    yield put(removeFromCartFailure(error.message || 'Failed to remove item from cart'));
  }
}

// Clear cart saga
function* clearCartSaga() {
  try {
    yield call(cartService.clearCart);
    yield put(clearCartSuccess());
  } catch (error: any) {
    yield put(clearCartFailure(error.message || 'Failed to clear cart'));
  }
}

// Watch for cart actions
export default function* cartSaga() {
  yield takeLatest(addToCartStart.type, addToCartSaga);
  yield takeLatest(fetchCartStart.type, fetchCartSaga);
  yield takeLatest(updateCartItemStart.type, updateCartItemSaga);
  yield takeLatest(removeFromCartStart.type, removeFromCartSaga);
  yield takeLatest(clearCartStart.type, clearCartSaga);
}