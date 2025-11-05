# Product Management API Documentation

## Overview
This document describes the complete product management API endpoints for the e-commerce platform. All endpoints return JSON responses with a consistent format.

## Response Format
All API responses follow this format:
```json
{
  "success": boolean,
  "message": string,
  "data": object | null,
  "errors": array | null
}
```

## Product Endpoints

### 1. Get All Products
**GET** `/api/products`

Retrieve all products with pagination, filtering, and search capabilities.

#### Query Parameters
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| page | integer | Page number | 1 |
| limit | integer | Items per page (1-100) | 12 |
| category | string | Filter by category | - |
| minPrice | number | Minimum price filter | - |
| maxPrice | number | Maximum price filter | - |
| search | string | Search in name, description, category | - |
| sortBy | string | Sort field (name, price, created_at, category) | created_at |
| sortOrder | string | Sort order (ASC, DESC) | DESC |
| warranty | string | Warranty filter (12, 24, 36) | - |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "product_id": "uuid",
        "name": "iPhone 15 Pro",
        "description": "Latest iPhone with advanced features",
        "price": 999.99,
        "category": "Electronics",
        "stock": 50,
        "warranty_months": 12,
        "images_json": ["url1", "url2"],
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 12,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### Error Responses
- **400**: Validation errors
- **500**: Server error

---

### 2. Get Single Product
**GET** `/api/products/:id`

Retrieve detailed information about a specific product.

