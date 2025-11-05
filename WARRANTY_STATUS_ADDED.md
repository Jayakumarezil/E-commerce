# Warranty Status Added to Order Management

## Summary
Added a "Warranty Status" column to the admin order management table to show warranty information for each order.

## Changes Made

### Backend (`server/src/controllers/adminController.ts`)

**Added warranty data to API response:**
```typescript
// Fetch warranties for each order
const warranties = await Warranty.findAll({
  where: { user_id: order.user_id },
  attributes: ['warranty_id', 'expiry_date', 'product_id']
});

// Determine warranty status
const hasActiveWarranty = orderWarranties.some((w) => new Date(w.expiry_date) > now);
const hasExpiredWarranty = orderWarranties.some((w) => new Date(w.expiry_date) <= now);
const hasNoWarranty = orderWarranties.length === 0;

// Set status and color
if (hasActiveWarranty) {
  warrantyStatus = 'Active';
  warrantyColor = 'green';
} else if (hasExpiredWarranty) {
  warrantyStatus = 'Expired';
  warrantyColor = 'red';
} else {
  warrantyStatus = 'Not Registered';
  warrantyColor = 'orange';
}
```

### Frontend (`client/src/pages/OrderManagement.tsx`)

**Added warranty status column:**
```typescript
{
  title: 'Warranty Status',
  dataIndex: 'warrantyStatus',
  key: 'warrantyStatus',
  render: (status: string, record: any) => (
    <Tag color={record.warrantyColor || 'default'}>
      {status || 'N/A'}
    </Tag>
  ),
}
```

## Status Colors

- 🟢 **Green (Active)**: Warranty is valid and active
- 🔴 **Red (Expired)**: Warranty has expired
- 🟠 **Orange (Not Registered)**: No warranty registered for order products

## How It Works

1. Backend fetches all orders with user and product information
2. For each order, fetches related warranties
3. Checks warranty expiry dates against current date
4. Determines status (Active/Expired/Not Registered)
5. Returns status and color to frontend
6. Frontend displays as colored Tag

## Benefits

- Quickly see which orders have active warranties
- Identify orders with expired warranties
- Spot orders that need warranty registration
- Better customer service visibility

## Testing

1. Navigate to `/admin/orders`
2. Check warranty status column
3. Should see colored tags for each status
4. Verify colors match status:
   - Green = Active warranty
   - Red = Expired warranty
   - Orange = Not registered

The warranty status is now visible in the order management table! ✅

