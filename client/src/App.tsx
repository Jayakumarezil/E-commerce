import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { store } from './redux/store';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import PrivateRoute from './components/PrivateRoute';
import React, { Suspense } from 'react';
const Home = React.lazy(() => import('./pages/Home'));
const Products = React.lazy(() => import('./pages/Products'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const OrderConfirmation = React.lazy(() => import('./pages/OrderConfirmation'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Orders = React.lazy(() => import('./pages/Orders'));
const AdminProducts = React.lazy(() => import('./pages/AdminProducts'));
const WarrantyRegistration = React.lazy(() => import('./pages/WarrantyRegistration'));
const MyWarranties = React.lazy(() => import('./pages/MyWarranties'));
const ClaimSubmission = React.lazy(() => import('./pages/ClaimSubmission'));
const MyClaims = React.lazy(() => import('./pages/MyClaims'));
const AdminClaimsDashboard = React.lazy(() => import('./pages/AdminClaimsDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const OrderManagement = React.lazy(() => import('./pages/OrderManagement'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const AdminManualOrder = React.lazy(() => import('./pages/AdminManualOrder'));
const AdminUsers = React.lazy(() => import('./pages/AdminUsers'));
const MembershipSearch = React.lazy(() => import('./pages/MembershipSearch'));
const AdminMemberships = React.lazy(() => import('./pages/AdminMemberships'));
import './index.css';

const theme = {
  token: {
    colorPrimary: '#0ea5e9',
    borderRadius: 8,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
};

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider theme={theme}>
        <ErrorBoundary>
          <Router>
            <ScrollToTop />
            <Layout>
              <Suspense fallback={<div style={{padding:'2rem'}}>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
                
                {/* Membership Routes */}
                <Route path="/membership/search" element={<MembershipSearch />} />
                
                {/* Warranty Routes */}
                <Route path="/warranties/register" element={<WarrantyRegistration />} />
                <Route path="/warranties" element={<MyWarranties />} />
                <Route path="/claims/submit" element={<ClaimSubmission />} />
                <Route path="/claims" element={<MyClaims />} />
                
                {/* Admin Routes */}
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/claims" element={<AdminClaimsDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/orders" element={<OrderManagement />} />
                <Route path="/admin/orders/manual" element={<AdminManualOrder />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/memberships" element={<PrivateRoute requiredRole="admin"><AdminMemberships /></PrivateRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </Layout>
          </Router>
        </ErrorBoundary>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
