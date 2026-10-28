import React, { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [showPass, setShowPass]        = useState(false);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setServerError('');
      const { user: authUser } = await login(data.email, data.password);
      navigate(authUser.role === 'admin' ? '/admin' : '/', { replace: true });
    } catch (error) {
      setServerError(error.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
  }, [user, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <h2>"Style is a way to say who you are without having to speak."</h2>
          <p>— Kunal Gautam</p>
        </div>
      </div>

      <div className="auth-form-side">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="auth-card-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your StyleHouse account</p>
          </div>

          <AnimatePresence>
            {serverError && (
              <motion.div
                className="auth-error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <AlertCircle size={16} />
                {serverError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                {...register('email', { required: 'Email is required' })}
                className={errors.email ? 'input-error' : ''}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <span className="error-text">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <input
                  type={showPass ? 'text' : 'password'}
                  id="password"
                  {...register('password', { required: 'Password is required' })}
                  className={errors.password ? 'input-error' : ''}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password.message}</span>}
            </div>

            <motion.button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <span className="btn-loading"><span className="spinner" /> Signing in…</span>
              ) : (
                <span className="btn-content"><LogIn size={16} /> Sign In</span>
              )}
            </motion.button>
          </form>

          <div className="auth-card-footer">
            <p>Don't have an account? <Link to="/register">Create one</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;