import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, X, LayoutGrid, List } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';
import './Shop.css';

const CATEGORIES = [
  { label: 'All Products',  value: 'all' },
  { label: 'Women',         value: 'women' },
  { label: 'Men',           value: 'men' },
  { label: 'Accessories',   value: 'accessories' },
  { label: 'New Arrivals',  value: 'new-arrivals' },
];

const SORT_OPTIONS = [
  { label: 'Newest',       value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Best Selling', value: 'bestselling' },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [gridView, setGridView]         = useState('grid');  // 'grid' | 'list'
  const [filtersOpen, setFiltersOpen]   = useState(false);
  const [sortOpen, setSortOpen]         = useState(false);

  const categoryFilter = searchParams.get('category') || 'all';
  const sortFilter     = searchParams.get('sort')     || 'newest';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let query = '/products';
        const params = [];
        if (categoryFilter !== 'all') params.push(`category=${categoryFilter}`);
        if (params.length) query += '?' + params.join('&');
        const { data } = await api.get(query);
        setProducts(data.data || []);
      } catch {
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryFilter]);

  const handleFilterChange = (newCategory) => {
    const next = new URLSearchParams(searchParams);
    if (newCategory === 'all') next.delete('category');
    else next.set('category', newCategory);
    setSearchParams(next);
  };

  const handleSortChange = (value) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', value);
    setSearchParams(next);
    setSortOpen(false);
  };

  const activeCatLabel = CATEGORIES.find(c => c.value === categoryFilter)?.label || 'All Products';
  const activeSortLabel = SORT_OPTIONS.find(s => s.value === sortFilter)?.label || 'Newest';

  /* Client-side sort */
  const sorted = [...products].sort((a, b) => {
    if (sortFilter === 'price_asc')  return a.price - b.price;
    if (sortFilter === 'price_desc') return b.price - a.price;
    return 0;
  });

  return (
    <div className="shop-page">

      {/* ── Shop Header ── */}
      <div className="shop-hero">
        <div className="container">
          <motion.h1
            className="shop-hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            {activeCatLabel}
          </motion.h1>
          <motion.p
            className="shop-hero-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            {loading ? 'Loading…' : `${sorted.length} product${sorted.length !== 1 ? 's' : ''}`}
          </motion.p>
        </div>
      </div>

      <div className="container shop-layout">

        {/* ── Sidebar ── */}
        <aside className={`shop-sidebar ${filtersOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-header">
            <h3>Filter</h3>
            <button className="sidebar-close mobile-only" onClick={() => setFiltersOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="filter-group">
            <h4 className="filter-group-title">Category</h4>
            <ul className="filter-list">
              {CATEGORIES.map(({ label, value }) => (
                <li key={value}>
                  <button
                    className={`filter-btn ${categoryFilter === value ? 'active' : ''}`}
                    onClick={() => { handleFilterChange(value); setFiltersOpen(false); }}
                  >
                    {label}
                    {categoryFilter === value && <span className="filter-dot" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              className="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* ── Main Content ── */}
        <main className="shop-main">

          {/* Toolbar */}
          <div className="shop-toolbar">
            <button className="filter-toggle-btn mobile-only" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal size={16} />
              Filters
            </button>

            <div className="toolbar-right">
              {/* Sort Dropdown */}
              <div className="sort-wrapper">
                <button className="sort-btn" onClick={() => setSortOpen(v => !v)}>
                  Sort: <strong>{activeSortLabel}</strong>
                  <ChevronDown size={14} className={sortOpen ? 'rotate' : ''} />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.ul
                      className="sort-dropdown"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                    >
                      {SORT_OPTIONS.map(({ label, value }) => (
                        <li key={value}>
                          <button
                            className={`sort-option ${sortFilter === value ? 'active' : ''}`}
                            onClick={() => handleSortChange(value)}
                          >
                            {label}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {/* Grid / List Toggle */}
              <div className="view-toggle">
                <button
                  className={`view-btn ${gridView === 'grid' ? 'active' : ''}`}
                  onClick={() => setGridView('grid')}
                  aria-label="Grid view"
                ><LayoutGrid size={16} /></button>
                <button
                  className={`view-btn ${gridView === 'list' ? 'active' : ''}`}
                  onClick={() => setGridView('list')}
                  aria-label="List view"
                ><List size={16} /></button>
              </div>
            </div>
          </div>

          {/* Products */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                className="shop-skeleton-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="product-skeleton">
                    <div className="skeleton skeleton-img" />
                    <div className="skeleton skeleton-text" />
                    <div className="skeleton skeleton-price" />
                  </div>
                ))}
              </motion.div>
            ) : error ? (
              <motion.div key="error" className="shop-state-msg error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p>{error}</p>
              </motion.div>
            ) : sorted.length === 0 ? (
              <motion.div key="empty" className="shop-state-msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p>No products found for this category.</p>
                <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={() => handleFilterChange('all')}>
                  View All Products
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={categoryFilter}
                className={`product-grid ${gridView === 'list' ? 'product-grid-list' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {sorted.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.4) }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Shop;