# Authentication API Testing Guide

## Endpoints Implemented

### 1. Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient",
  "phone": "+1234567890"
}
```

**For Doctor:**
```json
{
  "name": "Dr. Sarah Wilson",
  "email": "doctor@example.com",
  "password": "password123",
  "role": "doctor",
  "phone": "+1234567890",
  "specialization": "Cardiology"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient",
    "phone": "+1234567890"
  }
}
```

### 2. Login User
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

### 3. Get Profile
**GET** `/api/auth/profile`
**Requires:** Authentication header

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient",
    "phone": "+1234567890"
  }
}
```

### 4. Update Profile
**PUT** `/api/auth/profile`
**Requires:** Authentication header

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+9876543210",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

### 5. Logout
**POST** `/api/auth/logout`
**Requires:** Authentication header

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "patient"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile (replace TOKEN with actual token)
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

## Testing with Postman

1. **Register**: POST to `http://localhost:5000/api/auth/register`
2. **Login**: POST to `http://localhost:5000/api/auth/login`
3. **Get Profile**: GET to `http://localhost:5000/api/auth/profile`
   - Add header: `Authorization: Bearer <token>`
4. **Update Profile**: PUT to `http://localhost:5000/api/auth/profile`
   - Add header: `Authorization: Bearer <token>`

## Frontend Integration

The frontend is already configured to use these endpoints:
- `src/services/api.ts` - API service layer
- `src/context/AuthContext.tsx` - Auth context with login/register
- All hooks are ready to use the API

## Error Responses

All endpoints return consistent error format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

Common status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required/invalid)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

