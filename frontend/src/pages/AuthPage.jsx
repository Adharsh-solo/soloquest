import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Compass, Eye, EyeOff } from 'lucide-react';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Always default to login page on initial load
  const [isLogin, setIsLogin] = useState(true);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Register state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Password validation
  const hasLength = registerPassword.length >= 8;
  const hasLower = /[a-z]/.test(registerPassword);
  const hasUpper = /[A-Z]/.test(registerPassword);
  const hasNumber = /\d/.test(registerPassword);
  const hasSpecial = /[@$!%*?&]/.test(registerPassword);
  const isPasswordValid = hasLength && hasLower && hasUpper && hasNumber && hasSpecial;
  
  // Specific states
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/login/`, {
        username: loginEmail,
        password: loginPassword,
      });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('username', loginEmail);
      navigate('/');
    } catch (err) {
      setLoginError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRegisterError('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/register/`, {
        username: registerEmail,
        email: registerEmail,
        password: registerPassword,
      });
      // Auto login after register
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/login/`, {
        username: registerEmail,
        password: registerPassword,
      });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('username', registerEmail);
      navigate('/');
    } catch (err) {
      setRegisterError(err.response?.data?.username?.[0] || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = (mode) => {
    setIsLogin(mode === 'login');
    // Update URL silently without reloading component
    window.history.replaceState(null, '', `/${mode}`);
  };

  return (
    <div className="auth-container">
      <div className={`flip-container ${!isLogin ? 'flipped' : ''}`}>
        <div className="flipper">
          
          {/* FRONT - LOGIN */}
          <div className="auth-card front">
            <div className="auth-header">
              <Compass className="auth-icon" size={48} />
              <h2>Solo Quest</h2>
              <p>Welcome back! Please login to your account.</p>
            </div>
            <form onSubmit={handleLogin} className="auth-form">
              {loginError && <div className="auth-error">{loginError}</div>}
              <div className="input-group">
                <label>Email</label>
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="input-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    title={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <div className="auth-footer">
              Don't have an account? <span className="auth-link" onClick={() => toggleAuthMode('register')}>Sign up</span>
            </div>
          </div>

          {/* BACK - REGISTER */}
          <div className="auth-card back">
            <div className="auth-header">
              <Compass className="auth-icon" size={48} />
              <h2>Join Us</h2>
              <p>Create an account to explore Kerala.</p>
            </div>
            <form onSubmit={handleRegister} className="auth-form">
              {registerError && <div className="auth-error">{registerError}</div>}
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="input-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    placeholder="Create a strong password"
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    title={showRegisterPassword ? "Hide password" : "Show password"}
                  >
                    {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {registerPassword && (
                  <div className="password-requirements">
                    <div className={hasLength ? 'valid' : 'invalid'}>✓ 8+ characters</div>
                    <div className={hasUpper ? 'valid' : 'invalid'}>✓ Uppercase letter</div>
                    <div className={hasLower ? 'valid' : 'invalid'}>✓ Lowercase letter</div>
                    <div className={hasNumber ? 'valid' : 'invalid'}>✓ Number</div>
                    <div className={hasSpecial ? 'valid' : 'invalid'}>✓ Special character (@$!%*?&)</div>
                  </div>
                )}
              </div>
              <button type="submit" disabled={loading || !isPasswordValid} className="btn-primary">
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>
            <div className="auth-footer">
              Already have an account? <span className="auth-link" onClick={() => toggleAuthMode('login')}>Login</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
