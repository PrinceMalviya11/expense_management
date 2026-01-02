import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    monthlyBudget: {
      type: Number,
      required: [true, 'Please provide a monthly budget'],
      min: [0, 'Budget must be greater than or equal to 0'],
      default: 0,
    },
    categoryBudgets: [
      {
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Category',
          required: true,
        },
        limit: {
          type: Number,
          required: true,
          min: [0, 'Category budget limit must be greater than or equal to 0'],
        },
      },
    ],
    month: {
      type: Number, // 1-12
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries and uniqueness
budgetSchema.index({ user: 1, year: 1, month: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;

