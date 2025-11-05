# Debug Console Check

## What to Check in Browser Console

After clicking "Raise Claim", check the browser console (F12) for these logs:

### Expected Console Output:

```
ClaimSubmission RENDER - warrantyId from URL: warranty_id_value
ClaimSubmission RENDER - warranties: [array of warranties]
ClaimSubmission RENDER - selectedWarranty: null (initially)
ClaimSubmission RENDER - activeWarranties count: X
ClaimSubmission RENDER - activeWarranties: [array]
ClaimSubmission RENDER - selectedWarranty?.warranty_id: undefined

ClaimSubmission - warrantyId: warranty_id_value, warranties count: X, loading: true/false
Found warranty: {warranty object}
Set form value to: warranty_id_value
ClaimSubmission RENDER - selectedWarranty?.warranty_id: warranty_id_value
```

## Diagnostic Questions:

1. **Is warrantyId from URL?**
   - ✅ Should see: `warrantyId from URL: something-here`
   - ❌ If null/undefined: URL parameter missing

2. **Are warranties being fetched?**
   - ✅ Should see: `warranties count: > 0`
   - ❌ If 0: Warranties not loading or user has no warranties

3. **Is the warranty being found?**
   - ✅ Should see: `Found warranty: {warranty object}`
   - ❌ If not: Warranty ID doesn't match

4. **Is selectedWarranty being set?**
   - ✅ Should see: `selectedWarranty?.warranty_id: warranty_id_value`
   - ❌ If undefined: Warranty not found or state not updating

## Common Issues:

### Issue 1: warranties count is 0
**Problem:** No warranties being fetched
**Solution:** Check if user has warranties in the database

### Issue 2: warrantyId matches but not found in warranties array
**Problem:** warrantyId from URL doesn't match warranty_id in database
**Solution:** Check warranty IDs are consistent

### Issue 3: selectedWarranty is set but dropdown doesn't show
**Problem:** Select component value prop not working
**Solution:** Check if warranty_id matches an option value

## How to Report:
Please share the console output when clicking "Raise Claim" so I can diagnose the issue!

