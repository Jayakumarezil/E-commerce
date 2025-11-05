# Admin Products Edit Fix

## The Problem
Error when clicking "Edit" in Product Management:
```
AdminProducts.tsx:94 Uncaught TypeError: Cannot read properties of undefined (reading 'map')
    at handleEditProduct (AdminProducts.tsx:94:48)
```

## Root Cause
The code was trying to access `product.images_json.map()` but `images_json` was undefined. The issue was:

1. **Product structure mismatch**: Products from the API have images stored as:
   - `images` array (new format) - array of ProductImage objects
   - OR `images_json` string array (old format)

2. **No null safety**: The code didn't handle the case where `images_json` might be undefined or null.

## Fix Applied

### 1. Updated Product Interface
```typescript
interface Product {
  // ... other fields
  images_json?: string[]; // Optional for backward compatibility
  images?: Array<{
    image_id: string;
    image_url: string;
    alt_text?: string;
    display_order: number;
    is_primary: boolean;
  }>;
}
```

### 2. Fixed Image Handling in Edit Function
```typescript
// OLD - Unsafe
const existingImages = product.images_json.map((url, index) => ({...}));

// NEW - Safe with fallback
let imageUrls: string[] = [];
if (product.images && Array.isArray(product.images)) {
  // New format: images array
  imageUrls = product.images.map(img => img.image_url);
} else if (product.images_json && Array.isArray(product.images_json)) {
  // Old format: images_json
  imageUrls = product.images_json;
}

const existingImages = imageUrls.map((url, index) => ({...}));
```

### 3. Fixed Image Display in Table
Updated the table column to handle both formats:
```typescript
render: (_: any, record: Product) => {
  const imageUrls = record.images?.map(img => img.image_url) || record.images_json || [];
  return (
    <div className="w-12 h-12">
      {imageUrls && imageUrls.length > 0 ? (
        <Image src={imageUrls[0]} alt="Product" />
      ) : (
        <div>No Image</div>
      )}
    </div>
  );
}
```

## Result

Now when clicking "Edit":
1. ✅ No more undefined error
2. ✅ Works with both image formats (images array or images_json)
3. ✅ Shows "No Image" if product has no images
4. ✅ Safely handles null/undefined values

## Files Changed
- `client/src/pages/AdminProducts.tsx`

