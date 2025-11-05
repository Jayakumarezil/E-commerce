import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import {
  Card,
  Typography,
  Button,
  Space,
  Row,
  Col,
  Divider,
  Alert,
  Spin,
  Timeline,
} from 'antd';
import {
  CheckCircleOutlined,
  ShoppingOutlined,
  HomeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { formatPrice, formatDate, formatDateTime } from '../utils/helpers';
import { fetchOrderById } from '../redux/slices/orderSlice';

const { Title, Text, Paragraph } = Typography;

const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(true);
  
  // Get orderId from location state or sessionStorage as fallback
  const orderIdFromState = (location.state as any)?.orderId;
  const orderIdFromStorage = sessionStorage.getItem('lastOrderId');
  const orderId = orderIdFromState || orderIdFromStorage;
  
  const { currentOrder } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    console.log('OrderConfirmation useEffect triggered');
    console.log('Location state:', location.state);
    console.log('OrderId from state:', orderIdFromState);
    console.log('OrderId from sessionStorage:', orderIdFromStorage);
    console.log('Final orderId:', orderId);
    
    if (orderId) {
      console.log('Fetching order with ID:', orderId);
      dispatch(fetchOrderById(orderId) as any).finally(() => {
        console.log('Order fetch complete');
        // Clear sessionStorage after successful load
        sessionStorage.removeItem('lastOrderId');
        setLoading(false);
      });
    } else {
      console.warn('No orderId found in location.state or sessionStorage');
      setLoading(false);
    }
  }, [orderId, dispatch, orderIdFromState, orderIdFromStorage]);
  
  console.log('OrderConfirmation render:', {
    orderId,
    hasSelectedOrder: !!currentOrder,
    selectedOrderId: currentOrder?.order_id
  });

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!orderId || !currentOrder) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <Alert
            message="Order Not Found"
            description="The order you're looking for doesn't exist or has been removed."
            type="error"
            showIcon
            action={
              <Button size="small" onClick={handleContinueShopping}>
                Continue Shopping
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const order = currentOrder;
  const shippingAddress = typeof order.shipping_address_json === 'string' 
    ? JSON.parse(order.shipping_address_json) 
    : order.shipping_address_json;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
        <Title level={2} className="mt-4 text-green-600">
          Order Confirmed!
        </Title>
        <Paragraph className="text-lg text-gray-600">
          Thank you for your purchase. Your order has been successfully placed.
        </Paragraph>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card title="Order Details" className="mb-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Text strong>Order ID:</Text>
                <Text code>{order.order_id}</Text>
              </div>
              <div className="flex justify-between">
                <Text strong>Order Date:</Text>
                <Text>{formatDate(order.created_at)}</Text>
              </div>
              <div className="flex justify-between">
                <Text strong>Payment Status:</Text>
                <Text className={order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}>
                  {order.payment_status?.toUpperCase()}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text strong>Order Status:</Text>
                <Text className={order.order_status === 'confirmed' ? 'text-green-600' : 'text-blue-600'}>
                  {order.order_status?.toUpperCase()}
                </Text>
              </div>
            </div>

            <Divider />

            <Title level={4}>Items Ordered</Title>
            <div className="space-y-3">
              {order.orderItems?.map((item: any) => (
                <div key={item.item_id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <Text strong>{item.product?.name}</Text>
                    <div className="text-sm text-gray-600">
                      Quantity: {item.quantity} × {formatPrice(parseFloat(item.price_at_purchase))}
                    </div>
                  </div>
                  <Text strong>{formatPrice(item.quantity * parseFloat(item.price_at_purchase))}</Text>
                </div>
              ))}
            </div>

            <Divider />

            <div className="space-y-2">
              {/* GST hidden: show subtotal, shipping, total */}
              {(() => {
                const itemsTotal = (order.orderItems || []).reduce((sum: number, it: any) => {
                  const price = parseFloat(String(it.price_at_purchase));
                  return sum + (isNaN(price) ? 0 : price) * (Number(it.quantity) || 0);
                }, 0);
                const totalNum = parseFloat(String(order.total_price)) || 0;
                const shippingCharge = Math.max(0, Number((totalNum - itemsTotal).toFixed(2)));
                return (
                  <>
                    <div className="flex justify-between">
                      <Text>Subtotal:</Text>
                      <Text>{formatPrice(itemsTotal)}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text>Shipping:</Text>
                      <Text>{shippingCharge === 0 ? 'Free' : formatPrice(shippingCharge)}</Text>
                    </div>
                    <Divider />
                    <div className="flex justify-between text-lg font-semibold">
                      <Text strong>Total:</Text>
                      <Text strong className="text-blue-600">
                        {formatPrice(totalNum)}
                      </Text>
                    </div>
                  </>
                );
              })()}
            </div>
          </Card>

          <Card title="Shipping Address">
            <div className="space-y-2">
              <div className="flex items-center">
                <UserOutlined className="mr-2 text-gray-500" />
                <Text strong>{shippingAddress?.firstName} {shippingAddress?.lastName}</Text>
              </div>
              <div className="flex items-center">
                <MailOutlined className="mr-2 text-gray-500" />
                <Text>{shippingAddress?.email}</Text>
              </div>
              <div className="flex items-center">
                <PhoneOutlined className="mr-2 text-gray-500" />
                <Text>{shippingAddress?.phone}</Text>
              </div>
              <div className="flex items-start">
                <EnvironmentOutlined className="mr-2 text-gray-500 mt-1" />
                <div>
                  <Text>{shippingAddress?.address}</Text>
                  <br />
                  <Text>{shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.zipCode}</Text>
                  <br />
                  <Text>{shippingAddress?.country}</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Order Timeline" className="mb-6">
            <Timeline>
              {/* Order Placed - Always completed */}
              <Timeline.Item
                dot={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                color="green"
              >
                <Text strong>Order Placed</Text>
                <br />
                <Text type="secondary">{formatDateTime(order.created_at)}</Text>
              </Timeline.Item>

              {/* Payment Confirmed - Completed if payment is paid */}
              <Timeline.Item
                dot={order.payment_status === 'paid' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CheckCircleOutlined />}
                color={order.payment_status === 'paid' ? 'green' : 'gray'}
              >
                <Text strong>Payment Confirmed</Text>
                <br />
                <Text type="secondary">
                  {order.payment_status === 'paid' 
                    ? formatDateTime(order.created_at) 
                    : 'Waiting for payment confirmation'}
                </Text>
              </Timeline.Item>

              {/* Processing - Completed for processing, confirmed, shipped, delivered */}
              <Timeline.Item
                dot={
                  ['processing', 'confirmed', 'shipped', 'delivered'].includes(order.order_status?.toLowerCase() || '')
                    ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    : <CheckCircleOutlined />
                }
                color={
                  ['processing', 'confirmed', 'shipped', 'delivered'].includes(order.order_status?.toLowerCase() || '')
                    ? 'green'
                    : ['pending'].includes(order.order_status?.toLowerCase() || '') ? 'blue' : 'gray'
                }
              >
                <Text strong>Processing</Text>
                <br />
                <Text type="secondary">
                  {['processing', 'confirmed'].includes(order.order_status?.toLowerCase() || '')
                    ? 'Your order is being prepared'
                    : order.order_status?.toLowerCase() === 'pending'
                    ? 'Waiting to process'
                    : 'Your order will be prepared'}
                </Text>
              </Timeline.Item>

              {/* Shipped - Completed for shipped or delivered */}
              <Timeline.Item
                dot={
                  ['shipped', 'delivered'].includes(order.order_status?.toLowerCase() || '')
                    ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    : <CheckCircleOutlined />
                }
                color={
                  ['shipped', 'delivered'].includes(order.order_status?.toLowerCase() || '')
                    ? 'green'
                    : order.order_status?.toLowerCase() === 'confirmed'
                    ? 'blue'
                    : 'gray'
                }
              >
                <Text strong>Shipped</Text>
                <br />
                <Text type="secondary">
                  {order.order_status?.toLowerCase() === 'shipped'
                    ? 'Your order has shipped'
                    : order.order_status?.toLowerCase() === 'delivered'
                    ? 'Delivered'
                    : 'Estimated delivery: 3-5 business days'}
                </Text>
              </Timeline.Item>

              {/* Delivered - Completed only for delivered status */}
              <Timeline.Item
                dot={
                  order.order_status?.toLowerCase() === 'delivered'
                    ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    : <CheckCircleOutlined />
                }
                color={order.order_status?.toLowerCase() === 'delivered' ? 'green' : 'gray'}
              >
                <Text strong>Delivered</Text>
                <br />
                <Text type="secondary">
                  {order.order_status?.toLowerCase() === 'delivered'
                    ? 'Order has been delivered'
                    : 'You will receive tracking information'}
                </Text>
              </Timeline.Item>
            </Timeline>
          </Card>

          <Card title="What's Next?">
            <div className="space-y-4">
              <Alert
                message="Email Confirmation"
                description="You will receive an order confirmation email shortly with all the details."
                type="info"
                showIcon
              />
              
              <Alert
                message="Tracking Information"
                description="Once your order ships, you'll receive tracking information via email."
                type="info"
                showIcon
              />

              <Alert
                message="Warranty Registration"
                description="Your products are automatically registered for warranty. Check your email for warranty details."
                type="success"
                showIcon
              />
            </div>

            <Divider />

            <Space direction="vertical" className="w-full">
              <Button
                type="primary"
                icon={<ShoppingOutlined />}
                onClick={handleContinueShopping}
                block
                size="large"
              >
                Continue Shopping
              </Button>
              <Button
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
                block
                size="large"
              >
                Back to Home
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderConfirmation;