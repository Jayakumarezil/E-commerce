import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService';
import {
  createOrderStart,
  createOrderSuccess,
  createOrderFailure,
  fetchUserOrdersStart,
  fetchUserOrdersSuccess,
  fetchUserOrdersFailure,
  fetchOrderByIdStart,
  fetchOrderByIdSuccess,
  fetchOrderByIdFailure,
  updateOrderStatusStart,
  updateOrderStatusSuccess,
  updateOrderStatusFailure,
  cancelOrderStart,
  cancelOrderSuccess,
  cancelOrderFailure,
} from '../slices/orderSlice';

// Create order saga
function* createOrderSaga(action: PayloadAction<{
  shippingAddress: any;
  paymentMethod?: string;
}>): Generator<any, void, any> {
  try {
    const { shippingAddress, paymentMethod } = action.payload;
    const order: any = yield call(orderService.createOrder as any, {
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
    });
    yield put(createOrderSuccess({ order }));
  } catch (error: any) {
    yield put(createOrderFailure(error.message || 'Failed to create order'));
  }
}

// Fetch user orders saga
function* fetchUserOrdersSaga(action: PayloadAction<{
  page?: number;
  limit?: number;
  status?: string;
}>): Generator<any, void, any> {
  try {
    const { page = 1, limit = 10, status } = action.payload;
    const ordersData: any = yield call(orderService.getUserOrders, page, limit, status);
    yield put(fetchUserOrdersSuccess(ordersData));
  } catch (error: any) {
    yield put(fetchUserOrdersFailure(error.message || 'Failed to fetch orders'));
  }
}

// Fetch order by ID saga
function* fetchOrderByIdSaga(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const orderId = action.payload;
    const order: any = yield call(orderService.getOrderById, orderId);
    yield put(fetchOrderByIdSuccess({ order }));
  } catch (error: any) {
    yield put(fetchOrderByIdFailure(error.message || 'Failed to fetch order'));
  }
}

// Update order status saga
function* updateOrderStatusSaga(action: PayloadAction<{
  orderId: string;
  orderStatus?: string;
  paymentStatus?: string;
}>): Generator<any, void, any> {
  try {
    const { orderId, orderStatus, paymentStatus } = action.payload;
    const order: any = yield call(orderService.updateOrderStatus, orderId, orderStatus, paymentStatus);
    yield put(updateOrderStatusSuccess({ order }));
  } catch (error: any) {
    yield put(updateOrderStatusFailure(error.message || 'Failed to update order status'));
  }
}

// Cancel order saga
function* cancelOrderSaga(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const orderId = action.payload;
    const order: any = yield call(orderService.cancelOrder, orderId);
    yield put(cancelOrderSuccess({ order }));
  } catch (error: any) {
    yield put(cancelOrderFailure(error.message || 'Failed to cancel order'));
  }
}

// Watch for order actions
export default function* orderSaga() {
  yield takeLatest(createOrderStart.type, createOrderSaga);
  yield takeLatest(fetchUserOrdersStart.type, fetchUserOrdersSaga);
  yield takeLatest(fetchOrderByIdStart.type, fetchOrderByIdSaga);
  yield takeLatest(updateOrderStatusStart.type, updateOrderStatusSaga);
  yield takeLatest(cancelOrderStart.type, cancelOrderSaga);
}
