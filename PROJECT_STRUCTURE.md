# Project Structure

This document outlines the complete structure of the Expense Management System.

## Backend Structure

```
backend/
├── config/
│   └── db.js                    # MongoDB connection configuration
├── controllers/
│   ├── authController.js        # Authentication (register, login, getMe)
│   ├── budgetController.js      # Budget management
│   ├── categoryController.js    # Category CRUD operations
│   ├── expenseController.js     # Expense CRUD operations + stats
│   ├── incomeController.js      # Income CRUD operations + stats
│   └── userController.js        # User profile management
├── middleware/
│   └── authMiddleware.js        # JWT authentication middleware
├── models/
│   ├── Budget.js                # Budget schema (monthly + category budgets)
│   ├── Category.js              # Category schema
│   ├── Expense.js               # Expense schema
│   ├── Income.js                # Income schema
│   └── User.js                  # User schema with password hashing
├── routes/
│   ├── authRoutes.js            # Authentication routes
│   ├── budgetRoutes.js          # Budget routes
│   ├── categoryRoutes.js        # Category routes
│   ├── expenseRoutes.js         # Expense routes
│   ├── incomeRoutes.js          # Income routes
│   └── userRoutes.js            # User routes
├── utils/
│   ├── createDefaultCategories.js  # Utility to create default categories
│   ├── generateToken.js         # JWT token generation
│   └── seedData.js              # Seed data script
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore file
├── package.json                 # Backend dependencies
└── server.js                    # Express server entry point
```

## Frontend Structure

```
frontend/
├── public/                      # Static assets
├── src/
│   ├── components/
│   │   ├── CategoryModal.jsx    # Category add/edit modal
│   │   ├── ExpenseModal.jsx     # Expense add/edit modal
│   │   ├── IncomeModal.jsx      # Income add/edit modal
│   │   ├── Layout.jsx           # Main layout with sidebar
│   │   ├── Layout.css           # Layout styles
│   │   ├── Modal.css            # Modal component styles
│   │   ├── Notification.jsx     # Notification component
│   │   ├── Notification.css     # Notification styles
│   │   └── PrivateRoute.jsx     # Protected route wrapper
│   ├── contexts/
│   │   ├── AuthContext.jsx      # Authentication context
│   │   ├── NotificationContext.jsx  # Notification context
│   │   └── ThemeContext.jsx     # Dark/light theme context
│   ├── pages/
│   │   ├── Auth.css             # Authentication page styles
│   │   ├── Budget.css           # Budget page styles
│   │   ├── Budget.jsx           # Budget management page
│   │   ├── Categories.css       # Categories page styles
│   │   ├── Categories.jsx       # Category management page
│   │   ├── Dashboard.css        # Dashboard styles
│   │   ├── Dashboard.jsx        # Dashboard page
│   │   ├── Expenses.css         # Expenses page styles
│   │   ├── Expenses.jsx         # Expense management page
│   │   ├── Income.css           # Income page styles
│   │   ├── Income.jsx           # Income management page
│   │   ├── Login.jsx            # Login page
│   │   ├── Profile.css          # Profile page styles
│   │   ├── Profile.jsx          # User profile page
│   │   └── Register.jsx         # Registration page
│   ├── services/
│   │   └── api.js               # Axios API client with interceptors
│   ├── styles/
│   │   ├── App.css              # App-level styles
│   │   └── index.css            # Global styles + theme variables
│   ├── utils/
│   │   └── format.js            # Utility functions (currency, date formatting)
│   ├── App.jsx                  # Main app component with routing
│   └── main.jsx                 # React entry point
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore file
├── index.html                   # HTML template
├── package.json                 # Frontend dependencies
└── vite.config.js               # Vite configuration
```

## Key Features by Component

### Authentication
- **Backend**: JWT-based authentication with bcrypt password hashing
- **Frontend**: Login/Register pages with protected routes
- **Security**: Token stored in localStorage, auto-logout on 401

### Expense Management
- **Backend**: Full CRUD + filtering, sorting, search, statistics
- **Frontend**: List view with filters, add/edit modal, delete confirmation
- **Features**: Category assignment, payment mode, date, notes, receipt URL

### Income Management
- **Backend**: Full CRUD + filtering, sorting, search, statistics
- **Frontend**: List view with filters, add/edit modal
- **Features**: Income source, date, notes

### Category Management
- **Backend**: Full CRUD with user-specific categories
- **Frontend**: Grid view with icons and colors
- **Features**: Custom icons, colors, default categories

### Budget Management
- **Backend**: Monthly budget + category-wise budgets with spending tracking
- **Frontend**: Budget overview with progress bars, edit mode
- **Features**: Monthly budget limit, category limits, overspending alerts

### Dashboard
- **Backend**: Aggregated statistics (income, expenses, balance)
- **Frontend**: Summary cards, recent transactions, quick actions
- **Features**: Real-time calculations, month-wise filtering

### Theme System
- **Implementation**: CSS variables with data-theme attribute
- **Toggle**: Theme context with localStorage persistence
- **Themes**: Light and Dark modes

### Notifications
- **Implementation**: Context-based notification system
- **Types**: Success, error, warning, info
- **Features**: Auto-dismiss, manual close, toast-style display

## Data Flow

1. **User Registration/Login**
   - Frontend → Auth API → JWT token → localStorage
   - Default categories created automatically

2. **Protected Routes**
   - Request → Auth middleware → Verify JWT → Attach user to request

3. **Data Fetching**
   - Component → API service → Backend → Database → Response → Component state

4. **State Management**
   - React Context API for global state (Auth, Theme, Notifications)
   - Local component state for page-specific data

## Database Schema

### User
- name, email, password (hashed), role, isActive, avatar

### Category
- name, color, icon, user (reference), isDefault

### Expense
- title, amount, category (reference), date, paymentMode, notes, receipt, user (reference)

### Income
- title, amount, source, date, notes, user (reference)

### Budget
- user (reference), monthlyBudget, categoryBudgets[], month, year

## API Endpoints Summary

### Public Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Protected Routes (require JWT)
- `GET /api/auth/me` - Get current user
- `GET /api/expenses` - Get expenses (with filters)
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/stats/summary` - Get expense statistics
- `GET /api/income` - Get income (with filters)
- `POST /api/income` - Create income
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income
- `GET /api/income/stats/summary` - Get income statistics
- `GET /api/categories` - Get categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/budgets` - Get current month budget
- `POST /api/budgets` - Create/update budget
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Update password

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_EXPIRE` - JWT expiration time
- `CLOUDINARY_CLOUD_NAME` - (Optional) Cloudinary cloud name
- `CLOUDINARY_API_KEY` - (Optional) Cloudinary API key
- `CLOUDINARY_API_SECRET` - (Optional) Cloudinary API secret

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Authentication**: Token-based auth with expiration
3. **Protected Routes**: Middleware to verify JWT
4. **Input Validation**: Mongoose schema validation
5. **Error Handling**: Comprehensive error handling
6. **CORS**: Configured for frontend domain
7. **Environment Variables**: Secrets stored in .env files

## Responsive Design

- **Mobile First**: CSS Grid and Flexbox for responsive layouts
- **Breakpoints**: 768px for tablet/mobile transitions
- **Mobile Menu**: Hamburger menu for mobile navigation
- **Touch Friendly**: Appropriate button sizes and spacing

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features (requires modern browser)
- CSS Grid and Flexbox

