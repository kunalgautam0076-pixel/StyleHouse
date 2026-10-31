import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import './Login.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setServerError('');
      await api.post(`/auth/reset-password/${token}`, { password: data.password });
      navigate('/login', { state: { notice: 'Password reset successful. Please sign in with your new password.' } });
    } catch (error) {
      setServerError(error.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Helmet><title>Reset Password — StyleHouse</title></Helmet>
      <div className="auth-visual">
        <div className="auth-visual-content">
          <h2>"A fresh start is just a password away."</h2>
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
            <h1>Set New Password</h1>
            <p>Enter your new password below.</p>
          </div>

          <AnimatePresence>
            {serverError && (
              <motion.div className="auth-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <AlertCircle size={16} />
                {serverError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <div className="input-with-icon">
                <input
                  type={showPass ? 'text' : 'password'}
                  id="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Must be at least 8 characters' },
                  })}
                  className={errors.password ? 'input-error' : ''}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
                <button type="button" className="input-icon-btn" onClick={() => setShowPass(v => !v)} aria-label="Toggle password visibility">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                id="confirmPassword"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === watch('password') || 'Passwords do not match',
                })}
                className={errors.confirmPassword ? 'input-error' : ''}
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword.message}</span>}
            </div>

            <motion.button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <span className="btn-loading"><span className="spinner" /> Resetting...</span>
              ) : (
                <span className="btn-content"><Lock size={16} /> Reset Password</span>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
