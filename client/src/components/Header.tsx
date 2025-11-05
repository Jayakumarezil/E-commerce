import React from 'react';
import { Layout, Menu, Button, Badge, Avatar, Dropdown } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { logout } from '../redux/slices/authSlice';
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined, SafetyCertificateOutlined, FileTextOutlined, DashboardOutlined, SettingOutlined } from '@ant-design/icons';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { itemCount } = useSelector((state: RootState) => state.cart);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Profile</Link>,
    },
    {
      key: 'orders',
      icon: <UserOutlined />,
      label: <Link to="/orders">Orders</Link>,
    },
    {
      type: 'divider' as const,
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
        type: 'divider' as const,
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
    ] : []),
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: '/',
      label: <Link to="/">Home</Link>,
    },
    {
      key: '/products',
      label: <Link to="/products">Products</Link>,
    },
    ...(isAuthenticated ? [
      {
        key: '/warranties',
        label: <Link to="/warranties">Warranties</Link>,
      },
      {
        key: '/claims',
        label: <Link to="/claims">Claims</Link>,
      },
    ] : []),
  ];

  return (
    <AntHeader className="bg-white shadow-sm px-4 flex items-center justify-between">
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-bold text-primary-600 mr-8">
          Vellore Mobile Point
        </Link>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="border-none bg-transparent"
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <Link to="/cart">
          <Badge count={itemCount} size="small">
            <Button
              type="text"
              icon={<ShoppingCartOutlined />}
              size="large"
            />
          </Badge>
        </Link>
        
        {isAuthenticated ? (
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <Avatar
              icon={<UserOutlined />}
              className="cursor-pointer"
            />
          </Dropdown>
        ) : (
          <div className="space-x-2">
            <Button type="text" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              Register
            </Button>
          </div>
        )}
      </div>
    </AntHeader>
  );
};

export default Header;
