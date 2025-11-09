'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RangePercentagesCardProps {
  stats?: {
    low: number;    // 1-18
    high: number;   // 19-36
    zero: number;   // 0
  };
  roundData?: {
    number: number;
    color: string;
  };
}

const RangePercentagesCard: React.FC<RangePercentagesCardProps> = ({ stats, roundData }) => {
  const percentages = stats || { low: 0, high: 0, zero: 0 };

  const data = {
    labels: ['1-18', '19-36', '0'],
    datasets: [
      {
        data: [percentages.low, percentages.high, percentages.zero],
        backgroundColor: [
          'rgba(59, 130, 246, 0.9)', // Azul más intenso para 1-18
          'rgba(16, 185, 129, 0.9)', // Verde más brillante para 19-36
          'rgba(239, 68, 68, 0.9)',  // Rojo más intenso para 0
        ],
        borderColor: [
          'rgba(96, 165, 250, 1)',
          'rgba(52, 211, 153, 1)',
          'rgba(248, 113, 113, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 20,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const, // Hace las barras horizontales
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed.x}%`;
          }
        }
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(16, 185, 129, 0.15)',
          lineWidth: 1,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 11,
            weight: 'bold' as const,
          },
          callback: function(value: any) {
            return value + '%';
          }
        },
        border: {
          color: 'rgba(16, 185, 129, 0.3)',
          width: 2,
        }
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        border: {
          color: 'rgba(16, 185, 129, 0.3)',
          width: 2,
        }
      },
    },
  };

  return (
    <div className="flex-1 flex flex-col relative z-10">
      <div className="flex flex-col h-full">
        <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] via-white to-[#10B981] mb-3 text-center tracking-wide drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
          RANGOS (#{roundData?.number ?? 'N/A'})
        </h3>
        <div className="flex-1 flex items-center justify-center relative">
          {/* Glow effect detrás del gráfico */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-[#10B981]/10 rounded-full blur-2xl"></div>
          </div>
          <div className="w-full h-full relative z-10">
            <Bar data={data} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RangePercentagesCard;
