import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Form, Typography, Space, Tag, Descriptions, message, Alert, Divider } from 'antd';
import { SearchOutlined, IdcardOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { searchMembership, clearSearchedMembership, clearError } from '../redux/slices/membershipSlice';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const MembershipSearch: React.FC = () => {
  const dispatch = useDispatch();
  const { searchedMembership, loading, error } = useSelector((state: RootState) => state.membership);
  const [form] = Form.useForm();
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    return () => {
      dispatch(clearSearchedMembership());
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSearch = async (values: any) => {
    try {
      const searchTerm = values.search?.trim();
      
      if (!searchTerm) {
        message.warning('Please enter IMEI number, mobile number, or membership ID');
        return;
      }

      await dispatch(searchMembership(searchTerm) as any);
    } catch (err) {
      // Error handled by Redux
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD MMM YYYY');
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <Title level={2} className="mb-2">
          <IdcardOutlined className="mr-2" />
          Membership Search
        </Title>
        <Text type="secondary">
          Enter IMEI number, mobile number, or membership ID to search
        </Text>
      </div>

      <Card className="mb-6">
        <Form form={form} onFinish={handleSearch} layout="vertical">
          <Form.Item
            name="search"
            label="Search"
            rules={[
              { required: true, message: 'Please enter IMEI number, mobile number, or membership ID' },
              { min: 3, message: 'Search term must be at least 3 characters' },
            ]}
          >
            <Input
              size="large"
              placeholder="Enter IMEI number, mobile number, or membership ID"
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              allowClear
              onPressEnter={() => form.submit()}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              size="large"
              loading={loading}
              block
            >
              Search Membership
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {error && (
        <Alert
          message="No Membership Found"
          description={
            <div>
              <p className="mb-4">{error}</p>
              <Space>
                <Button type="primary" onClick={() => window.location.href = '/contact'}>
                  Contact Admin
                </Button>
                <Button onClick={() => window.location.href = '/register'}>
                  Register Membership
                </Button>
              </Space>
            </div>
          }
          type="info"
          showIcon
          className="mb-6"
        />
      )}

      {searchedMembership && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <Title level={4} className="mb-0">
              Membership Details
            </Title>
            <Tag color={searchedMembership.status === 'Active' ? 'green' : 'red'} className="text-base px-3 py-1">
              {searchedMembership.status === 'Active' ? '🟢 Active' : '🔴 Expired'}
            </Tag>
          </div>

          <Descriptions bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Full Name">
              <Text strong>{searchedMembership.full_name}</Text>
            </Descriptions.Item>
            {searchedMembership.dob && (
              <Descriptions.Item label="Date of Birth">
                {formatDate(searchedMembership.dob)}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Unique Membership ID">
              <Text copyable strong>{searchedMembership.unique_membership_id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Membership Start Date">
              {formatDate(searchedMembership.membership_start_date)}
            </Descriptions.Item>
            <Descriptions.Item label="Expiry Date">
              <Text strong={searchedMembership.status === 'Expired'}>
                {formatDate(searchedMembership.expiry_date)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Payment Mode">
              <Tag color={searchedMembership.payment_mode === 'Cash' ? 'blue' : 'green'}>
                {searchedMembership.payment_mode}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Amount Paid">
              <Text strong className="text-green-600">
                {formatCurrency(searchedMembership.amount)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Phone Brand & Model">
              {searchedMembership.phone_brand_model}
            </Descriptions.Item>
            <Descriptions.Item label="IMEI Number">
              <Text copyable code>{searchedMembership.imei_number}</Text>
            </Descriptions.Item>
          </Descriptions>

          {searchedMembership.status === 'Expired' && (
            <>
              <Divider />
              <Alert
                message="Membership Expired"
                description="This membership has expired. Please contact admin for renewal."
                type="warning"
                showIcon
                // action={
                //   <Button size="small" type="primary" onClick={() => window.location.href = '/contact'}>
                //     Contact Admin
                //   </Button>
                // }
              />
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default MembershipSearch;

