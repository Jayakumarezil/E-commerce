# Uploads Folder Persistence Across Deployments

## Overview
The `uploads/` folder contains user-uploaded files (product images, claim documents, etc.) that must persist across deployments.

## Configuration

### 1. Git Configuration
- **`.gitignore`**: Ignores uploaded files but preserves folder structure via `.gitkeep` files
- **`.gitkeep` files**: Ensure the folder structure is tracked in git

### 2. Docker Configuration
- **`Dockerfile`**: Creates uploads directory structure during build
- **`.dockerignore`**: Excludes uploaded files from Docker build but preserves structure

### 3. Server Configuration
- **`server/src/index.ts`**: Automatically creates uploads directory if it doesn't exist
- **`server/src/controllers/uploadController.ts`**: Creates uploads directory on startup

## Production Deployment Options

### Option 1: Docker Volume (Recommended)
Mount a persistent volume for uploads:

```dockerfile
# In docker-compose.yml or deployment config
volumes:
  - ./uploads:/app/uploads
  # or
  - uploads_data:/app/uploads

volumes:
  uploads_data:
```

### Option 2: External Storage (Best Practice)
For production, consider using:
- **AWS S3** / **Google Cloud Storage** / **Azure Blob Storage**
- **Cloudinary** or similar image hosting service
- **CDN** for better performance

### Option 3: Persistent Volume in Cloud Platforms
- **Railway**: Use persistent volumes
- **Heroku**: Use ephemeral filesystem (consider external storage)
- **AWS ECS/Fargate**: Use EFS (Elastic File System)
- **Kubernetes**: Use PersistentVolumes

## Current Setup

The server automatically:
1. ✅ Creates `uploads/` directory if missing
2. ✅ Creates `uploads/claims/` subdirectory if missing
3. ✅ Serves files from `/uploads` route
4. ✅ Handles missing files gracefully (404 without errors)

## Important Notes

⚠️ **Ephemeral Filesystems**: Some platforms (like Heroku) have ephemeral filesystems that reset on each deployment. For these platforms, you **must** use external storage.

✅ **Persistent Volumes**: Platforms with persistent volumes (Railway, AWS ECS with EFS, etc.) will preserve the uploads folder across deployments.

## Migration to External Storage

If you need to migrate to external storage:

1. Update `server/src/controllers/uploadController.ts` to upload to S3/Cloudinary
2. Update `server/src/index.ts` to serve from external URLs or proxy
3. Migrate existing files to external storage
4. Update database URLs to point to external storage

## Testing

To verify uploads persist:
1. Upload a file
2. Note the file path
3. Redeploy the application
4. Verify the file is still accessible at the same path

