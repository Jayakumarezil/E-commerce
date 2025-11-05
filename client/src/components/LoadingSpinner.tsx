import React from 'react';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'large', 
  tip = 'Loading...',
  fullScreen = false,
  className = ''
}) => {
  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`} style={fullScreen ? { minHeight: '100vh' } : {}}>
      <Spin 
        indicator={<LoadingOutlined style={{ fontSize: size === 'large' ? 48 : size === 'default' ? 32 : 24, color: '#1890ff' }} spin />} 
        size={size}
      />
      {tip && (
        <Text type="secondary" className="mt-4">
          {tip}
        </Text>
      )}
    </div>
  );

  return spinner;
};

export default LoadingSpinner;

