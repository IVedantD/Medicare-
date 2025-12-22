# How to Create Admin Account

## Option 1: Register Through Frontend (Easiest)

1. **Go to Registration Page**: http://localhost:8080/register
2. **Fill in the form**:
   - Name: `Admin User`
   - Email: `admin@medicare.com` (or any email)
   - Password: `password123`
   - Role: Select **Admin**
3. **Click Register**
4. **Login** with the credentials you just created

## Option 2: Create via API (Using Postman/cURL)

### Using cURL:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@medicare.com",
    "password": "password123",
    "role": "admin"
  }'
```

### Using Postman:
1. Method: `POST`
2. URL: `http://localhost:5000/api/auth/register`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "name": "Admin User",
  "email": "admin@medicare.com",
  "password": "password123",
  "role": "admin"
}
```

## Option 3: Use Mock Account (When Backend is Down)

If the backend is not running, you can use the mock admin account:

- **Email**: `admin@demo.com`
- **Password**: `password123`

The app will automatically use mock authentication when the backend is unavailable.

## Option 4: Create via MongoDB (Direct Database)

If you have MongoDB access:

```javascript
// In MongoDB shell or Compass
use medicare

db.users.insertOne({
  name: "Admin User",
  email: "admin@medicare.com",
  password: "$2a$10$...", // Hashed password (use bcrypt)
  role: "admin",
  isActive: true,
  createdAt: new Date()
})
```

**Note**: You'll need to hash the password using bcrypt. It's easier to use Option 1 or 2.

## Verify Admin Account

After creating, test login:
- Email: `admin@medicare.com` (or the email you used)
- Password: `password123` (or the password you set)

You should be redirected to `/admin/dashboard`.

## Troubleshooting

**"Invalid email or password" error:**
- Make sure backend is running
- Check if account exists in database
- Verify email and password are correct
- Try using mock account: `admin@demo.com` / `password123`

**Account created but can't login:**
- Check MongoDB connection
- Verify user was saved in database
- Check browser console for errors
- Clear browser localStorage and try again

