import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const result = register({
      username: formData.username,
      password: formData.password,
      role: formData.role
    });

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate('/login', {
      replace: true,
      state: { message: 'Registration successful. Please log in with your new account.' }
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-eyebrow">Smart Campus</span>
        <h1>Registration</h1>
        <p className="auth-subtitle">Create a new account as a normal user or an admin.</p>

        {error && <div className="auth-message error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
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
              placeholder="Create a password"
              required
            />
          </label>

          <label>
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
            />
          </label>

          <label>
            Account Type
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="user">Normal User</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <button type="submit" className="auth-button">
            Register
          </button>
        </form>

        <div className="auth-footer">
          <span>Already registered?</span>
          <Link to="/login">Go to login</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
