import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';

/**
 * @route   GET /api/budgets
 * @desc    Get budget for current month
 * @access  Private
 */
export const getBudget = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let budget = await Budget.findOne({
      user: req.user._id,
      month,
      year,
    }).populate('categoryBudgets.category', 'name color icon');

    if (!budget) {
      // Create default budget if doesn't exist
      budget = await Budget.create({
        user: req.user._id,
        monthlyBudget: 0,
        categoryBudgets: [],
        month,
        year,
      });
    }

    // Calculate current spending
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    });

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate category-wise spending
    const categorySpending = {};
    expenses.forEach(exp => {
      const catId = exp.category.toString();
      categorySpending[catId] = (categorySpending[catId] || 0) + exp.amount;
    });

    // Add spending info to category budgets
    const categoryBudgetsWithSpending = budget.categoryBudgets.map(cb => {
      const catId = cb.category._id.toString();
      const spent = categorySpending[catId] || 0;
      return {
        ...cb.toObject(),
        spent,
        remaining: cb.limit - spent,
        isExceeded: spent > cb.limit,
      };
    });

    res.json({
      ...budget.toObject(),
      categoryBudgets: categoryBudgetsWithSpending,
      totalSpent,
      remainingBudget: budget.monthlyBudget - totalSpent,
      isExceeded: totalSpent > budget.monthlyBudget,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   POST /api/budgets
 * @desc    Create or update budget
 * @access  Private
 */
export const createOrUpdateBudget = async (req, res) => {
  try {
    const { monthlyBudget, categoryBudgets } = req.body;

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let budget = await Budget.findOne({
      user: req.user._id,
      month,
      year,
    });

    if (budget) {
      // Update existing budget
      if (monthlyBudget !== undefined) {
        budget.monthlyBudget = monthlyBudget;
      }
      if (categoryBudgets) {
        budget.categoryBudgets = categoryBudgets;
      }
      await budget.save();
    } else {
      // Create new budget
      budget = await Budget.create({
        user: req.user._id,
        monthlyBudget: monthlyBudget || 0,
        categoryBudgets: categoryBudgets || [],
        month,
        year,
      });
    }

    const populatedBudget = await Budget.findById(budget._id).populate(
      'categoryBudgets.category',
      'name color icon'
    );

    res.json(populatedBudget);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   PUT /api/budgets
 * @desc    Update budget
 * @access  Private
 */
export const updateBudget = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let budget = await Budget.findOne({
      user: req.user._id,
      month,
      year,
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (req.body.monthlyBudget !== undefined) {
      budget.monthlyBudget = req.body.monthlyBudget;
    }

    if (req.body.categoryBudgets) {
      budget.categoryBudgets = req.body.categoryBudgets;
    }

    await budget.save();

    const populatedBudget = await Budget.findById(budget._id).populate(
      'categoryBudgets.category',
      'name color icon'
    );

    res.json(populatedBudget);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};

