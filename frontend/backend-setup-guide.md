# Quick Backend Setup Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB installed (or MongoDB Atlas account)

## Step 1: Create Backend Folder

```bash
# In your project root (clinicflow-ui)
mkdir backend
cd backend
```

## Step 2: Initialize Backend Project

```bash
npm init -y
```

## Step 3: Install Dependencies

```bash
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install -D nodemon
```

## Step 4: Update package.json Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

## Step 5: Create Basic Server File

Create `backend/server.js`:

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

// Routes will go here
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Step 6: Create .env File

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medicare
JWT_SECRET=your_secret_key_here_change_this
JWT_EXPIRE=7d
```

## Step 7: Test Backend

```bash
npm run dev
```

Visit: http://localhost:5000/api/health

You should see: `{ "status": "OK", "message": "Backend is running" }`

## Next: Follow BACKEND_INTEGRATION.md for step-by-step API implementation

