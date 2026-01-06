import Expense from '../models/Expense.js';

/**
 * @route   GET /api/expenses
 * @desc    Get all expenses for logged in user
 * @access  Private
 */
export const getExpenses = async (req, res) => {
  try {
    const {
      category,
      paymentMode,
      startDate,
      endDate,
      search,
      sort = '-date',
      page = 1,
      limit = 50,
    } = req.query;

    // Build query
    const query = { user: req.user._id };

    if (category) {
      query.category = category;
    }

    if (paymentMode) {
      query.paymentMode = paymentMode;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get expenses
    const expenses = await Expense.find(query)
      .populate('category', 'name color icon')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Expense.countDocuments(query);

    res.json({
      expenses,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/expenses/:id
 * @desc    Get single expense
 * @access  Private
 */
export const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('category', 'name color icon');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   POST /api/expenses
 * @desc    Create new expense
 * @access  Private
 */
export const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, paymentMode, notes, receipt } = req.body;

    // Validation
    if (!title || !amount || !category) {
      return res.status(400).json({ message: 'Please provide title, amount, and category' });
    }

    const expense = await Expense.create({
      title,
      amount,
      category,
      date: date || new Date(),
      paymentMode: paymentMode || 'Cash',
      notes: notes || '',
      receipt: receipt || '',
      user: req.user._id,
    });

    const populatedExpense = await Expense.findById(expense._id).populate(
      'category',
      'name color icon'
    );

    res.status(201).json(populatedExpense);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   PUT /api/expenses/:id
 * @desc    Update expense
 * @access  Private
 */
export const updateExpense = async (req, res) => {
  try {
    let expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Update fields
    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name color icon');

    res.json(expense);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete expense
 * @access  Private
 */
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/expenses/stats/summary
 * @desc    Get expense statistics
 * @access  Private
 */
export const getExpenseStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Total expenses
    const totalExpenses = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Expenses by category
    const expensesByCategory = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Populate category names
    const Category = (await import('../models/Category.js')).default;
    const categories = await Category.find({ _id: { $in: expensesByCategory.map(e => e._id) } });

    const expensesByCategoryWithNames = expensesByCategory.map(exp => {
      const category = categories.find(c => c._id.toString() === exp._id.toString());
      return {
        categoryId: exp._id,
        categoryName: category?.name || 'Unknown',
        categoryColor: category?.color || '#6366f1',
        total: exp.total,
        count: exp.count,
      };
    });

    res.json({
      totalExpenses: totalExpenses[0]?.total || 0,
      expensesByCategory: expensesByCategoryWithNames,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/expenses/stats/monthly
 * @desc    Get monthly expense statistics for last 6 months
 * @access  Private
 */
export const getMonthlyExpenseStats = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    
    const query = {
      user: req.user._id,
      date: { $gte: startDate },
    };

    // Aggregate expenses by month
    const monthlyExpenses = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedData = monthlyExpenses.map(item => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      total: item.total,
      label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    }));

    res.json({ monthlyExpenses: formattedData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

