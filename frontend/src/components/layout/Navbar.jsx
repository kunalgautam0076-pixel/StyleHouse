import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import logo from '../../assets/logo-transparent.png';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home',         path: '/' },
  { label: 'Shop',         path: '/shop' },
  { label: 'New Arrivals', path: '/shop?category=new-arrivals' },
  { label: 'Women',        path: '/shop?category=women' },
  { label: 'Men',          path: '/shop?category=men' },
];

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount }  = useContext(CartContext);
  const { wishlistItems } = useContext(WishlistContext);

  const [isOpen,     setIsOpen]     = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal,  setSearchVal]  = useState('');
  const [userMenu,   setUserMenu]   = useState(false);

  const searchRef = useRef(null);
  const location  = useLocation();

  const cartCount     = getCartCount();
  const wishlistCount = wishlistItems?.length || 0;
  const isAdmin       = user?.role === 'admin';

  /* Close mobile menu on route change */
  useEffect(() => { setIsOpen(false); setUserMenu(false); }, [location.pathname]);

  /* Scroll-to-add glass effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Focus search input when opened */
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchVal.trim())}`;
      setSearchOpen(false);
      setSearchVal('');
    }
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">

          {/* Brand */}
          <div className="nav-brand">
            <Link to={isAdmin ? '/admin' : '/'}>
              <img src={logo} alt="StyleHouse" className="nav-logo" />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          {!isAdmin && (
            <ul className="nav-links">
              {NAV_LINKS.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className={`nav-link ${location.pathname === path ? 'active' : ''}`}
                  >
                    {label}
                    <span className="nav-link-underline" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* Admin Links */}
          {isAdmin && (
            <ul className="nav-links">
              <li><Link to="/admin" className="nav-link">Dashboard</Link></li>
              <li><Link to="/admin#inventory" className="nav-link">Products</Link></li>
            </ul>
          )}

          {/* Icons */}
          <div className="nav-icons">
            {/* Search */}
            {!isAdmin && (
              <motion.button
                className="icon-btn"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search size={20} strokeWidth={1.5} />
              </motion.button>
            )}

            {/* Wishlist */}
            {!isAdmin && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Link to="/wishlist" className="icon-btn icon-with-badge" aria-label="Wishlist">
                  <Heart size={20} strokeWidth={1.5} />
                  <AnimatePresence>
                    {wishlistCount > 0 && (
                      <motion.span
                        className="icon-badge"
                        key="wl-badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        {wishlistCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            )}

            {/* Cart */}
            {!isAdmin && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Link to="/cart" className="icon-btn icon-with-badge cart-icon-wrapper" aria-label="Cart">
                  <ShoppingBag size={20} strokeWidth={1.5} />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        className="icon-badge cart-badge"
                        key="cart-badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            )}

            {/* User Account */}
            <div className="account-menu hide-on-mobile" ref={null}>
              {user ? (
                <div className="user-dropdown-wrapper">
                  <motion.button
                    className="user-avatar-btn"
                    onClick={() => setUserMenu(v => !v)}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="user-avatar-circle">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <ChevronDown size={14} className={`chevron ${userMenu ? 'open' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {userMenu && (
                      <motion.div
                        className="user-dropdown-menu"
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                      >
                        <div className="dropdown-user-info">
                          <strong>{user.name}</strong>
                          <span>{user.email}</span>
                        </div>
                        <div className="dropdown-divider" />
                        <Link to={user.role === 'admin' ? '/admin' : '/account'} className="dropdown-item">
                          <User size={15} strokeWidth={1.5} />
                          {user.role === 'admin' ? 'Dashboard' : 'My Account'}
                        </Link>
                        {!isAdmin && (
                          <Link to="/wishlist" className="dropdown-item">
                            <Heart size={15} strokeWidth={1.5} />
                            Wishlist
                          </Link>
                        )}
                        <div className="dropdown-divider" />
                        <button onClick={logout} className="dropdown-item dropdown-logout">
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="nav-login-btn">
                  <User size={18} strokeWidth={1.5} />
                  <span>Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Toggle */}
            <motion.button
              className="icon-btn mobile-toggle"
              onClick={() => setIsOpen(v => !v)}
              aria-label="Toggle menu"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isOpen
                  ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={24} strokeWidth={1.5} /></motion.div>
                  : <motion.div key="menu"  initial={{ rotate: 90,  opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu size={24} strokeWidth={1.5} /></motion.div>
                }
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="mobile-menu-inner">
                {!isAdmin && NAV_LINKS.map(({ label, path }, i) => (
                  <motion.div
                    key={path}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link to={path} className="mobile-nav-link">{label}</Link>
                  </motion.div>
                ))}
                <div className="mobile-menu-footer">
                  {user ? (
                    <>
                      <Link to="/account" className="mobile-nav-link">My Account</Link>
                      <button onClick={logout} className="mobile-nav-link logout-mobile">Sign Out</button>
                    </>
                  ) : (
                    <Link to="/login" className="mobile-nav-link">Login / Register</Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              className="search-modal"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
            >
              <form onSubmit={handleSearchSubmit} className="search-form">
                <Search size={20} strokeWidth={1.5} className="search-icon-inner" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search for products..."
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  className="search-input"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="search-close-btn">
                  <X size={20} strokeWidth={1.5} />
                </button>
              </form>
              <p className="search-hint">Press Enter to search or Esc to close</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;