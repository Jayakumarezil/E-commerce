import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Select, 
  DatePicker, 
  Input, 
  Tag, 
  Modal, 
  Form, 
  message,
  Row,
  Col,
  Typography,
  Tooltip
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { fetchAllOrders, updateOrderStatus } from '../redux/slices/adminSlice';
import dayjs from 'dayjs';
import { formatCurrency } from '../utils/currency';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const OrderManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { orders, ordersPagination, loading } = useSelector((state: RootState) => state.admin);
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    payment_status: '',
    start_date: '',
    end_date: '',
    search: ''
  });
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchAllOrders(filters) as any);
  }, [dispatch, filters]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus }) as any);
      message.success('Order status updated successfully');
      dispatch(fetchAllOrders(filters) as any);
    } catch (error) {
      message.error('Failed to update order status');
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setFilters(prev => ({
        ...prev,
        start_date: dates[0].format('YYYY-MM-DD'),
        end_date: dates[1].format('YYYY-MM-DD')
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        start_date: '',
        end_date: ''
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'orange';
      case 'processing': return 'blue';
      case 'confirmed': return 'cyan';
      case 'shipped': return 'cyan';
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
      case 'refunded': return 'purple';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      align: 'center' as const,
      render: (id: string) => (
        <span className="font-mono text-sm">#{id?.slice(-8) || 'N/A'}</span>
      ),
    },
    {
      title: 'Customer',
      dataIndex: ['user', 'name'],
      key: 'customer',
      align: 'center' as const,
      render: (name: string, record: any) => (
        <div>
          <div className="font-medium">{name || 'Unknown'}</div>
          <div className="text-xs text-gray-500">{record.user?.email || 'N/A'}</div>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'total_price',
      key: 'total_price',
      align: 'center' as const,
      render: (price: number | string) => (
        <span className="font-semibold">{formatCurrency(price)}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'order_status',
      key: 'order_status',
      align: 'center' as const,
      render: (status: string, record: any) => (
        <Select
          value={status}
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(record.order_id, value)}
        >
          <Option value="pending">Pending</Option>
          <Option value="processing">Processing</Option>
          <Option value="confirmed">Confirmed</Option>
          <Option value="shipped">Shipped</Option>
          <Option value="delivered">Delivered</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'payment_status',
      key: 'payment_status',
      align: 'center' as const,
      render: (status: string) => (
        <Tag color={getPaymentStatusColor(status)}>
          {status?.toUpperCase() || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Warranty Status',
      dataIndex: 'warrantyStatus',
      key: 'warrantyStatus',
      align: 'center' as const,
      render: (status: string, record: any) => (
        <Tag color={record.warrantyColor || 'default'}>
          {status || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center' as const,
      render: (date: string) => (
        <span className="text-sm">
          {dayjs(date).format('MMM DD, YYYY')}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Tooltip title="View Details">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedOrder(record);
              setIsModalVisible(true);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Title level={2} className="mb-0">
          Order Management
        </Title>
        <Button type="primary" onClick={() => (window.location.href = '/admin/orders/manual')}>Create Manual Order</Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search orders..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Order Status"
              style={{ width: '100%' }}
              allowClear
              value={filters.status || undefined}
              onChange={(value) => handleFilterChange('status', value || '')}
            >
              <Option value="pending">Pending</Option>
              <Option value="processing">Processing</Option>
              <Option value="confirmed">Confirmed</Option>
              <Option value="shipped">Shipped</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Payment Status"
              style={{ width: '100%' }}
              allowClear
              value={filters.payment_status || undefined}
              onChange={(value) => handleFilterChange('payment_status', value || '')}
            >
              <Option value="pending">Pending</Option>
              <Option value="paid">Paid</Option>
              <Option value="failed">Failed</Option>
              <Option value="refunded">Refunded</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={handleDateRangeChange}
            />
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey={(record) => record.order_id || record.id || Math.random().toString()}
          loading={loading.orders}
          pagination={{
            current: ordersPagination?.page || 1,
            pageSize: ordersPagination?.limit || 20,
            total: ordersPagination?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} orders`,
            onChange: (page, pageSize) => {
              setFilters(prev => ({
                ...prev,
                page,
                limit: pageSize || 20
              }));
            }
          }}
          locale={{
            emptyText: 'No orders found'
          }}
        />
      </Card>

      {/* Order Details Modal */}
      <Modal
        title={`Order Details - #${selectedOrder?.order_id?.slice(-8) || selectedOrder?.id?.slice(-8) || 'N/A'}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> {selectedOrder.user?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
              </Col>
              <Col span={12}>
                <h4>Order Information</h4>
                <p><strong>Total:</strong> {formatCurrency(selectedOrder.total_price)}</p>
                <p><strong>Status:</strong> <Tag color={getStatusColor(selectedOrder.order_status || selectedOrder.status)}>{selectedOrder.order_status || selectedOrder.status}</Tag></p>
                <p><strong>Payment:</strong> <Tag color={getPaymentStatusColor(selectedOrder.payment_status)}>{selectedOrder.payment_status}</Tag></p>
              </Col>
            </Row>
            
            <div className="mt-4">
              <h4>Order Items</h4>
              <Table
                dataSource={selectedOrder.orderItems || []}
                columns={[
                  { title: 'Product', dataIndex: ['product', 'name'], key: 'product' },
                  { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
                  { 
                    title: 'Price', 
                    dataIndex: 'price_at_purchase', 
                    key: 'price', 
                    render: (price: number | string) => formatCurrency(price)
                  },
                ]}
                pagination={false}
                size="small"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement;
