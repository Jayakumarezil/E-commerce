import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Modal, Card, Row, Col, Typography, Select, Pagination, Input, message, Form, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { fetchAllClaims, updateClaimStatus, setSelectedClaim, Claim } from '../redux/slices/warrantySlice';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AdminClaimsDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { claims, loading, pagination } = useSelector((state: RootState) => state.claim);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateForm] = Form.useForm();

  useEffect(() => {
    dispatch(fetchAllClaims({ page: currentPage, status: statusFilter }) as any);
  }, [dispatch, currentPage, statusFilter]);

  const handleViewDetails = (claim: Claim) => {
    dispatch(setSelectedClaim(claim));
    setClaimModalVisible(true);
  };

  const handleUpdateStatus = (claim: Claim) => {
    dispatch(setSelectedClaim(claim));
    updateForm.setFieldsValue({
      status: claim.status,
      admin_notes: claim.admin_notes || '',
    });
    setUpdateModalVisible(true);
  };

  const { selectedClaim } = useSelector((state: RootState) => state.claim);

  const handleStatusUpdate = async (values: any) => {
    try {
      if (selectedClaim) {
        console.log('Updating claim:', selectedClaim.claim_id, 'with data:', values);
        
        const result = await dispatch(updateClaimStatus({
          claimId: selectedClaim.claim_id,
          statusData: {
            status: values.status,
            admin_notes: values.admin_notes,
          },
        }) as any);
        
        console.log('Update result:', result);
        
        if (result.error) {
          message.error(result.error.message || 'Failed to update claim status');
          return;
        }
        
        message.success('Claim status updated successfully!');
        setUpdateModalVisible(false);
        updateForm.resetFields();
        // Refresh the claims list
        dispatch(fetchAllClaims({ page: currentPage, status: statusFilter }) as any);
      }
    } catch (error) {
      console.error('Failed to update claim status:', error);
      message.error('Failed to update claim status. Please try again.');
    }
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
      title: 'Claim ID',
      dataIndex: 'claim_id',
      key: 'claim_id',
      align: 'center' as const,
      render: (id: string) => (
        <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          {id.slice(-8)}
        </div>
      ),
    },
    {
      title: 'Customer',
      dataIndex: ['warranty', 'user', 'name'],
      key: 'customer',
      align: 'center' as const,
      render: (text: string, record: Claim) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.warranty?.user?.email}
          </div>
        </div>
      ),
    },
    {
      title: 'Product',
      dataIndex: ['warranty', 'product', 'name'],
      key: 'product',
      align: 'center' as const,
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
      align: 'center' as const,
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
      align: 'center' as const,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Submitted Date',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center' as const,
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: (a: Claim, b: Claim) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center' as const,
      render: (record: Claim) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Update Status">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleUpdateStatus(record)}
            />
          </Tooltip>
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

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      resolved: 0,
    };

    claims.forEach(claim => {
      counts[claim.status as keyof typeof counts]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
          <Col>
            <Title level={2}>Claims Management Dashboard</Title>
          </Col>
          <Col>
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
          </Col>
        </Row>

        {/* Status Summary Cards */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center', backgroundColor: '#fff7e6' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                {statusCounts.pending}
              </div>
              <div>Pending</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center', backgroundColor: '#f6ffed' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {statusCounts.approved}
              </div>
              <div>Approved</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center', backgroundColor: '#fff2f0' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
                {statusCounts.rejected}
              </div>
              <div>Rejected</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center', backgroundColor: '#f0f5ff' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {statusCounts.resolved}
              </div>
              <div>Resolved</div>
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={claims}
          loading={loading}
          rowKey="claim_id"
          pagination={false}
          scroll={{ x: 1000 }}
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
      </Card>

      <ClaimDetailsModal
        visible={claimModalVisible}
        onClose={() => setClaimModalVisible(false)}
      />

      <UpdateStatusModal
        visible={updateModalVisible}
        onClose={() => setUpdateModalVisible(false)}
        form={updateForm}
        onSubmit={handleStatusUpdate}
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
      width={800}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card size="small" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={8}>
                <strong>Customer:</strong>
                <div>{selectedClaim.warranty?.user?.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {selectedClaim.warranty?.user?.email}
                </div>
              </Col>
              <Col span={8}>
                <strong>Product:</strong>
                <div>{selectedClaim.warranty?.product?.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Serial: {selectedClaim.warranty?.serial_number}
                </div>
              </Col>
              <Col span={8}>
                <strong>Status:</strong>
                <div>{getStatusTag(selectedClaim.status)}</div>
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

        <Col span={12}>
          <strong>Submitted:</strong>
          <div>{dayjs(selectedClaim.created_at).format('MMM DD, YYYY HH:mm')}</div>
        </Col>
        <Col span={12}>
          <strong>Last Updated:</strong>
          <div>{dayjs(selectedClaim.updated_at).format('MMM DD, YYYY HH:mm')}</div>
        </Col>
      </Row>
    </Modal>
  );
};

// Update Status Modal Component
const UpdateStatusModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  form: any;
  onSubmit: (values: any) => void;
}> = ({ visible, onClose, form, onSubmit }) => {
  return (
    <Modal
      title="Update Claim Status"
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Update Status"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: 'Please select a status' }]}
        >
          <Select>
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
            <Option value="resolved">Resolved</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Admin Notes"
          name="admin_notes"
        >
          <TextArea
            rows={4}
            placeholder="Add notes about the claim status update..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdminClaimsDashboard;
