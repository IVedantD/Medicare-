# Environment Variables Setup

Create a `.env` file in the `backend` folder with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# MongoDB Configuration
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/medicare

# Or MongoDB Atlas (replace with your connection string):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medicare?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=medicare_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Other Configuration
BCRYPT_ROUNDS=10
```

## Quick Setup

1. Create `.env` file in `backend` folder
2. Copy the content above
3. Update `MONGODB_URI` with your MongoDB connection string
4. Update `JWT_SECRET` with a secure random string

## MongoDB Options

### Option 1: Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/medicare
```

### Option 2: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Replace username and password:
```env
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/medicare?retryWrites=true&w=majority
```

