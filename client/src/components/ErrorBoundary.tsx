import React, { Component, ReactNode } from 'react';
import { Result, Button, Typography } from 'antd';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Result
            status="500"
            title="500"
            subTitle="Sorry, something went wrong."
            className="max-w-md"
            extra={[
              <Button
                key="reload"
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.reload();
                }}
              >
                Try Again
              </Button>,
              <Button
                key="home"
                icon={<HomeOutlined />}
                onClick={() => {
                  window.location.href = '/';
                }}
              >
                Go Home
              </Button>,
            ]}
          >
            {this.state.error && (
              <div className="mt-4">
                <Paragraph type="secondary" code>
                  {this.state.error.message}
                </Paragraph>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
