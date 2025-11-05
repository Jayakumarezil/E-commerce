import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Typography, Divider, Space } from 'antd';
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const EnhancedFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact' },
  ];

  const customerService = [
    { path: '/orders', label: 'My Orders' },
    { path: '/warranties', label: 'Warranties' },
    { path: '/claims', label: 'Claims' },
    { path: '/support', label: 'Support' },
  ];

  const legal = [
    { path: '/privacy', label: 'Privacy Policy' },
    { path: '/terms', label: 'Terms of Service' },
    { path: '/shipping', label: 'Shipping Policy' },
    { path: '/returns', label: 'Return Policy' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <Row gutter={[32, 32]}>
          {/* Company Info */}
          <Col xs={24} sm={12} lg={6}>
            <Title level={4} className="text-white mb-4">
              Vellore Mobile Point
            </Title>
            <Text className="text-gray-400 text-sm leading-relaxed">
              Your trusted partner for quality products. We provide excellent 
              customer service and comprehensive warranty support.
            </Text>
            <div className="mt-6">
              <Space size="large">
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                  <FacebookOutlined style={{ fontSize: 24 }} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                  <TwitterOutlined style={{ fontSize: 24 }} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                  <InstagramOutlined style={{ fontSize: 24 }} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                  <LinkedinOutlined style={{ fontSize: 24 }} />
                </a>
              </Space>
            </div>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} className="text-white mb-4">
              Quick Links
            </Title>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-white transition-colors block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Customer Service */}
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} className="text-white mb-4">
              Customer Service
            </Title>
            <ul className="space-y-2">
              {customerService.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-white transition-colors block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Legal & Contact */}
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} className="text-white mb-4">
              Legal & Policies
            </Title>
            <ul className="space-y-2 mb-6">
              {legal.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-white transition-colors block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MailOutlined className="text-blue-500" />
                <a href="mailto:support@velloremobilepoint.com" className="text-gray-400 hover:text-white transition-colors">
                  support@velloremobilepoint.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneOutlined className="text-blue-500" />
                <a href="tel:+1234567890" className="text-gray-400 hover:text-white transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <EnvironmentOutlined className="text-blue-500" />
                <Text className="text-gray-400">
                  123 Commerce St, City, State 12345
                </Text>
              </div>
            </div>
          </Col>
        </Row>

        <Divider className="bg-gray-700 my-8" />

        {/* Copyright */}
        <div className="text-center">
          <Text className="text-gray-500 text-sm">
            © {currentYear} Vellore Mobile Point. All rights reserved.
          </Text>
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;

