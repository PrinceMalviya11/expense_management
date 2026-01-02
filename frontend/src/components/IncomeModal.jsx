import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { FiX } from 'react-icons/fi';
import './Modal.css';

const IncomeModal = ({ income, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    source: 'Salary',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (income) {
      setFormData({
        title: income.title || '',
        amount: income.amount || '',
        source: income.source || 'Salary',
        date: income.date ? new Date(income.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: income.notes || '',
      });
    }
  }, [income]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (income) {
        await api.put(`/income/${income._id}`, formData);
        showNotification('Income updated successfully', 'success');
      } else {
        await api.post('/income', formData);
        showNotification('Income added successfully', 'success');
      }
      onSave();
    } catch (error) {
      showNotification(
        error.response?.data?.message || 'Failed to save income',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const incomeSources = ['Salary', 'Freelance', 'Business', 'Investment', 'Other'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{income ? 'Edit Income' : 'Add Income'}</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="input"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount *</label>
              <input
                type="number"
                className="input"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Source</label>
              <select
                className="input"
                name="source"
                value={formData.source}
                onChange={handleChange}
              >
                {incomeSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Date *</label>
            <input
              type="date"
              className="input"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="input"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              maxLength="500"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : income ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomeModal;

