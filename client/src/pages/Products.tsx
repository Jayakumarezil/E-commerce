import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import {
  fetchProductsStart,
  fetchCategoriesStart,
  setFilters,
  setPagination,
  clearError,
} from '../redux/slices/productSlice';
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Pagination,
  Spin,
  Alert,
  Typography,
  Space,
  Tag,
} from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { debounce, formatPrice, getStockStatus, getProductImageUrl } from '../utils/helpers';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Products: React.FC = () => {
  const dispatch = useDispatch();
  const { products, categories, isLoading, error, filters, pagination } = useSelector(
    (state: RootState) => state.products
  );

  const [searchValue, setSearchValue] = useState(filters.search);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      dispatch(setFilters({ search: value, page: 1 } as any));
    }, 500),
    [dispatch]
  );

  useEffect(() => {
    dispatch(fetchCategoriesStart());
    dispatch(fetchProductsStart(filters as any));
  }, [dispatch, filters]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleCategoryChange = (category: string) => {
    dispatch(setFilters({ category, page: 1 } as any));
  };

  const handlePriceChange = (value: [number, number]) => {
    dispatch(setFilters({ minPrice: value[0], maxPrice: value[1], page: 1 } as any));
  };

  const handleWarrantyChange = (warranty: string) => {
    dispatch(setFilters({ warranty, page: 1 } as any));
  };

  const handleSortChange = (sortBy: string) => {
    // Determine sort order based on the field
    let sortOrder: 'ASC' | 'DESC' = 'ASC';
    
    // created_at should be descending for "Newest First"
    if (sortBy === 'created_at') {
      sortOrder = 'DESC';
    } else {
      // Name, price, category should be ascending for A-Z and Low to High
      sortOrder = 'ASC';
    }
    
    dispatch(setFilters({ sortBy, sortOrder, page: 1 } as any));
  };

  const handlePageChange = (page: number) => {
    dispatch(setPagination({ currentPage: page }));
    dispatch(setFilters({ page } as any));
  };

  const clearFilters = () => {
    dispatch(setFilters({
      category: '',
      minPrice: 0,
      maxPrice: 10000,
      search: '',
      sortBy: 'created_at',
      sortOrder: 'DESC',
      warranty: '',
      page: 1,
    }));
    setSearchValue('');
  };


  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => dispatch(clearError())}>
              Dismiss
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Title level={2}>Products</Title>
        <Text type="secondary">Browse our extensive product catalog</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Filters Sidebar */}
        <Col xs={24} lg={6}>
          <Card title="Filters" className="sticky top-4">
            <Space direction="vertical" size="middle" className="w-full">
              {/* Search */}
              <div>
                <Text strong>Search</Text>
                <Search
                  placeholder="Search products..."
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  onSearch={handleSearch}
                  prefix={<SearchOutlined />}
                  className="mt-2"
                />
              </div>

              {/* Category Filter */}
              <div>
                <Text strong>Category</Text>
                <Select
                  placeholder="All Categories"
                  value={filters.category || undefined}
                  onChange={handleCategoryChange}
                  className="w-full mt-2"
                  allowClear
                >
                  {categories.map((category) => {
                    const categoryName = typeof category === 'string' ? category : category?.name || '';
                    const categoryValue = categoryName;
                    return (
                      <Option key={categoryValue} value={categoryValue}>
                        {categoryName}
                      </Option>
                    );
                  })}
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <Text strong>Price Range</Text>
                <Select
                  placeholder="All Prices"
                  value={filters.minPrice > 0 || filters.maxPrice < 10000 ? `${filters.minPrice}-${filters.maxPrice}` : undefined}
                  onChange={(value) => {
                    if (!value) {
                      handlePriceChange([0, 10000]);
                    } else {
                      const [min, max] = value.split('-').map(Number);
                      handlePriceChange([min, max]);
                    }
                  }}
                  className="w-full mt-2"
                  allowClear
                >
                  <Option value="0-1000">₹0 - ₹1,000</Option>
                  <Option value="1000-2500">₹1,000 - ₹2,500</Option>
                  <Option value="2500-5000">₹2,500 - ₹5,000</Option>
                  <Option value="5000-7500">₹5,000 - ₹7,500</Option>
                  <Option value="7500-10000">₹7,500 - ₹10,000</Option>
                  <Option value="10000-999999">Above ₹10,000</Option>
                </Select>
              </div>

              {/* Warranty Filter */}
              <div>
                <Text strong>Warranty</Text>
                <Select
                  placeholder="All Warranties"
                  value={filters.warranty || undefined}
                  onChange={handleWarrantyChange}
                  className="w-full mt-2"
                  allowClear
                >
                  <Option value="6">6+ Months</Option>
                  <Option value="12">12+ Months</Option>
                  <Option value="24">24+ Months</Option>
                  <Option value="36">36+ Months</Option>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <Text strong>Sort By</Text>
                <Select
                  value={filters.sortBy}
                  onChange={handleSortChange}
                  className="w-full mt-2"
                >
                  <Option value="created_at">Newest First</Option>
                  <Option value="name">Name A-Z</Option>
                  <Option value="price">Price Low to High</Option>
                  <Option value="category">Category</Option>
                </Select>
              </div>

              {/* Clear Filters */}
              <Button
                icon={<ReloadOutlined />}
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Products Grid */}
        <Col xs={24} lg={18}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <Text strong>
                {pagination.totalItems} products found
              </Text>
            </div>
            <div className="flex items-center space-x-2">
              <FilterOutlined />
              <Text>Showing {products.length} of {pagination.totalItems}</Text>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <Spin size="large" />
              <div className="mt-4">
                <Text>Loading products...</Text>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Text type="secondary">No products found matching your criteria.</Text>
              <div className="mt-4">
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <Col xs={24} sm={12} md={8} lg={6} key={product.product_id}>
                      <Card
                        hoverable
                        cover={
                          <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                            {(() => {
                              const imageUrl = getProductImageUrl(product);
                              if (!imageUrl) {
                                return (
                                  <div className="text-gray-400 w-full h-full flex items-center justify-center">
                                    <span>No Image</span>
                                  </div>
                                );
                              }
                              return (
                                <img
                                  alt={product.name}
                                  src={imageUrl}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error('Image load error:', imageUrl);
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                      parent.innerHTML = '<div class="text-gray-400 w-full h-full flex items-center justify-center"><span>No Image</span></div>';
                                    }
                                  }}
                                />
                              );
                            })()}
                          </div>
                        }
                        actions={[
                          product.product_id ? (
                            <Link to={`/products/${product.product_id}`} key="view">
                              View Details
                            </Link>
                          ) : (
                            <span key="view">View Details</span>
                          ),
                        ]}
                      >
                        <Card.Meta
                          title={
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-medium line-clamp-2">
                                {product.name}
                              </span>
                              <Tag color={stockStatus.color} className="ml-2">
                                {stockStatus.text}
                              </Tag>
                            </div>
                          }
                          description={
                            <div>
                              <div className="text-lg font-bold text-blue-600 mb-2">
                                {formatPrice(product.price)}
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                {typeof product.category === 'string' 
                                  ? product.category 
                                  : product.category?.name || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {product.warranty_months} months warranty
                              </div>
                            </div>
                          }
                        />
                      </Card>
                    </Col>
                  );
                })}
              </Row>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="text-center mt-8">
                  <Pagination
                    current={pagination.currentPage}
                    total={pagination.totalItems}
                    pageSize={pagination.itemsPerPage}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total, range) =>
                      `${range[0]}-${range[1]} of ${total} items`
                    }
                  />
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Products;
