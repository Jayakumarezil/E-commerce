import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchUserOrders } from '../redux/slices/orderSlice';
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Empty,
  Spin,
  message,
} from 'antd';
import {
  EyeOutlined,
  DownloadOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { formatPrice, formatDateOnly } from '../utils/helpers';

const { Title } = Typography;

const Orders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { orders, loading, error } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    dispatch(fetchUserOrders() as any);
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'orange';
      case 'confirmed': return 'blue';
      case 'processing': return 'cyan';
      case 'shipped': return 'purple';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'orange';
      case 'paid': return 'green';
      case 'failed': return 'red';
      case 'refunded': return 'blue';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      render: (text: string) => (
        <span className="font-mono text-sm">{text.substring(0, 8)}...</span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => formatDateOnly(text),
    },
    {
      title: 'Items',
      dataIndex: 'order_items',
      key: 'items',
      render: (_: any, record: any) => {
        return record.orderItems?.length || 0;
      },
    },
    {
      title: 'Total',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price: number | string) => formatPrice(typeof price === 'string' ? parseFloat(price) : price),
    },
    {
      title: 'Status',
      dataIndex: 'order_status',
      key: 'order_status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status: string) => (
        <Tag color={getPaymentStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/order-confirmation`, { state: { orderId: record.order_id } })}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    message.error(error);
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <Title level={2}>
          <ShoppingCartOutlined className="mr-2" />
          My Orders
        </Title>
      </div>

      <Card>
        {orders.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="You haven't placed any orders yet."
          >
            <Button type="primary" onClick={() => navigate('/products')}>
              Start Shopping
            </Button>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="order_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
            }}
            scroll={{ x: 800 }}
          />
        )}
      </Card>
    </div>
  );
};

export default Orders;
