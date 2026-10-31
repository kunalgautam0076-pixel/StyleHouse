import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Login.css'; /* Shares auth page styles */

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const Register = () => {
  const { register: hookRegister, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });
  const { register: registerUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [showPass, setShowPass]        = useState(false);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setServerError('');
      await registerUser(data.name, data.email, data.password);
      navigate('/account');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <h2>"Fashion is the armor to survive everyday life."</h2>
          <p>— Bill Cunningham</p>
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
            <h1>Create Account</h1>
            <p>Join StyleHouse for exclusive benefits and style inspiration</p>
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
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                {...hookRegister('name')}
                className={errors.name ? 'input-error' : ''}
                placeholder="Your full name"
                autoComplete="name"
              />
              {errors.name && <span className="error-text">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                {...hookRegister('email')}
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
                  {...hookRegister('password')}
                  className={errors.password ? 'input-error' : ''}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
                <button type="button" className="input-icon-btn" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
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
                <span className="btn-loading"><span className="spinner" /> Creating account…</span>
              ) : (
                <span className="btn-content"><UserPlus size={16} /> Create Account</span>
              )}
            </motion.button>
          </form>

          <div className="auth-card-footer">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;