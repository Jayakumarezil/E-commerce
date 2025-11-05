import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { login } from '../redux/slices/authSlice';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state: RootState) => state.auth);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await dispatch(login(values) as any);
      message.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      message.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Title level={2} className="text-gray-900">
            Sign in to your account
          </Title>
          <Text type="secondary">
            Welcome back! Please sign in to continue.
          </Text>
        </div>

        <Card className="shadow-lg">
          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            className="space-y-6"
          >
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="Enter your email"
                className="h-12"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter your password"
                className="h-12"
              />
            </Form.Item>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 border-none"
                size="large"
              >
                Sign In
              </Button>
            </Form.Item>

            <div className="text-center">
              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800">
                Forgot your password?
              </Link>
            </div>
          </Form>
        </Card>

        <div className="text-center">
          <Divider>
            <Text type="secondary">New to our platform?</Text>
          </Divider>
          <Space>
            <Text type="secondary">Don't have an account?</Text>
            <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Create an account
            </Link>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default Login;