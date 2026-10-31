import { LayoutDashboard, LogOut, Package, ShoppingBag, Store } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo-transparent.png';
import './AdminSidebar.css';

const AdminSidebar = ({ user, isOpen, onClose, onLogout }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const linkClass = section => {
    const active = section === 'products'
      ? pathname === '/admin/products' || pathname.startsWith('/admin/product/')
      : pathname === `/admin/${section}`;
    return active ? 'active' : '';
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
      <aside className={`admin-sidebar${isOpen ? ' is-open' : ''}`} aria-label="Admin navigation">
        <button type="button" className="admin-brand" aria-label="StyleHouse home" onClick={() => navigate('/')}>
          <img src={logo} alt="StyleHouse" />
        </button>

        <span className="admin-nav-label">Workspace</span>
        <nav className="admin-nav">
          <NavLink to="/admin/overview" className={linkClass('overview')} onClick={onClose}>
            <LayoutDashboard size={17} /> Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={linkClass('products')} onClick={onClose}>
            <Package size={17} /> Products <span>{user.productCount}</span>
          </NavLink>
          <NavLink to="/admin/orders" className={linkClass('orders')} onClick={onClose}>
            <ShoppingBag size={17} /> Orders <span>{user.orderCount}</span>
          </NavLink>
        </nav>

        <span className="admin-nav-label admin-nav-label-secondary">Store</span>
        <nav className="admin-nav">
          <button type="button" onClick={() => navigate('/')}><Store size={17} /> View storefront</button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <span className="admin-avatar">{user.name?.charAt(0) || 'A'}</span>
            <span><strong>{user.name || 'Administrator'}</strong><small>Administrator</small></span>
          </div>
          <button type="button" className="admin-logout" onClick={onLogout}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;