import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Dedicated CSS

const Home = () => {
  return (
    <div className="home-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Effortless Elegance.</h1>
          <p>Discover the new Fall/Winter collection defined by minimalist lines and premium materials.</p>
          <Link to="/shop" className="btn-primary">Shop Collection</Link>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container categories-section">
        <div className="section-header">
          <h2>Shop by Category</h2>
        </div>
        <div className="categories-grid">
          <Link to="/shop?category=women" className="category-card women-cat">
            <h3>Women</h3>
          </Link>
          <Link to="/shop?category=men" className="category-card men-cat">
            <h3>Men</h3>
          </Link>
          <Link to="/shop?category=accessories" className="category-card acc-cat">
            <h3>Accessories</h3>
          </Link>
        </div>
      </section>

      {/* Brand Story */}
      <section className="brand-story">
        <div className="container story-container">
          <div className="story-text">
            <h2>The StyleHouse Philosophy</h2>
            <p>We believe that luxury should be felt, not just seen. Every piece we create is designed with uncompromising attention to detail, using sustainably sourced fabrics that stand the test of time.</p>
            <Link to="/about" className="btn-secondary">Read Our Story</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;