import React, { useEffect, useState } from 'react';
import { Card, Table, Typography, Tag, Space, Button, message } from 'antd';
import { adminService } from '../services/adminService';

const { Title, Text } = Typography;

const AdminUsers: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<Array<{ user_id: string; name: string; email: string; role: string; created_at: string }>>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await adminService.getAllUsers();
        setUsers(res.data || []);
      } catch (e: any) {
        message.error(e?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const columns = [
    {
      title: 'UUID',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (text: string) => (
        <Space>
          <Text code className="font-mono text-xs">{text}</Text>
          <Button size="small" onClick={() => navigator.clipboard.writeText(text)}>Copy</Button>
        </Space>
      )
    },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={role === 'admin' ? 'geekblue' : 'green'}>{role.toUpperCase()}</Tag>
    },
    {
      title: 'Registered',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString()
    }
  ];

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">Registered Users</Title>
      <Card>
        <Table
          columns={columns as any}
          dataSource={users}
          rowKey="user_id"
          loading={loading}
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  );
};

export default AdminUsers;


