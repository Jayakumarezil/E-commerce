import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { logout } from '../redux/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Dropdown, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
} from '@ant-design/icons';

const AppleNavbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { itemCount } = useSelector((state: RootState) => state.cart);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMobileMenuOpen(false);
  };

  const menuItems = [
    { key: 'home', label: 'Home', path: '/' },
    { key: 'products', label: 'Products', path: '/products' },
    ...(isAuthenticated ? [
      { key: 'warranties', label: 'Warranties', path: '/warranties' },
      { key: 'claims', label: 'Claims', path: '/claims' },
    ] : []),
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: <Link to="/profile">Profile</Link>,
    },
    {
      key: 'orders',
      label: <Link to="/orders">Orders</Link>,
    },
    { type: 'divider' },
    ...(user?.role === 'admin' ? [
      { key: 'admin', label: <Link to="/admin/dashboard">Admin</Link> },
      { type: 'divider' },
    ] : []),
    {
      key: 'logout',
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <>
      {/* Sticky Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-apple"
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-xl font-semibold text-apple-gray-900 tracking-tight">
                Commerce
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  className="text-sm text-apple-gray-700 hover:text-apple-gray-900 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <Link to="/cart" className="relative">
                <Badge count={itemCount} size="small">
                  <ShoppingCartOutlined className="text-xl text-apple-gray-700 hover:text-apple-gray-900 transition-colors" />
                </Badge>
              </Link>

              {isAuthenticated ? (
                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                  trigger={['click']}
                >
                  <Avatar
                    icon={<UserOutlined />}
                    size="small"
                    className="cursor-pointer"
                  />
                </Dropdown>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-sm text-apple-gray-700 hover:text-apple-gray-900 font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="btn-apple text-sm px-6 py-2"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(true)}
              >
                <MenuOutlined className="text-xl text-apple-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-apple-lg"
            >
              <div className="p-6">
                {/* Close Button */}
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xl font-semibold">Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <CloseOutlined className="text-xl" />
                  </button>
                </div>

                {/* Menu Items */}
                <nav className="space-y-4">
                  {menuItems.map((item) => (
                    <Link
                      key={item.key}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-lg text-apple-gray-700 hover:text-apple-gray-900 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {/* Auth Buttons */}
                {!isAuthenticated && (
                  <div className="mt-8 space-y-3">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/login');
                      }}
                      className="btn-apple w-full text-center py-3"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/register');
                      }}
                      className="btn-apple-secondary w-full text-center py-3"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-14"></div>
    </>
  );
};

export default AppleNavbar;

