# Expense Management System - Setup Guide

This guide will help you set up and run the Expense Management System locally.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB Atlas Account** (Free tier works) - [Sign Up](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** (comes with Node.js)

## Step 1: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier M0)
4. Create a database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Remember the username and password
5. Whitelist your IP:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" for development (0.0.0.0/0)
6. Get your connection string:
   - Go to "Clusters" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `expense_management` (or your preferred database name)

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/expense_management?retryWrites=true&w=majority
```
<!-- mongodb+srv://admin:admin321@expense.sngxtxe.mongodb.net/?appName=Expense -->
## Step 2: Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Important:** 
- Replace `your_mongodb_connection_string_here` with your actual MongoDB connection string from Step 1
- Replace `your_super_secret_jwt_key_change_this_in_production` with a random secret string (you can generate one using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- Cloudinary is optional (for image uploads). You can leave those fields empty for now.

4. Start the backend server:
```bash
# Development mode (with auto-reload)
npm run dev

# OR Production mode
npm start
```

The server should start on `http://localhost:5000`

5. (Optional) Seed sample data:
```bash
npm run seed
```

This will create:
- A test user (email: `test@example.com`, password: `password123`)
- Default categories (Food, Travel, Rent, Shopping, Medical)
- Sample expenses and income
- Sample budget

## Step 3: Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend should start on `http://localhost:5173` (or another port if 5173 is busy)

## Step 4: Access the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Register a new account or use the test account:
   - Email: `test@example.com`
   - Password: `password123` (if you ran the seed script)

## Troubleshooting

### Backend Issues

**Error: Cannot connect to MongoDB**
- Verify your MongoDB connection string is correct
- Check that your IP is whitelisted in MongoDB Atlas
- Ensure your database user password is correctly encoded (replace special characters with URL encoding)

**Error: Port 5000 already in use**
- Change the PORT in backend/.env to another port (e.g., 5001)
- Update VITE_API_URL in frontend/.env accordingly

**Error: JWT_SECRET not defined**
- Make sure your `.env` file exists in the backend directory
- Check that JWT_SECRET is set in the `.env` file

### Frontend Issues

**Error: Cannot connect to backend API**
- Verify the backend server is running
- Check that VITE_API_URL in frontend/.env matches your backend URL
- Check browser console for CORS errors (should not happen as CORS is enabled)

**Error: Module not found**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### Common Issues

**CORS Errors**
- Make sure backend is running on the port specified in frontend/.env
- Backend has CORS enabled for all origins (development only)

**Authentication Issues**
- Clear browser localStorage
- Try logging out and logging back in
- Check that JWT_SECRET is set correctly

## Production Deployment

For production deployment:

1. **Backend:**
   - Set `NODE_ENV=production` in `.env`
   - Use a strong, random `JWT_SECRET`
   - Use environment variables for all secrets
   - Consider using a process manager like PM2
   - Set up proper CORS origins (not `*`)

2. **Frontend:**
   - Build for production: `npm run build`
   - Serve the `dist` folder using a web server (nginx, Apache, etc.)
   - Update `VITE_API_URL` to your production API URL

3. **Security:**
   - Never commit `.env` files
   - Use HTTPS in production
   - Set up proper firewall rules
   - Use MongoDB Atlas IP whitelisting
   - Regularly update dependencies

## Features Overview

- ✅ User Authentication (Register, Login, JWT)
- ✅ Expense Management (CRUD operations)
- ✅ Income Management (CRUD operations)
- ✅ Category Management (Create, edit, delete categories)
- ✅ Budget Management (Monthly and category-wise budgets)
- ✅ Dashboard with financial overview
- ✅ Search and Filter (Date range, category, payment mode)
- ✅ Dark/Light Mode
- ✅ Responsive Design (Mobile + Desktop)
- ✅ Notifications and Alerts

## API Documentation

The API is RESTful and follows these patterns:

- `GET /api/resource` - Get all resources
- `GET /api/resource/:id` - Get single resource
- `POST /api/resource` - Create resource
- `PUT /api/resource/:id` - Update resource
- `DELETE /api/resource/:id` - Delete resource

All routes except `/api/auth/register` and `/api/auth/login` require authentication.

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Check server logs for detailed error messages
4. Ensure MongoDB connection is working

Enjoy using the Expense Management System! 🎉

