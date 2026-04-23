import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const successMessage = location.state?.message || '';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const result = login(formData);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate('/', { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-eyebrow">Smart Campus</span>
        <h1>Login</h1>
        <p className="auth-subtitle">Enter your username and password to continue.</p>

        {successMessage && <div className="auth-message success">{successMessage}</div>}
        {error && <div className="auth-message error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </label>

          <button type="submit" className="auth-button">
            Login
          </button>
        </form>

        <div className="auth-footer">
          <span>Need an account?</span>
          <Link to="/register">Create one here</Link>
        </div>

        <div className="auth-demo">
          <strong>Demo accounts:</strong> admin / admin123 and user / user123
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
