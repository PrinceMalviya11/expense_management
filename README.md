# Expense Management System

A complete, production-ready Expense Management System built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- 🔐 **User Authentication** - JWT-based authentication with secure password hashing
- 💰 **Expense Management** - Add, edit, delete, and track expenses with categories
- 💵 **Income Management** - Track income from multiple sources
- 📊 **Budget Management** - Set monthly and category-wise budgets
- 📈 **Dashboard & Analytics** - Visual overview of finances
- 🔍 **Search & Filter** - Filter by date, category, payment mode, and search by keywords
- 🎨 **Dark & Light Mode** - Beautiful UI with theme switching
- 📱 **Responsive Design** - Works seamlessly on mobile and desktop
- 👤 **User Profile** - Manage your profile and settings
- 🔔 **Notifications** - Budget alerts and reminders

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (MongoDB Atlas)
- Mongoose
- JWT Authentication
- bcryptjs

### Frontend
- React (Vite)
- React Router
- Context API
- HTML, CSS, JavaScript

## Project Structure

```
expense-management/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Start the backend server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

5. (Optional) Seed sample data:
```bash
npm run seed
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173` (or the port shown in the terminal)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Expenses
- `GET /api/expenses` - Get all expenses (Protected)
- `GET /api/expenses/:id` - Get single expense (Protected)
- `POST /api/expenses` - Create expense (Protected)
- `PUT /api/expenses/:id` - Update expense (Protected)
- `DELETE /api/expenses/:id` - Delete expense (Protected)
- `GET /api/expenses/stats/summary` - Get expense statistics (Protected)

### Income
- `GET /api/income` - Get all income (Protected)
- `POST /api/income` - Create income (Protected)
- `PUT /api/income/:id` - Update income (Protected)
- `DELETE /api/income/:id` - Delete income (Protected)
- `GET /api/income/stats/summary` - Get income statistics (Protected)

### Categories
- `GET /api/categories` - Get all categories (Protected)
- `POST /api/categories` - Create category (Protected)
- `PUT /api/categories/:id` - Update category (Protected)
- `DELETE /api/categories/:id` - Delete category (Protected)

### Budgets
- `GET /api/budgets` - Get current month budget (Protected)
- `POST /api/budgets` - Create or update budget (Protected)

### Users
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update profile (Protected)
- `PUT /api/users/password` - Update password (Protected)
- `GET /api/users/all` - Get all users (Admin only)
- `PUT /api/users/:id/status` - Update user status (Admin only)

## Default Test User

After running seed data:
- Email: `test@example.com`
- Password: `password123`

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT expiration time
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name (for image uploads)
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

## Features in Detail

### Expense Management
- Add expenses with title, amount, category, date, payment mode, and notes
- Upload receipt images (Cloudinary integration)
- Filter by date range, category, payment mode
- Search by keywords
- Sort by amount and date

### Budget Management
- Set monthly budget
- Set category-wise budget limits
- Real-time budget tracking
- Overspending alerts

### Dashboard
- Total income display
- Total expense display
- Remaining balance calculation
- Recent transactions list
- Category-wise breakdown

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes
- Input validation
- Error handling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Support

For support, please open an issue in the repository.

