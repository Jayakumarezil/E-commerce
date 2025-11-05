import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState } from '../redux/store';
import {
  fetchProductByIdStart,
  fetchProductsStart,
  clearCurrentProduct,
  clearError,
} from '../redux/slices/productSlice';
import { addToCartStart } from '../redux/slices/cartSlice';
import { message } from 'antd';
import {
  Card,
  Row,
  Col,
  Button,
  InputNumber,
  Typography,
  Carousel,
  Tag,
  Alert,
  Spin,
  Divider,
  Space,
  Image,
} from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  ShareAltOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { formatPrice, getStockStatus, getWarrantyText } from '../utils/helpers';

const { Title, Text, Paragraph } = Typography;

const ProductDetail: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentProduct, products, isLoading, error } = useSelector(
    (state: RootState) => state.products
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'admin';

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id && id !== 'undefined') {
      dispatch(fetchProductByIdStart(id));
    } else if (!id) {
      // If no id parameter, redirect to products page
      navigate('/products');
    }
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id, navigate]);

  useEffect(() => {
    // Fetch related products when current product loads
    if (currentProduct) {
      dispatch(fetchProductsStart({
        category: currentProduct.category,
        limit: 4,
        page: 1,
      }));
    }
  }, [dispatch, currentProduct]);

  const handleAddToCart = () => {
    if (!user) {
      message.warning('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!currentProduct) return;

    dispatch(addToCartStart({
      productId: currentProduct.product_id,
      quantity,
    }));

    message.success(`${quantity} ${currentProduct.name} added to cart`);
  };


  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => dispatch(clearError())}>
              Dismiss
            </Button>
          }
        />
      </div>
    );
  }

  if (isLoading || !currentProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Spin size="large" />
          <div className="mt-4">
            <Text>Loading product details...</Text>
          </div>
        </div>
      </div>
    );
  }

  const stockStatus = {
    ...getStockStatus(currentProduct.stock),
    icon: currentProduct.stock === 0 ? <ExclamationCircleOutlined /> : 
          currentProduct.stock < 10 ? <ExclamationCircleOutlined /> : 
          <CheckCircleOutlined />
  };
  const relatedProducts = products.filter(p => p.product_id !== currentProduct.product_id);

  return (
    <div className="container mx-auto px-4 py-8">
      <Row gutter={[32, 32]}>
        {/* Product Images */}
        <Col xs={24} lg={12}>
          <Card>
            {(currentProduct.images_json && currentProduct.images_json.length > 0) || (currentProduct.images && currentProduct.images.length > 0) ? (
              <div>
                <Carousel
                  autoplay
                  dots={{ className: 'custom-dots' }}
                  beforeChange={(from, to) => setSelectedImageIndex(to)}
                >
                  {(currentProduct.images_json || currentProduct.images || []).map((image, index) => {
                    let imageUrl = typeof image === 'string' ? image : image.image_url;
                    // Convert to full URL if relative
                    if (imageUrl && !imageUrl.startsWith('http')) {
                      imageUrl = imageUrl.startsWith('/uploads') 
                        ? `http://localhost:5000${imageUrl}` 
                        : imageUrl;
                    }
                    // Skip placeholder/example URLs
                    const isPlaceholder = imageUrl.includes('example.com') || imageUrl.includes('placeholder');
                    if (isPlaceholder) {
                      return null;
                    }
                    return (
                      <div key={index} className="w-full h-[420px] flex items-center justify-center bg-white">
                        <Image
                          src={imageUrl}
                          alt={`${currentProduct.name} ${index + 1}`}
                          style={{ width: '100%', height: 400, objectFit: 'contain', background: '#fff' }}
                          preview={{ mask: 'Click to preview' }}
                          onError={(e) => {
                            if (!imageUrl.includes('example.com')) {
                              console.error('Image load error:', imageUrl);
                            }
                            e.currentTarget.src = '/placeholder-image.jpg';
                          }}
                        />
                      </div>
                    );
                  })}
                </Carousel>
                
                {/* Thumbnail Navigation */}
                {((currentProduct.images_json?.length || 0) + (currentProduct.images?.length || 0)) > 1 && (
                  <div className="flex space-x-2 mt-4">
                    {(currentProduct.images_json || currentProduct.images || []).map((image, index) => {
                      let imageUrl = typeof image === 'string' ? image : image.image_url;
                      // Convert to full URL if relative
                      if (imageUrl && !imageUrl.startsWith('http')) {
                        imageUrl = imageUrl.startsWith('/uploads') 
                          ? `http://localhost:5000${imageUrl}` 
                          : imageUrl;
                      }
                      // Skip placeholder/example URLs
                      const isPlaceholder = imageUrl.includes('example.com') || imageUrl.includes('placeholder');
                      if (isPlaceholder) {
                        return null;
                      }
                      return (
                        <div
                          key={index}
                          className={`w-16 h-16 cursor-pointer border-2 rounded bg-white ${
                            index === selectedImageIndex ? 'border-blue-500' : 'border-gray-200'
                          }`}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <Image
                            src={imageUrl}
                            alt={`Thumbnail ${index + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff', padding: 2 }}
                            onError={(e) => {
                              if (!imageUrl.includes('example.com')) {
                                console.error('Thumbnail load error:', imageUrl);
                              }
                              e.currentTarget.src = '/placeholder-image.jpg';
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-96 bg-gray-100 flex items-center justify-center">
                <Text type="secondary">No images available</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Product Information */}
        <Col xs={24} lg={12}>
          <div className="space-y-6">
            <div>
              <Title level={2}>{currentProduct.name}</Title>
              <div className="flex items-center space-x-4 mb-4">
                <Tag color={stockStatus.color} icon={stockStatus.icon}>
                  {stockStatus.text}
                </Tag>
                <Tag color="blue">{currentProduct.category}</Tag>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-4">
                {formatPrice(currentProduct.price)}
              </div>
            </div>

            <Divider />

            <div>
              <Title level={4}>Product Details</Title>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text strong>Warranty:</Text>
                  <Text>{getWarrantyText(currentProduct.warranty_months)}</Text>
                </div>
                <div className="flex justify-between">
                {isAdmin && (
                  <>
                    <Text strong>Stock Available:</Text>
                    <Text>{currentProduct.stock} units</Text>
                  </>
                )}
                </div>
                <div className="flex justify-between">
                  <Text strong>Category:</Text>
                  <Text>{currentProduct.category}</Text>
                </div>
              </div>
            </div>

            <Divider />

            <div>
              <Title level={4}>Description</Title>
              <Paragraph>{currentProduct.description}</Paragraph>
            </div>

            <Divider />

            {/* Add to Cart Section */}
            <div>
              <Title level={4}>Add to Cart</Title>
              <Space size="middle" className="w-full">
                <div className="flex items-center space-x-2">
                  <Text strong>Quantity:</Text>
                  <InputNumber
                    min={1}
                    max={currentProduct.stock}
                    value={quantity}
                    onChange={(value) => setQuantity(value || 1)}
                    disabled={currentProduct.stock === 0}
                  />
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  disabled={currentProduct.stock === 0}
                  className="flex-1"
                >
                  Add to Cart
                </Button>
              </Space>
            </div>

            <Divider />

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button icon={<HeartOutlined />} size="large">
                Add to Wishlist
              </Button>
              <Button icon={<ShareAltOutlined />} size="large">
                Share
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <Title level={3}>Related Products</Title>
          <Row gutter={[16, 16]}>
            {relatedProducts.map((product) => {
              const productStockStatus = getStockStatus(product.stock);
              return (
                <Col xs={24} sm={12} md={8} lg={6} key={product.product_id}>
                  <Card
                    hoverable
                    cover={
                      (() => {
                        let imageUrl = '';
                        if (product.images_json && Array.isArray(product.images_json) && product.images_json.length > 0) {
                          imageUrl = product.images_json[0];
                        } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                          imageUrl = typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.image_url || '';
                        }
                        
                        // Convert to full URL if relative
                        if (imageUrl && !imageUrl.startsWith('http')) {
                          imageUrl = imageUrl.startsWith('/uploads') 
                            ? `http://localhost:5000${imageUrl}` 
                            : imageUrl;
                        }
                        
                        // Skip placeholder images
                        const isPlaceholder = imageUrl.includes('example.com') || imageUrl.includes('placeholder');
                        
                        return imageUrl && !isPlaceholder ? (
                          <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                            <img
                              alt={product.name}
                              src={imageUrl}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Image load error:', imageUrl);
                                e.currentTarget.src = '/placeholder-product.jpg';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="h-48 bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        );
                      })()
                    }
                    actions={[
                      <Button
                        type="link"
                        onClick={() => {
                          if (product.product_id) {
                            navigate(`/products/${product.product_id}`);
                          }
                        }}
                        key="view"
                      >
                        View Details
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium line-clamp-2">
                            {product.name}
                          </span>
                          <Tag color={productStockStatus.color} className="ml-2">
                            {productStockStatus.text}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <div className="text-lg font-bold text-blue-600 mb-2">
                            {formatPrice(product.price)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {product.category}
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
