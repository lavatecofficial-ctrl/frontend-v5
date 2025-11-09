'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  ChartOptions,
} from 'chart.js';
import styles from '../styles/DistributionChart.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface DistributionChartProps {
  history: any[];
}

export default function DistributionChart({ history }: DistributionChartProps) {
  const distributionData = useMemo(() => {
    if (history.length === 0) {
      return [
        { label: '1.00-1.50', value: 0, color: '#a855f7' },
        { label: '1.51-2.00', value: 0, color: '#8b5cf6' },
        { label: '2.01-3.00', value: 0, color: '#ec4899' },
        { label: '3.00-10.00', value: 0, color: '#c084fc' },
        { label: '10 o más', value: 0, color: '#d946ef' },
      ];
    }

    const last100 = history.slice(-100);
    const ranges = [
      { label: '1.00-1.50', min: 1.00, max: 1.50, color: '#a855f7' },
      { label: '1.51-2.00', min: 1.51, max: 2.00, color: '#8b5cf6' },
      { label: '2.01-3.00', min: 2.01, max: 3.00, color: '#ec4899' },
      { label: '3.00-10.00', min: 3.00, max: 10.00, color: '#c084fc' },
      { label: '10 o más', min: 10.00, max: Infinity, color: '#d946ef' },
    ];

    return ranges.map(range => {
      const count = last100.filter(round => {
        const mult = parseFloat(round.maxMultiplier) || 0;
        return mult >= range.min && mult <= range.max;
      }).length;

      return {
        label: range.label,
        value: count,
        color: range.color
      };
    });
  }, [history]);

  const total = distributionData.reduce((sum, item) => sum + item.value, 0);

  const data = {
    labels: distributionData.map(d => d.label),
    datasets: [
      {
        data: distributionData.map(d => d.value),
        backgroundColor: distributionData.map(d => d.color),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(26, 11, 26, 0.95)',
        padding: 10,
        cornerRadius: 6,
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 11 },
        callbacks: {
          label: (context) => {
            const value = context.parsed.x;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${value} veces (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        display: false,
        grid: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: { size: 11 },
          padding: 8,
        },
      },
    },
    layout: {
      padding: { left: 5, right: 40, top: 2, bottom: 2 },
    },
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>DISTRIBUCIÓN (100 RONDAS)</h3>
      <div className={styles.chartWrapper}>
        <Bar data={data} options={options} />
        {distributionData.map((item, idx) => {
          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
          return (
            <div
              key={idx}
              className={styles.percentage}
              style={{ 
                top: `${10 + idx * 19.5}%`,
                color: item.color 
              }}
            >
              {percentage}%
            </div>
          );
        })}
      </div>
    </div>
  );
}
