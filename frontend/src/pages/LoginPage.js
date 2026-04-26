import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  // Initialize Google Sign-In
  useEffect(() => {
    const loadGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
          callback: handleGoogleSignIn
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { 
            theme: 'outline', 
            size: 'large',
            width: '100%'
          }
        );
      }
    };

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = loadGoogleSignIn;
    document.head.appendChild(script);
  }, []);

  const handleGoogleSignIn = (response) => {
    // Handle Google Sign-In response
    if (response.credential) {
      // Send the JWT token to your backend for verification
      fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Store user data and redirect
            localStorage.setItem('smartcampus_auth_user', JSON.stringify(data.user));
            navigate('/', { replace: true });
          } else {
            setError(data.message || 'Google login failed');
          }
        })
        .catch(err => {
          console.error('Google login error:', err);
          setError('Google login failed. Please try again.');
        });
    }
  };

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

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div id="google-signin-button" style={{ display: 'flex', justifyContent: 'center' }}></div>

        <div className="auth-footer">
          <span>Need an account?</span>
          <Link to="/register">Create one here</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
