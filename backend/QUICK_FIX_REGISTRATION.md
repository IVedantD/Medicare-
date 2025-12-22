# Quick Fix: Registration 500 Error

## Current Issue
Registration is returning **500 Internal Server Error**. This means something is failing on the backend.

## Immediate Steps

### Step 1: Check Backend Console

**Look at your backend terminal** when you try to register. You should see error logs like:

```
[REGISTER] Registration error: ...
[REGISTER] Error details: { name: ..., message: ..., code: ... }
```

**Share this error message** - it will tell us exactly what's wrong!

### Step 2: Common Causes & Fixes

#### Cause 1: Password Doesn't Meet Requirements

**Error**: "Password must be at least 8 characters and contain..."

**Fix**: Use a password that has:
- ✅ At least 8 characters
- ✅ Uppercase letter (A-Z)
- ✅ Lowercase letter (a-z)  
- ✅ Number (0-9)
- ✅ Special character (!@#$%^&*...)

**Examples**:
- ✅ `Test123!@#`
- ✅ `MyPass123!`
- ✅ `Secure123$`
- ❌ `password` (missing uppercase, number, special)
- ❌ `Password` (missing number, special)
- ❌ `Password1` (missing special)

#### Cause 2: Phone Format Issue

**Error**: "Phone number must be in format..."

**Fix**: 
- Leave phone **empty** (it's optional)
- Or use: `+91 XXXXX XXXXX`
- Or use: `10 digits` (e.g., `9876543210`)

#### Cause 3: MongoDB Connection Issue

**Error**: "Database connection unavailable"

**Fix**:
1. Check backend console for MongoDB connection status
2. Should see: `✅ MongoDB Connected: localhost`
3. If not, start MongoDB service and restart backend

#### Cause 4: Email Already Exists

**Error**: "Email already registered"

**Fix**: Use a different email address

### Step 3: Test Registration Directly

Run this to test registration:

```bash
cd backend
node test-register.js
```

This will show you the exact error message.

### Step 4: Check Backend Logs

When you register, your backend console should show:

```
[REGISTER] Creating user with data: ...
[REGISTER] Attempting to create user in database...
[REGISTER] User created successfully: ...
```

If you see an error instead, **that's the problem**!

## Most Likely Issue

Based on the 500 error, it's probably:

1. **Password validation failing** - Password doesn't meet all requirements
2. **Phone validation failing** - Phone format is incorrect
3. **MongoDB operation failing** - Some database issue

## Quick Test

Try registering with this exact data:

- **Name**: Test User
- **Email**: test123@example.com
- **Password**: `Test123!@#`
- **Phone**: (leave empty)
- **Role**: Patient

If this works, then your original password/phone was the issue.

## Next Steps

1. **Check backend console** for the actual error
2. **Share the error message** from backend console
3. **Try the test registration** with the exact password format above
4. **Check MongoDB is connected** (should see ✅ in backend console)

The backend console will show the exact error - that's what we need to fix it!

