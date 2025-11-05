# Authentication API Documentation

## Overview
This document describes the authentication API endpoints for the e-commerce platform. All endpoints return JSON responses with a consistent format.

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

## Authentication Endpoints

### 1. User Registration
**POST** `/api/auth/register`

Register a new user account.

#### Request Body
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "Password123",
  "phone": "+1234567890"
}
```

#### Validation Rules
- `name`: Required, 2-100 characters, letters and spaces only
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters, must contain at least one uppercase letter, one lowercase letter, and one number
- `phone`: Optional, valid mobile phone number

#### Success Response (201)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "user_id": "uuid",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "role": "customer"
    },
    "token": "jwt_token_here"
  }
}
```

#### Error Responses
- **400**: Validation errors or user already exists
- **500**: Server error

---

### 2. User Login
**POST** `/api/auth/login`

Authenticate user and return JWT token.

#### Request Body
```json
{
  "email": "john.doe@example.com",
  "password": "Password123"
}
```

#### Validation Rules
- `email`: Required, valid email format
- `password`: Required, non-empty

#### Success Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": "uuid",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "role": "customer"
    },
    "token": "jwt_token_here"
  }
}
```

#### Error Responses
- **400**: Validation errors
- **401**: Invalid credentials
- **500**: Server error

---

### 3. Get User Profile
**GET** `/api/auth/profile`

Get current user's profile information.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "role": "customer",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Error Responses
- **401**: Missing or invalid token
- **500**: Server error

---

### 4. Update User Profile
**PUT** `/api/auth/update-profile`

Update current user's profile information.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Request Body
```json
{
  "name": "John Smith",
  "phone": "+1234567891"
}
```

#### Validation Rules
- `name`: Optional, 2-100 characters, letters and spaces only
- `phone`: Optional, valid mobile phone number

#### Success Response (200)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user_id": "uuid",
    "name": "John Smith",
    "email": "john.doe@example.com",
    "phone": "+1234567891",
    "role": "customer"
  }
}
```

#### Error Responses
- **400**: Validation errors
- **401**: Missing or invalid token
- **500**: Server error

---

### 5. Forgot Password
**POST** `/api/auth/forgot-password`

Request a password reset link.

#### Request Body
```json
{
  "email": "john.doe@example.com"
}
```

#### Validation Rules
- `email`: Required, valid email format

#### Success Response (200)
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent"
}
```

#### Error Responses
- **400**: Validation errors
- **500**: Server error

---

### 6. Reset Password
**POST** `/api/auth/reset-password`

Reset password using the token from email.

#### Request Body
```json
{
  "token": "reset_token_from_email",
  "password": "NewPassword123"
}
```

#### Validation Rules
- `token`: Required, non-empty
- `password`: Required, minimum 8 characters, must contain at least one uppercase letter, one lowercase letter, and one number

#### Success Response (200)
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

#### Error Responses
- **400**: Validation errors or invalid/expired token
- **500**: Server error

---

### 7. Logout
**POST** `/api/auth/logout`

Logout current user (token invalidation).

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### Error Responses
- **401**: Missing or invalid token
- **500**: Server error

---

## Authentication Flow

### 1. Registration Flow
1. User submits registration form
2. Server validates input data
3. Server checks if email already exists
4. Password is hashed with bcrypt (10 rounds)
5. User is created in database
6. Welcome email is sent (async)
7. JWT token is generated and returned
8. User is automatically logged in

### 2. Login Flow
1. User submits login credentials
2. Server validates input data
3. Server finds user by email
4. Password is verified with bcrypt
5. JWT token is generated (24h expiry)
6. User data and token are returned

### 3. Password Reset Flow
1. User requests password reset
2. Server validates email
3. Reset token is generated (1h expiry)
4. Token is stored in database
5. Reset email is sent with link
6. User clicks link and submits new password
7. Server validates token and new password
8. Password is updated and token is marked as used
9. Confirmation email is sent

## Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Token Security
- JWT tokens expire in 24 hours
- Password reset tokens expire in 1 hour
- Tokens are cryptographically secure
- Reset tokens are single-use

### Email Security
- Password reset emails don't reveal if account exists
- Reset links expire after 1 hour
- Confirmation emails sent after successful reset

### Rate Limiting
- All auth endpoints are rate limited
- Prevents brute force attacks
- Configurable limits per IP

## Error Handling

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter",
      "value": "password123"
    }
  ]
}
```

### Authentication Errors
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Token Errors
```json
{
  "success": false,
  "message": "Token expired"
}
```

## Testing

### Test Credentials
- **Admin**: admin@ecommerce.com / admin123
- **Customer**: john.doe@example.com / password123

### Sample Requests

#### Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123",
    "phone": "+1234567890"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

#### Get Profile
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <jwt_token>"
```

## Environment Variables

Make sure to set these environment variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Client URL (for reset links)
CLIENT_URL=http://localhost:3000
```
