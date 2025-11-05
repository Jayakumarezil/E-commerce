import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Row,
  Col,
  Divider,
  Tabs,
  Space,
  Alert,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  HomeOutlined,
  SaveOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { updateUserProfile, changePassword } from '../redux/slices/authSlice';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
}

interface AddressFormData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);
  const [profileForm] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });

      // Load saved address if exists
      const savedAddress = localStorage.getItem('userAddress');
      if (savedAddress) {
        const address = JSON.parse(savedAddress);
        addressForm.setFieldsValue(address);
      }
    }
  }, [user, profileForm, addressForm]);

  const onProfileSubmit = async (values: ProfileFormData) => {
    try {
      console.log('Profile submit with values:', values);
      const result = await dispatch(updateUserProfile(values) as any);
      console.log('Profile update result:', result);
      
      if (result.error) {
        message.error(result.error.message || 'Failed to update profile');
        return;
      }
      
      message.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      message.error('Failed to update profile');
    }
  };

  const onAddressSubmit = (values: AddressFormData) => {
    // Save address to localStorage
    localStorage.setItem('userAddress', JSON.stringify(values));
    message.success('Address saved successfully!');
  };

  const onPasswordSubmit = async (values: PasswordFormData) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('New passwords do not match!');
      return;
    }

    try {
      console.log('Password submit...');
      const result = await dispatch(changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }) as any);
      
      console.log('Password change result:', result);
      
      if (result.error) {
        message.error(result.error.message || 'Failed to change password');
        return;
      }
      
      message.success('Password changed successfully!');
      passwordForm.resetFields();
    } catch (error) {
      console.error('Password change error:', error);
      message.error('Failed to change password');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert message="Please login to view your profile" type="info" showIcon />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Title level={2} className="mb-6">
        <UserOutlined className="mr-2" />
        My Profile
      </Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" size="large">
        {/* Profile Information Tab */}
        <TabPane
          tab={
            <span>
              <UserOutlined />
              Profile Information
            </span>
          }
          key="profile"
        >
          <Card>
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={onProfileSubmit}
              className="max-w-2xl"
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Name"
                    name="name"
                    rules={[
                      { required: true, message: 'Please enter your name' },
                      { min: 2, message: 'Name must be at least 2 characters' },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Enter your name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Phone"
                    name="phone"
                    rules={[
                      { required: true, message: 'Please enter your phone' },
                      { pattern: /^[0-9]{10,15}$/, message: 'Invalid phone number' },
                    ]}
                  >
                    <Input placeholder="Enter your phone" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Invalid email format' },
                ]}
              >
                <Input disabled />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  Save Changes
                </Button>
              </Form.Item>

              {error && <Alert message={error} type="error" className="mt-4" />}
            </Form>
          </Card>
        </TabPane>

        {/* Address Management Tab */}
        <TabPane
          tab={
            <span>
              <HomeOutlined />
              Address Management
            </span>
          }
          key="address"
        >
          <Card>
            <Form
              form={addressForm}
              layout="vertical"
              onFinish={onAddressSubmit}
              className="max-w-2xl"
            >
              <Form.Item
                label="Street Address"
                name="street"
                rules={[{ required: true, message: 'Please enter street address' }]}
              >
                <Input placeholder="Enter street address" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="City"
                    name="city"
                    rules={[{ required: true, message: 'Please enter city' }]}
                  >
                    <Input placeholder="Enter city" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="State"
                    name="state"
                    rules={[{ required: true, message: 'Please enter state' }]}
                  >
                    <Input placeholder="Enter state" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Zip Code"
                    name="zipCode"
                    rules={[{ required: true, message: 'Please enter zip code' }]}
                  >
                    <Input placeholder="Enter zip code" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Country"
                    name="country"
                    rules={[{ required: true, message: 'Please enter country' }]}
                  >
                    <Input placeholder="Enter country" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Save Address
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        {/* Change Password Tab */}
        <TabPane
          tab={
            <span>
              <LockOutlined />
              Change Password
            </span>
          }
          key="password"
        >
          <Card>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={onPasswordSubmit}
              className="max-w-2xl"
            >
              <Form.Item
                label="Current Password"
                name="currentPassword"
                rules={[{ required: true, message: 'Please enter current password' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Enter current password" />
              </Form.Item>

              <Form.Item
                label="New Password"
                name="newPassword"
                rules={[
                  { required: true, message: 'Please enter new password' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
              >
                <Input.Password placeholder="Enter new password" />
              </Form.Item>

              <Form.Item
                label="Confirm New Password"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm new password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm new password" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<LockOutlined />} loading={loading}>
                  Change Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Profile;
