import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import {
  fetchCartStart,
  updateCartItemOptimistic,
  removeFromCartStart,
  clearCartStart,
  clearError,
} from '../redux/slices/cartSlice';
import {
  Card,
  List,
  Button,
  InputNumber,
  Popconfirm,
  Typography,
  Space,
  Divider,
  Empty,
  Spin,
  Alert,
  Row,
  Col,
} from 'antd';
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { formatPrice, getStockStatus, getProductImageUrl } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Cart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, subtotal, tax, shipping, total, itemCount, loading, error } = useSelector(
    (state: RootState) => state.cart
  );

  useEffect(() => {
    dispatch(fetchCartStart());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleQuantityChange = (cartItemId: string, quantity: number) => {
    if (quantity > 0) {
      dispatch(updateCartItemOptimistic({ cartItemId, quantity }));
    }
  };

  const handleRemoveItem = (cartItemId: string) => {
    dispatch(removeFromCartStart(cartItemId as any));
  };

  const handleClearCart = () => {
    dispatch(clearCartStart());
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  // Compute reliable numbers from parts
  const subtotalNum = isNaN(parseFloat(subtotal)) ? 0 : parseFloat(subtotal);
  const shippingNum = isNaN(parseFloat(shipping)) ? 0 : parseFloat(shipping);
  const computedTotal = Number((subtotalNum + shippingNum).toFixed(2));

  const isEmpty = items.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={isEmpty ? 24 : 16}>
          <Card title={<div className="flex items-center space-x-2"><ShoppingCartOutlined /> <span>Your Cart</span></div>}>
            {error && (
              <Alert type="error" message={error} showIcon className="mb-4" />
            )}
            {isEmpty ? (
              <div className="flex flex-col items-center py-12">
                <Empty description="Your cart is empty" />
                <Button type="primary" className="mt-4" onClick={() => navigate('/products')}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <List
                itemLayout="vertical"
                dataSource={items}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Popconfirm
                        key="remove"
                        title="Remove item"
                        description="Are you sure you want to remove this item?"
                        onConfirm={() => handleRemoveItem(item.cart_id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button icon={<DeleteOutlined />} danger size="small">Remove</Button>
                      </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded">
                          {(() => {
                            const imageUrl = getProductImageUrl(item.product);
                            return imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.product.name}
                                className="w-full h-full object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                            <ShoppingCartOutlined className="text-2xl text-gray-400" />
                          );
                        })()}
                        </div>
                      }
                      title={
                        <div>
                          <Text strong>{item.product.name}</Text>
                          <div className="mt-1">
                            <Text type="secondary" className="text-sm">
                              {item.product.category}
                            </Text>
                          </div>
                        </div>
                      }
                      description={
                        <div className="space-y-2">
                          <div className="flex items-center space-x-4">
                            <Text className="text-lg font-semibold text-blue-600">
                              {formatPrice(parseFloat(item.product.price))}
                            </Text>
                            {(
                              <Text type="secondary">
                                {getStockStatus(item.product.stock).text}
                              </Text>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            <Text>Quantity:</Text>
                            <Space>
                              <Button
                                icon={<MinusOutlined />}
                                size="small"
                                onClick={() =>
                                  handleQuantityChange(item.cart_id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1 || loading}
                              />
                              <InputNumber
                                min={1}
                                max={item.product.stock}
                                value={item.quantity}
                                onChange={(value) =>
                                  handleQuantityChange(item.cart_id, value || 1)
                                }
                                disabled={loading}
                                className="w-16"
                              />
                              <Button
                                icon={<PlusOutlined />}
                                size="small"
                                onClick={() =>
                                  handleQuantityChange(item.cart_id, item.quantity + 1)
                                }
                                disabled={item.quantity >= item.product.stock || loading}
                              />
                            </Space>
                          </div>
                          <div className="text-right">
                            <Text strong className="text-lg">
                              Total: {formatPrice(item.itemTotal || 0)}
                            </Text>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {!isEmpty && (
          <Col xs={24} lg={8}>
            <Card title="Order Summary" className="sticky top-4">
              <div className="space-y-4">
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
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleCheckout}
                  className="mt-4"
                >
                  Proceed to Checkout
                </Button>
                <Button
                  block
                  onClick={() => navigate('/products')}
                  className="mt-2"
                >
                  Continue Shopping
                </Button>
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default Cart;