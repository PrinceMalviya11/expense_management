# Quick Start Guide - Expense Management System

This is a beginner-friendly step-by-step guide to get your Expense Management System up and running.

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- ✅ **Node.js installed** (v14 or higher)
  - Check: Open terminal/command prompt and type `node --version`
  - Download: https://nodejs.org/ if not installed

- ✅ **MongoDB Atlas account** (free)
  - Sign up: https://www.mongodb.com/cloud/atlas
  - Free tier is sufficient

- ✅ **Code Editor** (VS Code recommended)

---

## 🚀 Step-by-Step Setup

### STEP 1: MongoDB Atlas Setup (5 minutes)

1. **Sign up/Login to MongoDB Atlas**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Create a free account or login

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "M0 FREE" tier
   - Select a cloud provider and region (closest to you)
   - Click "Create"

3. **Create Database User**
   - Wait for cluster to finish creating (2-3 minutes)
   - Click "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `admin` (or your choice)
   - Password: Create a strong password (save it!)
   - Click "Add User"

4. **Allow Network Access**
   - Click "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String**
   - Click "Clusters" → Click "Connect" button
   - Choose "Connect your application"
   - Copy the connection string
   - Example: `mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - **IMPORTANT**: Replace `<password>` with your actual password
   - Add database name: Change `/?` to `/expense_management?`
   - Final should look like: `mongodb+srv://admin:yourpassword@cluster0.xxxxx.mongodb.net/expense_management?retryWrites=true&w=majority`

---

### STEP 2: Backend Setup (10 minutes)

1. **Open Terminal in Project Folder**
   - Navigate to: `C:\Users\HP\Desktop\Expense Management`
   - Open terminal here (Right-click → "Open in Terminal" or "Git Bash Here")

2. **Go to Backend Folder**
   ```bash
   cd backend
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```
   - Wait for installation (2-5 minutes)
   - You'll see many packages being installed

4. **Create .env File**
   - Create a new file named `.env` in the `backend` folder
   - Copy this template and fill in your values:

   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://admin:yourpassword@cluster0.xxxxx.mongodb.net/expense_management?retryWrites=true&w=majority
   JWT_SECRET=my_super_secret_jwt_key_123456789
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

   **How to fill:**
   - `MONGODB_URI`: Paste your connection string from Step 1
   - `JWT_SECRET`: Generate one using this command in terminal:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
     Copy the generated string and paste it as JWT_SECRET
   - Leave Cloudinary fields empty for now

