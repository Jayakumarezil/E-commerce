# Claims Data Persistence Fix

## 🎯 Problem

Claims data was disappearing when the page was refreshed for all users.

## 🔍 Root Cause

The `MyClaims.tsx` page was using:
```typescript
const userId = localStorage.getItem('userId'); // ❌ This key doesn't exist
```

But the user data is stored in localStorage under the key `'user'` as a JSON object:
```typescript
localStorage.setItem('user', JSON.stringify(userObj));
```

So `userId` was always `null`, which meant:
1. No API call was made
2. Claims array remained empty
3. Data disappeared on refresh

## ✅ Solution

Updated the userId retrieval logic to properly read from Redux auth state or localStorage:

```typescript
const { user } = useSelector((state: RootState) => state.auth);

const getUserId = () => {
  // First try from Redux state
  if (user?.user_id) return user.user_id;
  
  // Fallback to localStorage
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      return userObj?.user_id;
    }
  } catch (error) {
    console.error('Failed to parse user from localStorage:', error);
  }
  
  return null;
};

const userId = getUserId();
```

## 📊 Changes Made

### File: `client/src/pages/MyClaims.tsx`

**Before:**
```typescript
const userId = localStorage.getItem('userId'); // ❌ Wrong key
```

**After:**
```typescript
const { user } = useSelector((state: RootState) => state.auth);
const userId = getUserId(); // ✅ Reads from 'user' key correctly
```

**Added:**
- Proper Redux state access via `useSelector`
- Fallback to localStorage with error handling
- Console logging for debugging
- Checks both Redux state and localStorage

## 🎯 How It Works Now

1. **First Priority**: Check Redux auth state for `user.user_id`
2. **Fallback**: If Redux state is not available, read from `localStorage.getItem('user')` 
3. **Parse**: Parse the JSON and extract `user_id`
4. **Error Handling**: Catch and log any parsing errors
5. **API Call**: Fetch claims using the correct userId

## ✅ Result

- ✅ Claims data persists after page refresh
- ✅ Proper userId retrieval from both sources
- ✅ Error handling for localStorage parsing
- ✅ Console logging for debugging
- ✅ Works for all users (customers and admins)

Claims should now load and persist correctly! 🎊

