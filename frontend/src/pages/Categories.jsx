import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import CategoryModal from '../components/CategoryModal';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      showNotification('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await api.delete(`/categories/${id}`);
      showNotification('Category deleted successfully', 'success');
      fetchCategories();
    } catch (error) {
      showNotification(
        error.response?.data?.message || 'Failed to delete category',
        'error'
      );
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  const handleSave = () => {
    fetchCategories();
    handleModalClose();
  };

  if (loading) {
    return (
      <div className="categories-page">
        <div className="loading">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <div>
          <h1>Categories</h1>
          <p>Manage your expense categories</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FiPlus /> Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          <p>No categories found. Create your first category!</p>
          <button className="btn btn-primary" onClick={handleAdd}>
            <FiPlus /> Add Category
          </button>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category._id} className="category-card">
              <div
                className="category-icon"
                style={{
                  backgroundColor: category.color + '20',
                  color: category.color,
                }}
              >
                <span style={{ fontSize: '2rem' }}>{category.icon}</span>
              </div>
              <div className="category-info">
                <h3>{category.name}</h3>
                {category.isDefault && (
                  <span className="default-badge">Default</span>
                )}
              </div>
              <div className="category-actions">
                <button
                  className="btn-icon"
                  onClick={() => handleEdit(category)}
                  title="Edit"
                >
                  <FiEdit2 />
                </button>
                {!category.isDefault && (
                  <button
                    className="btn-icon btn-icon-danger"
                    onClick={() => handleDelete(category._id)}
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={handleModalClose}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Categories;

