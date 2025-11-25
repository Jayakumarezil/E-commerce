# Assets/Images Folder Preservation

## Overview
The `client/src/assets/images/` folder contains static images that are part of the application (e.g., QR_code.png, logo.jpeg) and must be preserved across deployments.

## Current Configuration

### ✅ Git Configuration
- **`.gitignore`**: Does NOT ignore `assets/images/` folder
- All images in `src/assets/images/` are tracked in git
- Files like `QR_code.png` and `logo.jpeg` are committed to the repository

### ✅ Docker Configuration
- **`Dockerfile`**: Copies all source files including `assets/images/`
- **`.dockerignore`**: Explicitly preserves `assets/images/` folder
- Images are bundled into the build output during `npm run build`

### ✅ Vite Configuration
- **`vite.config.ts`**: Vite automatically processes images in `src/assets/`
- Images imported in code are bundled and optimized
- Static assets are copied to the build output

## Folder Structure

```
client/
└── src/
    └── assets/
        └── images/
            ├── QR_code.png      # QR code for payment modal
            └── logo.jpeg        # Application logo
```

## How It Works

1. **Development**: Images are served directly from `src/assets/images/`
2. **Build**: Vite processes and bundles images into `dist/assets/`
3. **Production**: Images are served from the bundled assets in the Docker container

## Important Notes

✅ **Tracked in Git**: All images in `assets/images/` are committed to the repository
✅ **Included in Build**: Images are automatically included in the production build
✅ **Preserved in Docker**: The folder structure is preserved in Docker images

⚠️ **Do NOT ignore**: Never add `assets/images/` to `.gitignore` or `.dockerignore`
⚠️ **Static Assets Only**: This folder is for application assets, not user uploads

## Adding New Images

To add a new image:
1. Place the image file in `client/src/assets/images/`
2. Import it in your component: `import myImage from '../assets/images/myImage.png'`
3. Use it: `<img src={myImage} alt="..." />`
4. Commit the file to git

## Difference from Uploads

- **`assets/images/`**: Static application images (tracked in git, bundled in build)
- **`server/uploads/`**: User-uploaded files (not tracked in git, stored on server)

