import { useState } from 'react';
import { Menu, Plus, Search, X } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';

const AdminLayout = ({ user, productCount, orderCount, searchTerm, onSearchChange, onAddProduct, onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-dashboard">
      <AdminSidebar
        user={{ ...user, productCount, orderCount }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={onLogout}
      />

      <div className="admin-workspace">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-toggle"
            aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(open => !open)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <label className="admin-global-search">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search products"
              value={searchTerm}
              onChange={event => onSearchChange(event.target.value)}
              aria-label="Search products"
            />
            <kbd>Ctrl K</kbd>
          </label>
          <div className="admin-topbar-actions">
            <button type="button" className="admin-add-button" onClick={onAddProduct}>
              <Plus size={16} /> Add product
            </button>
            <span className="admin-topbar-user" title={user.name || 'Administrator'}>
              {user.name?.charAt(0) || 'A'}
            </span>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;