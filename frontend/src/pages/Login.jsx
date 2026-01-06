import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import NotificationToast from '../components/NotificationToast';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // Clear form data when component mounts (after logout)
  useEffect(() => {
    // Reset form state
    setFormData({
      email: '',
      password: '',
    });
    
    // Clear browser autofill after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      if (emailInput) emailInput.value = '';
      if (passwordInput) passwordInput.value = '';
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
      await login(formData.email, formData.password);
      // Clear form on successful login
      setFormData({ email: '', password: '' });
      showNotification('Login successful!', 'success');
      navigate('/dashboard');
    } catch (error) {
      // Clear form fields on error
      setFormData({ email: '', password: '' });
      // Clear input values directly to prevent autofill
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      if (emailInput) emailInput.value = '';
      if (passwordInput) passwordInput.value = '';
      
      const errorMessage = error.response?.data?.message || 'Invalid email or password. Please try again.';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <NotificationToast />
      <div className="auth-card">
        <div className="auth-header">
          <h1>💰 Expense Manager</h1>
          <h2>Sign In</h2>
          <p>Welcome back! Please sign in to your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

