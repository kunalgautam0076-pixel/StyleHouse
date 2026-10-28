import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import logo from '../../assets/logo.png'; // Make sure to save the logo image in src/assets/
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <div className="nav-brand">
          <Link to="/" onClick={closeMenu}>
            <img src={logo} alt="StyleHouse" className="nav-logo" />
          </Link>
        </div>
        
        {/* Desktop & Mobile Navigation Links */}
        <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={closeMenu}>Home</Link></li>
          <li><Link to="/shop" onClick={closeMenu}>Shop</Link></li>
          <li><Link to="/shop?category=new-arrivals" onClick={closeMenu}>New Arrivals</Link></li>
        </ul>

        <div className="nav-icons">
          <button className="icon-btn" aria-label="Search"><Search size={20} strokeWidth={1.5} /></button>
          <Link to="/wishlist" className="icon-btn" aria-label="Wishlist"><Heart size={20} strokeWidth={1.5} /></Link>
          <Link to="/cart" className="icon-btn" aria-label="Cart"><ShoppingBag size={20} strokeWidth={1.5} /></Link>
          
          <div className="account-menu hide-on-mobile">
            {user ? (
              <div className="user-dropdown">
                <Link to="/account" className="icon-btn" aria-label="Account"><User size={20} strokeWidth={1.5} /></Link>
                <button onClick={logout} className="logout-text">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="login-text">Login</Link>
            )}
          </div>

          {/* Mobile Hamburger Menu */}
          <button className="icon-btn mobile-toggle" onClick={toggleMenu} aria-label="Toggle menu">
            {isOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;