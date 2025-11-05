import React, { useEffect, useState } from 'react';
import { Alert, List, Typography, Tag, Spin } from 'antd';
import axios from 'axios';
import { formatDateOnly } from '../../utils/helpers';

const { Text } = Typography;

interface WarrantyAlert {
  warranty_id: string;
  product: {
    name: string;
  };
  user: {
    name: string;
    email: string;
  };
  expiry_date: string;
  daysLeft: number;
}

const WarrantyAlerts: React.FC = () => {
  const [warrantyAlerts, setWarrantyAlerts] = useState<WarrantyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWarrantyAlerts();
  }, []);

  const fetchWarrantyAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current date and calculate 30 days from now
      const now = new Date();
      const thirtyDaysFromNow = new Date(now);
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      // Get auth token
      const token = localStorage.getItem('token');
      
      const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await axios.get(
        `${apiBaseUrl}/warranties`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Warranties response:', response.data);

      if (response.data.success) {
        const warranties = response.data.data?.warranties || [];
        
        // Filter warranties expiring in the next 30 days
        const expiringWarranties = warranties
          .filter((w: any) => {
            const expiryDate = new Date(w.expiry_date);
            return expiryDate > now && expiryDate <= thirtyDaysFromNow;
          })
          .map((w: any) => {
            const expiryDate = new Date(w.expiry_date);
            const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return {
              ...w,
              daysLeft,
            };
          })
          .sort((a: any, b: any) => a.daysLeft - b.daysLeft)
          .slice(0, 5); // Show only top 5 most urgent

        setWarrantyAlerts(expiringWarranties);
      }
    } catch (err: any) {
      console.error('Error fetching warranty alerts:', err);
      setError(err.response?.data?.message || 'Failed to fetch warranty alerts');
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (daysLeft: number) => {
    if (daysLeft <= 7) return 'red';
    if (daysLeft <= 15) return 'orange';
    return 'blue';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spin size="small" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      {warrantyAlerts.length === 0 ? (
        <Alert
          message="No Alerts"
          description="No warranty expiry alerts at this time"
          type="success"
          showIcon
        />
      ) : (
        <List
          size="small"
          dataSource={warrantyAlerts}
          renderItem={(item) => (
            <List.Item>
              <div className="w-full">
                <div className="flex justify-between items-start mb-1">
                  <Text strong className="text-sm">
                    {item.product?.name || 'Unknown Product'}
                  </Text>
                  <Tag color={getAlertColor(item.daysLeft)}>
                    {item.daysLeft} days left
                  </Tag>
                </div>
                <div className="text-xs text-gray-500">
                  Customer: {item.user?.name || item.user?.email || 'Unknown'}
                </div>
                <div className="text-xs text-gray-500">
                  Expires: {formatDateOnly(item.expiry_date)}
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default WarrantyAlerts;
