import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import ExpenseModal from '../components/ExpenseModal';
import './Expenses.css';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    paymentMode: '',
    startDate: '',
    endDate: '',
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      showNotification('Failed to load categories', 'error');
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.paymentMode) params.append('paymentMode', filters.paymentMode);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/expenses?${params.toString()}&sort=-date`);
      setExpenses(response.data.expenses || []);
    } catch (error) {
      showNotification('Failed to load expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await api.delete(`/expenses/${id}`);
      showNotification('Expense deleted successfully', 'success');
      fetchExpenses();
    } catch (error) {
      showNotification('Failed to delete expense', 'error');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingExpense(null);
  };

  const handleSave = () => {
    fetchExpenses();
    handleModalClose();
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      paymentMode: '',
      startDate: '',
      endDate: '',
    });
  };

  const paymentModes = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Other'];

  if (loading && expenses.length === 0) {
    return (
      <div className="expenses-page">
        <div className="loading">Loading expenses...</div>
      </div>
    );
  }

  return (
    <div className="expenses-page">
      <div className="page-header">
        <div>
          <h1>Expenses</h1>
          <p>Manage your expenses</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FiPlus /> Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-header">
          <FiFilter />
          <h3>Filters</h3>
        </div>
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Search</label>
            <div className="input-with-icon">
              <FiSearch />
              <input
                type="text"
                className="input"
                placeholder="Search expenses..."
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="input"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Mode</label>
            <select
              className="input"
              name="paymentMode"
              value={filters.paymentMode}
              onChange={handleFilterChange}
            >
              <option value="">All Modes</option>
              {paymentModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="input"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="input"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <div className="empty-state">
          <p>No expenses found. Add your first expense to get started!</p>
          <button className="btn btn-primary" onClick={handleAdd}>
            <FiPlus /> Add Expense
          </button>
        </div>
      ) : (
        <div className="expenses-list">
          {expenses.map((expense) => (
            <div key={expense._id} className="expense-card">
              <div
                className="expense-category-badge"
                style={{
                  backgroundColor: expense.category?.color + '20',
                  color: expense.category?.color,
                }}
              >
                <span>{expense.category?.icon || '📁'}</span>
                <span>{expense.category?.name || 'Uncategorized'}</span>
              </div>
              <div className="expense-content">
                <div className="expense-main">
                  <h3>{expense.title}</h3>
                  <p className="expense-date">{formatDate(expense.date)}</p>
                  {expense.notes && <p className="expense-notes">{expense.notes}</p>}
                  <div className="expense-meta">
                    <span className="payment-mode">{expense.paymentMode}</span>
                  </div>
                </div>
                <div className="expense-actions">
                  <div className="expense-amount">{formatCurrency(expense.amount)}</div>
                  <div className="action-buttons">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(expense)}
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => handleDelete(expense._id)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ExpenseModal
          expense={editingExpense}
          categories={categories}
          onClose={handleModalClose}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Expenses;

