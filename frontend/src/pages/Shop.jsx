import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';
import './Shop.css';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const categoryFilter = searchParams.get('category') || 'all';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Build query string based on active filters
        let query = '/products';
        if (categoryFilter !== 'all') {
          query += `?category=${categoryFilter}`; // In a real app, backend needs to handle slug mapping
        }

        const { data } = await api.get(query);
        setProducts(data.data);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter]);

  const handleFilterChange = (newCategory) => {
    if (newCategory === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', newCategory);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="container shop-container">
      <aside className="shop-sidebar">
        <h3>Categories</h3>
        <ul className="filter-list">
          <li>
            <button 
              className={categoryFilter === 'all' ? 'active' : ''} 
              onClick={() => handleFilterChange('all')}
            >
              All Products
            </button>
          </li>
          <li>
            <button 
              className={categoryFilter === 'women' ? 'active' : ''} 
              onClick={() => handleFilterChange('women')}
            >
              Women
            </button>
          </li>
          <li>
            <button 
              className={categoryFilter === 'men' ? 'active' : ''} 
              onClick={() => handleFilterChange('men')}
            >
              Men
            </button>
          </li>
        </ul>
      </aside>

      <main className="shop-main">
        <header className="shop-header">
          <h2>{categoryFilter === 'all' ? 'All Products' : categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}</h2>
          <span className="product-count">{products.length} Results</span>
        </header>

        {loading ? (
          <div className="loading-state">Loading products...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : products.length === 0 ? (
          <div className="empty-state">No products found for this category.</div>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Shop;