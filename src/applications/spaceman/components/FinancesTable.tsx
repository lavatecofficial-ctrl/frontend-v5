'use client';

import { useMemo } from 'react';
import styles from '../styles/FinancesTable.module.css';

interface FinancesTableProps {
  history: any[];
}

const formatCompactCurrency = (value: number): string => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const getMultiplierColor = (multiplier: number): string => {
  if (multiplier >= 10) return '#d946ef'; // Magenta Spaceman
  if (multiplier >= 2) return '#a855f7'; // Purple Spaceman
  return '#c084fc'; // Lavender Spaceman
};

export default function FinancesTable({ history }: FinancesTableProps) {
  const last5Rounds = useMemo(() => {
    return history.slice(0, 5);
  }, [history]);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>FINANZAS (ÚLTIMAS 5)</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>APOSTADO</th>
              <th>RESULT</th>
              <th>RETIRADO</th>
              <th>CASIN P.</th>
            </tr>
          </thead>
          <tbody>
            {last5Rounds.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.noData}>
                  Sin datos disponibles
                </td>
              </tr>
            ) : (
              last5Rounds.map((round, index) => (
                <tr key={round.id || index}>
                  <td>{round.roundId}</td>
                  <td>{formatCompactCurrency(round.totalBetAmount || 0)}</td>
                  <td>
                    <span style={{ color: getMultiplierColor(round.maxMultiplier || 0) }}>
                      {(round.maxMultiplier || 0).toFixed(2)}x
                    </span>
                  </td>
                  <td>{formatCompactCurrency(round.totalCashout || 0)}</td>
                  <td className={(round.casinoProfit || 0) >= 0 ? styles.profit : styles.loss}>
                    {formatCompactCurrency(round.casinoProfit || 0)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
