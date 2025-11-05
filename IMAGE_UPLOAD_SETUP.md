# Image Upload Setup - Complete Implementation

## What Was Implemented

### 1. **Server-Side Upload Endpoint**
Created `/api/upload` endpoint that:
- Accepts image files (JPG, PNG, etc.)
- Saves files to `server/uploads/` directory
- Returns file URL for use in UI
- Validates file type and size (max 2MB)
- Requires authentication

### 2. **File Storage**
- Files saved to: `server/uploads/`
- Unique filenames: `{original-name}-{timestamp}-{random}.{ext}`
- Accessible at: `http://localhost:5000/uploads/{filename}`

### 3. **Client-Side Integration**
Updated AdminProducts page to:
- Use correct server URL (port 5000)
- Upload images to the server
- Display uploaded images in the UI

## Files Created/Modified

### New Files
- `server/src/controllers/uploadController.ts` - Upload logic
- `server/src/routes/uploadRoutes.ts` - Upload route
- `server/uploads/.gitkeep` - Creates uploads folder

### Modified Files
- `server/src/index.ts` - Added upload route and static file serving
- `client/src/pages/AdminProducts.tsx` - Fixed upload action URL

## How It Works

### Upload Flow
1. User selects image in the admin panel
2. Image is uploaded to `POST http://localhost:5000/api/upload`
3. Server saves file to `server/uploads/`
4. Server returns URL: `/uploads/{filename}`
5. Image is displayed at `http://localhost:5000/uploads/{filename}`

### Image URL Format
```
http://localhost:5000/uploads/Product-1234567890-987654321.jpg
```

## Setup Steps

### 1. Restart the Server
```bash
cd server
npm run dev
```

### 2. Create Uploads Directory
The uploads folder will be created automatically on first upload, but you can also create it manually:

```bash
cd server
mkdir uploads
```

### 3. Verify It Works
1. Go to Admin Products page
2. Click "Add Product" or "Edit"
3. Upload an image
4. You should see:
   - Upload progress
   - Image preview
   - Image saved successfully message

## Configuration

### File Size Limit
Default: 2MB
Location: `server/src/controllers/uploadController.ts`
```typescript
limits: {
  fileSize: 2 * 1024 * 1024 // 2MB limit
}
```

### Allowed File Types
Only image files are allowed:
- .jpg, .jpeg
- .png
- .gif
- .webp
- .bmp
- etc.

### Upload Directory
Default: `server/uploads/`
Location: `server/src/controllers/uploadController.ts`
```typescript
const uploadDir = path.join(__dirname, '../../uploads');
```

## API Endpoints

### Upload File
```bash
POST /api/upload
Headers:
  Authorization: Bearer {token}

Body (multipart/form-data):
  file: {image file}

Response:
{
  "success": true,
  "message": "File uploaded successfully",
  "url": "/uploads/filename.jpg"
}
```

## Testing

### Test Upload
```bash
curl -X POST "http://localhost:5000/api/upload" \
  -H "Authorization: Bearer {token}" \
  -F "file=@/path/to/image.jpg"
```

### Access Uploaded Image
```
http://localhost:5000/uploads/{filename}
```

## Troubleshooting

### Images Not Showing
1. Check server logs for upload errors
2. Verify uploads folder exists
3. Check file permissions
4. Verify URL format: `http://localhost:5000/uploads/...`

### Upload Fails
1. Check file size (must be < 2MB)
2. Check file type (must be image)
3. Verify authentication token is valid
4. Check server console for errors

### Files Not Saved
1. Check `server/uploads/` folder exists
2. Verify folder permissions
3. Check server logs for errors

## Security Notes

- All uploads require authentication
- Only images are allowed
- File size limited to 2MB
- Unique filenames prevent conflicts
- Malformed filenames are sanitized

## Production Considerations

For production:
1. Use cloud storage (AWS S3, Azure Blob, etc.)
2. Generate signed URLs
3. Implement CDN for faster delivery
4. Add virus scanning
5. Set up backup strategy
6. Monitor storage usage

