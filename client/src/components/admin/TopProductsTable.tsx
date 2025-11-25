import React, { useEffect } from 'react';
import { Table, Spin, Alert, Tag, Image } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { fetchTopSellingProducts } from '../../redux/slices/adminSlice';
import { formatPrice } from '../../utils/helpers';

const TopProductsTable: React.FC = () => {
  const dispatch = useDispatch();
  const { topProducts, loading } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    dispatch(fetchTopSellingProducts(10) as any);
  }, [dispatch]);

  if (loading.topProducts) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!topProducts || topProducts.length === 0) {
    return (
      <Alert
        message="No Data"
        description="No top selling products data available"
        type="warning"
        showIcon
      />
    );
  }

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div className="flex items-center space-x-3">
          <Image
            src={
              (() => {
                let imageUrl = record.image_url;
                if (imageUrl && !imageUrl.startsWith('http')) {
                  imageUrl = imageUrl.startsWith('/uploads') 
                    ? ((import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000') + imageUrl
                    : imageUrl;
                }
                // Skip placeholder images
                if (imageUrl && (imageUrl.includes('example.com') || imageUrl.includes('placeholder'))) {
                  return '/placeholder-product.jpg';
                }
                return imageUrl || '/placeholder-product.jpg';
              })()
            }
            alt={text}
            width={40}
            height={40}
            className="rounded"
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number | string) => {
        const numPrice = typeof price === 'number' ? price : parseFloat(String(price || 0));
        return <span className="font-medium">{formatPrice(numPrice)}</span>;
      },
    },
    {
      title: 'Quantity Sold',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      render: (quantity: number) => (
        <Tag color="blue">{quantity}</Tag>
      ),
    },
    {
      title: 'Revenue',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      render: (revenue: number | string) => {
        const numRevenue = typeof revenue === 'number' ? revenue : parseFloat(String(revenue || 0));
        return (
          <span className="font-semibold text-green-600">
            {formatPrice(numRevenue)}
          </span>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={topProducts}
      rowKey="id"
      pagination={false}
      size="small"
      scroll={{ y: 300 }}
    />
  );
};

export default TopProductsTable;
