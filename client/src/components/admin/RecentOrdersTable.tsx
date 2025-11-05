import React, { useEffect } from 'react';
import { Table, Spin, Alert, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { fetchAllOrders } from '../../redux/slices/adminSlice';
import { formatDateOnly } from '../../utils/helpers';

const RecentOrdersTable: React.FC = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    dispatch(fetchAllOrders({ limit: 5 }) as any);
  }, [dispatch]);

  if (loading.orders) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Alert
        message="No Data"
        description="No recent orders available"
        type="warning"
        showIcon
      />
    );
  }

  const getStatusColor = (status: string | undefined | null) => {
    if (!status || typeof status !== 'string') return 'default';
    switch (status.toLowerCase()) {
      case 'pending':
        return 'orange';
      case 'processing':
        return 'blue';
      case 'confirmed':
        return 'cyan';
      case 'shipped':
        return 'cyan';
      case 'delivered':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status: string | undefined | null) => {
    if (!status || typeof status !== 'string') return 'default';
    switch (status.toLowerCase()) {
      case 'pending':
        return 'orange';
      case 'paid':
        return 'green';
      case 'failed':
        return 'red';
      case 'refunded':
        return 'purple';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      render: (id: string) => (
        <span className="font-mono text-sm">#{id?.slice(-8) || 'N/A'}</span>
      ),
    },
    {
      title: 'Customer',
      dataIndex: ['user', 'name'],
      key: 'customer',
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
      render: (price: number) => {
        const numPrice = typeof price === 'number' ? price : parseFloat(String(price || 0));
        return <span className="font-semibold">₹{numPrice.toFixed(2)}</span>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'order_status',
      key: 'order_status',
      render: (status: string | undefined) => {
        const safeStatus = (status && typeof status === 'string') ? status : 'unknown';
        return (
          <Tag color={getStatusColor(safeStatus)}>
            {safeStatus.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Payment',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status: string | undefined) => {
        const safeStatus = (status && typeof status === 'string') ? status : 'unknown';
        return (
          <Tag color={getPaymentStatusColor(safeStatus)}>
            {safeStatus.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <span className="text-sm">
          {formatDateOnly(date)}
        </span>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={orders}
      rowKey={(record) => record.order_id || record.id || Math.random().toString()}
      pagination={false}
      size="small"
      scroll={{ y: 300 }}
    />
  );
};

export default RecentOrdersTable;
