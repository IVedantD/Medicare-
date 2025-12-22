# Login Troubleshooting Guide

## Issue: Cannot login with correct credentials

### Step 1: Check Backend Logs

When you try to login, check your backend console. You should see debug logs like:

```
[LOGIN DEBUG] Attempting login for: user@example.com
[LOGIN DEBUG] User found: user@example.com, Role: patient, Active: true
[LOGIN DEBUG] Password hash exists: true
[LOGIN DEBUG] Password hash length: 60
[LOGIN DEBUG] Password comparison result: true/false
```

### Step 2: Test Login Directly

Run the test script to verify password comparison:

```bash
cd backend
node test-login.js your-email@example.com YourPassword123!
```

This will tell you:
- ✅ If user exists in database
- ✅ If password hash is valid
- ✅ If password comparison works
- ✅ What the exact issue is

### Step 3: Common Issues and Solutions

#### Issue 1: User Not Found
**Symptoms**: `[LOGIN DEBUG] User found: undefined`

**Solutions**:
- Check if user was actually registered
- Verify email is correct (case-insensitive)
- Check database connection

#### Issue 2: Password Comparison Fails
**Symptoms**: `Password comparison result: false` but password is correct

**Possible Causes**:
1. **Password was double-hashed during registration**
   - This can happen if `user.save()` was called after password was already hashed
   - **Solution**: Re-register the user (the fix prevents this now)

2. **Password hash is corrupted**
   - **Solution**: Reset password or re-register

3. **Password doesn't match what's in database**
   - **Solution**: Verify the exact password used during registration

#### Issue 3: Account Inactive
**Symptoms**: `Account is inactive`

**Solution**: Check `isActive` field in database, set to `true`

#### Issue 4: Frontend Not Receiving Response
**Symptoms**: Backend logs show success but frontend shows error

**Check**:
1. Browser Network tab - check the actual API response
2. CORS issues - check browser console for CORS errors
3. Response format - ensure backend returns `{ success: true, token, user }`

### Step 4: Verify Database State

If you have MongoDB shell access:

```javascript
// Connect to database
use medicare

// Find user
db.users.findOne({ email: "your-email@example.com" })

// Check password hash
// Should start with $2a$, $2b$, or $2y$
// Should be 60 characters long
```

### Step 5: Reset User Password (If Needed)

If password is corrupted, you can reset it:

```javascript
// In MongoDB shell or Node.js script
const bcrypt = require('bcryptjs');
const newPassword = 'NewPassword123!';
const hashedPassword = await bcrypt.hash(newPassword, 10);

// Update in database
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { password: hashedPassword } }
)
```

### Step 6: Check Frontend

1. **Open Browser DevTools** → Network tab
2. **Try to login**
3. **Check the login request**:
   - Request URL: Should be `http://localhost:5000/api/auth/login`
   - Request Payload: Should have `{ email: "...", password: "..." }`
   - Response: Check what the server actually returns

4. **Check Console** for any JavaScript errors

### Step 7: Verify Environment Variables

Check `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/medicare
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Quick Fix: Re-register User

If nothing works, the quickest solution is to:
1. Delete the user from database (or use a different email)
2. Re-register with the new validation rules
3. Try logging in again

### Still Not Working?

1. **Check backend logs** - Look for any errors
2. **Check frontend console** - Look for JavaScript errors
3. **Check network tab** - See actual API request/response
4. **Run test script** - `node test-login.js email password`
5. **Verify MongoDB connection** - Ensure database is accessible

### Debug Mode

The login endpoint now has extensive debugging. Check your backend console when attempting to login to see:
- User lookup result
- Password hash status
- Password comparison result
- Any errors during comparison

