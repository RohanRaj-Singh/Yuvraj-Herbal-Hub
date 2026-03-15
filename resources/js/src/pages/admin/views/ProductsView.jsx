import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Plus, Search } from 'lucide-react';
import style from '../admin.module.css';
import { useNotifications } from '../../../components/notifications/NotificationProvider';
import PremiumLoader from '../../../components/ui/PremiumLoader';
import { buildAssetUrl } from '../../../utils/media';

const getImageUrl = (path) => buildAssetUrl(path);

const ProductModal = lazy(() => import('../components/ProductModal'));

const ProductsView = ({ products, categories, refreshData }) => {
  const [filters, setFilters] = useState({ name: '', category: '', minPrice: '', maxPrice: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const { success, error: notifyError } = useNotifications();

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const nameMatch = p.title.toLowerCase().includes(filters.name.toLowerCase());
      const categoryMatch = filters.category ? p.category_id == filters.category : true;
      const minPriceMatch = filters.minPrice ? p.selling_price >= filters.minPrice : true;
      const maxPriceMatch = filters.maxPrice ? p.selling_price <= filters.maxPrice : true;
      return nameMatch && categoryMatch && minPriceMatch && maxPriceMatch;
    });
  }, [products, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      refreshData();
      success('Product deleted', 'The product was removed successfully.');
    } catch (err) {
      notifyError('Delete failed', err.message);
    }
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className={style.viewContainer}>
      <div className={style.viewHeader}>
        <div>
          <h2>Manage Products</h2>
          <p className={style.viewSubtitle}>Control your product inventory</p>
        </div>
        <button className={style.primaryBtn} onClick={openAddModal}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className={style.filtersBar}>
        <div className={style.searchBox}>
          <Search size={18} />
          <input 
            type="text" 
            name="name" 
            placeholder="Search products..." 
            onChange={handleFilterChange}
            className={style.searchInput}
          />
        </div>
        <select name="category" onChange={handleFilterChange} className={style.select}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.title}</option>)}
        </select>
        <input 
          type="number" 
          name="minPrice" 
          placeholder="Min Price" 
          onChange={handleFilterChange}
          className={style.input}
        />
        <input 
          type="number" 
          name="maxPrice" 
          placeholder="Max Price" 
          onChange={handleFilterChange}
          className={style.input}
        />
      </div>

      {isModalOpen && (
        <Suspense fallback={<PremiumLoader title="Loading product form" subtitle="Preparing editor" variant="inline" />}>
          <ProductModal 
            product={editProduct} 
            categories={categories} 
            closeModal={() => setIsModalOpen(false)} 
            refreshData={refreshData} 
          />
        </Suspense>
      )}

      <div className={style.tableContainer}>
        <table className={style.dataTable}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.product_id}>
                <td><img src={getImageUrl(p.image_url)} alt={p.title} className={style.tableImage} /></td>
                <td>{p.title}</td>
                <td><span className={style.badge}>{p.category_title}</span></td>
                <td>${p.selling_price}</td>
                <td>{p.discount_percent}%</td>
                <td><span className={p.stock_quantity > 10 ? style.stockGood : style.stockLow}>{p.stock_quantity}</span></td>
                <td>
                  <span className={p.is_active ? style.statusActive : style.statusInactive}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className={style.actionBtns}>
                    <button className={style.editBtn} onClick={() => openEditModal(p)}>
                      Edit
                    </button>
                    <button className={style.deleteBtn} onClick={() => handleDeleteProduct(p.product_id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsView;
