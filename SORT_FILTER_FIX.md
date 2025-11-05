# Sort Filter Fix

## Problem
The sort by filter in the Products page was working in the opposite direction. When selecting "Name A-Z", it would sort Z-A instead.

## Root Cause
The `handleSortChange` function was not setting the `sortOrder` parameter when dispatching the filter action. This meant the backend was always using the default sort order (DESC for created_at), which caused alphabetical sorting to be reversed.

## Solution Applied

### File: `client/src/pages/Products.tsx`

**Updated `handleSortChange` function (lines 72-85):**

```typescript
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
  
  dispatch(setFilters({ sortBy, sortOrder, page: 1 }));
};
```

## Logic:

1. **Name A-Z**: Uses `ASC` - alphabetically ascending
2. **Price Low to High**: Uses `ASC` - numerically ascending
3. **Category**: Uses `ASC` - alphabetically ascending
4. **Newest First**: Uses `DESC` - chronologically descending (newest items first)

## Key Changes:
- Added `sortOrder` to the `setFilters` dispatch
- Set `sortOrder = 'ASC'` for alphabetical and numerical sorting
- Set `sortOrder = 'DESC'` only for "Newest First" (created_at)
- Ensures the backend receives the correct sort direction

## Result
✅ "Name A-Z" now sorts A-Z correctly
✅ "Price Low to High" now sorts ascending
✅ "Category" now sorts alphabetically
✅ "Newest First" still shows newest items first
✅ All sort options work as expected!

The sort filter now works correctly in both directions! 🎉

