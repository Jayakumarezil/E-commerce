# Claim Validation Error Fix

## ✅ Problem

**Error:** `Validation error: Validation isUrl on image_url failed`

**Root Cause:** The Claim model has `isUrl: true` validation on `image_url` field, which requires full URLs like `http://...` or `https://...`. But we're saving relative paths like `/uploads/claims/...` which don't start with http/https.

## 🔧 Changes Made

### File: `server/src/models/Claim.ts`

**Before (Lines 50-56):**
```typescript
image_url: {
  type: DataTypes.STRING,
  allowNull: true,
  validate: {
    isUrl: true,  // ❌ Rejects relative paths!
  },
},
```

**After:**
```typescript
image_url: {
  type: DataTypes.STRING,
  allowNull: true,
  // Removed isUrl validation to allow relative paths ✅
},
```

## 🎯 Why This Fixes It

### The Problem:
- Database validation was checking if `image_url` starts with `http://` or `https://`
- Our paths are `/uploads/claims/filename.png` (relative paths)
- Validation failed: "not a full URL"

### The Solution:
- Remove the `isUrl` validation
- Now accepts both:
  - Relative paths: `/uploads/claims/file.png` ✅
  - Full URLs: `http://example.com/file.png` ✅
  - Empty: `null` or `''` ✅

## ✅ Test Now

1. Fill in issue description
2. Upload an image (optional)
3. Click Submit
4. Should work now! ✅

**Expected result:**
```json
{
  "success": true,
  "message": "Claim submitted successfully",
  "data": { "claim": { ... } }
}
```

