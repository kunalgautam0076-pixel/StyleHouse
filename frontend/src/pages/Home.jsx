import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, ChevronDown, Star, Shield, RefreshCw, Truck } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';
import './Home.css';

/* ─── Reusable Reveal Wrapper ─── */
const Reveal = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
      x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0 },
  };
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
};

/* ─── Hero Typing Text ─── */
const HERO_WORDS = ['Elegance.', 'Style.', 'Confidence.', 'Luxury.'];
const HeroTyping = () => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % HERO_WORDS.length), 2800);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="hero-rotating-word">
      <motion.span
        key={idx}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0,  opacity: 1 }}
        exit={{ y: -20,   opacity: 0 }}
        transition={{ duration: 0.45 }}
      >
        {HERO_WORDS[idx]}
      </motion.span>
    </span>
  );
};

const BoltStrike = ({ boltRef }) => (
  <div className="hero-bolt-strike" ref={boltRef} aria-hidden="true">
    <div className="hero-bolt-cursor-glow" />
    <svg viewBox="0 0 1440 900" preserveAspectRatio="none">
      <path className="hero-bolt-path hero-bolt-path-left" pathLength="1" d="M340 -30 L290 115 L342 138 L250 302 L312 326 L205 512" />
      <path className="hero-bolt-branch hero-bolt-branch-left" d="M292 115 L205 167 M250 302 L174 344" />
      <path className="hero-bolt-path hero-bolt-path-right" pathLength="1" d="M1110 -40 L1040 130 L1098 151 L994 318 L1058 340 L934 535" />
      <path className="hero-bolt-branch hero-bolt-branch-right" d="M1040 130 L1150 194 M994 318 L1100 376" />
    </svg>
  </div>
);

/* ─── Value Props ─── */
const VALUES = [
  { icon: Truck,     label: 'Free Shipping', desc: 'On all orders over ₹2,000' },
  { icon: RefreshCw, label: 'Easy Returns',  desc: '30-day hassle-free returns' },
  { icon: Shield,    label: 'Secure Payment',desc: 'Protected by Razorpay' },
  { icon: Star,      label: 'Premium Quality',desc: 'Sustainably sourced fabrics' },
];

