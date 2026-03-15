import React, { useState, useEffect, lazy, Suspense } from 'react';
import { DollarSign, Clock, ShoppingCart, CheckCircle, Package, Filter, XCircle, AlertCircle } from 'lucide-react';
import style from '../admin.module.css';
import { API_BASE_URL } from '../Admin';
import PremiumLoader from '../../../components/ui/PremiumLoader';

// Lazy load heavy chart components
const RevenueChart = lazy(() => import('../components/charts/RevenueChart'));
const OrdersChart = lazy(() => import('../components/charts/OrdersChart'));
const StatusPieChart = lazy(() => import('../components/charts/StatusPieChart'));
const ComparisonChart = lazy(() => import('../components/charts/ComparisonChart'));

const LoadingSpinner = () => (
  <PremiumLoader title="Loading charts" subtitle="Building the latest performance view" variant="inline" />
);

const DashboardView = ({ stats }) => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const [monthlyRes, statusRes] = await Promise.all([
        fetch(`${API_BASE_URL}/monthly-trends`),
        fetch(`${API_BASE_URL}/order-status`)
      ]);

      const monthlyJson = await monthlyRes.json();
      const statusJson = await statusRes.json();

      setMonthlyData(monthlyJson.data || []);
      setOrderStatusData(statusJson.data || []);
    } catch (err) {
      console.error('Failed to fetch graph data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  if (!stats) {
    return <p>No dashboard stats available.</p>;
  }

  const statCards = [
    { label: 'Total Profit', value: `$${parseFloat(stats.total_profit || 0).toFixed(2)}`, color: '#10b981', icon: <DollarSign />, change: '+12.5%' },
    { label: 'New Orders', value: stats.new_orders || 0, color: '#3b82f6', icon: <Clock />, change: '+8.2%' },
    { label: 'Total Orders', value: stats.total_orders || 0, color: '#8b5cf6', icon: <ShoppingCart />, change: '+15.3%' },
    { label: 'Completed', value: stats.completed || 0, color: '#10b981', icon: <CheckCircle />, change: '+10.1%' },
    { label: 'Total Products', value: stats.total_products || 0, color: '#f59e0b', icon: <Package />, change: '+5.7%' },
    { label: 'Categories', value: stats.total_categories || 0, color: '#ec4899', icon: <Filter />, change: '+2.4%' },
    { label: 'Canceled', value: stats.canceled || 0, color: '#ef4444', icon: <XCircle />, change: '-3.2%' },
    { label: 'Returned', value: stats.returned || 0, color: '#64748b', icon: <AlertCircle />, change: '-1.5%' },
  ];

  return (
    <div className={style.dashboardContainer}>
      <div className={style.dashboardHeader}>
        <h2>Dashboard Overview</h2>
        <p className={style.dashboardSubtitle}>Monitor your store's performance and trends</p>
      </div>

      <div className={style.dashboardCards}>
        {statCards.map(card => (
          <div key={card.label} className={style.statCard}>
            <div className={style.statIcon} style={{ backgroundColor: card.color }}>
              {card.icon}
            </div>
            <div className={style.statContent}>
              <h3>{card.label}</h3>
              <p className={style.statValue}>{card.value}</p>
              <span className={style.statChange} style={{ color: card.change.startsWith('+') ? '#10b981' : '#ef4444' }}>
                {card.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <div className={style.chartsGrid}>
          <RevenueChart monthlyData={monthlyData} />
          <OrdersChart monthlyData={monthlyData} />
          <StatusPieChart orderStatusData={orderStatusData} />
          <ComparisonChart monthlyData={monthlyData} />
        </div>
      </Suspense>
    </div>
  );
};

export default DashboardView;
