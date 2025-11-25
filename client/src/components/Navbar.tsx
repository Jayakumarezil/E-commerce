import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { logout } from '../redux/slices/authSlice';
import { Input, Button, Badge, Avatar, Dropdown, Drawer, Menu } from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  DashboardOutlined,
  SettingOutlined,
  HomeOutlined,
  ShopOutlined,
  IdcardOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { itemCount } = useSelector((state: RootState) => state.cart);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value.trim()) {
      navigate(`/products?search=${encodeURIComponent(value)}`);
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Profile</Link>,
    },
    {
      key: 'orders',
      icon: <FileTextOutlined />,
      label: <Link to="/orders">My Orders</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'warranties',
      icon: <SafetyCertificateOutlined />,
      label: <Link to="/warranties">My Warranties</Link>,
    },
    {
      key: 'claims',
      icon: <FileTextOutlined />,
      label: <Link to="/claims">My Claims</Link>,
    },
    ...(user?.role === 'admin' ? [
      {
        type: 'divider',
      },
      {
        key: 'admin-dashboard',
        icon: <DashboardOutlined />,
        label: <Link to="/admin/dashboard">Admin Dashboard</Link>,
      },
      {
        key: 'admin-orders',
        icon: <SettingOutlined />,
        label: <Link to="/admin/orders">Order Management</Link>,
      },
      {
        key: 'admin-products',
        icon: <SettingOutlined />,
        label: <Link to="/admin/products">Product Management</Link>,
      },
      {
        key: 'admin-claims',
        icon: <FileTextOutlined />,
        label: <Link to="/admin/claims">Claims Management</Link>,
      },
      {
        key: 'admin-users',
        icon: <UserOutlined />,
        label: <Link to="/admin/users">Users</Link>,
      },
      {
        key: 'admin-memberships',
        icon: <IdcardOutlined />,
        label: <Link to="/admin/memberships">Manage Memberships</Link>,
      },
      {
        key: 'admin-categories',
        icon: <AppstoreOutlined />,
        label: <Link to="/admin/categories">Manage Categories</Link>,
      },
    ] as any : []),
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ];

  const mobileMenuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>,
    },
    {
      key: '/products',
      icon: <ShopOutlined />,
      label: <Link to="/products" onClick={() => setMobileMenuOpen(false)}>Products</Link>,
    },
    {
      key: '/membership/search',
      icon: <IdcardOutlined />,
      label: <Link to="/membership/search" onClick={() => setMobileMenuOpen(false)}>Membership Search</Link>,
    },
    ...(isAuthenticated ? [
      {
        key: '/profile',
        icon: <UserOutlined />,
        label: <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>,
      },
      {
        key: '/orders',
        icon: <FileTextOutlined />,
        label: <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>,
      },
      {
        key: '/warranties',
        icon: <SafetyCertificateOutlined />,
        label: <Link to="/warranties" onClick={() => setMobileMenuOpen(false)}>Warranties</Link>,
      },
      {
        key: '/claims',
        icon: <FileTextOutlined />,
        label: <Link to="/claims" onClick={() => setMobileMenuOpen(false)}>My Claims</Link>,
      },
      ...(user?.role === 'admin' ? [
        {
          type: 'divider',
        },
        {
          key: '/admin/dashboard',
          icon: <DashboardOutlined />,
          label: <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</Link>,
        },
        {
          key: '/admin/orders',
          icon: <SettingOutlined />,
          label: <Link to="/admin/orders" onClick={() => setMobileMenuOpen(false)}>Order Management</Link>,
        },
        {
          key: '/admin/products',
          icon: <SettingOutlined />,
          label: <Link to="/admin/products" onClick={() => setMobileMenuOpen(false)}>Product Management</Link>,
        },
        {
          key: '/admin/claims',
          icon: <FileTextOutlined />,
          label: <Link to="/admin/claims" onClick={() => setMobileMenuOpen(false)}>Claims Management</Link>,
        },
        {
          key: '/admin/users',
          icon: <UserOutlined />,
          label: <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)}>Users</Link>,
        },
        {
          key: '/admin/memberships',
          icon: <IdcardOutlined />,
          label: <Link to="/admin/memberships" onClick={() => setMobileMenuOpen(false)}>Manage Memberships</Link>,
        },
      ] as any : []),
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        onClick: handleLogout,
        danger: true,
      },
    ] : []),
  ];

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="w-full px-6">
          <div className="flex items-center h-16 gap-2">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0 mr-6">
              <img src={new URL('../assets/images/logo.jpeg', import.meta.url).href} alt="Vellore Mobile Point" className="h-8 w-8 rounded" />
              <span className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">Vellore Mobile Point</span>
            </Link>

            {/* Desktop Navigation - Menu Items */}
            <div className="hidden md:flex items-center gap-1 flex-1 overflow-x-auto">
              {/* Navigation Links */}
              <Link 
                to="/" 
                className={`px-4 py-2.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className={`px-4 py-2.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/products' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Products
              </Link>
              <Link 
                to="/membership/search" 
                className={`px-4 py-2.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/membership/search' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Membership Search
              </Link>
              {isAuthenticated && (
                <>
                  <Link 
                    to="/warranties" 
                    className={`px-4 py-2.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors ${
                      location.pathname === '/warranties' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    Warranties
                  </Link>
                  <Link 
                    to="/claims" 
                    className={`px-4 py-2.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors ${
                      location.pathname === '/claims' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    Claims
                  </Link>
                  {/* {user?.role === 'admin' && (
                    <>
                      <Link 
                        to="/admin/dashboard" 
                        className={`px-4 py-2.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors ${
                          location.pathname === '/admin/dashboard' 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to="/admin/orders" 
                        className={`px-4 py-2.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors ${
                          location.pathname === '/admin/orders' 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        Orders
                      </Link>
                      <Link 
                        to="/admin/products" 
                        className={`px-4 py-2.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors ${
                          location.pathname === '/admin/products' 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        Products
                      </Link>
                      <Link 
                        to="/admin/claims" 
                        className={`px-4 py-2.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors ${
                          location.pathname === '/admin/claims' 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        Claims
                      </Link>
                    </>
                  )} */}
                </>
              )}

            </div>

            {/* Right Side: Search, Cart, and User Menu */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">

              {/* Cart */}
              <Link to="/cart">
                <Badge count={itemCount} size="small">
                  <Button
                    type="text"
                    icon={<ShoppingCartOutlined />}
                    size="large"
                    className="flex items-center"
                  />
                </Badge>
              </Link>

              {isAuthenticated ? (
                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                  arrow={{ pointAtCenter: true }}
                >
                  <Avatar
                    icon={<UserOutlined />}
                    className="cursor-pointer hover:bg-blue-50 transition-colors"
                  />
                </Dropdown>
              ) : (
                <div className="flex space-x-2">
                  <Button type="text" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button type="primary" onClick={() => navigate('/register')}>
                    Register
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <Link to="/cart">
                <Badge count={itemCount} size="small">
                  <Button
                    type="text"
                    icon={<ShoppingCartOutlined />}
                    size="large"
                  />
                </Badge>
              </Link>
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuOpen(true)}
                className="text-gray-600"
              />
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-3">
            <Input
              placeholder="Search products..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={(e) => handleSearch(e.currentTarget.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
              size="large"
            />
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <Drawer
        title={
          isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <Avatar icon={<UserOutlined />} />
              <div>
                <div className="font-semibold">{user.name || 'User'}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            </div>
          ) : (
            <div className="font-bold text-blue-600">Menu</div>
          )
        }
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
      >
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          items={mobileMenuItems}
          className="border-none"
        />

        {!isAuthenticated && (
          <div className="mt-6 space-y-2">
            <Button
              type="primary"
              block
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/register');
              }}
            >
              Register
            </Button>
            <Button
              block
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
            >
              Login
            </Button>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default Navbar;

