import React, { useState, useEffect, lazy, Suspense, memo, useCallback } from 'react';
import styles from './styles/admin.module.css' ;
import PremiumLoader from '../../components/ui/PremiumLoader';

// Lazy load all components with prefetch
const Sidebar = lazy(() => import('./components/Sidebar'));
const DashboardView = lazy(() => import('./views/DashboardView'));
const BannersView = lazy(() => import('./views/BannersView'));
const CategoriesView = lazy(() => import('./views/CategoriesView'));
const ProductsView = lazy(() => import('./views/ProductsView'));
const OrdersView = lazy(() => import('./views/OrdersView'));
const CustomersView = lazy(() => import('./views/CustomersView'));

export const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
export const API_BASE = `${import.meta.env.VITE_API_BASE_URL}`;

// Optimized Loading Spinner
const LoadingSpinner = memo(() => (
  <PremiumLoader title="Loading admin data" subtitle="Syncing dashboard insights" variant="inline" />
));

LoadingSpinner.displayName = 'LoadingSpinner';

// Optimized Auth Screen
const AuthScreen = memo(({ onAuthenticate }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('request');
  const [isLocked, setIsLocked] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) {
        setTimeRemaining('00:00');
        setStep('request');
        setIsLocked(false);
        setAttemptsRemaining(3);
        setExpiresAt(null);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleRequestCode = useCallback(async () => {
    setError('');
    setIsSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/login/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'yuvrajherbal@gmail.com' }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to send code.');
      }
      setAttemptsRemaining(data.attempts_remaining ?? 3);
      setExpiresAt(Date.now() + (data.expires_in ?? 300) * 1000);
      setTimeRemaining('05:00');
      setStep('verify');
      setCode('');
    } catch (err) {
      setError(err.message || 'Failed to send code.');
    } finally {
      setIsSending(false);
    }
  }, []);

  const handleVerifyCode = useCallback(async (e) => {
    e.preventDefault();
    if (isLocked) {
      setError('Too many attempts. Request a new code.');
      return;
    }
    setError('');
    setIsVerifying(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/login/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        if (res.status === 429) {
          setIsLocked(true);
        }
        if (typeof data?.attempts_remaining === 'number') {
          setAttemptsRemaining(data.attempts_remaining);
          if (data.attempts_remaining === 0) {
            setIsLocked(true);
          }
        }
        throw new Error(data?.error || 'Invalid code.');
      }
      sessionStorage.setItem('adminAuthenticated', 'true');
      onAuthenticate();
    } catch (err) {
      setError(err.message || 'Invalid code.');
      setCode('');
    } finally {
      setIsVerifying(false);
    }
  }, [code, isLocked, onAuthenticate]);

  const handleCodeChange = useCallback((e) => {
    setCode(e.target.value);
  }, []);

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <div className={styles.authHeader}>
          <svg className={styles.lockIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2"/>
          </svg>
          <h2 className={styles.authTitle}>Admin Access</h2>
          <p className={styles.authSubtitle}>Enter your access code to continue</p>
        </div>

        {step === 'request' ? (
          <div className={styles.authForm}>
            <p className={styles.authSubtitle} style={{ marginBottom: 16 }}>
              A login code will be sent to the owner email and will be valid for 5 minutes.
            </p>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
            <button
              type="button"
              className={styles.authButton}
              onClick={handleRequestCode}
              disabled={isSending}
            >
              {isSending ? 'Sending...' : 'Send Login Code'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerifyCode} className={styles.authForm}>
            <div className={styles.inputGroup}>
              <input
                type="password"
                value={code}
                onChange={handleCodeChange}
                placeholder="Enter 6-digit code"
                className={styles.authInput}
                autoFocus
                disabled={isLocked}
              />
            </div>

            {timeRemaining && (
              <div className={styles.attemptsText}>
                Code expires in: <strong>{timeRemaining}</strong>
              </div>
            )}

            {typeof attemptsRemaining === 'number' && (
              <div className={styles.attemptsText}>
                Attempts remaining: <strong>{attemptsRemaining}</strong>
              </div>
            )}

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className={styles.authButton}
              disabled={isLocked || !code || isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Access Admin Panel'}
            </button>

            <button
              type="button"
              className={styles.authButton}
              style={{ marginTop: 10, background: 'transparent', color: 'inherit', border: '1px solid currentColor' }}
              onClick={handleRequestCode}
              disabled={isSending}
            >
              {isSending ? 'Sending...' : 'Resend Code'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
});

AuthScreen.displayName = 'AuthScreen';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('adminAuthenticated') === 'true';
  });
  const [view, setView] = useState('dashboard');
  const [data, setData] = useState({
    dashboard: null,
    banners: [],
    categories: [],
    products: [],
    orders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchData = useCallback(async () => {
    setError('');
    try {
      const [dashRes, banRes, catRes, prodRes, ordRes] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard`),
        fetch(`${API_BASE_URL}/banners`),
        fetch(`${API_BASE_URL}/categories`),
        fetch(`${API_BASE_URL}/products`),
        fetch(`${API_BASE_URL}/orders`),
      ]);
      
      const [dashboard, banners, categories, products, orders] = await Promise.all([
        dashRes.json(),
        banRes.json(),
        catRes.json(),
        prodRes.json(),
        ordRes.json()
      ]);

      setData({
        dashboard: dashboard.data,
        banners: banners.data || [],
        categories: categories.data || [],
        products: products.data || [],
        orders: orders.data || [],
      });
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      setError('Failed to load data. Please check the API server and refresh.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  const handleAuthenticate = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
  }, []);

  const renderView = useCallback(() => {
    if (error) return <div className={styles.errorMessageMain}>{error}</div>;

    switch (view) {
      case 'dashboard': 
        return <DashboardView stats={data.dashboard} orders={data.orders} />;
      case 'banners': 
        return <BannersView banners={data.banners} refreshData={fetchData} />;
      case 'categories': 
        return <CategoriesView categories={data.categories} refreshData={fetchData} />;
      case 'products': 
        return <ProductsView products={data.products} categories={data.categories} refreshData={fetchData} />;
      case 'orders': 
        return <OrdersView orders={data.orders} refreshData={fetchData} />;
      case 'customers': 
        return <CustomersView orders={data.orders} />;
      default: 
        return <h2>Welcome to the Admin Panel</h2>;
    }
  }, [view, data, error, fetchData]);

  if (!isAuthenticated) {
    return <AuthScreen onAuthenticate={handleAuthenticate} />;
  }

  return (
    <div className={styles.adminContainer}>
      <Suspense fallback={<LoadingSpinner />}>
        <Sidebar view={view} setView={setView} onRefresh={fetchData} onLogout={handleLogout} />
        <main className={styles.mainContent}>
          {renderView()}
        </main>
      </Suspense>
    </div>
  );
}
