import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext'; // <-- ADD THIS
import logo from '../../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext); // <-- ADD THIS
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const cartCount = getCartCount();
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <div className="nav-brand">
          <Link to={isAdmin ? '/admin' : '/'} onClick={closeMenu}>
            <img src={logo} alt="StyleHouse" className="nav-logo" />
          </Link>
        </div>
        
        <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
          {isAdmin ? (
            <>
              <li><Link to="/admin" onClick={closeMenu}>Dashboard</Link></li>
              <li><Link to="/admin#inventory" onClick={closeMenu}>Products</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/" onClick={closeMenu}>Home</Link></li>
              <li><Link to="/shop" onClick={closeMenu}>Shop</Link></li>
              <li><Link to="/shop?category=new-arrivals" onClick={closeMenu}>New Arrivals</Link></li>
            </>
          )}
        </ul>

        <div className="nav-icons">
          {!isAdmin && (
            <>
              <button className="icon-btn" aria-label="Search"><Search size={20} strokeWidth={1.5} /></button>
              <Link to="/wishlist" className="icon-btn" aria-label="Wishlist"><Heart size={20} strokeWidth={1.5} /></Link>
          
              <Link to="/cart" className="icon-btn cart-icon-wrapper" aria-label="Cart">
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
            </>
          )}
          
          <div className="account-menu hide-on-mobile">
            {user ? (
              <div className="user-dropdown">
                <Link
                  to={user.role === 'admin' ? '/admin' : '/account'}
                  className="icon-btn"
                  aria-label={user.role === 'admin' ? 'Admin dashboard' : 'Account'}
                >
                  <User size={20} strokeWidth={1.5} />
                </Link>
                <button onClick={logout} className="logout-text">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="login-text">Login</Link>
            )}
          </div>

          <button className="icon-btn mobile-toggle" onClick={toggleMenu} aria-label="Toggle menu">
            {isOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;