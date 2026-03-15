import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import styles from './notification.module.css';

const NotificationContext = createContext(null);
const DEFAULT_DURATION = 4200;

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toTitle = (text) => (text ? String(text) : '');

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const timeoutsRef = useRef(new Map());

  const remove = useCallback((id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    ({ type = 'info', title = '', message = '', duration = DEFAULT_DURATION }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const payload = {
        id,
        type,
        title: toTitle(title),
        message: toTitle(message),
      };

      setNotifications((prev) => [...prev, payload]);

      if (duration !== 0) {
        const timeoutId = setTimeout(() => remove(id), duration);
        timeoutsRef.current.set(id, timeoutId);
      }

      return id;
    },
    [remove]
  );

  const api = useMemo(
    () => ({
      notify,
      success: (title, message, duration) => notify({ type: 'success', title, message, duration }),
      error: (title, message, duration) => notify({ type: 'error', title, message, duration }),
      warning: (title, message, duration) => notify({ type: 'warning', title, message, duration }),
      info: (title, message, duration) => notify({ type: 'info', title, message, duration }),
    }),
    [notify]
  );

  return (
    <NotificationContext.Provider value={api}>
      {children}
      <div className={styles.toastRegion} aria-live="polite" aria-atomic="false">
        <div className={styles.toastStack}>
          {notifications.map((item) => {
            const Icon = iconMap[item.type] || Info;
            return (
              <div key={item.id} className={`${styles.toast} ${styles[item.type] || styles.info}`}>
                <div className={styles.toastIcon}>
                  <Icon size={18} />
                </div>
                <div className={styles.toastBody}>
                  {item.title && <div className={styles.toastTitle}>{item.title}</div>}
                  {item.message && <div className={styles.toastMessage}>{item.message}</div>}
                </div>
                <button
                  className={styles.toastClose}
                  onClick={() => remove(item.id)}
                  aria-label="Dismiss notification"
                  type="button"
                >
                  <X size={16} />
                </button>
                <div className={styles.toastGlow} aria-hidden="true" />
              </div>
            );
          })}
        </div>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
