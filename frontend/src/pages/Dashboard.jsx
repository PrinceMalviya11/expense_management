import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiArrowRight, FiChevronDown } from 'react-icons/fi';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    remainingBalance: 0,
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('category'); // Default: Category-Wise Expense
  const [chartData, setChartData] = useState({
    categoryExpenses: [],
    monthlyExpenses: [],
    incomeVsExpense: [],
    budgetData: null,
  });
  const [chartLoading, setChartLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [selectedChart]);

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

  const fetchChartData = async () => {
    try {
      setChartLoading(true);
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      if (selectedChart === 'category') {
        // Category-Wise Expense (Pie Chart)
        const expenseResponse = await api.get(`/expenses/stats/summary?startDate=${startDate}&endDate=${endDate}`);
        const categoryData = (expenseResponse.data.expensesByCategory || []).map(item => ({
          name: item.categoryName,
          value: item.total,
          color: item.categoryColor,
        }));
        setChartData(prev => ({ ...prev, categoryExpenses: categoryData }));
      } else if (selectedChart === 'monthly') {
        // Monthly Expense (Bar Chart)
        const monthlyResponse = await api.get('/expenses/stats/monthly?months=6');
        setChartData(prev => ({ ...prev, monthlyExpenses: monthlyResponse.data.monthlyExpenses || [] }));
      } else if (selectedChart === 'incomeExpense') {
        // Income vs Expense (Line Chart)
        const [monthlyExpenseResponse, monthlyIncomeResponse] = await Promise.all([
          api.get('/expenses/stats/monthly?months=6'),
          api.get('/income/stats/monthly?months=6'),
        ]);
        
        const expenses = monthlyExpenseResponse.data.monthlyExpenses || [];
        const income = monthlyIncomeResponse.data.monthlyIncome || [];
        
        // Combine data by month
        const combinedData = [];
        const monthsMap = new Map();
        
        expenses.forEach(item => {
          monthsMap.set(item.label, { ...item, expense: item.total });
        });
        
        income.forEach(item => {
          const existing = monthsMap.get(item.label) || {};
          monthsMap.set(item.label, { ...existing, ...item, income: item.total });
        });
        
        monthsMap.forEach((value, key) => {
          combinedData.push({
            month: key,
            income: value.income || 0,
            expense: value.expense || 0,
          });
        });
        
        // Sort by year and month
        combinedData.sort((a, b) => {
          const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const aParts = a.month.split(' ');
          const bParts = b.month.split(' ');
          const aYear = parseInt(aParts[1]) || 0;
          const bYear = parseInt(bParts[1]) || 0;
          const aMonth = monthOrder.indexOf(aParts[0]);
          const bMonth = monthOrder.indexOf(bParts[0]);
          
          if (aYear !== bYear) return aYear - bYear;
          return aMonth - bMonth;
        });
        
        setChartData(prev => ({ ...prev, incomeVsExpense: combinedData }));
      } else if (selectedChart === 'budget') {
        // Budget vs Spent (Progress)
        const budgetResponse = await api.get('/budgets');
        setChartData(prev => ({ ...prev, budgetData: budgetResponse.data }));
      }
    } catch (error) {
      showNotification('Failed to load chart data', 'error');
    } finally {
      setChartLoading(false);
    }
  };

  const renderChart = () => {
    if (chartLoading) {
      return <div className="chart-loading">Loading chart...</div>;
    }

    if (selectedChart === 'category') {
      // Pie Chart for Category-Wise Expense
      if (chartData.categoryExpenses.length === 0) {
        return <div className="chart-empty">No expense data available</div>;
      }
      
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData.categoryExpenses}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.categoryExpenses.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    } else if (selectedChart === 'monthly') {
      // Bar Chart for Monthly Expense
      if (chartData.monthlyExpenses.length === 0) {
        return <div className="chart-empty">No monthly expense data available</div>;
      }
      
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData.monthlyExpenses}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(value) => {
              if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
              if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
              if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
              return `₹${value}`;
            }} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="total" fill="#ef4444" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (selectedChart === 'incomeExpense') {
      // Line Chart for Income vs Expense
      if (chartData.incomeVsExpense.length === 0) {
        return <div className="chart-empty">No income/expense data available</div>;
      }
      
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData.incomeVsExpense}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => {
              if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
              if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
              if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
              return `₹${value}`;
            }} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Expense" />
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (selectedChart === 'budget') {
      // Progress Chart for Budget vs Spent
      if (!chartData.budgetData) {
        return <div className="chart-empty">No budget data available</div>;
      }
      
      const { monthlyBudget, totalSpent } = chartData.budgetData;
      const percentage = monthlyBudget > 0 ? Math.min((totalSpent / monthlyBudget) * 100, 100) : 0;
      const remaining = monthlyBudget - totalSpent;
      
      return (
        <div className="budget-progress-chart">
          <div className="budget-info">
            <div className="budget-item">
              <span className="budget-label">Monthly Budget</span>
              <span className="budget-value">{formatCurrency(monthlyBudget)}</span>
            </div>
            <div className="budget-item">
              <span className="budget-label">Total Spent</span>
              <span className="budget-value spent">{formatCurrency(totalSpent)}</span>
            </div>
            <div className="budget-item">
              <span className="budget-label">Remaining</span>
              <span className={`budget-value ${remaining >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(remaining)}
              </span>
            </div>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-label">
              <span>Spent: {percentage.toFixed(1)}%</span>
              <span>{formatCurrency(totalSpent)} / {formatCurrency(monthlyBudget)}</span>
            </div>
            <div className="progress-bar">
              <div 
                className={`progress-bar-fill ${percentage > 100 ? 'exceeded' : ''}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      );
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

      {/* Charts Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Analytics</h2>
          <div className="chart-selector">
            <select
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value)}
              className="chart-dropdown"
            >
              <option value="category">Category-Wise Expense</option>
              <option value="monthly">Monthly Expense</option>
              <option value="incomeExpense">Income vs Expense</option>
              {/* <option value="budget">Budget vs Spent</option> */}
            </select>
            <FiChevronDown className="dropdown-icon" />
          </div>
        </div>
        <div className="chart-container">
          {renderChart()}
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
    </div>
  );
};

export default Dashboard;
