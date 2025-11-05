import React from 'react';
import { Layout, Row, Col, Typography } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

const Footer: React.FC = () => {
  return (
    <AntFooter className="bg-gray-100 text-center">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <div>
            <Text strong>Vellore Mobile Point</Text>
            <br />
            <Text type="secondary">
              Your one-stop shop for all your needs
            </Text>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div>
            <Text strong>Quick Links</Text>
            <br />
            <Text type="secondary">
              About Us | Contact | Privacy Policy | Terms of Service
            </Text>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div>
            <Text strong>Contact Info</Text>
            <br />
            <Text type="secondary">
              Email: support@velloremobilepoint.com
              <br />
              Phone: +1 (555) 123-4567
            </Text>
          </div>
        </Col>
      </Row>
      <div className="mt-4 pt-4 border-t border-gray-300">
        <Text type="secondary">
          © 2024 Vellore Mobile Point. All rights reserved.
        </Text>
      </div>
    </AntFooter>
  );
};

export default Footer;
