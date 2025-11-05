import React, { useEffect } from 'react';
import { Spin, Alert } from 'antd';
import { Line } from '@ant-design/plots';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { fetchMonthlySales } from '../../redux/slices/adminSlice';

const SalesChart: React.FC = () => {
  const dispatch = useDispatch();
  const { salesData, loading } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    dispatch(fetchMonthlySales() as any);
  }, [dispatch]);

  if (loading.salesData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!salesData || salesData.length === 0) {
    return (
      <Alert
        message="No Data"
        description="No sales data available for the chart"
        type="warning"
        showIcon
      />
    );
  }

  const config = {
    data: salesData,
    xField: 'month',
    yField: 'sales',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    smooth: true,
    color: '#1890ff',
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: 'Sales',
          value: `$${datum.sales.toLocaleString()}`,
        };
      },
    },
  };

  return (
    <div className="h-64">
      <Line {...config} />
    </div>
  );
};

export default SalesChart;
