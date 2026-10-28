import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';
import './NotFound.css';

const NotFound = () => (
  <div className="notfound-page">
    <motion.div
      className="notfound-content"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65 }}
    >
      <motion.div
        className="notfound-number"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.6, type: 'spring', stiffness: 120 }}
      >
        404
      </motion.div>
      <h1>Page Not Found</h1>
      <p>The page you're looking for seems to have wandered off our runway.</p>
      <div className="notfound-actions">
        <Link to="/" className="btn-primary">
          <Home size={16} /> Go Home
        </Link>
        <Link to="/shop" className="btn-secondary">
          <Search size={16} /> Browse Shop
        </Link>
      </div>
    </motion.div>
  </div>
);

export default NotFound;