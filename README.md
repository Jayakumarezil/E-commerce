# E-commerce Platform

A comprehensive full-stack e-commerce platform built with modern technologies including React 18, Node.js, Express.js, and PostgreSQL. Features include product management, order processing, warranty management, claims processing, and membership management.

## 🚀 Features

### Core E-commerce Features
- **Product Catalog**: Browse products with filtering, search, and sorting
- **Shopping Cart**: Add, update, and manage cart items
- **Checkout & Payment**: Secure checkout with Razorpay integration
- **Order Management**: Track orders with status updates and timeline
- **User Profiles**: Manage profile information, addresses, and preferences

### Warranty Management
- **Warranty Registration**: Register products for warranty coverage
- **Warranty Tracking**: View warranty status and expiry dates
- **Claim Submission**: Submit warranty claims with document uploads
- **Claim Management**: Track claim status and admin updates

### Membership Management
- **Public Membership Search**: Search membership records by IMEI, mobile number, or membership ID (accessible to all users)
- **Admin Membership Management**: Full CRUD operations for membership data
- **Membership Details**: View membership status, expiry dates, and payment information

### Admin Features
- **Dashboard**: Overview of sales, orders, and key metrics
- **Product Management**: Create, update, delete products with image uploads
- **Order Management**: Process orders, update status, and manual order creation
- **Claims Management**: Review and process warranty claims
- **User Management**: Manage user accounts and roles
- **Membership Management**: Manage membership records with export functionality

### User Experience
- **Responsive Design**: Mobile-first design that works on all devices
- **Authentication**: JWT-based secure authentication
- **Role-Based Access**: Different access levels for users and admins
- **Real-time Updates**: Cart updates and order status changes

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite for fast development and building
- **Redux Toolkit** for predictable state management
- **Redux-Saga** for handling side effects and async operations
- **React Router v6** for client-side routing
- **Ant Design (antd)** for professional UI components
- **Tailwind CSS** for custom styling and responsive design
- **Axios** for HTTP client with interceptors
- **TypeScript** for type safety

### Backend
- **Node.js** with Express.js framework
- **PostgreSQL** database with connection pooling
- **Sequelize ORM** for database operations and migrations
- **JWT** authentication with bcrypt password hashing
- **Express middleware** for validation, error handling, and security
- **Multer** for file uploads and image handling
- **Nodemailer** for email notifications
- **Joi** for request validation
- **TypeScript** for type safety

## 📁 Project Structure

```
/ecommerce-platform
├── /client                    # React frontend application
│   ├── /src
│   │   ├── /components        # Reusable UI components
│   │   │   ├── Navbar.tsx     # Main navigation
│   │   │   ├── ProductCard.tsx # Product display card
│   │   │   ├── PrivateRoute.tsx # Route protection
│   │   │   └── ...
│   │   ├── /pages            # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── MembershipSearch.tsx
│   │   │   ├── AdminMemberships.tsx
│   │   │   └── ...
│   │   ├── /redux            # Redux store and logic
│   │   │   ├── /slices        # Redux Toolkit slices
│   │   │   └── /sagas         # Redux-Saga effects
│   │   ├── /services         # API service layer
│   │   ├── /utils            # Utility functions
│   │   └── /assets           # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── /server                    # Express.js backend API
│   ├── /src
│   │   ├── /config           # Configuration files
│   │   ├── /controllers      # Route controllers
│   │   ├── /models           # Sequelize models
│   │   ├── /routes           # API routes
│   │   ├── /middleware       # Express middleware
│   │   ├── /services         # Business logic services
│   │   └── /utils            # Utility functions
│   ├── /migrations          # Database migrations
│   ├── package.json
│   └── tsconfig.json
├── package.json              # Root package.json
├── setup.sh                  # Setup script for Unix/Linux
├── setup.bat                 # Setup script for Windows
└── README.md
```

## 🔄 Application Flows

### 1. User Registration & Authentication Flow