#### Path Parameters
- `id` (string, required): Product UUID

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "product": {
      "product_id": "uuid",
      "name": "iPhone 15 Pro",
      "description": "Latest iPhone with advanced features",
      "price": 999.99,
      "category": "Electronics",
      "stock": 50,
      "warranty_months": 12,
      "images_json": ["url1", "url2"],
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Error Responses
- **400**: Invalid product ID
- **404**: Product not found
- **500**: Server error

---

### 3. Create Product (Admin Only)
**POST** `/api/products`

Create a new product. Requires admin authentication.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Request Body
```json
{
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone with advanced features and improved camera system",
  "price": 999.99,
  "category": "Electronics",
  "stock": 50,
  "warranty_months": 12,
  "images_json": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
}
```

#### Validation Rules
- `name`: Required, 1-200 characters
- `description`: Required, 10-2000 characters
- `price`: Required, positive number
- `category`: Required, 1-100 characters
- `stock`: Required, non-negative integer
- `warranty_months`: Optional, 0-120 months
- `images_json`: Optional, array of image URLs

#### Success Response (201)
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "product_id": "uuid",
      "name": "iPhone 15 Pro",
      "description": "Latest iPhone with advanced features",
      "price": 999.99,
      "category": "Electronics",
      "stock": 50,
      "warranty_months": 12,
      "images_json": ["url1", "url2"],
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Error Responses
- **400**: Validation errors
- **401**: Unauthorized (not admin)
- **500**: Server error

---

### 4. Update Product (Admin Only)
**PUT** `/api/products/:id`

Update an existing product. Requires admin authentication.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Path Parameters
- `id` (string, required): Product UUID

#### Request Body
```json
{
  "name": "iPhone 15 Pro Max",
  "price": 1099.99,
  "stock": 75,
  "is_active": true
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "product": {
      "product_id": "uuid",
      "name": "iPhone 15 Pro Max",
      "description": "Latest iPhone with advanced features",
      "price": 1099.99,
      "category": "Electronics",
      "stock": 75,
      "warranty_months": 12,
      "images_json": ["url1", "url2"],
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Error Responses
- **400**: Validation errors or invalid product ID
- **401**: Unauthorized (not admin)
- **404**: Product not found
- **500**: Server error

---

### 5. Delete Product (Admin Only)
**DELETE** `/api/products/:id`

Soft delete a product by setting `is_active` to false. Requires admin authentication.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Path Parameters
- `id` (string, required): Product UUID

#### Success Response (200)
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

#### Error Responses
- **400**: Invalid product ID
- **401**: Unauthorized (not admin)
- **404**: Product not found
- **500**: Server error

---

### 6. Get Categories
**GET** `/api/products/categories`

Retrieve all available product categories.

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "categories": [
      "Electronics",
      "Computers",
      "Audio",
      "Gaming",
      "Tablets"
    ]
  }
}
```

#### Error Responses
- **500**: Server error

---

### 7. Get Featured Products
**GET** `/api/products/featured`

Retrieve featured products (latest 8 products).

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "product_id": "uuid",
        "name": "iPhone 15 Pro",
        "description": "Latest iPhone with advanced features",
        "price": 999.99,
        "category": "Electronics",
        "stock": 50,
        "warranty_months": 12,
        "images_json": ["url1", "url2"],
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Error Responses
- **500**: Server error

---

## Frontend Implementation

### Redux State Structure
```typescript
interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  categories: string[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    category: string;
    minPrice: number;
    maxPrice: number;
    search: string;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
    warranty: string;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
```

### Redux Actions
- `fetchProductsStart(filters)` - Fetch products with filters
- `fetchProductByIdStart(id)` - Fetch single product
- `fetchCategoriesStart()` - Fetch categories
- `fetchFeaturedProductsStart()` - Fetch featured products
- `createProductStart(productData)` - Create new product
- `updateProductStart({id, data})` - Update product
- `deleteProductStart(id)` - Delete product
- `setFilters(filters)` - Update filters
- `setPagination(pagination)` - Update pagination
- `clearCurrentProduct()` - Clear current product
- `clearError()` - Clear error state

### Pages Implemented

#### 1. Product Listing Page (`/products`)
- **Features**:
  - Grid layout with Ant Design Cards
  - Search bar with debounced input
  - Category filter dropdown
  - Price range slider
  - Warranty filter
  - Sort options
  - Pagination
  - Stock status indicators
  - Responsive design

#### 2. Product Detail Page (`/products/:id`)
- **Features**:
  - Image gallery with carousel
  - Thumbnail navigation
  - Product information display
  - Stock availability indicator
  - Add to cart with quantity selector
  - Related products section
  - Warranty information
  - Social sharing buttons

#### 3. Admin Product Management (`/admin/products`)
- **Features**:
  - Data table with all products
  - CRUD operations (Create, Read, Update, Delete)
  - Modal forms for add/edit
  - Image upload with preview
  - Form validation
  - Stock management
  - Status toggle (active/inactive)
  - Bulk operations support

### Key Features

#### Search and Filtering
- **Debounced Search**: 500ms delay to prevent excessive API calls
- **Category Filter**: Dropdown with all available categories
- **Price Range**: Slider with min/max price selection
- **Warranty Filter**: Filter by warranty duration
- **Sort Options**: Sort by name, price, date, category

#### Image Management
- **Multiple Images**: Support for up to 5 images per product
- **Image Upload**: Drag-and-drop upload interface
- **Image Preview**: Thumbnail previews in admin panel
- **Image Gallery**: Carousel with thumbnail navigation

#### Stock Management
- **Stock Indicators**: Visual status (In Stock, Low Stock, Out of Stock)
- **Stock Validation**: Prevent adding to cart when out of stock
- **Stock Updates**: Real-time stock updates in admin panel

#### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Grid Layout**: Responsive grid that adapts to screen size
- **Touch Friendly**: Touch-optimized controls and interactions

### Error Handling
- **Loading States**: Spinner indicators during API calls
- **Error Messages**: User-friendly error messages
- **Retry Logic**: Automatic retry for failed requests
- **Fallback UI**: Graceful degradation when data fails to load

### Performance Optimizations
- **Pagination**: Limit data transfer with pagination
- **Debounced Search**: Reduce API calls with search debouncing
- **Image Optimization**: Lazy loading and optimized image sizes
- **Caching**: Redux state caching for better performance

## Testing

### Sample API Calls

#### Get Products with Filters
```bash
curl -X GET "http://localhost:5000/api/products?category=Electronics&minPrice=500&maxPrice=1500&search=iPhone&sortBy=price&sortOrder=ASC&page=1&limit=12"
```

#### Create Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": "Test Product",
    "description": "This is a test product description",
    "price": 99.99,
    "category": "Electronics",
    "stock": 10,
    "warranty_months": 12,
    "images_json": ["https://example.com/image.jpg"]
  }'
```

#### Update Product
```bash
curl -X PUT http://localhost:5000/api/products/<product_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "price": 149.99,
    "stock": 20
  }'
```

## Security Features

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Admin-only endpoints for product management
- **Token Expiry**: 24-hour token expiration

### Validation
- **Input Validation**: Comprehensive validation on all inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization

### Rate Limiting
- **API Rate Limits**: Prevent abuse with rate limiting
- **Request Throttling**: Limit requests per IP address

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=2097152
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```
