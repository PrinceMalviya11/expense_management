import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { formatCurrency } from '../utils/format';
import { FiTarget, FiAlertTriangle } from 'react-icons/fi';
import './Budget.css';

const Budget = () => {
  const [budget, setBudget] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    monthlyBudget: 0,
    categoryBudgets: [],
  });
  const { showNotification } = useNotification();

  // Define fetchCategories first using useCallback
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      // Don't show error notification for categories, just set empty array
    }
  }, []);

  // Define fetchBudget using useCallback
  const fetchBudget = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/budgets');
      setBudget(response.data);
      setFormData({
        monthlyBudget: response.data.monthlyBudget || 0,
        categoryBudgets: response.data.categoryBudgets || [],
      });
    } catch (error) {
      console.error('Budget fetch error:', error);
      // Set default budget if API fails
      setBudget({
        monthlyBudget: 0,
        categoryBudgets: [],
        totalSpent: 0,
        remainingBudget: 0,
        isExceeded: false,
      });
      setFormData({
        monthlyBudget: 0,
        categoryBudgets: [],
      });
      // Only show error if it's not a 404 (budget might not exist yet)
      if (error.response?.status !== 404) {
        showNotification(
          error.response?.data?.message || 'Failed to load budget',
          'error'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Initial data fetch
  useEffect(() => {
    fetchBudget();
    fetchCategories();
  }, [fetchBudget, fetchCategories]);

  // Refresh categories when entering edit mode
  useEffect(() => {
    if (editing) {
      fetchCategories();
    }
  }, [editing, fetchCategories]);

  // Listen for category updates from other pages (e.g., Categories page)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'categories-updated') {
        fetchCategories();
        // Clear the flag
        localStorage.removeItem('categories-updated');
      }
    };

    const handleFocus = () => {
      // Refresh categories when page comes into focus
      fetchCategories();
    };

    const handleCategoryUpdate = () => {
      fetchCategories();
    };

    // Listen for storage events (when categories are updated in another tab/page)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for focus events (when user switches back to this tab)
    window.addEventListener('focus', handleFocus);
    
    // Also listen for custom events (when categories are updated in same tab)
    window.addEventListener('categories-updated', handleCategoryUpdate);

    // Also listen for visibility change (when tab becomes visible)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchCategories();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('categories-updated', handleCategoryUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchCategories]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.post('/budgets', formData);
      showNotification('Budget updated successfully', 'success');
      setEditing(false);
      fetchBudget();
    } catch (error) {
      showNotification(
        error.response?.data?.message || 'Failed to save budget',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMonthlyBudgetChange = (e) => {
    setFormData({
      ...formData,
      monthlyBudget: parseFloat(e.target.value) || 0,
    });
  };

  const handleCategoryBudgetChange = (categoryId, value) => {
    const existing = formData.categoryBudgets.find((cb) => cb.category === categoryId);
    let updated;

    if (existing) {
      updated = formData.categoryBudgets.map((cb) =>
        cb.category === categoryId ? { ...cb, limit: parseFloat(value) || 0 } : cb
      );
    } else {
      updated = [...formData.categoryBudgets, { category: categoryId, limit: parseFloat(value) || 0 }];
    }

    setFormData({
      ...formData,
      categoryBudgets: updated,
    });
  };

  const getCategoryBudget = (categoryId) => {
    const cb = formData.categoryBudgets.find((cb) => cb.category === categoryId);
    return cb ? cb.limit : 0;
  };

  const getCategorySpending = (categoryId) => {
    if (!budget || !budget.categoryBudgets) return 0;
    const cb = budget.categoryBudgets.find((cb) => cb.category._id === categoryId);
    return cb ? cb.spent || 0 : 0;
  };

  // Show loading only on initial load
  if (loading && !budget) {
    return (
      <div className="budget-page">
        <div className="loading">Loading budget...</div>
      </div>
    );
  }

  // Ensure budget is always defined (use default if null)
  const currentBudget = budget || {
    monthlyBudget: 0,
    categoryBudgets: [],
    totalSpent: 0,
    remainingBudget: 0,
    isExceeded: false,
  };

  const totalSpent = currentBudget.totalSpent || 0;
  const monthlyBudget = currentBudget.monthlyBudget || 0;
  const remainingBudget = monthlyBudget - totalSpent;
  const isExceeded = totalSpent > monthlyBudget;

  return (
    <div className="budget-page">
      <div className="page-header">
        <div>
          <h1>Budget</h1>
          <p>Manage your monthly budget</p>
        </div>
        {!editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            Edit Budget
          </button>
        )}
      </div>

      {/* Monthly Budget Overview */}
      <div className="budget-overview-card">
        <div className="budget-overview-header">
          <FiTarget />
          <h2>Monthly Budget Overview</h2>
        </div>
        {editing ? (
          <div className="budget-edit-form">
            <div className="form-group">
              <label className="form-label">Monthly Budget (₹)</label>
              <input
                type="number"
                className="input"
                value={formData.monthlyBudget}
                onChange={handleMonthlyBudgetChange}
                min="0"
                step="0.01"
              />
            </div>
            <div className="budget-actions">
              <button className="btn btn-secondary" onClick={() => {
                setEditing(false);
                fetchBudget();
              }}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Budget'}
              </button>
            </div>
          </div>
        ) : (
          <div className="budget-stats">
            <div className="budget-stat">
              <div className="budget-stat-label">Monthly Budget</div>
              <div className="budget-stat-value">{formatCurrency(monthlyBudget)}</div>
            </div>
            <div className="budget-stat">
              <div className="budget-stat-label">Total Spent</div>
              <div className={`budget-stat-value ${isExceeded ? 'exceeded' : ''}`}>
                {formatCurrency(totalSpent)}
              </div>
            </div>
            <div className="budget-stat">
              <div className="budget-stat-label">Remaining</div>
              <div className={`budget-stat-value ${remainingBudget < 0 ? 'exceeded' : 'positive'}`}>
                {formatCurrency(remainingBudget)}
              </div>
            </div>
            {isExceeded && (
              <div className="budget-alert">
                <FiAlertTriangle />
                <span>You have exceeded your monthly budget!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Budgets */}
      <div className="category-budgets-card">
        <h2>Category-wise Budget</h2>
        {editing ? (
          <div className="category-budgets-list">
            {categories.length === 0 ? (
              <div className="empty-state">
                <p>No categories found. Create categories first!</p>
              </div>
            ) : (
              categories.map((category) => {
                const limit = getCategoryBudget(category._id);
                return (
                  <div key={category._id} className="category-budget-item">
                    <div className="category-budget-header">
                      <div
                        className="category-icon-small"
                        style={{
                          backgroundColor: category.color + '20',
                          color: category.color,
                        }}
                      >
                        <span>{category.icon}</span>
                      </div>
                      <span className="category-name">{category.name}</span>
                    </div>
                    <div className="category-budget-input">
                      <span>₹</span>
                      <input
                        type="number"
                        value={limit}
                        onChange={(e) => handleCategoryBudgetChange(category._id, e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="category-budgets-list">
            {currentBudget.categoryBudgets?.map((cb) => {
              const category = cb.category;
              const limit = cb.limit || 0;
              const spent = cb.spent || 0;
              const remaining = limit - spent;
              const isExceeded = spent > limit;
              const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

              return (
                <div key={category._id} className="category-budget-item">
                  <div className="category-budget-header">
                    <div
                      className="category-icon-small"
                      style={{
                        backgroundColor: category.color + '20',
                        color: category.color,
                      }}
                    >
                      <span>{category.icon}</span>
                    </div>
                    <span className="category-name">{category.name}</span>
                  </div>
                  <div className="category-budget-progress">
                    <div className="progress-bar-container">
                      <div
                        className={`progress-bar ${isExceeded ? 'exceeded' : ''}`}
                        style={{ width: `${percentage}%`, backgroundColor: category.color }}
                      />
                    </div>
                    <div className="category-budget-stats">
                      <span className="spent">{formatCurrency(spent)}</span>
                      <span className="limit">/ {formatCurrency(limit)}</span>
                      <span className={`remaining ${remaining < 0 ? 'exceeded' : ''}`}>
                        ({remaining >= 0 ? 'Remaining: ' : 'Over by: '}
                        {formatCurrency(Math.abs(remaining))})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {(!currentBudget.categoryBudgets || currentBudget.categoryBudgets.length === 0) && (
              <div className="empty-state">
                <p>No category budgets set. Edit budget to add category limits.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Budget;
