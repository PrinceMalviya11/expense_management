import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import IncomeModal from '../components/IncomeModal';
import './Income.css';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    source: '',
    startDate: '',
    endDate: '',
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchIncomes();
  }, [filters]);

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.source) params.append('source', filters.source);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/income?${params.toString()}&sort=-date`);
      setIncomes(response.data.incomes || []);
    } catch (error) {
      showNotification('Failed to load income', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingIncome(null);
    setModalOpen(true);
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income entry?')) {
      return;
    }

    try {
      await api.delete(`/income/${id}`);
      showNotification('Income deleted successfully', 'success');
      fetchIncomes();
    } catch (error) {
      showNotification('Failed to delete income', 'error');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingIncome(null);
  };

  const handleSave = () => {
    fetchIncomes();
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
      source: '',
      startDate: '',
      endDate: '',
    });
  };

  const incomeSources = ['Salary', 'Freelance', 'Business', 'Investment', 'Other'];

  if (loading && incomes.length === 0) {
    return (
      <div className="income-page">
        <div className="loading">Loading income...</div>
      </div>
    );
  }

  return (
    <div className="income-page">
      <div className="page-header">
        <div>
          <h1>Income</h1>
          <p>Manage your income</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FiPlus /> Add Income
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
                placeholder="Search income..."
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Source</label>
            <select
              className="input"
              name="source"
              value={filters.source}
              onChange={handleFilterChange}
            >
              <option value="">All Sources</option>
              {incomeSources.map((source) => (
                <option key={source} value={source}>
                  {source}
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

      {/* Income List */}
      {incomes.length === 0 ? (
        <div className="empty-state">
          <p>No income entries found. Add your first income to get started!</p>
          <button className="btn btn-primary" onClick={handleAdd}>
            <FiPlus /> Add Income
          </button>
        </div>
      ) : (
        <div className="income-list">
          {incomes.map((income) => (
            <div key={income._id} className="income-card">
              <div className="income-content">
                <div className="income-main">
                  <h3>{income.title}</h3>
                  <p className="income-date">{formatDate(income.date)}</p>
                  {income.notes && <p className="income-notes">{income.notes}</p>}
                  <div className="income-meta">
                    <span className="income-source">{income.source}</span>
                  </div>
                </div>
                <div className="income-actions">
                  <div className="income-amount">{formatCurrency(income.amount)}</div>
                  <div className="action-buttons">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(income)}
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => handleDelete(income._id)}
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
        <IncomeModal
          income={editingIncome}
          onClose={handleModalClose}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Income;

