# Admin Account Credentials

## ✅ Admin User Created

An admin account has been successfully created in the database.

## 🔐 Login Credentials

```
Email:    admin@medicare.com
Password: Admin@123
Name:     MediCare Admin
Role:     Admin
```

## 📝 How to Login

1. **Start the application** (if not already running):
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`

2. **Navigate to login page**: http://localhost:8080/login

3. **Enter credentials**:
   - Email: `admin@medicare.com`
   - Password: `Admin@123`

4. **You will be redirected to**: `/admin/dashboard`

## 🔄 Recreate Admin Account

If you need to recreate the admin account, run:

```bash
cd backend
node scripts/createAdmin.js
```

The script will:
- Check if admin already exists
- Create admin if it doesn't exist
- Update password if admin exists but password is different
- Display credentials after creation

## 🛡️ Security Notes

- **Change the password** after first login for production use
- The admin account has full access to:
  - Approve/reject doctor registrations
  - Block/unblock users
  - View all appointments
  - Access system statistics
  - Manage all users

## 📋 Admin Capabilities

As an admin, you can:
- ✅ View dashboard with system statistics
- ✅ Approve/reject doctor registrations
- ✅ Block/unblock doctors and patients
- ✅ View all appointments across the system
- ✅ Monitor system activity
- ✅ Access admin logs

## 🔧 Troubleshooting

**Can't login?**
- Verify backend is running
- Check MongoDB connection
- Ensure email and password are correct (case-sensitive)
- Clear browser cache/localStorage

**Admin not found?**
- Run the create script again: `node scripts/createAdmin.js`
- Check MongoDB connection
- Verify the database name is `medicare`

