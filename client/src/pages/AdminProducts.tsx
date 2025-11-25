import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import {
  fetchProductsStart,
  fetchCategoriesStart,
  createProductStart,
  updateProductStart,
  deleteProductStart,
  clearError,
} from '../redux/slices/productSlice';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  message,
  Popconfirm,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Image,
  Switch,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { formatPrice, getStockStatus, formatDateOnly, getImageUrl, getProductImageUrl } from '../utils/helpers';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Product {
  product_id: string;
  name: string;
  description: string;
  price: number;
  category: string | { name: string }; // Can be string or object
  stock: number;
  warranty_months: number;
  images_json?: string[]; // Optional for backward compatibility
  images?: Array<{
    image_id: string;
    image_url: string;
    alt_text?: string;
    display_order: number;
    is_primary: boolean;
  }>;
  is_active: boolean;
  created_at: string;
}

const AdminProducts: React.FC = () => {
  const dispatch = useDispatch();
  const { products, categories, isLoading, error } = useSelector(
    (state: RootState) => state.products
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    (dispatch as any)(fetchProductsStart({ limit: 100 } as any));
    dispatch(fetchCategoriesStart() as any);
  }, [dispatch]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    
    // Extract category name if it's an object
    const categoryName = typeof product.category === 'string' 
      ? product.category 
      : product.category?.name || '';
    
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0,
      category: categoryName,
      stock: typeof product.stock === 'number' ? product.stock : parseInt(String(product.stock)) || 0,
      warranty_months: typeof product.warranty_months === 'number' ? product.warranty_months : parseInt(String(product.warranty_months)) || 12,
      is_active: product.is_active,
    });
    
    // Set existing images
    // Support both old format (images_json) and new format (images array)
    let imageUrls: string[] = [];
    if (product.images && Array.isArray(product.images)) {
      // New format: images array
      imageUrls = product.images.map(img => img.image_url);
    } else if (product.images_json && Array.isArray(product.images_json)) {
      // Old format: images_json
      imageUrls = product.images_json;
    }
    
    const existingImages = imageUrls.map((url, index) => ({
      uid: `existing-${index}`,
      name: `image-${index + 1}`,
      status: 'done',
      url: url,
    }));
    setFileList(existingImages);
    setIsModalVisible(true);
  };

  const handleDeleteProduct = (productId: string) => {
    (dispatch as any)(deleteProductStart(productId as any));
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Extract image URLs from fileList
      const imageUrls: string[] = [];
      fileList.forEach(file => {
        if (file.status === 'done') {
          // Try different ways to get the URL
          const url = file.url || file.response?.url || file.response?.data?.url;
          if (url) {
            console.log('Adding image URL:', url);
            imageUrls.push(url);
          } else {
            console.warn('Could not extract URL from file:', file);
          }
        }
      });

      console.log('Extracted image URLs:', imageUrls);

      const productData = {
        ...values,
        images_json: imageUrls,
      };

      console.log('Submitting product data:', productData);

      if (editingProduct) {
        (dispatch as any)(updateProductStart({ id: editingProduct.product_id, data: productData } as any));
      } else {
        dispatch(createProductStart(productData) as any);
      }

      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setFileList([]);
  };

  const handleUploadChange = (info: any) => {
    console.log('Upload info:', info);
    let newFileList = [...info.fileList];

    // Limit to 5 images
    newFileList = newFileList.slice(-5);

    // Update file status and extract URL
    newFileList = newFileList.map(file => {
      console.log('Processing file:', file.status, file);
      if (file.status === 'done' && file.response) {
        console.log('Upload response:', file.response);
        // Extract URL from response (structure: { success: true, message: "", url: "/uploads/..." })
        const url = file.response.url || file.response.data?.url;
        if (url) {
          console.log('Extracted URL:', url);
          file.url = url;
        }
      }
      return file;
    });

    setFileList(newFileList);
  };

  const uploadProps = {
    name: 'file',
    action: `${((import.meta as any).env.VITE_API_BASE_URL as string) || 'http://localhost:5000/api'}/upload`,
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    onChange: handleUploadChange,
    multiple: true,
    accept: 'image/*',
    beforeUpload: (file: any) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
      }
      return isImage && isLt2M;
    },
  };


  const columns = [
    {
      title: 'Image',
      dataIndex: 'images',
      key: 'images',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: Product) => {
        const imageUrl = getProductImageUrl(record);
        
        return (
          <div className="w-12 h-12">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Product"
                className="w-full h-full object-cover rounded"
                preview={false}
                onError={(e) => {
                  console.error('Failed to load image:', imageUrl);
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-gray-200 rounded flex items-center justify-center"><span class="text-xs text-gray-500">No Image</span></div>';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs text-gray-500">No Image</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      align: 'center' as const,
      render: (text: string) => (
        <div className="max-w-xs">
          <div className="font-medium truncate">{text}</div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      align: 'center' as const,
      render: (category: string | { name: string }) => {
        // Handle both string and object formats
        const categoryName = typeof category === 'string' ? category : category?.name || '';
        return <Tag color="blue">{categoryName}</Tag>;
      },
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      align: 'center' as const,
      render: (price: number) => (
        <span className="font-medium text-green-600">{formatPrice(price)}</span>
      ),
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      align: 'center' as const,
      render: (stock: number) => {
        const status = getStockStatus(stock);
        return <Tag color={status.color}>{stock} ({status.text})</Tag>;
      },
    },
    {
      title: 'Warranty',
      dataIndex: 'warranty_months',
      key: 'warranty',
      align: 'center' as const,
      render: (months: number) => `${months} months`,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'status',
      align: 'center' as const,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center' as const,
      render: (date: string) => formatDateOnly(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: Product) => (
        <Space size="small">
          <Tooltip title="View Product">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => {
                if (record.product_id) {
                  window.open(`/products/${record.product_id}`, '_blank');
                }
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditProduct(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => handleDeleteProduct(record.product_id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    message.error(error);
    dispatch(clearError());
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Product Management</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddProduct}
            size="large"
          >
            Add Product
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={products}
          rowKey="product_id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 1000 }}
        />

        <Modal
          title={editingProduct ? 'Edit Product' : 'Add Product'}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          width={800}
          okText={editingProduct ? 'Update' : 'Create'}
          cancelText="Cancel"
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              warranty_months: 12,
              stock: 0,
              is_active: true,
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Product Name"
                  rules={[
                    { required: true, message: 'Please enter product name' },
                    { max: 200, message: 'Name must be less than 200 characters' },
                  ]}
                >
                  <Input placeholder="Enter product name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: 'Please select category' }]}
                >
                  <Select placeholder="Select category" allowClear>
                    {categories.map((category: any) => {
                      // Handle both string and object formats
                      const categoryValue = typeof category === 'string' ? category : category?.name || '';
                      return (
                        <Option key={categoryValue} value={categoryValue}>
                          {categoryValue}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="price"
                  label="Price"
                  rules={[
                    { required: true, message: 'Please enter price' },
                    { 
                      validator: (_, value) => {
                        const numValue = typeof value === 'number' ? value : parseFloat(String(value));
                        if (!numValue || isNaN(numValue) || numValue <= 0) {
                          return Promise.reject(new Error('Price must be greater than 0'));
                        }
                        return Promise.resolve();
                      }
                    },
                  ]}
                  getValueFromEvent={(value) => {
                    // Ensure value is always a number
                    if (value === null || value === undefined) return value;
                    return typeof value === 'number' ? value : parseFloat(String(value));
                  }}
                >
                  <InputNumber
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    precision={2}
                    className="w-full"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="stock"
                  label="Stock Quantity"
                  rules={[
                    { required: true, message: 'Please enter stock quantity' },
                    { type: 'number', min: 0, message: 'Stock must be non-negative' },
                  ]}
                >
                  <InputNumber
                    placeholder="0"
                    min={0}
                    className="w-full"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="warranty_months"
                  label="Warranty (Months)"
                  rules={[
                    { required: true, message: 'Please enter warranty period' },
                    { type: 'number', min: 0, max: 120, message: 'Warranty must be between 0-120 months' },
                  ]}
                >
                  <InputNumber
                    placeholder="12"
                    min={0}
                    max={120}
                    className="w-full"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: 'Please enter product description' },
                { min: 10, message: 'Description must be at least 10 characters' },
                { max: 2000, message: 'Description must be less than 2000 characters' },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Enter product description"
                showCount
                maxLength={2000}
              />
            </Form.Item>

            <Form.Item
              name="is_active"
              label="Status"
              valuePropName="checked"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>

            <Form.Item label="Product Images">
              <Upload {...uploadProps} fileList={fileList}>
                <Button icon={<UploadOutlined />}>Upload Images</Button>
              </Upload>
              <div className="text-sm text-gray-500 mt-2">
                Upload up to 5 images. Each image should be less than 2MB.
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default AdminProducts;
