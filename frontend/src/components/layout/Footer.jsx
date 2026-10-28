import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, Globe, MessageCircle, Heart, ArrowRight } from 'lucide-react';
import './Footer.css';

const SHOP_LINKS   = [
  { label: 'Women',        to: '/shop?category=women' },
  { label: 'Men',          to: '/shop?category=men' },
  { label: 'Accessories',  to: '/shop?category=accessories' },
  { label: 'New Arrivals', to: '/shop?category=new-arrivals' },
  { label: 'All Products', to: '/shop' },
];
const SUPPORT_LINKS = [
  { label: 'Contact Us',        to: '/contact' },
  { label: 'Shipping & Returns', to: '/shipping' },
  { label: 'FAQ',               to: '/faq' },
  { label: 'Size Guide',        to: '/size-guide' },
];
const COMPANY_LINKS = [
  { label: 'Our Story',     to: '/about' },
  { label: 'Sustainability', to: '/sustainability' },
  { label: 'Careers',       to: '/careers' },
  { label: 'Press',         to: '/press' },
];
const SOCIALS = [
  { icon: Heart,         label: 'Pinterest',  href: '#' },
  { icon: MessageCircle, label: 'Threads',    href: '#' },
  { icon: Share2,        label: 'Share',      href: '#' },
  { icon: Globe,         label: 'Website',    href: '#' },
];

const Footer = () => (
  <footer className="footer">
    <div className="footer-top">
      <div className="container footer-container">

        {/* Brand Column */}
        <div className="footer-section footer-brand">
          <h2 className="footer-logo">StyleHouse</h2>
          <p className="footer-tagline">
            Elevating everyday essentials with premium materials and minimalist design.
          </p>
          <div className="footer-socials">
            {SOCIALS.map(({ icon: Icon, label, href }) => (
              <a key={label} href={href} aria-label={label} className="social-btn">
                <Icon size={18} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        {/* Shop Links */}
        <div className="footer-section">
          <h4 className="footer-heading">Shop</h4>
          <ul className="footer-links">
            {SHOP_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className="footer-link">
                  <ArrowRight size={12} /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support Links */}
        <div className="footer-section">
          <h4 className="footer-heading">Support</h4>
          <ul className="footer-links">
            {SUPPORT_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className="footer-link">
                  <ArrowRight size={12} /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company Links */}
        <div className="footer-section">
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            {COMPANY_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className="footer-link">
                  <ArrowRight size={12} /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    <div className="footer-bottom">
      <div className="container footer-bottom-inner">
        <p>&copy; {new Date().getFullYear()} StyleHouse. All rights reserved.</p>
        <div className="footer-legal">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
        <div className="footer-payment-icons">
          <span className="payment-badge">Visa</span>
          <span className="payment-badge">MC</span>
          <span className="payment-badge">UPI</span>
          <span className="payment-badge">Razorpay</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;