```
1. User visits Register page (/register)
   ↓
2. Fills registration form (email, password, name)
   ↓
3. Submits form → Backend validates → Creates user account
   ↓
4. User redirected to Login page (/login)
   ↓
5. User logs in → JWT token issued → Stored in localStorage
   ↓
6. User redirected to Home page → Authenticated state active
```

### 2. Shopping Flow

```
1. Browse Products (/products)
   - Filter by category, price, warranty
   - Search products
   - Sort by name, price, date
   ↓
2. View Product Details (/products/:id)
   - View images, description, price
   - Check warranty information
   - Add to cart
   ↓
3. Shopping Cart (/cart)
   - View cart items
   - Update quantities
   - Remove items
   - Proceed to checkout
   ↓
4. Checkout (/checkout)
   - Review order summary
   - Enter shipping address
   - Select payment method
   - Process payment (Razorpay)
   ↓
5. Order Confirmation (/order-confirmation)
   - Order details displayed
   - Order ID provided
   - Redirect to Orders page
```

### 3. Order Management Flow

```
1. User Views Orders (/orders)
   - List of all orders
   - Order status badges
   - Payment status
   ↓
2. View Order Details
   - Order items
   - Shipping address
   - Order timeline
   - Status history
   ↓
3. Admin Order Management (/admin/orders)
   - View all orders
   - Update order status
   - Process orders
   - Manual order creation
```

### 4. Warranty Management Flow

```
1. Warranty Registration (/warranties/register)
   - Select product from orders
   - Auto-populate details
   - Submit registration
   ↓
2. View Warranties (/warranties)
   - List of registered warranties
   - Status (Active/Expired)
   - Expiry dates
   - Warranty details
   ↓
3. Submit Claim (/claims/submit)
   - Select warranty
   - Describe issue
   - Upload documents
   - Submit claim
   ↓
4. Track Claims (/claims)
   - View claim status
   - Admin updates
   - Claim history
   ↓
5. Admin Claims Management (/admin/claims)
   - View all claims
   - Update claim status
   - Process claims
   - Add notes
```

### 5. Membership Management Flow

#### Public Search Flow
```
1. User visits Membership Search (/membership/search)
   - No authentication required
   ↓
2. Enter search term (IMEI/Mobile/Membership ID)
   ↓
3. System searches across all fields
   ↓
4. Display membership details if found:
   - Full name, DOB (if provided)
   - Unique Membership ID
   - Membership dates
   - Payment information
   - Phone brand & model
   - IMEI number
   - Status (Active/Expired)
   ↓
5. If not found: Show "No membership record found" message
```

#### Admin Management Flow
```
1. Admin navigates to Manage Memberships (/admin/memberships)
   - Requires admin role
   ↓
2. View Membership List
   - Paginated table
   - Search and filter
   - Status badges
   ↓
3. Add New Membership
   - Required: Full Name, Mobile, IMEI
   - Optional: DOB, Phone Brand, Dates, Payment
   - Select duration (6/12/18/24 months)
   - Auto-generate Membership ID
   ↓
4. Edit Membership
   - Update details
   - Maintain IMEI uniqueness
   - Update status
   ↓
5. Delete Membership
   - Confirm deletion
   - Remove from database
   ↓
6. Export Memberships
   - Export to CSV
   - Download file
```

### 6. Admin Dashboard Flow

```
1. Admin Dashboard (/admin/dashboard)
   - Overview statistics
   - Recent orders
   - Top products
   - Sales charts
   - Warranty alerts
   ↓
2. Product Management (/admin/products)
   - Add/Edit/Delete products
   - Upload images
   - Manage stock
   - Set featured products
   ↓
3. User Management (/admin/users)
   - View all users
   - Update roles
   - Manage user status
```

## 👥 User Roles & Permissions

### Guest User
- Browse products
- Search products
- View product details
- **Search membership records** (public feature)
- Register account
- Login

