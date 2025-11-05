import { all, fork } from 'redux-saga/effects';
import authSaga from './authSaga';
import productSaga from './productSaga';
import cartSaga from './cartSaga';
import orderSaga from './orderSaga';
import userSaga from './userSaga';
import warrantySaga from './warrantySaga';

export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(productSaga),
    fork(cartSaga),
    fork(orderSaga),
    fork(userSaga),
    fork(warrantySaga),
  ]);
}
