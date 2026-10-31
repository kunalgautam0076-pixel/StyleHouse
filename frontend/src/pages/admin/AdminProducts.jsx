import { ChevronDown, MoreHorizontal, Plus } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';
import './AdminProducts.css';
import './AdminTables.css';

const AdminProducts = () => {
  const navigate = useNavigate();
  const {
    products,
    pageSize,
    categories,
    loading,
    showAddProduct,
    isSavingProduct,
    formError,
    newProduct,
    setNewProduct,
    handleCreateProduct,
    statusFilter,
    setStatusFilter,
    publishedCount,
    draftCount,
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
  } = useOutletContext();

  const updateProductField = (field, value) => {
    setNewProduct(current => ({ ...current, [field]: value }));
  };

  return (
    <>
      {showAddProduct && (
        <section className="admin-section add-product-section" aria-labelledby="add-product-title">
          <div className="admin-section-heading">
            <div><span className="admin-eyebrow">CATALOG</span><h2 id="add-product-title">Add product</h2></div>
          </div>
          {formError && <div className="admin-error" role="alert">{formError}</div>}
          {categories.length === 0 ? (
            <p className="admin-status">Create an active category before adding products.</p>
          ) : (
            <form className="add-product-form" onSubmit={handleCreateProduct}>
              <div className="add-product-grid">
                <label>Product name<input name="name" value={newProduct.name} onChange={event => updateProductField('name', event.target.value)} required /></label>
                <label>Brand<input name="brand" value={newProduct.brand} onChange={event => updateProductField('brand', event.target.value)} /></label>
                <label>Price (₹)<input name="price" type="number" min="0" step="0.01" value={newProduct.price} onChange={event => updateProductField('price', event.target.value)} required /></label>
                <label>Compare-at price (₹)<input name="compareAtPrice" type="number" min="0" step="0.01" value={newProduct.compareAtPrice} onChange={event => updateProductField('compareAtPrice', event.target.value)} /></label>
                <label>Category<select name="category" value={newProduct.category} onChange={event => updateProductField('category', event.target.value)} required><option value="">Select category</option>{categories.map(category => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label>
                <label>Stock quantity<input name="stockQuantity" type="number" min="0" step="1" value={newProduct.stockQuantity} onChange={event => updateProductField('stockQuantity', event.target.value)} required /></label>
                <label className="add-product-wide">Image URL<input name="imageUrl" type="url" value={newProduct.imageUrl} onChange={event => updateProductField('imageUrl', event.target.value)} required /></label>
                <label className="add-product-wide">Description<textarea name="description" rows="4" value={newProduct.description} onChange={event => updateProductField('description', event.target.value)} required /></label>
                <label className="add-product-publish"><input type="checkbox" checked={newProduct.isPublished} onChange={event => updateProductField('isPublished', event.target.checked)} />Publish product immediately</label>
              </div>
              <button type="submit" className="admin-add-button" disabled={isSavingProduct}><Plus size={16} />{isSavingProduct ? 'Adding product...' : 'Save product'}</button>
            </form>
          )}
        </section>
      )}

      <section className="admin-section admin-inventory-section" id="inventory" aria-labelledby="inventory-title">
        <div className="inventory-heading">
          <div><span className="admin-eyebrow">CATALOG</span><h1 id="inventory-title">Products <span className="inventory-count">{products.length}</span></h1></div>
          <div className="admin-table-controls">
            <div className="inventory-filters" role="group" aria-label="Filter products by status">
              {[
                ['all', 'All'],
                ['published', 'Published'],
                ['draft', 'Drafts'],
              ].map(([filter, label]) => (
                <button key={filter} type="button" className={statusFilter === filter ? 'active' : ''} onClick={() => { setStatusFilter(filter); setProductPage(1); }}>
                  {label}<span>{filter === 'all' ? products.length : filter === 'published' ? publishedCount : draftCount}</span>
                </button>
              ))}
            </div>
            <label className="admin-sort-select"><span>Sort</span><select value={sortBy} onChange={event => { setSortBy(event.target.value); setProductPage(1); }} aria-label="Sort products"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option></select><ChevronDown size={14} aria-hidden="true" /></label>
          </div>
        </div>

        {loading ? <p className="admin-status">Loading products...</p> : visibleProducts.length === 0 ? <p className="admin-status">{products.length ? 'No products match your filters.' : 'No products found.'}</p> : (
          <div className="admin-table-wrapper">
            <table className="admin-table inventory-admin-table">
              <thead><tr><th>Product</th><th>Category</th><th>ID</th><th>Price</th><th>Created</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {paginatedProducts.map(product => {
                  const stock = product.variants?.length
                    ? product.variants.reduce((total, variant) => total + (variant.stockQuantity || 0), 0)
                    : (product.stockQuantity || 0);
                  return (
                    <tr key={product._id}>
                      <td className="product-cell"><img src={product.images?.[0]?.url || 'https://placehold.co/80x80?text=Product'} alt="" className="admin-thumb" /><span><strong>{product.name}</strong><small>{stock} in stock</small></span></td>
                      <td>{product.category?.name || 'Unassigned'}</td>
                      <td className="admin-product-id">P-{product._id.slice(-5).toUpperCase()}</td>
                      <td>{formatCurrency(product.price)}</td>
                      <td>{product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td><span className={`badge ${product.isPublished ? 'published' : 'draft'}`}>{product.isPublished ? 'Published' : 'Draft'}</span></td>
                      <td>
                        <div className="admin-product-action-wrap">
                          <button type="button" className="admin-row-action" aria-label={`Actions for ${product.name}`} aria-expanded={openProductAction === product._id} onClick={() => setOpenProductAction(current => current === product._id ? '' : product._id)}><MoreHorizontal size={18} /></button>
                          {openProductAction === product._id && <div className="admin-action-menu"><button type="button" onClick={() => navigate(`/admin/product/${product._id}/edit`)}>Edit product</button><button type="button" className="is-danger" onClick={() => handleDeleteProduct(product._id)}>Delete product</button></div>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && visibleProducts.length > 0 && (
          <div className="admin-pagination">
            <span>Showing {(productPage - 1) * pageSize + 1}–{Math.min(productPage * pageSize, visibleProducts.length)} of {visibleProducts.length} products</span>
            <div>
              <button type="button" aria-label="Previous page" disabled={productPage <= 1} onClick={() => setProductPage(page => page - 1)}>‹</button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map(page => <button key={page} type="button" className={productPage === page ? 'active' : ''} aria-current={productPage === page ? 'page' : undefined} onClick={() => setProductPage(page)}>{page}</button>)}
              <button type="button" aria-label="Next page" disabled={productPage >= pageCount} onClick={() => setProductPage(page => page + 1)}>›</button>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default AdminProducts;