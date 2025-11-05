import React, { useEffect, useState } from 'react';
import { Card, Typography, Form, Input, Button, Space, Select, InputNumber, message, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { productService, Product } from '../services/productService';
import { adminService } from '../services/adminService';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminManualOrder: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<Array<{ product_id: string; quantity: number; warranty_months?: number }>>([{ product_id: '', quantity: 1, warranty_months: undefined }]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<Array<{ user_id: string; name: string; email: string }>>([]);
  const [userSearch, setUserSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const addItem = () => setItems(prev => [...prev, { product_id: '', quantity: 1 }]);
  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));
  const updateItem = (index: number, patch: Partial<{ product_id: string; quantity: number; warranty_months?: number }>) =>
    setItems(prev => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productService.getProducts({ limit: 100 });
        setProducts(data.products || []);
      } catch (e) {
        // ignore
      }
    };
    const loadUsers = async () => {
      try {
        const res = await adminService.getAllUsers();
        setUsers((res.data || []).map(u => ({ user_id: u.user_id, name: u.name, email: u.email })));
      } catch (e) {
        // ignore
      }
    };
    loadProducts();
    loadUsers();
  }, []);

  const handleSubmit = async (values: any) => {
    if (items.some(it => !it.product_id || !it.quantity)) {
      message.error('Please fill all product and quantity fields');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        user_id: values.user_id,
        items,
        shipping_address: {
          name: values.shipping_name,
          address: values.shipping_address,
          city: values.city,
          pincode: values.pincode,
          phone: values.phone,
        },
        payment_method: values.payment_method || 'manual',
        markPaid: values.markPaid ?? true,
      };
      const order = await orderService.createManualOrder(payload);
      message.success('Manual order created');
      navigate('/admin/orders', { state: { orderId: order.order_id } });
    } catch (e: any) {
      message.error(e?.message || 'Failed to create manual order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Title level={3} className="mb-4">Create Manual Order</Title>
      <Card>
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Title level={5}>Customer</Title>
          <Form.Item label="Select User" name="user_id" rules={[{ required: true, message: 'Please select a user' }]}>
            <Select
              showSearch
              allowClear
              placeholder="Search by name or email"
              optionFilterProp="children"
              onSearch={(val) => setUserSearch(val)}
              onClear={() => setUserSearch('')}
              className="w-full"
            >
              {(userSearch ? users.filter(u => (`${u.name} ${u.email} ${u.user_id}`).toLowerCase().includes(userSearch.toLowerCase())) : users)
                .map(u => (
                  <Option key={u.user_id} value={u.user_id}>{u.name} — {u.email}</Option>
              ))}
            </Select>
          </Form.Item>

          <Divider />
          <Title level={5}>Items</Title>
          <Space direction="vertical" className="w-full">
            {items.map((it, idx) => (
              <Space key={idx} className="w-full" align="baseline">
                <Select
                  showSearch
                  allowClear
                  placeholder="Select product"
                  className="w-80"
                  optionFilterProp="children"
                  onSearch={(val) => setProductSearch(val)}
                  onClear={() => setProductSearch('')}
                  value={it.product_id || undefined}
                  onChange={(val) => {
                    const prod = products.find(p => p.product_id === val);
                    updateItem(idx, { product_id: val, warranty_months: prod?.warranty_months });
                  }}
                >
                  {(productSearch ? products.filter(p => (`${p.name} ${p.category} ${p.product_id}`).toLowerCase().includes(productSearch.toLowerCase())) : products)
                    .map(p => (
                      <Option key={p.product_id} value={p.product_id}>{p.name} — ₹{p.price} — stock {p.stock}</Option>
                  ))}
                </Select>
                <InputNumber min={1} value={it.quantity} onChange={(v) => updateItem(idx, { quantity: Number(v) || 1 })} />
                <InputNumber placeholder="Warranty (months)" min={0} value={it.warranty_months as number | undefined} onChange={(v) => updateItem(idx, { warranty_months: (v as number) || 0 })} />
                <Button danger onClick={() => removeItem(idx)} disabled={items.length === 1}>Remove</Button>
              </Space>
            ))}
            <Button onClick={addItem}>Add Item</Button>
          </Space>

          <Divider />
          <Title level={5}>Shipping</Title>
          <Form.Item label="Name" name="shipping_name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Address" name="shipping_address" rules={[{ required: true }]}> 
            <Input.TextArea rows={2} />
          </Form.Item>
          <Space className="w-full">
            <Form.Item label="City" name="city" rules={[{ required: true }]}> 
              <Input className="w-48" />
            </Form.Item>
            <Form.Item label="Pincode" name="pincode" rules={[{ required: true }]}> 
              <Input className="w-40" />
            </Form.Item>
            <Form.Item label="Phone" name="phone"> 
              <Input className="w-56" />
            </Form.Item>
          </Space>

          <Divider />
          <Title level={5}>Payment</Title>
          <Space className="w-full">
            <Form.Item label="Payment Method" name="payment_method" initialValue="manual">
              <Select className="w-60">
                <Option value="manual">Manual</Option>
                <Option value="razorpay">Razorpay</Option>
                <Option value="upi">UPI</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Mark Paid" name="markPaid" initialValue={true}>
              <Select className="w-40">
                <Option value={true}>Yes</Option>
                <Option value={false}>No</Option>
              </Select>
            </Form.Item>
          </Space>

          <Button type="primary" htmlType="submit" loading={submitting}>Create Order</Button>
          <Button className="ml-2" onClick={() => navigate('/admin/orders')}>Cancel</Button>
        </Form>
      </Card>
    </div>
  );
};

export default AdminManualOrder;


