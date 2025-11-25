import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Modal, Card, Row, Col, Typography, Select, Pagination, Timeline, message } from 'antd';
import { EyeOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { fetchUserClaims, setSelectedClaim, Claim } from '../redux/slices/warrantySlice';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const MyClaims: React.FC = () => {
  const dispatch = useDispatch();
  const { claims, loading, pagination } = useSelector((state: RootState) => state.claim);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  // Get user from Redux state or localStorage
  const { user } = useSelector((state: RootState) => state.auth);
  
  const getUserId = () => {
    // First try from Redux state
    if (user?.user_id) return user.user_id;
    
    // Fallback to localStorage
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        return userObj?.user_id;
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
    }
    
    return null;
  };

  const userId = getUserId();

  useEffect(() => {
    if (userId) {
      console.log('Fetching claims for userId:', userId);
      dispatch(fetchUserClaims({ userId, page: currentPage, status: statusFilter }) as any);
    } else {
      console.log('No userId found, skipping claim fetch');
    }
  }, [dispatch, userId, currentPage, statusFilter]);

  const handleViewDetails = (claim: Claim) => {
    dispatch(setSelectedClaim(claim));
    setClaimModalVisible(true);
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      pending: { color: 'orange', icon: <ClockCircleOutlined /> },
      approved: { color: 'green', icon: <CheckCircleOutlined /> },
      rejected: { color: 'red', icon: <CloseCircleOutlined /> },
      resolved: { color: 'blue', icon: <CheckCircleOutlined /> },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Tag color={config.color} icon={config.icon}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: ['warranty', 'product', 'name'],
      key: 'product',
      render: (text: string, record: Claim) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Serial: {record.warranty?.serial_number}
          </div>
        </div>
      ),
    },
    {
      title: 'Issue Description',
      dataIndex: 'issue_description',
      key: 'issue_description',
      render: (text: string) => (
        <div style={{ maxWidth: '300px' }}>
          {text.length > 100 ? `${text.substring(0, 100)}...` : text}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Submitted Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Claim) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetails(record)}
        >
          View Details
        </Button>
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

  const renderTimelineView = () => {
    return (
      <Timeline>
        {claims.map((claim) => (
          <Timeline.Item
            key={claim.claim_id}
            color={
              claim.status === 'approved' ? 'green' :
              claim.status === 'rejected' ? 'red' :
              claim.status === 'resolved' ? 'blue' : 'orange'
            }
            dot={
              claim.status === 'approved' ? <CheckCircleOutlined /> :
              claim.status === 'rejected' ? <CloseCircleOutlined /> :
              claim.status === 'resolved' ? <CheckCircleOutlined /> : <ClockCircleOutlined />
            }
          >
            <Card size="small" style={{ marginBottom: '16px' }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={5} style={{ margin: 0 }}>
                    {claim.warranty?.product?.name}
                  </Title>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Serial: {claim.warranty?.serial_number}
                  </div>
                </Col>
                <Col>
                  {getStatusTag(claim.status)}
                </Col>
              </Row>
              <div style={{ marginTop: '8px' }}>
                <strong>Issue:</strong> {claim.issue_description}
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                Submitted: {dayjs(claim.created_at).format('MMM DD, YYYY HH:mm')}
              </div>
              {claim.admin_notes && (
                <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f6ffed', borderRadius: '4px' }}>
                  <strong>Admin Notes:</strong> {claim.admin_notes}
                </div>
              )}
              <div style={{ marginTop: '8px' }}>
                <Button
                  size="small"
                  onClick={() => handleViewDetails(claim)}
                >
                  View Full Details
                </Button>
              </div>
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
          <Col>
            <Title level={2}>My Claims</Title>
          </Col>
          <Col>
            <Space>
              <Select
                value={viewMode}
                onChange={setViewMode}
                style={{ width: 120 }}
              >
                <Option value="table">Table View</Option>
                <Option value="timeline">Timeline View</Option>
              </Select>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                style={{ width: 150 }}
              >
                <Option value="all">All Claims</Option>
                <Option value="pending">Pending</Option>
                <Option value="approved">Approved</Option>
                <Option value="rejected">Rejected</Option>
                <Option value="resolved">Resolved</Option>
              </Select>
            </Space>
          </Col>
        </Row>

        {viewMode === 'table' ? (
          <>
            <Table
              columns={columns}
              dataSource={claims}
              loading={loading}
              rowKey="claim_id"
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
                    `${range[0]}-${range[1]} of ${total} claims`
                  }
                />
              </div>
            )}
          </>
        ) : (
          renderTimelineView()
        )}
      </Card>

      <ClaimDetailsModal
        visible={claimModalVisible}
        onClose={() => setClaimModalVisible(false)}
      />
    </div>
  );
};

// Claim Details Modal Component
const ClaimDetailsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const { selectedClaim } = useSelector((state: RootState) => state.claim);

  if (!selectedClaim) return null;

  const getStatusTag = (status: string) => {
    const statusConfig = {
      pending: { color: 'orange', icon: <ClockCircleOutlined /> },
      approved: { color: 'green', icon: <CheckCircleOutlined /> },
      rejected: { color: 'red', icon: <CloseCircleOutlined /> },
      resolved: { color: 'blue', icon: <CheckCircleOutlined /> },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Tag color={config.color} icon={config.icon}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Tag>
    );
  };

  return (
    <Modal
      title="Claim Details"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={700}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card size="small" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <strong>Product:</strong>
                <div>{selectedClaim.warranty?.product?.name}</div>
              </Col>
              <Col span={12}>
                <strong>Serial Number:</strong>
                <div>{selectedClaim.warranty?.serial_number}</div>
              </Col>
              <Col span={12}>
                <strong>Status:</strong>
                <div>{getStatusTag(selectedClaim.status)}</div>
              </Col>
              <Col span={12}>
                <strong>Submitted:</strong>
                <div>{dayjs(selectedClaim.created_at).format('MMM DD, YYYY HH:mm')}</div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <strong>Issue Description:</strong>
          <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            {selectedClaim.issue_description}
          </div>
        </Col>

        {selectedClaim.image_url && (
          <Col span={24}>
            <strong>Supporting Documents:</strong>
            <div style={{ marginTop: '8px' }}>
              {selectedClaim.image_url.split(',').map((url, index) => {
                const apiUrl = url.startsWith('http') ? url : ((import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000') + url;
                return (
                  <div key={index} style={{ marginBottom: '8px' }}>
                    <img 
                      src={apiUrl} 
                      alt={`Supporting document ${index + 1}`}
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '200px',
                        cursor: 'pointer',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        marginRight: '8px'
                      }}
                      onClick={() => window.open(apiUrl, '_blank')}
                    />
                    <a href={apiUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '4px' }}>
                      Open full size
                    </a>
                  </div>
                );
              })}
            </div>
          </Col>
        )}

        {selectedClaim.admin_notes && (
          <Col span={24}>
            <strong>Admin Notes:</strong>
            <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f6ffed', borderRadius: '4px' }}>
              {selectedClaim.admin_notes}
            </div>
          </Col>
        )}

        <Col span={24}>
          <strong>Last Updated:</strong>
          <div>{dayjs(selectedClaim.updated_at).format('MMM DD, YYYY HH:mm')}</div>
        </Col>
      </Row>
    </Modal>
  );
};

export default MyClaims;
