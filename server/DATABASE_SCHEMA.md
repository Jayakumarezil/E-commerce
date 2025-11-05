# Database Schema Documentation

## Overview
This document describes the PostgreSQL database schema for the e-commerce platform with warranty management system.

## Tables

### 1. users
Stores user account information including customers and administrators.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | UUID | PRIMARY KEY | Unique identifier for the user |
| name | VARCHAR | NOT NULL | Full name of the user |
| email | VARCHAR | NOT NULL, UNIQUE | Email address (unique) |
| password_hash | VARCHAR | NOT NULL | Bcrypt hashed password |
| phone | VARCHAR | NULL | Phone number |
| role | ENUM | DEFAULT 'customer' | User role: 'customer' or 'admin' |
| created_at | TIMESTAMP | NOT NULL | Account creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `idx_users_email` (UNIQUE) - Fast email lookups
- `idx_users_role` - Filter by user role

### 2. products
Stores product catalog information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| product_id | UUID | PRIMARY KEY | Unique identifier for the product |
| name | VARCHAR | NOT NULL | Product name |
| description | TEXT | NOT NULL | Detailed product description |
| price | DECIMAL(10,2) | NOT NULL | Product price |
| category | VARCHAR | NOT NULL | Product category |
| stock | INTEGER | DEFAULT 0 | Available stock quantity |
| warranty_months | INTEGER | DEFAULT 12 | Warranty period in months |
| images_json | JSON | DEFAULT '[]' | Array of product image URLs |
| is_active | BOOLEAN | DEFAULT true | Product availability status |
| created_at | TIMESTAMP | NOT NULL | Product creation timestamp |

**Indexes:**
- `idx_products_category` - Filter by category
- `idx_products_is_active` - Filter active products
- `idx_products_name` - Search by product name
- `idx_products_price` - Sort by price

### 3. orders
Stores order information and status.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| order_id | UUID | PRIMARY KEY | Unique identifier for the order |
| user_id | UUID | FOREIGN KEY | Reference to users table |
| total_price | DECIMAL(10,2) | NOT NULL | Total order amount |
| payment_status | ENUM | DEFAULT 'pending' | Payment status: 'pending', 'paid', 'failed', 'refunded' |
| order_status | ENUM | DEFAULT 'pending' | Order status: 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled' |
| shipping_address_json | JSON | NOT NULL | Shipping address information |
| created_at | TIMESTAMP | NOT NULL | Order creation timestamp |

**Indexes:**
- `idx_orders_user_id` - User's orders
- `idx_orders_payment_status` - Filter by payment status
- `idx_orders_order_status` - Filter by order status
- `idx_orders_created_at` - Sort by creation date

### 4. order_items
Stores individual items within each order.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| item_id | UUID | PRIMARY KEY | Unique identifier for the order item |
| order_id | UUID | FOREIGN KEY | Reference to orders table |
| product_id | UUID | FOREIGN KEY | Reference to products table |
| quantity | INTEGER | NOT NULL | Quantity of the product |
| price_at_purchase | DECIMAL(10,2) | NOT NULL | Price at time of purchase |

**Indexes:**
- `idx_order_items_order_id` - Items in an order
- `idx_order_items_product_id` - Orders containing a product

### 5. cart_items
Stores shopping cart items for users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| cart_id | UUID | PRIMARY KEY | Unique identifier for the cart item |
| user_id | UUID | FOREIGN KEY | Reference to users table |
| product_id | UUID | FOREIGN KEY | Reference to products table |
| quantity | INTEGER | DEFAULT 1 | Quantity in cart |
| created_at | TIMESTAMP | NOT NULL | Cart item creation timestamp |

**Indexes:**
- `idx_cart_items_user_id` - User's cart items
- `idx_cart_items_product_id` - Cart items for a product
- `idx_cart_items_user_product` (UNIQUE) - One cart item per user-product combination

### 6. warranties
Stores warranty information for purchased products.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| warranty_id | UUID | PRIMARY KEY | Unique identifier for the warranty |
| user_id | UUID | FOREIGN KEY | Reference to users table |
| product_id | UUID | FOREIGN KEY | Reference to products table |
| purchase_date | DATE | NOT NULL | Date of purchase |
| expiry_date | DATE | NOT NULL | Warranty expiry date |
| serial_number | VARCHAR | UNIQUE | Product serial number |
| invoice_url | VARCHAR | NULL | URL to purchase invoice |
| registration_type | ENUM | DEFAULT 'manual' | Registration type: 'auto' or 'manual' |
| created_at | TIMESTAMP | NOT NULL | Warranty creation timestamp |

