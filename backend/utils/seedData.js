import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Budget from '../models/Budget.js';

dotenv.config();

const defaultCategories = [
  { name: 'Food', color: '#ef4444', icon: '🍔', isDefault: true },
  { name: 'Travel', color: '#3b82f6', icon: '✈️', isDefault: true },
  { name: 'Rent', color: '#8b5cf6', icon: '🏠', isDefault: true },
  { name: 'Shopping', color: '#ec4899', icon: '🛍️', isDefault: true },
  { name: 'Medical', color: '#10b981', icon: '🏥', isDefault: true },
];

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await Category.deleteMany({});
    // await Expense.deleteMany({});
    // await Income.deleteMany({});
    // await Budget.deleteMany({});

    // Create a test user
    const testUser = await User.findOne({ email: 'test@example.com' });

    if (!testUser) {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      });

      console.log('Test user created:', user.email);

      // Create default categories for the user
      const categories = [];
      for (const catData of defaultCategories) {
        const category = await Category.create({
          ...catData,
          user: user._id,
        });
        categories.push(category);
        console.log('Category created:', category.name);
      }

      // Create some sample expenses
      const sampleExpenses = [
        {
          title: 'Lunch at Restaurant',
          amount: 25.50,
          category: categories[0]._id, // Food
          date: new Date(),
          paymentMode: 'Credit Card',
          notes: 'Delicious meal',
          user: user._id,
        },
        {
          title: 'Uber Ride',
          amount: 15.00,
          category: categories[1]._id, // Travel
          date: new Date(),
          paymentMode: 'UPI',
          notes: 'Airport ride',
          user: user._id,
        },
        {
          title: 'Monthly Rent',
          amount: 1200.00,
          category: categories[2]._id, // Rent
          date: new Date(),
          paymentMode: 'Net Banking',
          notes: 'December rent',
          user: user._id,
        },
      ];

      for (const expenseData of sampleExpenses) {
        const expense = await Expense.create(expenseData);
        console.log('Expense created:', expense.title);
      }

      // Create sample income
      const sampleIncome = await Income.create({
        title: 'Monthly Salary',
        amount: 5000.00,
        source: 'Salary',
        date: new Date(),
        notes: 'December salary',
        user: user._id,
      });
      console.log('Income created:', sampleIncome.title);

      // Create budget
      const now = new Date();
      const budget = await Budget.create({
        user: user._id,
        monthlyBudget: 3000.00,
        categoryBudgets: [
          { category: categories[0]._id, limit: 500.00 },
          { category: categories[1]._id, limit: 300.00 },
          { category: categories[2]._id, limit: 1200.00 },
        ],
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      console.log('Budget created');

      console.log('\n✅ Seed data created successfully!');
      console.log('\nTest User Credentials:');
      console.log('Email: test@example.com');
      console.log('Password: password123');
    } else {
      console.log('Test user already exists. Skipping seed data creation.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

