import React from 'react';
import { TrendingUp, Package, ShoppingCart, Users, Filter, RefreshCw, LogOut } from 'lucide-react';
import style from '../admin.module.css';

const Sidebar = ({ view, setView, onRefresh, onLogout }) => (
  <aside className={style.sidebar}>
    <div className={style.sidebarHeader}>
      <h1 className={style.sidebarTitle}>Admin Panel</h1>
      <p className={style.sidebarSubtitle}>Management System</p>
    </div>
    <nav className={style.sidebarNav}>
      <ul>
        <li className={view === 'dashboard' ? style.active : ''} onClick={() => setView('dashboard')}>
          <TrendingUp size={20} />
          <span>Dashboard</span>
        </li>
        <li className={view === 'banners' ? style.active : ''} onClick={() => setView('banners')}>
          <Package size={20} />
          <span>Banners</span>
        </li>
        <li className={view === 'categories' ? style.active : ''} onClick={() => setView('categories')}>
          <Filter size={20} />
          <span>Categories</span>
        </li>
        <li className={view === 'products' ? style.active : ''} onClick={() => setView('products')}>
          <ShoppingCart size={20} />
          <span>Products</span>
        </li>
        <li className={view === 'orders' ? style.active : ''} onClick={() => setView('orders')}>
          <Package size={20} />
          <span>Orders</span>
        </li>
        <li className={view === 'customers' ? style.active : ''} onClick={() => setView('customers')}>
          <Users size={20} />
          <span>Customers</span>
        </li>
      </ul>
    </nav>
    <button className={style.refreshBtn} onClick={onRefresh}>
      <RefreshCw size={16} />
      <span>Refresh Data</span>
    </button>
    <button className={style.logoutBtn} onClick={onLogout}>
      <LogOut size={16} />
      <span>Logout</span>
    </button>
  </aside>
);

export default Sidebar;