### Authenticated User
- All guest permissions +
- Add to cart
- Checkout & place orders
- View order history
- Manage profile
- Register warranties
- Submit warranty claims
- View warranties and claims

### Admin User
- All user permissions +
- Access admin dashboard
- Manage products (CRUD)
- Manage orders (update status, create manual orders)
- Manage claims (review, update status, process)
- Manage users (view, update roles)
- **Manage memberships** (CRUD, export)
- View analytics and reports

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Products
- `GET /api/products` - Get products with filtering, search, pagination
- `GET /api/products/featured` - Get featured products
- `GET /api/products/categories` - Get product categories
- `GET /api/products/search` - Search products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item quantity
- `DELETE /api/cart/:productId` - Remove item from cart
- `POST /api/cart/clear` - Clear cart

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order (checkout)
- `PUT /api/orders/:id/status` - Update order status (Admin only)
- `GET /api/admin/orders` - Get all orders (Admin only)
- `POST /api/admin/orders/manual` - Create manual order (Admin only)

### Warranties
- `GET /api/warranties` - Get user's warranties
- `POST /api/warranties/register` - Register warranty
- `GET /api/warranties/:id` - Get warranty details

### Claims
- `GET /api/claims` - Get user's claims
- `POST /api/claims` - Submit claim
- `GET /api/claims/:id` - Get claim details
- `PUT /api/admin/claims/:id` - Update claim status (Admin only)
- `GET /api/admin/claims` - Get all claims (Admin only)

### Memberships
- `GET /api/memberships/search?search=TERM` - Search membership (Public)
- `GET /api/memberships` - Get all memberships (Admin only)
- `POST /api/memberships` - Create membership (Admin only)
- `PUT /api/memberships/:id` - Update membership (Admin only)
- `DELETE /api/memberships/:id` - Delete membership (Admin only)
- `GET /api/memberships/export` - Export memberships to CSV (Admin only)

### Users (Admin only)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `PUT /api/admin/users/:id/role` - Update user role

## 📊 Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `firstName` (String)
- `lastName` (String)
- `role` (Enum: user, admin)
- `phone` (String, Optional)
- `address` (JSONB, Optional)
- `isActive` (Boolean)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Products Table
- `id` (UUID, Primary Key)
- `name` (String)
- `description` (Text)
- `price` (Decimal)
- `image` (String)
- `category` (String)
- `warrantyMonths` (Integer)
- `stock` (Integer)
- `isActive` (Boolean)
- `isFeatured` (Boolean)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Orders Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `total` (Decimal)
- `status` (Enum: pending, processing, shipped, delivered, cancelled)
- `shippingAddress` (JSONB)
- `paymentMethod` (String)
- `paymentStatus` (Enum: pending, paid, failed)
- `razorpayOrderId` (String, Optional)
- `razorpayPaymentId` (String, Optional)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### OrderItems Table
- `id` (UUID, Primary Key)
- `orderId` (UUID, Foreign Key)
- `productId` (UUID, Foreign Key)
- `quantity` (Integer)
- `price` (Decimal)
- `createdAt` (Timestamp)

### CartItems Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `productId` (UUID, Foreign Key)
- `quantity` (Integer)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Warranties Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `orderId` (UUID, Foreign Key)
- `productId` (UUID, Foreign Key)
- `startDate` (Date)
- `endDate` (Date)
- `status` (Enum: active, expired, claimed)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Claims Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `warrantyId` (UUID, Foreign Key)
- `orderId` (UUID, Foreign Key)
- `productId` (UUID, Foreign Key)
- `description` (Text)
- `status` (Enum: pending, under_review, approved, rejected, completed)
- `documents` (JSONB)
- `adminNotes` (Text, Optional)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Memberships Table
- `id` (INT, Primary Key, Auto Increment)
- `full_name` (String, Required)
- `dob` (Date, Optional)
- `mobile_primary` (String, Required)
- `membership_start_date` (Date)
- `expiry_date` (Date)
- `payment_mode` (Enum: Cash, GPay)
- `amount` (Integer)
- `unique_membership_id` (String, Unique, Auto-generated)
- `phone_brand_model` (String, Optional)
- `imei_number` (String, Unique, Required)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (v13 or higher)
- **npm** or **yarn**

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-platform
   ```

2. **Run the setup script**
   
   For Unix/Linux/macOS:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
   
   For Windows:
   ```cmd
   setup.bat
   ```

3. **Configure environment variables**
   
   Create `server/.env` file:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ecommerce_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   PORT=5000
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

   Create `client/.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Set up PostgreSQL database**
   ```sql
   CREATE DATABASE ecommerce_db;
   ```

