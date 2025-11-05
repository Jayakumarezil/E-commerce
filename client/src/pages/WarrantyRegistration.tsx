import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Upload, Button, Select, message, Card, Row, Col, Typography } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { registerWarranty } from '../redux/slices/warrantySlice';
import { fetchUserOrdersStart } from '../redux/slices/orderSlice';
import { Order } from '../services/orderService';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface WarrantyRegistrationForm {
  product_id: string;
  purchase_date: string;
  serial_number: string;
  invoice_url?: string;
}

const WarrantyRegistration: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.warranty);
  const { orders } = useSelector((state: RootState) => state.order);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    // Fetch user orders to populate product selector
    const userId = localStorage.getItem('userId');
    if (userId) {
      dispatch(fetchUserOrdersStart({ userId, page: 1, limit: 100 }) as any);
    }
  }, [dispatch]);

  const handleOrderChange = (orderId: string) => {
    const order = orders.find(o => o.order_id === orderId);
    setSelectedOrder(order || null);
  };

  const handleFileChange = (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1); // Only keep the last uploaded file
    setFileList(newFileList);
  };

  const handleSubmit = async (values: WarrantyRegistrationForm) => {
    try {
      let invoiceUrl = '';
      
      // Handle file upload if present
      if (fileList.length > 0 && fileList[0].response) {
        invoiceUrl = fileList[0].response.url;
      }

      const warrantyData = {
        ...values,
        invoice_url: invoiceUrl,
      };

      await dispatch(registerWarranty(warrantyData) as any);
      message.success('Warranty registered successfully!');
      form.resetFields();
      setFileList([]);
      setSelectedOrder(null);
    } catch (error) {
      message.error('Failed to register warranty. Please try again.');
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    action: '/api/upload', // You'll need to implement this endpoint
    fileList,
    onChange: handleFileChange,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/') || file.type === 'application/pdf';
      if (!isImage) {
        message.error('You can only upload image or PDF files!');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File must be smaller than 10MB!');
        return false;
      }
      return true;
    },
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={2}>Warranty Registration</Title>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            purchase_date: dayjs(),
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Select Order"
                name="order_id"
                rules={[{ required: true, message: 'Please select an order' }]}
              >
                <Select
                  placeholder="Select an order to register warranty"
                  onChange={handleOrderChange}
                  showSearch
                  optionFilterProp="children"
                >
                  {orders.map((order) => (
                    <Option key={order.order_id} value={order.order_id}>
                      Order #{order.order_id.slice(-8)} - {dayjs(order.created_at).format('MMM DD, YYYY')}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {selectedOrder && (
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Product"
                  name="product_id"
                  rules={[{ required: true, message: 'Please select a product' }]}
                >
                  <Select placeholder="Select a product">
                    {selectedOrder.orderItems?.map((item) => (
                      <Option key={item.product.product_id} value={item.product.product_id}>
                        {item.product.name} - ${item.price_at_purchase}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Purchase Date"
                name="purchase_date"
                rules={[{ required: true, message: 'Please select purchase date' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Serial Number"
                name="serial_number"
                rules={[
                  { required: true, message: 'Please enter serial number' },
                  { min: 3, message: 'Serial number must be at least 3 characters' },
                ]}
              >
                <Input placeholder="Enter product serial number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Invoice Upload">
                <Upload.Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag file to this area to upload</p>
                  <p className="ant-upload-hint">
                    Support for single image or PDF file upload. Max file size: 10MB
                  </p>
                </Upload.Dragger>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  style={{ width: '100%' }}
                >
                  Register Warranty
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default WarrantyRegistration;
