# Diagnose Registration 500 Error

## 🔍 What to Check

### Step 1: Check Backend Console (MOST IMPORTANT!)

When you try to register, **look at your backend terminal**. You should see logs like:

```
[REGISTER] Creating user with data: ...
[REGISTER] Attempting to create user in database...
[REGISTER] Registration error: ...
[REGISTER] Error details: { name: ..., message: ..., code: ... }
```

**The error message here tells us exactly what's wrong!**

### Step 2: Common Errors & Solutions

#### Error: "Password must be at least 8 characters..."

**Problem**: Password doesn't meet requirements

**Solution**: Use a password with:
- ✅ 8+ characters
- ✅ Uppercase (A-Z)
- ✅ Lowercase (a-z)
- ✅ Number (0-9)
- ✅ Special character (!@#$%^&*...)

**Try this password**: `Test123!@#`

#### Error: "Phone number must be in format..."

**Problem**: Phone format is wrong

**Solution**: 
- Leave phone **EMPTY** (it's optional)
- Or use: `+91 12345 67890`
- Or use: `1234567890` (10 digits)

#### Error: "Database connection unavailable"

**Problem**: MongoDB not connected

**Solution**:
1. Check backend console - should see `✅ MongoDB Connected: localhost`
2. If not, start MongoDB service
3. Restart backend server

#### Error: "Email already registered"

**Problem**: Email exists in database

**Solution**: Use a different email

### Step 3: Test with Simple Data

Try registering with this **exact** data:

```
Name: Test User
Email: test999@example.com
Password: Test123!@#
Phone: (leave empty)
Role: Patient
```

If this works, then your original data had a validation issue.

### Step 4: Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to register
4. Click on `/api/auth/register` request
5. Check the **Response** tab

You should see the actual error message from the server.

## 🎯 Most Likely Issue

Based on 500 error, it's probably:

1. **Password validation** - Password doesn't meet all 5 requirements
2. **Phone validation** - Phone format is incorrect (if provided)
3. **MongoDB operation** - Some database error

## 📋 Action Items

1. ✅ **Check backend console** - Look for `[REGISTER]` error messages
2. ✅ **Share the error** - Copy the error message from backend console
3. ✅ **Try test password** - Use `Test123!@#` as password
4. ✅ **Leave phone empty** - Don't provide phone number
5. ✅ **Verify MongoDB** - Should see `✅ MongoDB Connected` in backend

## 🔧 Quick Test

Run this to test registration:

```bash
cd backend
node test-register.js
```

This will show you the exact error message.

## 💡 Next Steps

**The backend console error message is the key!** Once you see it, we can fix it immediately.

Share the error message from your backend console when you try to register.

