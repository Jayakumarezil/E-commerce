import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin, Alert } from 'antd';
import { 
  DollarOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  SafetyCertificateOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { fetchDashboardStats } from '../redux/slices/adminSlice';
import SalesChart from '../components/admin/SalesChart';
import TopProductsTable from '../../src/components/admin/TopProductsTable';
import RecentOrdersTable from '../components/admin/RecentOrdersTable';
import WarrantyAlerts from '../../src/components/admin/WarrantyAlerts';

const { Title } = Typography;

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state: RootState) => state.admin);
  
  useEffect(() => {
    dispatch(fetchDashboardStats() as any);
  }, [dispatch]);
  
  if (loading.stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        className="mb-4"
      />
    );
  }
  
  if (!stats) {
    return (
      <Alert
        message="No Data"
        description="No dashboard statistics available"
        type="warning"
        showIcon
      />
    );
  }
  
  return (
    <div className="p-6">
      <Title level={2} className="mb-6">
        Admin Dashboard
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Sales"
              value={stats.totalSales}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              suffix="INR"
            />
            <div className="mt-2 text-sm text-gray-500">
              <span className={stats.salesGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {stats.salesGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(stats.salesGrowth).toFixed(1)}% from last month
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Warranties"
              value={stats.activeWarranties}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Claims"
              value={stats.pendingClaims}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={stats.totalProducts}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Current Month Sales"
              value={stats.currentMonthSales}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#eb2f96' }}
              suffix="INR"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Last Month Sales"
              value={stats.lastMonthSales}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#f5222d' }}
              suffix="INR"
            />
          </Card>
        </Col>
      </Row>

      {/* Charts and Tables */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Monthly Sales Trend" className="mb-4">
            <SalesChart />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Warranty Alerts" className="mb-4">
            <WarrantyAlerts />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Top Selling Products">
            <TopProductsTable />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Recent Orders">
            <RecentOrdersTable />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
