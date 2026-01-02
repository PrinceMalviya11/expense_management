import Income from '../models/Income.js';

/**
 * @route   GET /api/income
 * @desc    Get all income for logged in user
 * @access  Private
 */
export const getIncomes = async (req, res) => {
  try {
    const {
      source,
      startDate,
      endDate,
      search,
      sort = '-date',
      page = 1,
      limit = 50,
    } = req.query;

    // Build query
    const query = { user: req.user._id };

    if (source) {
      query.source = source;
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

    // Get incomes
    const incomes = await Income.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Income.countDocuments(query);

    res.json({
      incomes,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/income/:id
 * @desc    Get single income
 * @access  Private
 */
export const getIncome = async (req, res) => {
  try {
    const income = await Income.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    res.json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   POST /api/income
 * @desc    Create new income
 * @access  Private
 */
export const createIncome = async (req, res) => {
  try {
    const { title, amount, source, date, notes } = req.body;

    // Validation
    if (!title || !amount) {
      return res.status(400).json({ message: 'Please provide title and amount' });
    }

    const income = await Income.create({
      title,
      amount,
      source: source || 'Salary',
      date: date || new Date(),
      notes: notes || '',
      user: req.user._id,
    });

    res.status(201).json(income);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   PUT /api/income/:id
 * @desc    Update income
 * @access  Private
 */
export const updateIncome = async (req, res) => {
  try {
    let income = await Income.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    income = await Income.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(income);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   DELETE /api/income/:id
 * @desc    Delete income
 * @access  Private
 */
export const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    await Income.findByIdAndDelete(req.params.id);

    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/income/stats/summary
 * @desc    Get income statistics
 * @access  Private
 */
export const getIncomeStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Total income
    const totalIncome = await Income.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Income by source
    const incomeBySource = await Income.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$source',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({
      totalIncome: totalIncome[0]?.total || 0,
      incomeBySource,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

