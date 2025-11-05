import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Modal, Card, Row, Col, Typography, Select, Pagination, message } from 'antd';
import { EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { fetchUserWarranties, setSelectedWarranty } from '../redux/slices/warrantySlice';
import { Warranty } from '../redux/slices/warrantySlice';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const MyWarranties: React.FC = () => {
  const dispatch = useDispatch();
  const { warranties, loading, pagination, error } = useSelector((state: RootState) => state.warranty);
  const { user } = useSelector((state: RootState) => state.auth);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [warrantyModalVisible, setWarrantyModalVisible] = useState(false);

  // Get userId from Redux state or localStorage
  const userId = user?.user_id || (() => {
    try {
      const userStr = localStorage.getItem('user');
      const userObj = userStr ? JSON.parse(userStr) : null;
      return userObj?.user_id;
    } catch {
      return null;
    }
  })();
  
  console.log('MyWarranties - userId:', userId, 'user:', user);

  useEffect(() => {
    if (userId) {
      console.log('Fetching warranties for userId:', userId);
      dispatch(fetchUserWarranties({ userId, page: currentPage, status: statusFilter }) as any);
    } else {
      console.warn('No userId found, cannot fetch warranties');
    }
  }, [dispatch, userId, currentPage, statusFilter]);
  
  useEffect(() => {
    console.log('Warranties state updated:', { warranties, loading, error, count: warranties?.length || 0 });
  }, [warranties, loading, error]);

  const handleViewDetails = (warranty: Warranty) => {
    dispatch(setSelectedWarranty(warranty));
    setWarrantyModalVisible(true);
  };

  const handleRaiseClaim = (warranty: Warranty) => {
    // Navigate to claim submission page with pre-filled warranty
    window.location.href = `/claims/submit?warrantyId=${warranty.warranty_id}`;
  };

  const getStatusTag = (warranty: Warranty) => {
    const isExpired = dayjs().isAfter(dayjs(warranty.expiry_date));
    const isExpiringSoon = dayjs().add(15, 'days').isAfter(dayjs(warranty.expiry_date)) && !isExpired;
    
    if (isExpired) {
      return <Tag color="red">Expired</Tag>;
    } else if (isExpiringSoon) {
      return <Tag color="orange">Expiring Soon</Tag>;
    } else {
      return <Tag color="green">Active</Tag>;
    }
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: ['product', 'name'],
      key: 'product',
      render: (text: string, record: Warranty) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Serial: {record.serial_number}
          </div>
        </div>
      ),
    },
    {
      title: 'Purchase Date',
      dataIndex: 'purchase_date',
      key: 'purchase_date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: Warranty) => getStatusTag(record),
    },
    {
      title: 'Registration Type',
      dataIndex: 'registration_type',
      key: 'registration_type',
      render: (type: string) => (
        <Tag color={type === 'auto' ? 'blue' : 'purple'}>
          {type === 'auto' ? 'Auto' : 'Manual'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Warranty) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            View Details
          </Button>
          {dayjs().isBefore(dayjs(record.expiry_date)) && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleRaiseClaim(record)}
            >
              Raise Claim
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
          <Col>
            <Title level={2}>My Warranties</Title>
          </Col>
          <Col>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              style={{ width: 150 }}
            >
              <Option value="all">All Warranties</Option>
              <Option value="active">Active</Option>
              <Option value="expired">Expired</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={warranties}
          loading={loading}
          rowKey="warranty_id"
          pagination={false}
          scroll={{ x: 800 }}
        />

        {pagination && (
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <Pagination
              current={pagination.currentPage}
              total={pagination.totalItems}
              pageSize={pagination.itemsPerPage}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} warranties`
              }
            />
          </div>
        )}
      </Card>

      <WarrantyDetailsModal
        visible={warrantyModalVisible}
        onClose={() => setWarrantyModalVisible(false)}
      />
    </div>
  );
};

// Warranty Details Modal Component
const WarrantyDetailsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const { selectedWarranty } = useSelector((state: RootState) => state.warranty);

  if (!selectedWarranty) return null;

  return (
    <Modal
      title="Warranty Details"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={600}
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <strong>Product:</strong>
          <div>{selectedWarranty?.product?.name}</div>
        </Col>
        <Col span={12}>
          <strong>Serial Number:</strong>
          <div>{selectedWarranty.serial_number}</div>
        </Col>
        <Col span={12}>
          <strong>Purchase Date:</strong>
          <div>{dayjs(selectedWarranty.purchase_date).format('MMM DD, YYYY')}</div>
        </Col>
        <Col span={12}>
          <strong>Expiry Date:</strong>
          <div>{dayjs(selectedWarranty.expiry_date).format('MMM DD, YYYY')}</div>
        </Col>
        <Col span={12}>
          <strong>Registration Type:</strong>
          <div>
            <Tag color={selectedWarranty.registration_type === 'auto' ? 'blue' : 'purple'}>
              {selectedWarranty.registration_type === 'auto' ? 'Auto' : 'Manual'}
            </Tag>
          </div>
        </Col>
        <Col span={12}>
          <strong>Warranty Period:</strong>
          <div>{selectedWarranty?.product?.warranty_months} months</div>
        </Col>
        {selectedWarranty.invoice_url && (
          <Col span={24}>
            <strong>Invoice:</strong>
            <div>
              <a href={selectedWarranty.invoice_url} target="_blank" rel="noopener noreferrer">
                View Invoice
              </a>
            </div>
          </Col>
        )}
        {selectedWarranty?.claims && selectedWarranty?.claims?.length > 0 && (
          <Col span={24}>
            <strong>Claims History:</strong>
            <div>
              {selectedWarranty?.claims?.map((claim) => (
                <div key={claim.claim_id} style={{ marginTop: '8px' }}>
                  <Tag color={
                    claim.status === 'approved' ? 'green' :
                    claim.status === 'rejected' ? 'red' :
                    claim.status === 'resolved' ? 'blue' : 'orange'
                  }>
                    {claim.status}
                  </Tag>
                  <span style={{ marginLeft: '8px' }}>
                    {dayjs(claim.created_at).format('MMM DD, YYYY')}
                  </span>
                </div>
              ))}
            </div>
          </Col>
        )}
      </Row>
    </Modal>
  );
};

export default MyWarranties;
