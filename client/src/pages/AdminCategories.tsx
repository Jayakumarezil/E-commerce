import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Space,
  Typography,
  Card,
  Tag,
  Switch,
  Tooltip,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { categoryService, Category } from '../services/categoryService';
import { formatDateOnly } from '../utils/helpers';

const { Title } = Typography;
const { TextArea } = Input;

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getCategories(false); // Get all categories including inactive
      setCategories(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description || '',
      is_active: category.is_active,
    });
    setIsModalVisible(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await categoryService.deleteCategory(categoryId);
      message.success('Category deleted successfully');
      fetchCategories();
    } catch (error: any) {
      message.error(error.message || 'Failed to delete category');
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      await categoryService.toggleCategoryStatus(category.category_id);
      message.success(`Category ${category.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchCategories();
    } catch (error: any) {
      message.error(error.message || 'Failed to toggle category status');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.category_id, values);
        message.success('Category updated successfully');
      } else {
        await categoryService.createCategory(values);
        message.success('Category created successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchCategories();
    } catch (error: any) {
      message.error(error.message || 'Failed to save category');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Category, b: Category) => a.name.localeCompare(b.name),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'} icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value: any, record: Category) => record.is_active === value,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDateOnly(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Category) => (
        <Space size="middle">
          <Tooltip title="Edit Category">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEditCategory(record)}
            >
              Edit
            </Button>
          </Tooltip>
          <Tooltip title={record.is_active ? 'Deactivate' : 'Activate'}>
            <Switch
              checked={record.is_active}
              onChange={() => handleToggleStatus(record)}
              checkedChildren="Active"
              unCheckedChildren="Inactive"
            />
          </Tooltip>
          <Popconfirm
            title="Delete Category"
            description={`Are you sure you want to delete "${record.name}"? This action cannot be undone.`}
            onConfirm={() => handleDeleteCategory(record.category_id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete Category">
              <Button danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              Category Management
            </Title>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              Manage product categories. Categories will appear in all category dropdowns throughout the application.
            </p>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={handleAddCategory}
            >
              Add Category
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={categories}
          rowKey="category_id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} categories`,
          }}
        />
      </Card>

      <Modal
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingCategory ? 'Update' : 'Create'}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            is_active: true,
          }}
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[
              { required: true, message: 'Please enter category name' },
              { min: 2, message: 'Category name must be at least 2 characters' },
              { max: 50, message: 'Category name must not exceed 50 characters' },
            ]}
          >
            <Input placeholder="e.g., Smartphones, Laptops, Accessories" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { max: 500, message: 'Description must not exceed 500 characters' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Optional description for this category"
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCategories;

