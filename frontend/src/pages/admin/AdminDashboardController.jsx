import { useContext, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import AdminLayout from './AdminLayout';

const PAGE_SIZE = 8;

const AdminDashboardController = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
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
  const [sortBy, setSortBy] = useState('newest');
  const [productPage, setProductPage] = useState(1);
  const [openProductAction, setOpenProductAction] = useState('');
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
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') Promise.resolve().then(fetchAdminData);
  }, [user]);

  const publishedCount = products.filter(product => product.isPublished).length;
  const draftCount = products.length - publishedCount;
  const lowStockCount = products.filter(product => {
    const stock = product.variants?.length
      ? product.variants.reduce((total, variant) => total + (variant.stockQuantity || 0), 0)
      : (product.stockQuantity || 0);
    return stock <= 5;
  }).length;

  const visibleProducts = products
    .filter(product => {
      const matchesSearch = `${product.name} ${product.category?.name || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'published' ? product.isPublished : !product.isPublished);
      return matchesSearch && matchesStatus;
    })
    .sort((first, second) => {
      if (sortBy === 'oldest') return new Date(first.createdAt || 0) - new Date(second.createdAt || 0);
      if (sortBy === 'price-low') return first.price - second.price;
      if (sortBy === 'price-high') return second.price - first.price;
      if (sortBy === 'name') return first.name.localeCompare(second.name);
      return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
    });
  const pageCount = Math.ceil(visibleProducts.length / PAGE_SIZE);
  const paginatedProducts = visibleProducts.slice((productPage - 1) * PAGE_SIZE, productPage * PAGE_SIZE);

  const handleCreateProduct = async event => {
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
        name: '', description: '', price: '', compareAtPrice: '', category: '',
        brand: 'StyleHouse', stockQuantity: '0', imageUrl: '', isPublished: false,
      });
      setShowAddProduct(false);
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Failed to create product.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async productId => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${productId}`);
      setProducts(currentProducts => currentProducts.filter(product => product._id !== productId));
      setOpenProductAction('');
    } catch (requestError) {
      window.alert(requestError.response?.data?.message || 'Failed to delete product.');
    }
  };

  const handleOrderStatusChange = async orderId => {
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
    } catch (requestError) {
      setOrderError(requestError.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingOrderId('');
    }
  };

  const handleSearchChange = value => {
    setSearchTerm(value);
    setProductPage(1);
  };

  const handleToggleAddProduct = () => {
    setFormError('');
    if (pathname !== '/admin/products') {
      setShowAddProduct(true);
      navigate('/admin/products');
      return;
    }
    setShowAddProduct(open => !open);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  if (!user || user.role !== 'admin') return null;

  const outletContext = {
    user,
    products,
    orders,
    categories,
    loading,
    pageSize: PAGE_SIZE,
    publishedCount,
    draftCount,
    lowStockCount,
    showAddProduct,
    setShowAddProduct,
    isSavingProduct,
    formError,
    newProduct,
    setNewProduct,
    handleCreateProduct,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    visibleProducts,
    paginatedProducts,
    productPage,
    setProductPage,
    pageCount,
    openProductAction,
    setOpenProductAction,
    handleDeleteProduct,
    orderError,
    orderStatuses,
    setOrderStatuses,
    updatingOrderId,
    handleOrderStatusChange,
  };

  return (
    <AdminLayout
      user={user}
      productCount={products.length}
      orderCount={orders.length}
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
      onAddProduct={handleToggleAddProduct}
      onLogout={handleLogout}
    >
      {error && <div className="admin-error" role="alert">{error}</div>}
      <Outlet context={outletContext} />
    </AdminLayout>
  );
};

export default AdminDashboardController;
