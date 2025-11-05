# Claim Upload Fix

## ✅ Changes Made

### 1. Created Separate Claims Upload Folder

**New file:** `server/src/controllers/claimUploadController.ts`
- Saves claim documents to `server/uploads/claims/`
- Allows images and PDFs
- 10MB file size limit
- Unique filename with `claim-` prefix

### 2. Updated Upload Route

**File:** `server/src/routes/uploadRoutes.ts`
```typescript
// Added new route for claim document uploads
router.post('/claim', authenticateToken, uploadClaimDocument.single('file'), uploadClaimFile);
```

### 3. Fixed Upload URL in Client

**File:** `client/src/pages/ClaimSubmission.tsx` (Line 118)
```typescript
// Before:
action: '/api/upload'

// After:
action: `${VITE_API_BASE_URL}/api/upload/claim`
```

### 4. Added Authorization Header

```typescript
headers: {
  authorization: `Bearer ${localStorage.getItem('token')}`,
}
```

## 🎯 How It Works Now

### Upload Flow:
1. User selects file in claim submission form
2. File sent to `POST /api/upload/claim`
3. Server saves to `server/uploads/claims/` folder ✅
4. Returns URL: `/uploads/claims/claim-filename-timestamp.ext`
5. URL saved in database with claim
6. Document accessible via `/uploads/claims/...`

## 📊 File Structure

```
server/
└── uploads/
    ├── (product images)
    └── claims/  ✅ NEW!
        ├── claim-document-1.jpg
        ├── claim-invoice.pdf
        └── claim-receipt.png
```

## ✨ Benefits

✅ **Separate folder** for claim documents
✅ **Organized storage** - easy to find claim files
✅ **Secure upload** with authentication
✅ **Proper file type** validation (images + PDFs)
✅ **10MB limit** for large documents
✅ **Unique filenames** to prevent conflicts

## 🎉 Next Steps

1. Restart the server
2. The `server/uploads/claims/` folder will be created automatically
3. Submit a claim with a document
4. Check the folder to see uploaded files

