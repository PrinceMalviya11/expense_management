import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { FiX } from 'react-icons/fi';
import './Modal.css';

const CategoryModal = ({ category, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#6366f1',
    icon: '📁',
  });
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const commonIcons = ['📁', '🍔', '✈️', '🏠', '🛍️', '🏥', '🚗', '💊', '🎮', '📚', '🎬', '💻', '⚽', '🎵', '☕', '🍕'];

  const commonColors = [
    '#6366f1', '#ef4444', '#10b981', '#f59e0b', '#3b82f6',
    '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
  ];

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        color: category.color || '#6366f1',
        icon: category.icon || '📁',
      });
    }
  }, [category]);

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
      if (category) {
        await api.put(`/categories/${category._id}`, formData);
        showNotification('Category updated successfully', 'success');
      } else {
        await api.post('/categories', formData);
        showNotification('Category created successfully', 'success');
      }
      onSave();
    } catch (error) {
      showNotification(
        error.response?.data?.message || 'Failed to save category',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{category ? 'Edit Category' : 'Add Category'}</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              className="input"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Icon</label>
            <div className="icon-selector">
              {commonIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, icon })}
                >
                  {icon}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="input"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              maxLength="2"
              style={{ marginTop: '0.5rem' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-selector">
              {commonColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
            <input
              type="color"
              className="input"
              name="color"
              value={formData.color}
              onChange={handleChange}
              style={{ marginTop: '0.5rem', height: '40px' }}
            />
          </div>

          <div className="category-preview" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: formData.color + '20', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '2rem' }}>{formData.icon}</span>
            <div style={{ marginTop: '0.5rem', color: formData.color, fontWeight: 500 }}>{formData.name || 'Category Name'}</div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;