5. **Start Backend Server**
   ```bash
   npm run dev
   ```

   **Success looks like:**
   ```
   MongoDB Connected: cluster0.xxxxx.mongodb.net
   Server running on port 5000
   ```

   ✅ **Keep this terminal window open!** (Don't close it)

---

### STEP 3: Frontend Setup (5 minutes)

1. **Open NEW Terminal Window**
   - Keep backend terminal running
   - Open a new terminal in project folder

2. **Go to Frontend Folder**
   ```bash
   cd frontend
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```
   - Wait for installation (2-5 minutes)

4. **Create .env File**
   - Create a new file named `.env` in the `frontend` folder
   - Add this:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start Frontend Server**
   ```bash
   npm run dev
   ```

   **Success looks like:**
   ```
   VITE v5.0.8  ready in 500 ms
   ➜  Local:   http://localhost:5173/
   ```

   ✅ **Keep this terminal window open too!**

---

### STEP 4: Open the Application (1 minute)

1. **Open Browser**
   - Go to: `http://localhost:5173`
   - You should see the login page!

2. **Create Your Account**
   - Click "Sign up" or go to `/register`
   - Fill in:
     - Name: Your name
     - Email: Your email
     - Password: Choose a password (min 6 characters)
   - Click "Sign Up"
   - You'll be automatically logged in!

3. **Optional: Seed Test Data**
   - If you want sample data, go to backend terminal
   - Press `Ctrl+C` to stop the server
   - Run: `npm run seed`
   - This creates a test user (email: `test@example.com`, password: `password123`)
   - Restart server: `npm run dev`

---

## 🎯 How to Use the Application

### Dashboard
- **View**: Total Income, Total Expenses, Remaining Balance
- **See**: Recent transactions
- **Quick Actions**: Add Expense, Add Income, Set Budget

### Expenses Page
- **Add Expense**: Click "Add Expense" button
  - Fill: Title, Amount, Category, Date, Payment Mode, Notes
  - Click "Add"
- **Filter**: Use filters to find specific expenses
  - By date range
  - By category
  - By payment mode
  - Search by keyword
- **Edit**: Click edit icon (pencil) on any expense
- **Delete**: Click delete icon (trash) on any expense

### Income Page
- **Add Income**: Click "Add Income" button
  - Fill: Title, Amount, Source, Date, Notes
  - Click "Add"
- **Filter**: Filter by source, date range, or search

### Categories Page
- **View**: All your expense categories
- **Add Category**: Click "Add Category"
  - Choose icon, color, and name
- **Edit**: Click edit icon
- **Delete**: Click delete icon (default categories can't be deleted)

### Budget Page
- **Set Monthly Budget**: Click "Edit Budget"
  - Enter your monthly budget amount
  - Set category-wise limits
  - Click "Save Budget"
- **View Progress**: See how much you've spent vs. budget
- **Alerts**: Red warnings if you exceed budget

### Profile Page
- **Update Profile**: Change your name and email
- **Change Password**: Update your password

---

## 🛠️ Troubleshooting

### Backend Won't Start

**Error: "Cannot connect to MongoDB"**
- ✅ Check your MongoDB connection string in `.env`
- ✅ Make sure password is correct
- ✅ Check Network Access in MongoDB Atlas (IP whitelist)
- ✅ Make sure you added `/expense_management` before `?` in connection string

**Error: "Port 5000 already in use"**
- Change PORT in backend/.env to 5001
- Update VITE_API_URL in frontend/.env to `http://localhost:5001/api`

**Error: "JWT_SECRET not defined"**
- Make sure `.env` file exists in backend folder
- Check file is named exactly `.env` (not `.env.txt`)

### Frontend Won't Start

**Error: "Cannot connect to backend API"**
- ✅ Make sure backend is running (check backend terminal)
- ✅ Check VITE_API_URL in frontend/.env matches backend port
- ✅ Try refreshing the browser

**Error: "Module not found"**
- Delete `node_modules` folder in frontend
- Run `npm install` again

### Application Issues

**Can't Login/Register**
- Check backend terminal for errors
- Clear browser localStorage (F12 → Application → Local Storage → Clear)
- Make sure backend is running

**Page Shows Blank/Errors**
- Open browser console (F12)
- Check for error messages
- Make sure both backend and frontend are running

---

## 📝 Quick Commands Reference

### Backend Commands
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start development server
npm start            # Start production server
npm run seed         # Seed sample data
```

### Frontend Commands
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
```

---

## ✅ Success Checklist

- [ ] MongoDB Atlas account created
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string copied
- [ ] Backend `.env` file created with correct values
- [ ] Backend dependencies installed
- [ ] Backend server running (port 5000)
- [ ] Frontend `.env` file created
- [ ] Frontend dependencies installed
- [ ] Frontend server running (port 5173)
- [ ] Application opens in browser
- [ ] Can register/login
- [ ] Can add expenses/income

---

## 🎉 You're All Set!

Your Expense Management System is now running! 

**Remember:**
- Keep both terminal windows open (backend + frontend)
- Backend runs on: http://localhost:5000
- Frontend runs on: http://localhost:5173
- Always access the app through: http://localhost:5173

**Need Help?**
- Check the error messages in terminal
- Check browser console (F12) for frontend errors
- Refer to SETUP.md for detailed troubleshooting

Happy expense tracking! 💰

