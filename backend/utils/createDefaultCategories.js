import Category from '../models/Category.js';

const defaultCategories = [
  { name: 'Food', color: '#ef4444', icon: '🍔', isDefault: true },
  { name: 'Travel', color: '#3b82f6', icon: '✈️', isDefault: true },
  { name: 'Rent', color: '#8b5cf6', icon: '🏠', isDefault: true },
  { name: 'Shopping', color: '#ec4899', icon: '🛍️', isDefault: true },
  { name: 'Medical', color: '#10b981', icon: '🏥', isDefault: true },
];

/**
 * Create default categories for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Created categories
 */
export const createDefaultCategories = async (userId) => {
  try {
    const categories = [];
    for (const catData of defaultCategories) {
      // Check if category already exists for this user
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${catData.name}$`, 'i') },
        user: userId,
      });

      if (!existing) {
        const category = await Category.create({
          ...catData,
          user: userId,
        });
        categories.push(category);
      }
    }
    return categories;
  } catch (error) {
    console.error('Error creating default categories:', error);
    throw error;
  }
};

export default createDefaultCategories;