/* ─── Categories ─── */
const CATEGORIES = [
  { label: 'Women',       cat: 'women',       position: 'top center' },
  { label: 'Men',         cat: 'men',         position: 'center center' },
  { label: 'Accessories', cat: 'accessories', position: 'bottom center' },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const boltRef = useRef(null);

  const handleHeroPointerMove = event => {
    if (event.pointerType !== 'mouse' || !boltRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    boltRef.current.style.setProperty('--bolt-pointer-x', `${x * 100}%`);
    boltRef.current.style.setProperty('--bolt-pointer-y', `${y * 100}%`);
    boltRef.current.style.setProperty('--bolt-shift-x', `${(x - 0.5) * 18}px`);
    boltRef.current.style.setProperty('--bolt-shift-y', `${(y - 0.5) * 14}px`);
  };

  const handleHeroPointerLeave = () => {
    if (!boltRef.current) return;
    boltRef.current.style.setProperty('--bolt-pointer-x', '76%');
    boltRef.current.style.setProperty('--bolt-pointer-y', '18%');
    boltRef.current.style.setProperty('--bolt-shift-x', '0px');
    boltRef.current.style.setProperty('--bolt-shift-y', '0px');
  };

  useEffect(() => {
    api.get('/products?limit=4')
      .then(({ data }) => setFeatured(data.data?.slice(0, 4) || []))
      .catch(() => {})
      .finally(() => setLoadingFeatured(false));

    api.get('/products?category=accessories&limit=5')
      .then(({ data }) => setAccessories(data.data?.slice(0, 5) || []))
      .catch(() => setAccessories([]));
  }, []);

  return (
    <div className="home-wrapper">

      {/* ── Hero ── */}
      <section
        className="hero-section"
        onPointerMove={handleHeroPointerMove}
        onPointerLeave={handleHeroPointerLeave}
      >
        <BoltStrike boltRef={boltRef} />

        <div className="hero-content">
          <motion.span
            className="hero-eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            New Collection — Fall / Winter 2026
          </motion.span>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Effortless <HeroTyping />
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.65 }}
          >
            Discover minimalist lines and premium materials crafted for the modern wardrobe.
          </motion.p>

          <motion.div
            className="hero-cta-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            <Link to="/shop" className="btn-primary hero-cta-primary">
              <span>Shop Collection</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/shop?category=new-arrivals" className="btn-secondary hero-cta-secondary">
              New Arrivals
            </Link>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.a
          href="#categories"
          className="hero-scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <ChevronDown size={22} strokeWidth={1.5} />
        </motion.a>
      </section>

      {/* ── Value Props Bar ── */}
      <section className="values-bar">
        <div className="container values-grid">
          {VALUES.map(({ icon: Icon, label, desc }, i) => (
            <Reveal key={label} delay={i * 0.1}>
              <div className="value-item">
                <div className="value-icon">
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <strong>{label}</strong>
                  <span>{desc}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section id="categories" className="container categories-section">
        <Reveal>
          <div className="section-header-block">
            <span className="section-eyebrow">Explore</span>
            <h2 className="section-heading">Shop by Category</h2>
            <div className="divider" />
          </div>
        </Reveal>

        <div className="categories-grid">
          {CATEGORIES.map(({ label, cat }, i) => (
            <Reveal key={cat} delay={i * 0.12} direction={i % 2 === 0 ? 'left' : 'right'}>
              <Link to={`/shop?category=${cat}`} className={`category-card cat-${cat}`}>
                <div className="category-card-overlay" />
                <div className="category-card-content">
                  <h3>{label}</h3>
                  <span className="category-cta">
                    Shop Now <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="container featured-section">
        <Reveal>
          <div className="section-header-block">
            <span className="section-eyebrow">Curated picks</span>
            <h2 className="section-heading">Featured Products</h2>
            <div className="divider" />
          </div>
        </Reveal>

        {loadingFeatured ? (
          <div className="featured-skeleton-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="product-skeleton">
                <div className="skeleton skeleton-img" />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-price" />
              </div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="featured-grid">
            {featured.map((product, i) => (
              <Reveal key={product._id} delay={i * 0.1}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        ) : null}

        <Reveal>
          <div className="featured-cta-center">
            <Link to="/shop" className="btn-secondary">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </section>

      {accessories.length > 0 && (
        <section className="container featured-section">
          <Reveal>
            <div className="section-header-block">
              <span className="section-eyebrow">Finishing touches</span>
              <h2 className="section-heading">Accessories</h2>
              <div className="divider" />
            </div>
          </Reveal>

          <div className="featured-grid">
            {accessories.map((product, i) => (
              <Reveal key={product._id} delay={i * 0.1}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="featured-cta-center">
              <Link to="/shop?category=accessories" className="btn-secondary">
                View All Accessories <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </section>
      )}

      {/* ── Brand Story ── */}
      <section className="brand-story">
        <div className="container story-container">
          <Reveal direction="right" className="story-text">
            <span className="section-eyebrow">Our Philosophy</span>
            <h2 className="section-heading">The StyleHouse Story</h2>
            <div className="divider" />
            <p className="section-subtext">
              We believe that luxury should be felt, not just seen. Every piece we create is
              designed with uncompromising attention to detail, using sustainably sourced fabrics
              that stand the test of time.
            </p>
            <Link to="/about" className="btn-secondary" style={{ marginTop: '2rem' }}>
              Read Our Story
            </Link>
          </Reveal>

          <Reveal direction="left" delay={0.2} className="story-visual">
            <div className="story-visual-inner">
              <div className="story-accent-box" />
              <div className="story-stat-card">
                <strong>2019</strong>
                <span>Founded</span>
              </div>
              <div className="story-stat-card">
                <strong>50K+</strong>
                <span>Happy customers</span>
              </div>
              <div className="story-stat-card">
                <strong>100%</strong>
                <span>Sustainable</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Newsletter Banner ── */}
      <section className="newsletter-section">
        <div className="container newsletter-container">
          <Reveal>
            <span className="section-eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Stay in the loop
            </span>
            <h2 className="newsletter-heading">Get 10% Off Your First Order</h2>
            <p className="newsletter-sub">
              Subscribe for exclusive offers, style inspiration, and early access to new arrivals.
            </p>
            <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="Your email address" className="newsletter-input" />
              <button type="submit" className="newsletter-btn">Subscribe</button>
            </form>
          </Reveal>
        </div>
      </section>

    </div>
  );
};

export default Home;