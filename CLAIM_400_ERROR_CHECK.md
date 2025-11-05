# Claim 400 Error - Debug Guide

## ✅ Progress!

**Status:** Getting 400 Bad Request instead of 500
**Meaning:** Data is being sent, but server is rejecting it due to validation

## 🔍 What to Check

### In Server Console (not browser console):

Look for these logs I just added:
```
Create claim request body: { ... }
Create claim request user: { ... }
Parsed values - user_id: "...", warranty_id: "...", issue_description length: X
```

Then look for one of these ERROR messages:
- `ERROR: user_id is missing` → Authentication problem
- `ERROR: warranty_id is missing` → warranty_id not in request body
- `ERROR: issue_description validation failed` → Issue description too short

## 📊 Possible Issues

### Issue 1: warranty_id missing
**Server log will show:**
```
Parsed values - user_id: "...", warranty_id: undefined, issue_description length: X
ERROR: warranty_id is missing
```

**Solution:** The Select component value isn't being set properly in the form

### Issue 2: issue_description too short
**Server log will show:**
```
ERROR: issue_description validation failed
received_data: { has_issue_description: true, length: 5 }
```

**Solution:** Make sure you typed at least 10 characters

### Issue 3: user_id missing
**Server log will show:**
```
ERROR: user_id is missing
```

**Solution:** Authentication token not valid or expired

## ✅ Next Steps

1. **Check the server console** (where you started the server)
2. **Copy the entire log** from "Create claim request body:" onwards
3. **Share it with me** so I can see exactly what's being sent

This will tell us exactly what's wrong! 🎊

