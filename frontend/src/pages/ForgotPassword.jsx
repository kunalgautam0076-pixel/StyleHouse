import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import './Login.css';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setServerError('');
      await api.post('/auth/forgot-password', { email: data.email });
      setSuccess(true);
    } catch (error) {
      setServerError(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Helmet><title>Forgot Password — StyleHouse</title></Helmet>
      <div className="auth-visual">
        <div className="auth-visual-content">
          <h2>"Don't worry, we've all been there."</h2>
          <p>— StyleHouse Team</p>
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
            <h1>Reset Password</h1>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          <AnimatePresence>
            {serverError && (
              <motion.div className="auth-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <AlertCircle size={16} />
                {serverError}
              </motion.div>
            )}
          </AnimatePresence>

          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '1.5rem',
                background: 'rgba(46, 125, 50, 0.08)',
                border: '1px solid rgba(46, 125, 50, 0.25)',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <CheckCircle size={32} style={{ color: 'var(--success-color)', marginBottom: '0.75rem' }} />
              <p style={{ color: 'var(--success-color)', fontWeight: 600, marginBottom: '0.5rem' }}>Check your email</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                If an account with that email exists, we've sent a password reset link. Please check your inbox and spam folder.
              </p>
            </motion.div>
          ) : (
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

              <motion.button
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <span className="btn-loading"><span className="spinner" /> Sending...</span>
                ) : (
                  <span className="btn-content"><Mail size={16} /> Send Reset Link</span>
                )}
              </motion.button>
            </form>
          )}

          <div className="auth-card-footer">
            <p><Link to="/login"><ArrowLeft size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />Back to Sign In</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
