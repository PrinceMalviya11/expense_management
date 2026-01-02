import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiArrowRight } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    remainingBalance: 0,
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get current month's date range
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      // Fetch income stats
      const incomeResponse = await api.get(`/income/stats/summary?startDate=${startDate}&endDate=${endDate}`);
      const totalIncome = incomeResponse.data.totalIncome || 0;

      // Fetch expense stats
      const expenseResponse = await api.get(`/expenses/stats/summary?startDate=${startDate}&endDate=${endDate}`);
      const totalExpense = expenseResponse.data.totalExpenses || 0;

      // Fetch recent expenses
      const expensesResponse = await api.get('/expenses?limit=5&sort=-date');
      setRecentExpenses(expensesResponse.data.expenses || []);

      setStats({
        totalIncome,
        totalExpense,
        remainingBalance: totalIncome - totalExpense,
      });
    } catch (error) {
      showNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Overview of your finances</p>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon income">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Income</p>
            <h2 className="stat-value">{formatCurrency(stats.totalIncome)}</h2>
          </div>
        </div>

        <div className="stat-card expense">
          <div className="stat-icon expense">
            <FiTrendingDown />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Expenses</p>
            <h2 className="stat-value">{formatCurrency(stats.totalExpense)}</h2>
          </div>
        </div>

        <div className={`stat-card balance ${stats.remainingBalance >= 0 ? 'positive' : 'negative'}`}>
          <div className={`stat-icon ${stats.remainingBalance >= 0 ? 'positive' : 'negative'}`}>
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <p className="stat-label">Remaining Balance</p>
            <h2 className="stat-value">{formatCurrency(stats.remainingBalance)}</h2>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Expenses</h2>
          <Link to="/expenses" className="view-all-link">
            View All <FiArrowRight />
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="empty-state">
            <p>No expenses yet. Start by adding your first expense!</p>
            <Link to="/expenses" className="btn btn-primary">
              Add Expense
            </Link>
          </div>
        ) : (
          <div className="recent-expenses">
            {recentExpenses.map((expense) => (
              <div key={expense._id} className="expense-item">
                <div className="expense-category" style={{ backgroundColor: expense.category?.color + '20', color: expense.category?.color }}>
                  <span>{expense.category?.icon || '📁'}</span>
                </div>
                <div className="expense-details">
                  <h4>{expense.title}</h4>
                  <p>{expense.category?.name || 'Uncategorized'} • {formatDate(expense.date)}</p>
                </div>
                <div className="expense-amount">{formatCurrency(expense.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <Link to="/expenses" className="action-card">
            <FiDollarSign />
            <span>Add Expense</span>
          </Link>
          <Link to="/income" className="action-card">
            <FiTrendingUp />
            <span>Add Income</span>
          </Link>
          <Link to="/budget" className="action-card">
            <FiTrendingDown />
            <span>Set Budget</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

