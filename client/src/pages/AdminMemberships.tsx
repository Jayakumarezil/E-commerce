import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import {
  fetchAllMemberships,
  createMembership,
  updateMembership,
  deleteMembership,
  exportMemberships,
  clearError,
} from '../redux/slices/membershipSlice';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Membership } from '../services/membershipService';

const { Title } = Typography;
const { Option } = Select;

const AdminMemberships: React.FC = () => {
  const dispatch = useDispatch();
  const { memberships, loading, error, pagination } = useSelector(
    (state: RootState) => state.membership
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    dispatch(fetchAllMemberships({
      page: currentPage,
      limit: pageSize,
      search: searchText || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    }) as any);
  }, [dispatch, currentPage, searchText, statusFilter]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleAddMembership = () => {
    setEditingMembership(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditMembership = (membership: Membership) => {
    setEditingMembership(membership);
    
    // Calculate expiry months from start date and expiry date
    const startDate = dayjs(membership.membership_start_date);
    const expiryDate = dayjs(membership.expiry_date);
    const expiryMonths = expiryDate.diff(startDate, 'month');
    
    form.setFieldsValue({
      full_name: membership.full_name,
      dob: membership.dob ? dayjs(membership.dob) : undefined,
      mobile_primary: membership.mobile_primary,
      membership_start_date: startDate,
      expiry_date: expiryDate,
      expiry_months: expiryMonths > 0 ? expiryMonths : undefined,
      payment_mode: membership.payment_mode,
      amount: membership.amount,
      phone_brand_model: membership.phone_brand_model,
      imei_number: membership.imei_number,
    });
    setIsModalVisible(true);
  };

  const handleDeleteMembership = async (id: number) => {
    try {
      await dispatch(deleteMembership(id) as any);
      message.success('Membership deleted successfully');
      dispatch(fetchAllMemberships({
        page: currentPage,
        limit: pageSize,
        search: searchText || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }) as any);
    } catch (err) {
      message.error('Failed to delete membership');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Calculate expiry_date from expiry_months if provided
      const startDate = values.membership_start_date ? dayjs(values.membership_start_date) : dayjs();
      let expiryDate: string;
      
      if (values.expiry_months) {
        // Use expiry_months to calculate expiry date
        expiryDate = startDate.add(values.expiry_months, 'month').format('YYYY-MM-DD');
      } else if (values.expiry_date) {
        // Use manually set expiry_date if available
        expiryDate = dayjs(values.expiry_date).format('YYYY-MM-DD');
      } else {
        // Default to 12 months from start date
        expiryDate = startDate.add(12, 'month').format('YYYY-MM-DD');
      }
      
      // Set default values for optional fields
      const membershipData: any = {
        full_name: values.full_name,
        mobile_primary: values.mobile_primary,
        imei_number: values.imei_number,
        phone_brand_model: values.phone_brand_model || '',
        membership_start_date: startDate.format('YYYY-MM-DD'),
        expiry_date: expiryDate,
        payment_mode: values.payment_mode || 'Cash',
        amount: values.amount || 0,
      };
      
      // Only include dob if it's provided
      if (values.dob) {
        membershipData.dob = values.dob.format('YYYY-MM-DD');
      }

      if (editingMembership) {
        await dispatch(updateMembership({
          id: editingMembership.id,
          membershipData,
        }) as any);
        message.success('Membership updated successfully');
      } else {
        await dispatch(createMembership(membershipData) as any);
        message.success('Membership created successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      dispatch(fetchAllMemberships({
        page: currentPage,
        limit: pageSize,
        search: searchText || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }) as any);
    } catch (err: any) {
      if (err.errorFields) {
        // Form validation errors
        return;
      }
      message.error(err.message || 'Failed to save membership');
    }
  };

  const handleExport = async () => {
    try {
      const result = await dispatch(exportMemberships() as any);
      if (result.type === 'membership/exportMemberships/fulfilled') {
        const blob = result.payload;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `memberships_${dayjs().format('YYYY-MM-DD')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        message.success('Memberships exported successfully');
      } else {
        throw new Error('Export failed');
      }
    } catch (err) {
      message.error('Failed to export memberships');
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD MMM YYYY');
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      fixed: 'left' as const,
      responsive: ['md'] as any,
      align: 'center' as const,
    },
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
      width: 150,
      fixed: 'left' as const,
      sorter: (a: Membership, b: Membership) => a.full_name.localeCompare(b.full_name),
      align: 'center' as const,
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile_primary',
      key: 'mobile_primary',
      width: 120,
      responsive: ['sm'] as any,
      align: 'center' as const,
    },
    {
      title: 'Membership ID',
      dataIndex: 'unique_membership_id',
      key: 'unique_membership_id',
      width: 120,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
      responsive: ['md'] as any,
      align: 'center' as const,
    },
    {
      title: 'IMEI',
      dataIndex: 'imei_number',
      key: 'imei_number',
      width: 130,
      render: (text: string) => (
        <Typography.Text code style={{ fontSize: '11px' }} ellipsis={{ tooltip: text }}>
          {text}
        </Typography.Text>
      ),
      responsive: ['lg'] as any,
      align: 'center' as const,
    },
    {
      title: 'Phone Model',
      dataIndex: 'phone_brand_model',
      key: 'phone_brand_model',
      width: 150,
      ellipsis: { showTitle: true },
      responsive: ['lg'] as any,
      align: 'center' as const,
    },
    {
      title: 'Start Date',
      dataIndex: 'membership_start_date',
      key: 'membership_start_date',
      width: 120,
      render: (text: string) => formatDate(text),
      sorter: (a: Membership, b: Membership) => 
        dayjs(a.membership_start_date).unix() - dayjs(b.membership_start_date).unix(),
      responsive: ['md'] as any,
      align: 'center' as const,
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      width: 120,
      render: (text: string) => formatDate(text),
      sorter: (a: Membership, b: Membership) => 
        dayjs(a.expiry_date).unix() - dayjs(b.expiry_date).unix(),
      responsive: ['sm'] as any,
      align: 'center' as const,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status === 'Active' ? '🟢 Active' : '🔴 Expired'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Expired', value: 'expired' },
      ],
      align: 'center' as const,
    },
    {
      title: 'Payment',
      dataIndex: 'payment_mode',
      key: 'payment_mode',
      width: 100,
      render: (mode: string) => (
        <Tag color={mode === 'Cash' ? 'blue' : 'green'}>{mode}</Tag>
      ),
      responsive: ['md'] as any,
      align: 'center' as const,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: Membership, b: Membership) => a.amount - b.amount,
      responsive: ['sm'] as any,
      align: 'center' as const,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 100,
      align: 'center' as const,
      render: (_: any, record: Membership) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditMembership(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this membership?"
            onConfirm={() => handleDeleteMembership(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="link" danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Row justify="space-between" align="middle" className="mb-6">
        <Col>
          <Title level={2} className="mb-0">
            Manage Memberships
          </Title>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExport}
              disabled={loading}
            >
              Export CSV
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddMembership}
            >
              Add Membership
            </Button>
          </Space>
        </Col>
      </Row>

      <Card className="overflow-x-auto">
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={10}>
            <Input
              placeholder="Search by name, mobile, or IMEI"
              prefix={<SearchOutlined />}
              allowClear
              onPressEnter={(e) => handleSearch(e.currentTarget.value)}
              onChange={(e) => !e.target.value && handleSearch('')}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="expired">Expired</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={memberships}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: pagination?.totalItems || 0,
            showSizeChanger: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} memberships`,
            onChange: (page) => setCurrentPage(page),
            responsive: true,
          }}
          scroll={{ x: 'max-content', y: 'calc(100vh - 400px)' }}
          size="small"
        />
      </Card>

      <Modal
        title={editingMembership ? 'Edit Membership' : 'Add New Membership'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={700}
        okText="Save"
        cancelText="Cancel"
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            payment_mode: 'Cash',
            amount: 0,
            membership_start_date: dayjs(),
            expiry_months: 12,
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="full_name"
                label="Full Name"
                rules={[
                  { required: true, message: 'Please enter full name' },
                  { min: 2, message: 'Name must be at least 2 characters' },
                ]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="dob"
                label="Date of Birth (Optional)"
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="mobile_primary"
                label="Mobile Number (Primary)"
                rules={[
                  { required: true, message: 'Please enter mobile number' },
                  { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit mobile number' },
                ]}
              >
                <Input placeholder="Enter mobile number" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="imei_number"
                label="IMEI Number"
                rules={[
                  { required: true, message: 'Please enter IMEI number' },
                  { min: 10, message: 'IMEI must be at least 10 characters' },
                ]}
              >
                <Input placeholder="Enter IMEI number" disabled={!!editingMembership} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone_brand_model"
                label="Phone Brand & Model (Optional)"
              >
                <Input placeholder="e.g., Samsung Galaxy S21" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="unique_membership_id"
                label="Unique Membership ID"
                tooltip="Auto-generated if left empty"
              >
                <Input placeholder="Auto-generated" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="membership_start_date"
                label="Membership Start Date (Optional)"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="YYYY-MM-DD"
                  onChange={(date) => {
                    // Update expiry date when start date changes
                    const expiryMonths = form.getFieldValue('expiry_months');
                    if (date && expiryMonths) {
                      const expiryDate = dayjs(date).add(expiryMonths, 'month');
                      form.setFieldsValue({ expiry_date: expiryDate });
                    } else if (date && !expiryMonths) {
                      // Default to 12 months if no duration selected
                      const expiryDate = dayjs(date).add(12, 'month');
                      form.setFieldsValue({ expiry_date: expiryDate, expiry_months: 12 });
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="expiry_months"
                label="Membership Duration (Optional)"
              >
                <Select
                  placeholder="Select duration"
                  onChange={(months) => {
                    const startDate = form.getFieldValue('membership_start_date');
                    if (startDate) {
                      const expiryDate = dayjs(startDate).add(months, 'month');
                      form.setFieldsValue({ expiry_date: expiryDate });
                    } else {
                      // If no start date, use today
                      const expiryDate = dayjs().add(months, 'month');
                      form.setFieldsValue({ 
                        expiry_date: expiryDate,
                        membership_start_date: dayjs()
                      });
                    }
                  }}
                >
                  <Option value={6}>6 Months</Option>
                  <Option value={12}>12 Months</Option>
                  <Option value={18}>18 Months</Option>
                  <Option value={24}>24 Months</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="expiry_date" hidden>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="payment_mode"
                label="Payment Mode (Optional)"
              >
                <Select>
                  <Option value="Cash">Cash</Option>
                  <Option value="GPay">GPay</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="amount"
                label="Amount Paid (Optional)"
                rules={[
                  { type: 'number', min: 0, message: 'Amount must be positive' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter amount"
                  formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/₹\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminMemberships;

