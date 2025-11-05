import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Card, Row, Col, Typography, Select, message, Space } from 'antd';
import { UploadOutlined, InboxOutlined, ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RootState } from '../redux/store';
import { createClaim, fetchUserWarranties, Warranty } from '../redux/slices/warrantySlice';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ClaimSubmission: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, warranties } = useSelector((state: RootState) => state.warranty);
  const [fileList, setFileList] = useState<any[]>([]);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);

  const warrantyId = searchParams.get('warrantyId');
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Get userId from Redux state or localStorage (same way as MyWarranties page)
  const userId = user?.user_id || (() => {
    try {
      const userStr = localStorage.getItem('user');
      const userObj = userStr ? JSON.parse(userStr) : null;
      return userObj?.user_id;
    } catch {
      return null;
    }
  })();
  
  console.log('ClaimSubmission RENDER - warrantyId from URL:', warrantyId);
  console.log('ClaimSubmission RENDER - userId:', userId);
  console.log('ClaimSubmission RENDER - warranties:', warranties);
  console.log('ClaimSubmission RENDER - selectedWarranty:', selectedWarranty);

  useEffect(() => {
    if (userId) {
      // Fetch ALL warranties, not just active ones, to ensure the selected warranty is included
      dispatch(fetchUserWarranties({ userId, page: 1, limit: 100, status: 'all' }) as any);
    }
  }, [dispatch, userId]);

  useEffect(() => {
    console.log('ClaimSubmission - warrantyId:', warrantyId, 'warranties count:', warranties.length, 'loading:', loading);
    
    if (warrantyId && warranties.length > 0) {
      const warranty = warranties.find(w => w.warranty_id === warrantyId);
      console.log('Found warranty:', warranty);
      if (warranty) {
        setSelectedWarranty(warranty);
        // Use setTimeout to ensure form is ready
        setTimeout(() => {
          form.setFieldsValue({
            warranty_id: warranty.warranty_id,
          });
          console.log('Set form value to:', warranty.warranty_id);
        }, 100);
      }
    } else if (warrantyId && warranties.length === 0 && !loading) {
      console.log('Waiting for warranties to load...');
    }
  }, [warrantyId, warranties, form, loading]);

  const handleWarrantyChange = (warrantyId: string) => {
    const warranty = warranties.find(w => w.warranty_id === warrantyId);
    setSelectedWarranty(warranty || null);
  };

  const handleFileChange = (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-5); // Keep max 5 files
    setFileList(newFileList);
  };

  const handleSubmit = async (values: any) => {
    try {
      console.log('Form values received:', values);
      
      // Check if warranty_id is set
      if (!values.warranty_id) {
        message.error('Please select a product/warranty');
        return;
      }
      
      // Check if issue_description is set
      if (!values.issue_description || values.issue_description.trim().length < 10) {
        message.error('Please provide a detailed issue description (at least 10 characters)');
        return;
      }
      
      let imageUrl = '';
      
      // Handle file uploads if present
      if (fileList.length > 0) {
        const uploadedFiles = fileList.filter(file => file.response);
        if (uploadedFiles.length > 0) {
          imageUrl = uploadedFiles.map(file => file.response.url).join(',');
        }
      }

      const claimData = {
        warranty_id: values.warranty_id,
        issue_description: values.issue_description,
        image_url: imageUrl || undefined,
      };

      console.log('Submitting claim with data:', claimData);
      
      const result = await dispatch(createClaim(claimData) as any);
      
      console.log('Claim submission result:', result);
      
      if (result.error || !result.payload) {
        message.error(result.error?.message || 'Failed to submit claim');
        return;
      }
      
      message.success('Claim submitted successfully!');
      navigate('/warranties');
    } catch (error) {
      console.error('Claim submission error:', error);
      message.error('Failed to submit claim. Please try again.');
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    action: `${((import.meta as any).env.VITE_API_BASE_URL as string) || 'http://localhost:5000/api'}/upload/claim`,
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`,
    },
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

  // Show all warranties if coming from a specific warranty, otherwise filter active ones
  const activeWarranties = warrantyId 
    ? warranties  // Show all if a specific warranty is selected
    : warranties.filter(w => dayjs().isBefore(dayjs(w.expiry_date)));  // Filter active otherwise

  console.log('ClaimSubmission RENDER - activeWarranties count:', activeWarranties.length);
  console.log('ClaimSubmission RENDER - activeWarranties:', activeWarranties);
  console.log('ClaimSubmission RENDER - selectedWarranty?.warranty_id:', selectedWarranty?.warranty_id);

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Space style={{ marginBottom: '24px' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/warranties')}
          >
            Back to Warranties
          </Button>
        </Space>

        <Title level={2}>Submit Warranty Claim</Title>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Select Product"
                name="warranty_id"
                rules={[{ required: true, message: 'Please select a product' }]}
              >
                <Select
                  placeholder={warrantyId ? "Loading product..." : "Select a product with active warranty"}
                  onChange={handleWarrantyChange}
                  showSearch
                  optionFilterProp="children"
                  disabled={!!warrantyId}
                >
                  {activeWarranties.map((warranty) => (
                    <Option key={warranty.warranty_id} value={warranty.warranty_id}>
                      {warranty.product?.name} - Serial: {warranty.serial_number}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {selectedWarranty && (
            <Row gutter={16}>
              <Col span={24}>
                <Card size="small" style={{ marginBottom: '16px', backgroundColor: '#f6ffed' }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <strong>Product:</strong> {selectedWarranty.product?.name}
                    </Col>
                    <Col span={12}>
                      <strong>Serial Number:</strong> {selectedWarranty.serial_number}
                    </Col>
                    <Col span={12}>
                      <strong>Purchase Date:</strong> {dayjs(selectedWarranty.purchase_date).format('MMM DD, YYYY')}
                    </Col>
                    <Col span={12}>
                      <strong>Expiry Date:</strong> {dayjs(selectedWarranty.expiry_date).format('MMM DD, YYYY')}
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Issue Description"
                name="issue_description"
                rules={[
                  { required: true, message: 'Please describe the issue' },
                  { min: 10, message: 'Description must be at least 10 characters' },
                  { max: 1000, message: 'Description must not exceed 1000 characters' },
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="Please provide a detailed description of the issue you're experiencing with your product..."
                  showCount
                  maxLength={1000}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Supporting Documents (Optional)">
                <Upload.Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag files to this area to upload</p>
                  <p className="ant-upload-hint">
                    Support for multiple image or PDF file uploads. Max 5 files, 10MB each.
                    Upload photos or videos showing the issue for faster processing.
                  </p>
                </Upload.Dragger>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Card size="small" style={{ backgroundColor: '#fff7e6', marginBottom: '16px' }}>
                <Title level={5} style={{ color: '#fa8c16', margin: 0 }}>
                  <ExclamationCircleOutlined /> Important Information
                </Title>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                  <li>Please provide accurate and detailed information about the issue</li>
                  <li>Include photos or videos if possible to help us understand the problem</li>
                  <li>Claims are typically processed within 2-3 business days</li>
                  <li>You will receive email notifications about your claim status</li>
                  <li>Keep your product and original packaging until the claim is resolved</li>
                </ul>
              </Card>
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
                  Submit Claim
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default ClaimSubmission;