5. **Run database migrations**
   ```bash
   cd server
   npm run db:migrate
   ```

6. **Start the development servers**
   ```bash
   npm run dev
   ```

   This starts:
   - Frontend on `http://localhost:5173`
   - Backend on `http://localhost:5000`

### Manual Setup

If you prefer to set up manually:

1. **Install dependencies**
   ```bash
   npm run install:all
   ```

2. **Set up environment files**
   ```bash
   cp client/env.example client/.env
   cp server/env.example server/.env
   ```

3. **Configure your environment variables**
   - Update database credentials in `server/.env`
   - Set JWT secret in `server/.env`
   - Configure email settings if needed
   - Set Razorpay credentials

4. **Run database migrations**
   ```bash
   cd server
   npm run db:migrate
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build the client for production
- `npm start` - Start the production server
- `npm run install:all` - Install dependencies for both client and server

### Client Scripts
- `cd client && npm run dev` - Start Vite development server
- `cd client && npm run build` - Build for production
- `cd client && npm run preview` - Preview production build
- `cd client && npm run lint` - Run ESLint

### Server Scripts
- `cd server && npm run dev` - Start with nodemon (development)
- `cd server && npm run build` - Compile TypeScript
- `cd server && npm start` - Start production server
- `cd server && npm run lint` - Run ESLint
- `cd server && npm run db:migrate` - Run database migrations
- `cd server && npm run db:migrate:undo` - Undo last migration

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcrypt
- **CORS** configuration for cross-origin requests
- **Helmet** for security headers
- **Rate Limiting** to prevent abuse
- **Input Validation** using Joi schemas
- **SQL Injection Protection** via Sequelize ORM
- **XSS Protection** with proper data sanitization
- **Role-Based Access Control** (RBAC)
- **File Upload Validation** for security

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with breakpoints for all devices
- **Loading States**: Skeleton loaders and spinners for better UX
- **Error Handling**: User-friendly error messages and error boundaries
- **Form Validation**: Real-time validation with clear error messages
- **Image Handling**: Fallback images for broken links
- **Search & Filter**: Advanced filtering and search capabilities
- **Pagination**: Efficient data loading with pagination
- **Toast Notifications**: Success and error notifications
- **Modals & Drawers**: Smooth transitions for modals and mobile navigation

## 📱 Responsive Breakpoints

```
xs: 0px     → Mobile portrait
sm: 640px   → Mobile landscape
md: 768px   → Tablet
lg: 1024px  → Desktop
xl: 1280px  → Large desktop
```

## 🚀 Deployment

### Production Build

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Build the server**
   ```bash
   cd server
   npm run build
   ```

3. **Set production environment variables**
   - Update `NODE_ENV=production`
   - Configure production database
   - Set secure JWT secrets
   - Configure email service
   - Set Razorpay production credentials

4. **Start production server**
   ```bash
   cd server
   npm start
   ```

### Docker Deployment (Optional)

The project includes Docker configuration for containerized deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Future Enhancements

- [ ] Payment integration (Stripe, PayPal)
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Product reviews and ratings
- [ ] Inventory management system
- [ ] Mobile app (React Native)
- [ ] Microservices architecture
- [ ] Redis caching
- [ ] Elasticsearch integration
- [ ] Multi-language support
- [ ] Advanced reporting features
