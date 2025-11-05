# Image Upload Implementation - Complete Guide

## What Was Implemented

### Server-Side (Backend)

#### 1. Upload Endpoint Created
- **Route**: `POST /api/upload`
- **Location**: `server/src/routes/uploadRoutes.ts`
- **Controller**: `server/src/controllers/uploadController.ts`
- **Features**:
  - Accepts multipart/form-data file uploads
  - Saves to `server/uploads/` directory
  - Returns file URL
  - Requires authentication (Bearer token)
  - Max file size: 2MB
  - Only images allowed

#### 2. Static File Serving
- **Route**: `/uploads/*`
- **Configuration**: Added to `server/src/index.ts`
- Serves images from `server/uploads/` folder
- Accessible at: `http://localhost:5000/uploads/{filename}`

### Client-Side (Frontend)

#### 1. Updated Admin Products Page
- Upload component action now points to correct server URL
- Handles both `images_json` and `images` array formats
- Displays uploaded images in the UI
- Images show in product table and detail pages

#### 2. Image Display Fixes
- **Products Page**: Shows product images from `images_json` or `images` array
- **Product Detail Page**: Carousel with thumbnails
- **Admin Table**: Product image previews
- **Error Handling**: Falls back to placeholder if image fails to load

## How It Works

### Upload Flow
1. Admin selects image(s) in product form
2. Upload to: `http://localhost:5000/api/upload`
3. Server saves to: `server/uploads/{unique-filename}.{ext}`
4. Server returns: `/uploads/{unique-filename}.{ext}`
5. Client stores URL in `images_json` field
6. Image accessible at: `http://localhost:5000/uploads/{filename}`

### Image Display
1. Product loaded from database
2. Check `images_json` or `images` array
3. Convert relative URLs to full URLs
4. Display in UI

## File Structure

```
server/
├── uploads/              # Uploaded images stored here
│   └── .gitkeep
├── src/
│   ├── controllers/
│   │   └── uploadController.ts  # Upload logic
│   └── routes/
│       └── uploadRoutes.ts      # Upload route
```

## Testing

### 1. Upload an Image
1. Go to: Admin → Products
2. Click: "Add Product" or "Edit"
3. Upload image(s)
4. Check uploads folder: `server/uploads/`

### 2. View Image
- Table: Shows thumbnail in Image column
- Product detail: Shows full image carousel
- Product list: Shows cover image

### 3. Verify Upload
- Image saved to: `server/uploads/{filename}`
- Accessible at: `http://localhost:5000/uploads/{filename}`
- Appears in product data as `images_json` field

## Troubleshooting

### Images Not Showing

1. **Check Image URLs**
   - Should be: `/uploads/filename.jpg`
   - Full URL: `http://localhost:5000/uploads/filename.jpg`

2. **Check Server Running**
   ```bash
   # Server must be running on port 5000
   cd server
   npm run dev
   ```

3. **Check Browser Console**
   - Look for image load errors
   - Check Network tab for failed image requests

4. **Check Upload Folder**
   - Verify `server/uploads/` exists
   - Check file permissions

### Upload Fails

1. **Check File Size**
   - Max: 2MB
   - Large files will be rejected

2. **Check File Type**
   - Only images allowed
   - Common formats: JPG, PNG, GIF, WebP

3. **Check Authentication**
   - Must be logged in
   - Token must be valid

4. **Check Server Logs**
   - Look for upload errors
   - Check console output

## Environment Variables

```env
# Client .env
VITE_API_BASE_URL=http://localhost:5000/api
```

## API Reference

### Upload Endpoint

```http
POST /api/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
  file: {image file}

Response:
{
  "success": true,
  "message": "File uploaded successfully",
  "url": "/uploads/filename.jpg"
}
```

### Access Image

```http
GET /uploads/{filename}
```

## Production Notes

For production:
1. Use cloud storage (AWS S3, Azure Blob, etc.)
2. Generate CDN URLs
3. Implement image compression
4. Add virus scanning
5. Set up backup strategy
6. Monitor storage usage

## Files Modified

### New Files
- `server/src/controllers/uploadController.ts`
- `server/src/routes/uploadRoutes.ts`
- `server/uploads/.gitkeep`

### Modified Files
- `server/src/index.ts` - Added upload route and static serving
- `client/src/pages/AdminProducts.tsx` - Fixed upload action URL
- `client/src/pages/Products.tsx` - Fixed image display
- `client/src/pages/ProductDetail.tsx` - Fixed carousel

## Next Steps

1. **Restart server** to load new routes
2. **Test upload** in admin panel
3. **Verify images** display correctly
4. **Check uploads folder** for saved files

