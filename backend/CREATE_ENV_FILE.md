# Create .env File - Step by Step

## Current Issue
Your `.env` file doesn't exist, which is why MongoDB connection is failing.

## Solution: Create `.env` File

### Method 1: Using Setup Script (Recommended)

1. Open terminal in `backend` folder
2. Run:
   ```bash
   node setup-env.js
   ```
3. Follow the prompts
4. Done! ✅

---

### Method 2: Manual Creation

#### Step 1: Create the File

**Windows:**
1. Navigate to: `D:\MediCare Project\Medicare\backend`
2. Right-click in the folder
3. New → Text Document
4. Name it exactly: `.env` (including the dot at the start)
   - If Windows asks about the extension, click "Yes"
   - The file should be named `.env` with no `.txt` extension

**Or use Command Line:**
```powershell
cd "D:\MediCare Project\Medicare\backend"
New-Item -Path .env -ItemType File
```

#### Step 2: Add Content

Open `.env` file and paste ONE of these:

**For Local MongoDB:**
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
MONGODB_URI=mongodb://localhost:27017/medicare
JWT_SECRET=medicare_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
```

**For MongoDB Atlas (Cloud):**
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/medicare?retryWrites=true&w=majority
JWT_SECRET=medicare_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
```

**⚠️ Important for Atlas:**
- Replace `username` with your MongoDB Atlas username
- Replace `password` with your MongoDB Atlas password
- Replace `cluster0.xxxxx` with your actual cluster name
- Make sure there are NO spaces around the `=` signs

#### Step 3: Save and Restart

1. Save the file
2. Restart your backend server:
   ```bash
   npm run dev
   ```

---

## Verify It Works

After creating `.env` and restarting, you should see:

```
✅ MongoDB Connected: localhost
   Database: medicare
```

If you still see an error, check:
1. File is named exactly `.env` (not `.env.txt`)
2. File is in `backend/` folder (not root folder)
3. No extra spaces in connection string
4. MongoDB is running (for local) or Atlas credentials are correct

---

## Quick MongoDB Atlas Setup (If Needed)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create cluster (takes 3-5 minutes)
4. Database Access → Add user (username + password)
5. Network Access → Add IP (0.0.0.0/0 for development)
6. Database → Connect → Connect your application
7. Copy connection string
8. Replace `<password>` with your actual password
9. Add `/medicare` before the `?` in the connection string

Example:
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/medicare?retryWrites=true&w=majority
```

---

## File Location

Your `.env` file should be here:
```
D:\MediCare Project\Medicare\backend\.env
```

NOT here:
```
D:\MediCare Project\Medicare\.env  ❌ (wrong location)
```

---

## Still Having Issues?

1. Check file name is exactly `.env` (no extension)
2. Check file is in `backend/` folder
3. Check no typos in connection string
4. For Atlas: Verify username, password, and cluster name
5. Restart backend server after creating file

