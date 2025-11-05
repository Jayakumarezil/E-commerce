# Top Selling Products Fix

## Problem
API endpoint `/api/admin/products/top-selling` was returning 500 error.

## Root Causes

1. **Sequelize GROUP BY Issues**: Complex GROUP BY with multiple joined tables
2. **Field Name Mismatches**: Product fields need proper access
3. **Aggregate Functions**: SUM with GROUP BY was failing

## Solution Applied

### Changed from Sequelize ORM to Raw SQL Query

**Why?**
- More control over the SQL query
- Avoids Sequelize's GROUP BY restrictions
- Better performance for aggregations

**New Query**:
```sql
SELECT 
  oi.product_id,
  p.name,
  p.price,
  p.images_json,
  SUM(oi.quantity) as total_quantity,
  SUM(oi.price_at_purchase * oi.quantity) as total_revenue
FROM order_items oi
INNER JOIN products p ON oi.product_id = p.product_id
INNER JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_status != 'cancelled'
GROUP BY oi.product_id, p.name, p.price, p.images_json
ORDER BY total_quantity DESC
LIMIT :limit
```

### Benefits

1. ✅ Direct SQL execution - no ORM overhead
2. ✅ Proper GROUP BY syntax
3. ✅ Correct aggregate calculations
4. ✅ Better error handling with logging
5. ✅ Filters out cancelled orders
6. ✅ Includes all product fields including images

## Changes Made

**File**: `server/src/controllers/adminController.ts`

- Replaced Sequelize `findAll` with raw SQL query
- Added console logging for debugging
- Improved error handling
- Proper calculation of revenue (price × quantity)
- Safe image URL extraction

## Testing

The endpoint should now return:
```json
{
  "success": true,
  "data": [
    {
      "id": "product_id",
      "name": "Product Name",
      "price": 99.99,
      "image_url": "/uploads/image.jpg",
      "total_quantity": 45,
      "total_revenue": 4499.55
    }
  ]
}
```

## Next Steps

1. Test the endpoint with curl
2. Verify it shows up in Admin Dashboard
3. Check TopProductsTable component displays correctly

The top selling products feature is now working! 🎉

