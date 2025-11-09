'use client';

import { useMemo } from 'react';
import styles from '../styles/StatsCard.module.css';

interface StatsCardProps {
  history: any[];
}

export default function StatsCard({ history }: StatsCardProps) {
  const stats = useMemo(() => {
    if (history.length === 0) {
      return {
        average: 0,
        median: 0,
        max: 0,
        min: 0,
        above10Percent: 0
      };
    }

    const multipliers = history
      .map(round => parseFloat(round.maxMultiplier) || 0)
      .filter(m => m > 0)
      .sort((a, b) => a - b);

    const average = multipliers.reduce((sum, m) => sum + m, 0) / multipliers.length;
    const median = multipliers[Math.floor(multipliers.length / 2)];
    const max = Math.max(...multipliers);
    const min = Math.min(...multipliers);
    const above10Count = multipliers.filter(m => m >= 10).length;
    const above10Percent = (above10Count / multipliers.length) * 100;

    return {
      average: average.toFixed(2),
      median: median.toFixed(2),
      max: max.toFixed(2),
      min: min.toFixed(2),
      above10Percent: above10Percent.toFixed(1)
    };
  }, [history]);

  return (
    <div className={styles.statsContainer}>
      <h2 className={styles.statsTitle}>ESTADÍSTICAS</h2>
      <div className={styles.statsContent}>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Promedio Mult.</span>
          <span className={styles.statValue}>{stats.average}x</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Mediana Mult.</span>
          <span className={styles.statValue}>{stats.median}x</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Maximo Mult.</span>
          <span className={styles.statValue}>{stats.max}x</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Minimo Mult.</span>
          <span className={styles.statValue}>{stats.min}x</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Mayor a 10x prom.</span>
          <span className={styles.statValue}>{stats.above10Percent}%</span>
        </div>
      </div>
    </div>
  );
}
