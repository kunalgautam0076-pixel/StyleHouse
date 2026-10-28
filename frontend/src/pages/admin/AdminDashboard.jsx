import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BadgeCheck, Boxes, FileEdit, Package, Search, ShoppingBag, TriangleAlert } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { hash } = useLocation();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState({});
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [orderError, setOrderError] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [formError, setFormError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    category: '',
    brand: 'StyleHouse',
    stockQuantity: '0',
    imageUrl: '',
    isPublished: false,
  });

  async function fetchAdminData() {
    try {
      const [productsResponse, categoriesResponse, ordersResponse] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/orders/admin'),
      ]);
      setProducts(productsResponse.data.data);
      setCategories(categoriesResponse.data.data);
      setOrders(ordersResponse.data.data);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    if (user?.role === 'admin') {
      Promise.resolve().then(fetchAdminData);
    }
  }, [user]);

  useEffect(() => {
    if (hash === '#inventory') {
      document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hash]);

  const publishedCount = products.filter(product => product.isPublished).length;
  const draftCount = products.length - publishedCount;
  const lowStockCount = products.filter(product => {
    const stock = product.variants?.length
      ? product.variants.reduce((total, variant) => total + (variant.stockQuantity || 0), 0)
      : (product.stockQuantity || 0);
    return stock <= 5;
  }).length;
  const visibleProducts = products.filter(product => {
    const matchesSearch = `${product.name} ${product.category?.name || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'published' ? product.isPublished : !product.isPublished);
    return matchesSearch && matchesStatus;
  });

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    try {
      setIsSavingProduct(true);
      setFormError('');
      const { data } = await api.post('/products', {
        name: newProduct.name,
        description: newProduct.description,
        price: Number(newProduct.price),
        compareAtPrice: newProduct.compareAtPrice ? Number(newProduct.compareAtPrice) : undefined,
        category: newProduct.category,
        brand: newProduct.brand,
        stockQuantity: Number(newProduct.stockQuantity),
        images: [{ url: newProduct.imageUrl, isPrimary: true }],
        isPublished: newProduct.isPublished,
      });
      setProducts(currentProducts => [data.data, ...currentProducts]);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        compareAtPrice: '',
        category: '',
        brand: 'StyleHouse',
        stockQuantity: '0',
        imageUrl: '',
        isPublished: false,
      });
      setShowAddProduct(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create product.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(currentProducts => currentProducts.filter(product => product._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleOrderStatusChange = async (orderId) => {
    const orderStatus = orderStatuses[orderId];
    if (!orderStatus) return;

    try {
      setUpdatingOrderId(orderId);
      setOrderError('');
      const { data } = await api.patch(`/orders/${orderId}/status`, { orderStatus });
      setOrders(currentOrders => currentOrders.map(order => (
        order._id === orderId ? data.data : order
      )));
      setOrderStatuses(currentStatuses => {
        const nextStatuses = { ...currentStatuses };
        delete nextStatuses[orderId];
        return nextStatuses;
      });
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingOrderId('');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="container admin-container">
      <div className="admin-header">
        <div>
          <span className="admin-eyebrow">STORE MANAGEMENT</span>
          <h1>Dashboard</h1>
          <p>Welcome back, {user.name?.split(' ')[0] || 'Admin'}. Here’s what’s happening with your store.</p>
        </div>
        <button
          onClick={() => {
            setShowAddProduct(open => !open);
            setFormError('');
          }}
          className="btn-primary"
        >
          {showAddProduct ? 'Cancel' : '+ Add New Product'}
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <section className="admin-overview" aria-label="Store overview">
        <article className="admin-stat-card">
          <span className="admin-stat-icon"><Package size={20} /></span>
          <span className="admin-stat-label">Total products</span>
          <strong>{products.length}</strong>
          <span className="admin-stat-note">Across your catalog</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-icon is-published"><BadgeCheck size={20} /></span>
          <span className="admin-stat-label">Published</span>
          <strong>{publishedCount}</strong>
          <span className="admin-stat-note">Visible in the storefront</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-icon is-draft"><FileEdit size={20} /></span>
          <span className="admin-stat-label">Drafts</span>
          <strong>{draftCount}</strong>
          <span className="admin-stat-note">Products still being prepared</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-icon is-alert"><TriangleAlert size={20} /></span>
          <span className="admin-stat-label">Low stock</span>
          <strong>{lowStockCount}</strong>
          <span className="admin-stat-note">Products with 5 or fewer units</span>
        </article>
      </section>

      <section className="admin-category-summary">
        <div>
          <span className="admin-summary-icon"><Boxes size={20} /></span>
          <div>
            <strong>{categories.length} active categories</strong>
            <p>Keep your catalog organized for shoppers.</p>
          </div>
        </div>
        <span className="admin-summary-caption">CATALOG OVERVIEW</span>
      </section>

      {showAddProduct && (
        <section className="admin-section add-product-section">
          <h2>Add Product</h2>
          {formError && <div className="admin-error">{formError}</div>}
          {categories.length === 0 ? (
            <p className="admin-status">Create an active category before adding products.</p>
          ) : (
            <form className="add-product-form" onSubmit={handleCreateProduct}>
              <div className="add-product-grid">
                <label>
                  Product name
                  <input
                    name="name"
                    value={newProduct.name}
                    onChange={event => setNewProduct({ ...newProduct, name: event.target.value })}
                    required
                  />
                </label>
                <label>
                  Brand
                  <input
                    name="brand"
                    value={newProduct.brand}
                    onChange={event => setNewProduct({ ...newProduct, brand: event.target.value })}
                  />
                </label>
                <label>
                  Price (₹)
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newProduct.price}
                    onChange={event => setNewProduct({ ...newProduct, price: event.target.value })}
                    required
                  />
                </label>
                <label>
                  Compare-at price (₹)
                  <input
                    name="compareAtPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newProduct.compareAtPrice}
                    onChange={event => setNewProduct({ ...newProduct, compareAtPrice: event.target.value })}
                  />
                </label>
                <label>
                  Category
                  <select
                    name="category"
                    value={newProduct.category}
                    onChange={event => setNewProduct({ ...newProduct, category: event.target.value })}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Stock quantity
                  <input
                    name="stockQuantity"
                    type="number"
                    min="0"
                    step="1"
                    value={newProduct.stockQuantity}
                    onChange={event => setNewProduct({ ...newProduct, stockQuantity: event.target.value })}
                    required
                  />
                </label>
                <label className="add-product-wide">
                  Image URL
                  <input
                    name="imageUrl"
                    type="url"
                    value={newProduct.imageUrl}
                    onChange={event => setNewProduct({ ...newProduct, imageUrl: event.target.value })}
                    required
                  />
                </label>
                <label className="add-product-wide">
                  Description
                  <textarea
                    name="description"
                    rows="4"
                    value={newProduct.description}
                    onChange={event => setNewProduct({ ...newProduct, description: event.target.value })}
                    required
                  />
                </label>
                <label className="add-product-publish">
                  <input
                    type="checkbox"
                    checked={newProduct.isPublished}
                    onChange={event => setNewProduct({ ...newProduct, isPublished: event.target.checked })}
                  />
                  Publish product immediately
                </label>
              </div>
              <button type="submit" className="btn-primary" disabled={isSavingProduct}>
                {isSavingProduct ? 'Adding Product...' : 'Add Product'}
              </button>
            </form>
          )}
        </section>
      )}

      <section className="admin-section" aria-labelledby="orders-heading">
        <div className="inventory-heading">
          <div>
            <span className="admin-eyebrow">FULFILLMENT</span>
            <h2 id="orders-heading">
              <ShoppingBag size={21} aria-hidden="true" />
              Customer orders <span className="inventory-count">{orders.length}</span>
            </h2>
          </div>
        </div>

        {orderError && <div className="admin-error" role="alert">{orderError}</div>}
        {loading ? (
          <p className="admin-status">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="admin-status">No customer orders yet.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table orders-admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Ship to</th>
                  <th>Items</th>
                  <th>Total / Payment</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const selectedStatus = orderStatuses[order._id] || order.orderStatus;
                  return (
                    <tr key={order._id}>
                      <td>
                        <strong>#{order._id.slice(-6).toUpperCase()}</strong>
                        <span className="admin-order-date">
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </td>
                      <td>
                        <strong>{order.user?.name || 'Customer'}</strong>
                        <span className="admin-order-date">{order.user?.email || 'Account unavailable'}</span>
                      </td>
                      <td>
                        <strong>{order.shippingAddress.fullName}</strong>
                        <span className="admin-order-date">
                          {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                        </span>
                        <span className="admin-order-date">{order.shippingAddress.phone}</span>
                      </td>
                      <td>
                        {order.orderItems.map((item, index) => (
                          <span className="admin-order-item" key={`${item.product}-${index}`}>
                            {item.qty}× {item.name} ({item.size})
                          </span>
                        ))}
                      </td>
                      <td>
                        <strong>{formatCurrency(order.totalPrice)}</strong>
                        <span className="admin-order-date">
                          {order.paymentMethod} · {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td>
                        <select
                          className="admin-order-status-select"
                          aria-label={`Status for order ${order._id.slice(-6)}`}
                          value={selectedStatus}
                          onChange={event => setOrderStatuses(current => ({
                            ...current,
                            [order._id]: event.target.value,
                          }))}
                          disabled={order.orderStatus === 'Cancelled'}
                        >
                          {order.orderStatus === 'Payment Pending' && (
                            <option value="Payment Pending">Payment Pending</option>
                          )}
                          {['Processing', 'Shipped', 'Delivered'].map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                          {order.paymentMethod === 'COD' && (
                            <option value="Cancelled">Cancelled</option>
                          )}
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-edit"
                          disabled={selectedStatus === order.orderStatus || updatingOrderId === order._id}
                          onClick={() => handleOrderStatusChange(order._id)}
                        >
                          {updatingOrderId === order._id ? 'Saving...' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="admin-section" id="inventory">
        <div className="inventory-heading">
          <div>
            <span className="admin-eyebrow">CATALOG</span>
            <h2>Product inventory <span className="inventory-count">{products.length}</span></h2>
          </div>
          <label className="inventory-search">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search products"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              aria-label="Search products"
            />
          </label>
        </div>

        <div className="inventory-filters" role="group" aria-label="Filter products by status">
          {[
            ['all', `All products (${products.length})`],
            ['published', `Published (${publishedCount})`],
            ['draft', `Drafts (${draftCount})`],
          ].map(([filter, label]) => (
            <button
              key={filter}
              type="button"
              className={statusFilter === filter ? 'active' : ''}
              onClick={() => setStatusFilter(filter)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="admin-status">Loading inventory...</p>
        ) : visibleProducts.length === 0 ? (
          <p className="admin-status">{products.length ? 'No products match your filters.' : 'No products found.'}</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map(product => {
                  const stock = product.variants?.length
                    ? product.variants.reduce((total, variant) => total + (variant.stockQuantity || 0), 0)
                    : (product.stockQuantity || 0);
                  return (
                  <tr key={product._id}>
                    <td className="product-cell">
                      <img 
                        src={product.images?.[0]?.url || 'https://via.placeholder.com/50'} 
                        alt={product.name} 
                        className="admin-thumb"
                      />
                      <span>{product.name}</span>
                    </td>
                    <td>{product.category?.name || 'Unassigned'}</td>
                    <td>
                      <span className={stock <= 5 ? 'stock-value is-low' : 'stock-value'}>{stock}</span>
                      <span className="stock-unit"> units</span>
                    </td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>
                      <span className={`badge ${product.isPublished ? 'published' : 'draft'}`}>
                        {product.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-btns">
                        <button 
                          onClick={() => navigate(`/admin/product/${product._id}/edit`)} 
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)} 
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;