import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an income title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    source: {
      type: String,
      enum: ['Salary', 'Freelance', 'Business', 'Investment', 'Other'],
      default: 'Salary',
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
incomeSchema.index({ user: 1, date: -1 });

const Income = mongoose.model('Income', incomeSchema);

export default Income;

