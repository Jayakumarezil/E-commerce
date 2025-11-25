import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Row,
  Col,
  Divider,
  Space,
  Alert,
  Spin,
  Radio,
  Select,
  message,
  Modal,
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  QrcodeOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { formatPrice } from '../utils/helpers';
import { createOrder } from '../redux/slices/orderSlice';
import { clearCartStart, clearCartSuccess } from '../redux/slices/cartSlice';
import { openRazorpayPayment, openUPIPayment } from '../utils/razorpay';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentMethod: 'razorpay' | 'upi' | 'card';
  upiId?: string;
}

const Checkout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const showPaymentMethods = String(((import.meta as any).env?.VITE_SHOW_PAYMENT_METHODS ?? 'false')).toLowerCase() === 'true';
  const forceQr = String(((import.meta as any).env?.VITE_USE_QR_PAYMENT ?? 'false')).toLowerCase() === 'true';
  const envQr = new URL('../assets/images/QR_code.png', import.meta.url).href;
  const fallbackQr = new URL('../assets/images/QR_code.png', import.meta.url).href;
  const qrImageSrc = envQr || fallbackQr;
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | 'card'>('razorpay');
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const { items, subtotal, tax, shipping, total, itemCount } = useSelector(
    (state: RootState) => state.cart
  );
  const { user } = useSelector((state: RootState) => state.auth);

  // Compute reliable totals from parts to avoid mismatches
  const subtotalNum = isNaN(parseFloat(subtotal)) ? 0 : parseFloat(subtotal);
  const shippingNum = isNaN(parseFloat(shipping)) ? 0 : parseFloat(shipping);
  const computedTotal = Number((subtotalNum + shippingNum).toFixed(2));

  // Determine if we should use QR flow (override toggle or hidden methods)
  const useQrFlow = forceQr || !showPaymentMethods;

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    if (user) {
      form.setFieldsValue({
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [items, user, form, navigate]);

  const handlePaymentMethodChange = (e: any) => {
    setPaymentMethod(e.target.value);
  };

  const onFinish = async (values: CheckoutFormData) => {
    if (items.length === 0) {
      message.error('Your cart is empty');
      return;
    }

    if (useQrFlow) {
      setPlacedOrderId(null);
      setQrModalVisible(true);
      message.info('Scan the QR to complete payment.');
      return;
    }

    setLoading(true);
    try {
      const shippingAddress = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        country: values.country,
      };

      const orderData = {
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: item.product.price,
        })),
        shipping_address: shippingAddress,
        payment_method: values.paymentMethod,
        total_price: computedTotal,
        upi_id: values.upiId,
      };

      const result = await dispatch(createOrder(orderData) as any);
      
      if (!result.payload || result.payload.error) {
        message.error(result.payload?.error || 'Failed to create order');
        setLoading(false);
        return;
      }

      const createdOrder = result.payload?.data?.order || result.payload?.order || result.payload;
      const orderId: string | undefined = createdOrder?.order_id;

      if (!orderId) {
        message.error('Order ID missing from response');
        setLoading(false);
        return;
      }

      dispatch(clearCartSuccess());
      
      const userDetails = {
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        phone: values.phone,
      };

      if (values.paymentMethod === 'razorpay') {
        openRazorpayPayment(
          orderId,
          computedTotal,
          userDetails,
          () => {
            message.success('Payment successful!');
            sessionStorage.setItem('lastOrderId', orderId);
            navigate('/order-confirmation', { state: { orderId }, replace: true });
          },
          (error) => {
            message.error(error.message || 'Payment failed');
          }
        );
      } else if (values.paymentMethod === 'upi') {
        openUPIPayment(
          orderId,
          computedTotal,
          () => {
            message.success('Payment successful!');
            navigate('/order-confirmation', { state: { orderId } });
          },
          (error) => {
            message.error(error.message || 'Payment failed');
          }
        );
      } else {
        message.success('Order placed successfully!');
        navigate('/order-confirmation', { state: { orderId } });
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Title level={2} className="text-center mb-8">
        <CreditCardOutlined className="mr-2" />
        Checkout
      </Title>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card title="Shipping Information" className="mb-6">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              size="large"
              className="space-y-4"
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[
                      { required: true, message: 'Please enter your first name!' },
                      { min: 2, message: 'First name must be at least 2 characters!' },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="First name"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[
                      { required: true, message: 'Please enter your last name!' },
                      { min: 2, message: 'Last name must be at least 2 characters!' },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="Last name"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                      { required: true, message: 'Please enter your email!' },
                      { type: 'email', message: 'Please enter a valid email!' },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="Email address"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[
                      { required: true, message: 'Please enter your phone number!' },
                      { 
                        pattern: /^[\+]?[1-9][\d]{0,15}$/,
                        message: 'Please enter a valid phone number!'
                      },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined className="text-gray-400" />}
                      placeholder="Phone number"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="address"
                label="Street Address"
                rules={[
                  { required: true, message: 'Please enter your address!' },
                  { min: 10, message: 'Please enter a complete address!' },
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="Enter your complete street address"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="city"
                    label="City"
                    rules={[
                      { required: true, message: 'Please enter your city!' },
                    ]}
                  >
                    <Input placeholder="City" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="state"
                    label="State"
                    rules={[
                      { required: true, message: 'Please enter your state!' },
                    ]}
                  >
                    <Input placeholder="State" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="zipCode"
                    label="ZIP Code"
                    rules={[
                      { required: true, message: 'Please enter your ZIP code!' },
                      { 
                        pattern: /^[0-9]{6}$/,
                        message: 'Please enter a valid 6-digit ZIP code!'
                      },
                    ]}
                  >
                    <Input placeholder="ZIP Code" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="country"
                label="Country"
                rules={[
                  { required: true, message: 'Please select your country!' },
                ]}
                initialValue="India"
              >
                <Select placeholder="Select country">
                  <Option value="India">India</Option>
                  <Option value="USA">United States</Option>
                  <Option value="UK">United Kingdom</Option>
                  <Option value="Canada">Canada</Option>
                  <Option value="Australia">Australia</Option>
                </Select>
              </Form.Item>

              <Divider />

              {/* Payment Method selection - hidden when useQrFlow */}
              {useQrFlow ? null : (
                <Form.Item
                  name="paymentMethod"
                  label="Payment Method"
                  rules={[
                    { required: true, message: 'Please select a payment method!' },
                  ]}
                  initialValue="razorpay"
                >
                  <Radio.Group onChange={handlePaymentMethodChange}>
                    <Space direction="vertical">
                      <Radio value="razorpay">
                        <Space>
                          <CreditCardOutlined />
                          <Text>Razorpay (Cards, UPI, Net Banking)</Text>
                        </Space>
                      </Radio>
                      <Radio value="upi">
                        <Space>
                          <QrcodeOutlined />
                          <Text>UPI Payment</Text>
                        </Space>
                      </Radio>
                      <Radio value="card">
                        <Space>
                          <BankOutlined />
                          <Text>Credit/Debit Card</Text>
                        </Space>
                      </Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item>
              )}

              {/* UPI ID field - only when not QR flow and method is UPI */}
              {(!useQrFlow && paymentMethod === 'upi') && (
                <Form.Item
                  name="upiId"
                  label="UPI ID"
                  rules={[
                    { required: true, message: 'Please enter your UPI ID!' },
                    { 
                      pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/,
                      message: 'Please enter a valid UPI ID!'
                    },
                  ]}
                >
                  <Input
                    prefix={<QrcodeOutlined className="text-gray-400" />}
                    placeholder="yourname@paytm"
                  />
                </Form.Item>
              )}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                  className="h-12"
                >
                  Place Order - {formatPrice(computedTotal)}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Order Summary" className="sticky top-4">
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                {itemCount} item(s) in your order
              </div>
              
              <Divider />
              
              {items.map((item) => (
                <div key={item.cart_id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <Text strong className="text-sm">{item.product.name}</Text>
                    <div className="text-xs text-gray-500">
                      Qty: {item.quantity} × {formatPrice(parseFloat(item.product.price))}
                    </div>
                  </div>
                  <Text strong className="text-sm">
                    {formatPrice(item.itemTotal || 0)}
                  </Text>
                </div>
              ))}
              
              <Divider />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text>Subtotal:</Text>
                  <Text>{formatPrice(subtotalNum)}</Text>
                </div>
                {/* GST hidden */}
                <div className="flex justify-between">
                  <Text>Shipping:</Text>
                  <Text>
                    {shippingNum === 0 ? 'Free' : formatPrice(shippingNum)}
                  </Text>
                </div>
                <Divider />
                <div className="flex justify-between text-lg font-semibold">
                  <Text strong>Total:</Text>
                  <Text strong className="text-blue-600">
                    {formatPrice(computedTotal)}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* QR Payment Modal */}
      <Modal
        title="Scan to Pay"
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        onOk={async () => {
          try {
            if (placedOrderId) {
              const { orderService } = await import('../services/orderService');
              await orderService.confirmPayment(placedOrderId);
              message.success('Payment status updated');
            }
          } catch (e: any) {
            message.warning(e?.message || 'Could not confirm payment now. Proceeding...');
          } finally {
            // Clear server cart then ensure client state is reset
            message.success('Once we receive the payment, your order will be updated and shipped.');
            try {
              await dispatch(clearCartStart() as any);
            } catch {}
            dispatch(clearCartSuccess());
            try { localStorage.removeItem('cart'); } catch {}
            if (placedOrderId) {
              navigate('/order-confirmation', { state: { orderId: placedOrderId } });
            } else {
              navigate('/orders');
            }
          }
        }}
        okText="I've Paid"
        cancelText="Close"
      >
        <div className="flex flex-col items-center">
          <img src={qrImageSrc} alt="QR Code" className="w-64 h-64 object-contain" />
          <Text className="mt-3 text-gray-600 text-center">Scan this QR code with any UPI app to pay the total amount. After payment, click "I've Paid" to continue.</Text>
        </div>
      </Modal>
    </div>
  );
};

export default Checkout;