# Login Issue Debugging Guide

## Current Problem
You're entering correct credentials but getting "Invalid email or password" and not being redirected to the dashboard.

## Quick Diagnosis

### Step 1: Check Backend Console

When you try to login, check your **backend terminal**. You should see debug logs like:

```
[LOGIN DEBUG] Attempting login for: your-email@example.com
[LOGIN DEBUG] User found: your-email@example.com, Role: patient, Active: true
[LOGIN DEBUG] Password comparison result: true/false
```

**What to look for:**
- ✅ If you see "User found" → User exists in database
- ✅ If "Password comparison result: true" → Password is correct
- ❌ If "User not found" → User doesn't exist (need to register)
- ❌ If "Password comparison result: false" → Password is wrong

### Step 2: Test Login Directly

Run this command to test your credentials:

```bash
cd backend
node debug-login.js your-email@example.com YourPassword123!
```

Replace with your actual email and password.

**This will tell you:**
- ✅ If user exists in database
- ✅ If password is correct
- ✅ What the exact issue is

### Step 3: Check MongoDB Connection

Make sure MongoDB is connected. In your backend console, you should see:

```
✅ MongoDB Connected: localhost
   Database: medicare
```

If you see an error instead, MongoDB is not connected.

**To fix:**
1. Start MongoDB service (see `START_MONGODB.md`)
2. Or check your `.env` file has correct connection string

### Step 4: Check Browser Console

Open browser DevTools (F12) → Console tab, and try to login.

**Look for:**
- `[LOGIN PAGE] Attempting login for: ...`
- `[AUTH] Login successful: ...`
- `[LOGIN PAGE] Navigating to dashboard: ...`
- Any error messages

### Step 5: Check Network Tab

1. Open browser DevTools (F12) → Network tab
2. Try to login
3. Find the `/api/auth/login` request
4. Click on it and check:
   - **Request Payload**: Should have `{ email: "...", password: "..." }`
   - **Response**: Should have `{ success: true, token: "...", user: {...} }`
   - **Status**: Should be `200` (not `401`)

## Common Issues & Solutions

### Issue 1: "User not found"

**Symptoms**: Backend logs show "User not found"

**Solution**:
1. User was never registered, OR
2. Email is incorrect, OR
3. User was registered but database was cleared

**Fix**: Register the user again

### Issue 2: "Password comparison result: false"

**Symptoms**: Backend logs show password is incorrect

**Possible Causes**:
1. Wrong password entered
2. Password was double-hashed during registration
3. Password hash is corrupted

**Solutions**:
1. Try the exact password used during registration
2. Re-register with a new account
3. Run: `node debug-login.js email password` to verify

### Issue 3: MongoDB Not Connected

**Symptoms**: Backend shows MongoDB connection error

**Solution**:
1. Start MongoDB service
2. Check `.env` file has: `MONGODB_URI=mongodb://localhost:27017/medicare`
3. Restart backend server

### Issue 4: Login Succeeds But No Redirect

**Symptoms**: Backend shows success, but frontend doesn't redirect

**Check**:
1. Browser console for `[LOGIN PAGE]` messages
2. localStorage has `clinic_user` and `clinic_token`
3. Network tab shows successful API response

**Fix**: The code now uses `window.location.href` for more reliable navigation

## Step-by-Step Debugging

### 1. Verify User Exists

```bash
cd backend
node debug-login.js your-email@example.com YourPassword123!
```

### 2. Check Backend Logs

When you login, backend should show:
```
[LOGIN DEBUG] Attempting login for: ...
[LOGIN DEBUG] User found: ...
[LOGIN DEBUG] Password comparison result: true
[LOGIN DEBUG] Login successful for: ...
```

### 3. Check Frontend Logs

Browser console should show:
```
[LOGIN PAGE] Attempting login for: ...
[AUTH] Login successful: ...
[LOGIN PAGE] Navigating to dashboard: /patient/dashboard
```

### 4. Verify localStorage

In browser console:
```javascript
localStorage.getItem('clinic_user')
localStorage.getItem('clinic_token')
```

Both should have values.

## Quick Fix: Re-register User

If nothing works, the quickest solution:

1. **Delete old user** (or use different email)
2. **Re-register** with the new validation rules
3. **Try logging in** again

The new registration process prevents password double-hashing.

## Still Not Working?

1. **Run diagnostic**: `node debug-login.js email password`
2. **Check backend logs** when you login
3. **Check browser console** for errors
4. **Check network tab** for API response
5. **Verify MongoDB is connected**

Share the output of these checks for further help!

