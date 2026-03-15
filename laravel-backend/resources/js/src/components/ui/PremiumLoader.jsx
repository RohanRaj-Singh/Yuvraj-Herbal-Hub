import React from 'react';
import styles from './PremiumLoader.module.css';

const PremiumLoader = ({ title = 'Loading', subtitle = 'Preparing something special', variant = 'page' }) => {
  const wrapperClass = variant === 'inline' ? styles.inline : styles.page;

  return (
    <div className={`${styles.wrapper} ${wrapperClass}`} role="status" aria-live="polite">
      <div className={styles.card}>
        <div className={styles.orbit}>
          <span className={styles.dot} />
          <span className={`${styles.dot} ${styles.dotSecondary}`} />
          <span className={`${styles.dot} ${styles.dotTertiary}`} />
        </div>
        <div className={styles.shimmer} aria-hidden="true" />
        <div className={styles.textBlock}>
          <div className={styles.title}>{title}</div>
          <div className={styles.subtitle}>{subtitle}</div>
        </div>
      </div>
    </div>
  );
};

export default PremiumLoader;
