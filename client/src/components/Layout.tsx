import React from 'react';
import { Layout as AntLayout } from 'antd';
import Header from './Header';
import Footer from './Footer';
import Navbar from './Navbar';
const { Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <AntLayout className="min-h-screen">
      <Navbar />
      <Content className="flex-1">
        {children}
      </Content>
      <Footer />
    </AntLayout>
  );
};

export default Layout;
