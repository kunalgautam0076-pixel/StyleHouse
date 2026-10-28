import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-section brand-section">
          <h3>StyleHouse</h3>
          <p>Elevating everyday essentials with premium materials and minimalist design.</p>
        </div>
        
        <div className="footer-section">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/shop?category=men">Men</Link></li>
            <li><Link to="/shop?category=women">Women</Link></li>
            <li><Link to="/shop">All Products</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/shipping">Shipping & Returns</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} StyleHouse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;