**Indexes:**
- `idx_warranties_user_id` - User's warranties
- `idx_warranties_product_id` - Warranties for a product
- `idx_warranties_expiry_date` - Filter by expiry date
- `idx_warranties_serial_number` (UNIQUE) - Lookup by serial number
- `idx_warranties_registration_type` - Filter by registration type

### 7. claims
Stores warranty claims submitted by users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| claim_id | UUID | PRIMARY KEY | Unique identifier for the claim |
| warranty_id | UUID | FOREIGN KEY | Reference to warranties table |
| issue_description | TEXT | NOT NULL | Description of the issue |
| image_url | VARCHAR | NULL | URL to supporting image |
| status | ENUM | DEFAULT 'pending' | Claim status: 'pending', 'approved', 'rejected', 'resolved' |
| admin_notes | TEXT | NULL | Admin notes on the claim |
| created_at | TIMESTAMP | NOT NULL | Claim creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `idx_claims_warranty_id` - Claims for a warranty
- `idx_claims_status` - Filter by claim status
- `idx_claims_created_at` - Sort by creation date

## Relationships

### Foreign Key Relationships
- `orders.user_id` → `users.user_id`
- `order_items.order_id` → `orders.order_id`
- `order_items.product_id` → `products.product_id`
- `cart_items.user_id` → `users.user_id`
- `cart_items.product_id` → `products.product_id`
- `warranties.user_id` → `users.user_id`
- `warranties.product_id` → `products.product_id`
- `claims.warranty_id` → `warranties.warranty_id`

### Cascade Rules
- **ON DELETE CASCADE**: When a user is deleted, all their orders, cart items, and warranties are deleted
- **ON DELETE CASCADE**: When an order is deleted, all its order items are deleted
- **ON DELETE CASCADE**: When a product is deleted, all related cart items and order items are deleted
- **ON DELETE CASCADE**: When a warranty is deleted, all its claims are deleted

## Enums

### payment_status
- `pending` - Payment not yet processed
- `paid` - Payment completed successfully
- `failed` - Payment failed
- `refunded` - Payment refunded

### order_status
- `pending` - Order placed, awaiting confirmation
- `confirmed` - Order confirmed by admin
- `shipped` - Order shipped to customer
- `delivered` - Order delivered successfully
- `cancelled` - Order cancelled

### claim_status
- `pending` - Claim submitted, awaiting review
- `approved` - Claim approved by admin
- `rejected` - Claim rejected by admin
- `resolved` - Claim resolved (repair/replacement completed)

### user_role
- `customer` - Regular customer
- `admin` - Administrator with full access

### registration_type
- `auto` - Warranty automatically registered upon purchase
- `manual` - Warranty manually registered by user

## Sample Data

### Admin User
- **Email**: admin@ecommerce.com
- **Password**: admin123
- **Role**: admin

### Sample Products
1. iPhone 15 Pro - $999.99 (Electronics)
2. Samsung Galaxy S24 - $899.99 (Electronics)
3. MacBook Pro 16" - $2499.99 (Computers)
4. Dell XPS 13 - $1299.99 (Computers)
5. Sony WH-1000XM5 - $399.99 (Audio)
6. AirPods Pro 2 - $249.99 (Audio)
7. Nintendo Switch OLED - $349.99 (Gaming)
8. PlayStation 5 - $499.99 (Gaming)
9. iPad Air 5th Gen - $599.99 (Tablets)
10. Samsung Galaxy Tab S9 - $799.99 (Tablets)

## Database Setup Commands

### Setup Database
```bash
npm run db:setup
```

### Run Migrations
```bash
npm run db:migrate
```

### Seed Data
```bash
npm run db:seed
```

### Reset Database
```bash
npm run db:reset
```

## Performance Considerations

1. **Indexes**: All frequently queried fields have appropriate indexes
2. **Foreign Keys**: Proper foreign key constraints ensure data integrity
3. **JSON Fields**: Used for flexible data storage (addresses, images)
4. **UUID Primary Keys**: Better for distributed systems and security
5. **Timestamps**: Automatic timestamp management for audit trails

## Security Features

1. **Password Hashing**: All passwords are bcrypt hashed
2. **Role-based Access**: Admin and customer roles with different permissions
3. **Data Validation**: Constraints ensure data integrity
4. **Audit Trail**: Created/updated timestamps for all records
5. **Soft References**: Foreign keys maintain referential integrity
