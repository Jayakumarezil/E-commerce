# Claim Form Value Fix

## ✅ Problem

**Issue:** warranty_id value isn't being captured by the form when submitted

**Root Cause:** The controlled `value` prop on the Select component was preventing Ant Design Form from managing the value

## 🔧 Changes Made

### File: `client/src/pages/ClaimSubmission.tsx`

**Removed controlled value from Select (Line 194):**
```typescript
// Before:
<Select
  value={selectedWarranty?.warranty_id || warrantyId || undefined}  // ❌ Prevents form capture
>

// After:
<Select
  // Let Form.Item manage the value ✅
>
```

**Added setTimeout for form value setting (Lines 58-61):**
```typescript
// Use setTimeout to ensure form is ready
setTimeout(() => {
  form.setFieldsValue({
    warranty_id: warranty.warranty_id,
  });
}, 100);
```

## 🎯 Why This Matters

### Ant Design Form Behavior:
- When you use `value` prop on a form field, you're taking control away from Form
- Form.Item can't capture the value on submit
- You need to let Form.Item manage the value OR manually handle onChange

### Solution:
- Remove `value` prop from Select
- Let Form.Item control it
- Use `form.setFieldsValue()` to set initial value
- Form will now capture it on submit ✅

## 📊 What Happens Now

1. Warranty is auto-selected from URL
2. Form.setFieldsValue() sets warranty_id
3. Select shows the selected value
4. User fills issue_description
5. User clicks Submit
6. **Form captures both values** ✅
7. Data is sent to API ✅

## ✅ Test

1. Fill in issue description
2. Click Submit
3. Check browser console for: `Form values received: { warranty_id: "...", issue_description: "..." }`

The form should now capture and send the data! 🎊

