import Category from '../models/Category.js';

/**
 * @route   GET /api/categories
 * @desc    Get all categories for logged in user
 * @access  Private
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category
 * @access  Private
 */
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Private
 */
export const createCategory = async (req, res) => {
  try {
    const { name, color, icon } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Please provide a category name' });
    }

    // Check if category already exists for this user
    const categoryExists = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      user: req.user._id,
    });

    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      color: color || '#6366f1',
      icon: icon || '📁',
      user: req.user._id,
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private
 */
export const updateCategory = async (req, res) => {
  try {
    let category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if new name conflicts with existing category
    if (req.body.name && req.body.name !== category.name) {
      const categoryExists = await Category.findOne({
        name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
        user: req.user._id,
        _id: { $ne: req.params.id },
      });

      if (categoryExists) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(category);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Private
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category is default (you might want to prevent deletion of default categories)
    if (category.isDefault) {
      return res.status(400).json({ message: 'Cannot delete default category' });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

