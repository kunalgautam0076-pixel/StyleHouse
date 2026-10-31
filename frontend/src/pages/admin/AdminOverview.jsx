import { BadgeCheck, Boxes, FileEdit, Package, TriangleAlert } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import './AdminOverview.css';

const AdminOverview = () => {
  const { user, categories, products, publishedCount, draftCount, lowStockCount } = useOutletContext();

  return (
    <section className="admin-overview-section" id="overview">
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">STORE MANAGEMENT</span>
          <h1>Dashboard</h1>
          <p>Welcome back, {user.name?.split(' ')[0] || 'Admin'}. Here’s your store at a glance.</p>
        </div>
        <span className="admin-category-chip"><Boxes size={15} /> {categories.length} categories</span>
      </div>
      <div className="admin-overview" aria-label="Store overview">
        <article className="admin-stat-card"><span className="admin-stat-icon"><Package size={18} /></span><span className="admin-stat-label">Total products</span><strong>{products.length}</strong><span className="admin-stat-note">Across your catalog</span></article>
        <article className="admin-stat-card"><span className="admin-stat-icon is-published"><BadgeCheck size={18} /></span><span className="admin-stat-label">Published</span><strong>{publishedCount}</strong><span className="admin-stat-note">Visible in the store</span></article>
        <article className="admin-stat-card"><span className="admin-stat-icon is-draft"><FileEdit size={18} /></span><span className="admin-stat-label">Drafts</span><strong>{draftCount}</strong><span className="admin-stat-note">Not yet published</span></article>
        <article className="admin-stat-card"><span className="admin-stat-icon is-alert"><TriangleAlert size={18} /></span><span className="admin-stat-label">Low stock</span><strong>{lowStockCount}</strong><span className="admin-stat-note">5 or fewer units</span></article>
      </div>
    </section>
  );
};

export default AdminOverview;