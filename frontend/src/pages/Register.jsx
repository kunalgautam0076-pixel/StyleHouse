import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Register.css'; // Dedicated CSS

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: registerUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setServerError('');
      await registerUser(data.name, data.email, data.password);
      navigate('/account');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create Account</h2>
        <p className="register-subtitle">Join StyleHouse for exclusive benefits</p>

        {serverError && <div className="register-error">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              {...register('name', { required: 'Name is required' })}
              className={errors.name ? 'input-error' : ''}
              placeholder="Enter your full name"
            />
            {errors.name && <span className="error-text">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              {...register('email', { required: 'Email is required' })}
              className={errors.email ? 'input-error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 8, message: 'Must be at least 8 characters' }
              })}
              className={errors.password ? 'input-error' : ''}
              placeholder="Create a password"
            />
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          <button type="submit" className="register-button" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;