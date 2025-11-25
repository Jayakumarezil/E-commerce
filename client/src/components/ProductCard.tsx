import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Typography, Image } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { formatPrice } from '../utils/helpers';
import { useDispatch } from 'react-redux';
import { addToCartStart } from '../redux/slices/cartSlice';

const { Meta } = Card;
const { Text, Paragraph } = Typography;

interface ProductCardProps {
  product: {
    product_id: string;
    name: string;
    description?: string;
    price: number;
    category: string | { name: string };
    stock: number;
    warranty_months: number;
    images_json?: string[];
    images?: Array<{
      image_id: string;
      image_url: string;
      alt_text?: string;
      display_order: number;
      is_primary: boolean;
    }>;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get stock status
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'red' };
    if (stock < 10) return { text: 'Low Stock', color: 'orange' };
    return { text: 'In Stock', color: 'green' };
  };

  const stockStatus = getStockStatus(product.stock);

  // Get image URL
  const getImageUrl = () => {
    let imageUrl = '';
    if (product.images_json && Array.isArray(product.images_json) && product.images_json.length > 0) {
      imageUrl = product.images_json[0];
    } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      imageUrl = typeof product.images[0] === 'string' 
        ? product.images[0] 
        : product.images[0]?.image_url || '';
    }

    // Convert relative URLs to absolute
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = imageUrl.startsWith('/uploads')
        ? ((import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000') + imageUrl
        : imageUrl;
    }

    // Filter out placeholder images
    const isPlaceholder = imageUrl.includes('example.com') || imageUrl.includes('placeholder');

    return { imageUrl, isPlaceholder };
  };

  const { imageUrl, isPlaceholder } = getImageUrl();

  // Get category name
  const getCategoryName = () => {
    return typeof product.category === 'string' 
      ? product.category 
      : product.category?.name || 'Uncategorized';
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Dispatch the start action which will trigger the saga
    dispatch(addToCartStart() as any);
    
    // Note: The actual add to cart logic should be handled by the saga
    // This is a placeholder - implement the full flow with your saga
    console.log('Add to cart:', product.product_id);
  };

  return (
    <Card
      hoverable
      className="card-hover h-full"
      cover={
        <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative group">
          {imageUrl && !isPlaceholder ? (
            <Image
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              preview={false}
              onError={(e) => {
                console.error('Image load error:', imageUrl);
                const target = e.currentTarget;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="text-gray-400 text-center p-4">
              <ShoppingCartOutlined style={{ fontSize: 48 }} />
              <div className="mt-2">No Image</div>
            </div>
          )}
          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/products/${product.product_id}`);
              }}
            >
              Quick View
            </Button>
          </div>
          {/* Stock Badge */}
          <div className="absolute top-2 right-2">
            <Tag color={stockStatus.color}>{stockStatus.text}</Tag>
          </div>
        </div>
      }
      actions={[
        <Button
          key="cart"
          type="primary"
          icon={<ShoppingCartOutlined />}
          block
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          Add to Cart
        </Button>,
      ]}
    >
      <Meta
        title={
          <div className="flex items-start justify-between">
            <Link to={`/products/${product.product_id}`} className="hover:text-blue-600 transition-colors">
              <Text strong className="line-clamp-2">{product.name}</Text>
            </Link>
          </div>
        }
        description={
          <div className="space-y-2">
            {product.description && (
              <Paragraph ellipsis={{ rows: 2 }} className="text-sm text-gray-600 mb-0">
                {product.description}
              </Paragraph>
            )}
            <div className="text-lg font-bold text-blue-600">
              {formatPrice(product.price)}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{getCategoryName()}</span>
              {product.warranty_months > 0 && (
                <Tag color="blue">{product.warranty_months} months warranty</Tag>
              )}
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default ProductCard;

