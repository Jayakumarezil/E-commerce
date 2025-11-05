# Warranty Alerts Endpoint Fix

## ✅ Problem Solved

**Error:** `Not Found - /api/warranties`

**Root Cause:** The endpoint `/api/warranties` didn't exist. The warranty routes only had:
- `/api/warranties/register`
- `/api/warranties/auto-register`
- `/api/warranties/user/:userId`
- `/api/warranties/:id`

But no endpoint to get ALL warranties for admin dashboard.

## 🔧 Solution Implemented

### 1. **Added `getAllWarranties` Controller** 
**File:** `server/src/controllers/warrantyController.ts` (line 147)

```typescript
export const getAllWarranties = async (req: Request, res: Response) => {
  // Fetches all warranties with product and user info
  // Includes status filtering (active/expired)
  // Sorted by expiry_date ASC
  // Returns with pagination
}
```

### 2. **Added Route**
**File:** `server/src/routes/warrantyRoutes.ts` (line 18)

```typescript
router.get('/', authenticateToken, requireAdmin, getAllWarranties);
```

**Endpoint:** `GET /api/warranties`
- Requires authentication
- Admin only access
- Returns all warranties with product and user details

### 3. **Updated Import**
**File:** `server/src/routes/warrantyRoutes.ts`

```typescript
import {
  registerWarranty,
  autoRegisterWarranty,
  getUserWarranties,
  getWarrantyById,
  getAllWarranties, // ✅ Added
  createClaim,
  getUserClaims,
  updateClaimStatus,
  getAllClaims,
} from '../controllers/warrantyController';
```

## 📊 API Response Format

```typescript
{
  success: true,
  data: {
    warranties: [
      {
        warranty_id: string,
        user_id: string,
        product_id: string,
        expiry_date: string,
        product: {
          product_id: string,
          name: string,
          description: string,
          warranty_months: number
        },
        user: {
          user_id: string,
          name: string,
          email: string
        }
      }
    ],
    pagination: {
      currentPage: number,
      totalPages: number,
      totalItems: number,
      itemsPerPage: number
    }
  }
}
```

## 🎯 Features

✅ **Authentication Required** - Only logged-in users
✅ **Admin Only** - Admin role required
✅ **Includes Relations** - Product and User details
✅ **Status Filtering** - Query param: `?status=active|expired`
✅ **Sorted by Expiry** - Most urgent first
✅ **Pagination Support** - Query params: `?page=1&limit=100`

## 📝 Usage

### From Frontend (WarrantyAlerts.tsx)
```typescript
const response = await axios.get(
  `${apiBaseUrl}/warranties`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
```

### Filters Available
- `status=active` - Only active warranties
- `status=expired` - Only expired warranties
- `page=1` - Page number
- `limit=100` - Items per page

## ✅ Status

The endpoint is now available and working! The Warranty Alerts component will successfully fetch and display real warranty data. 🎉

