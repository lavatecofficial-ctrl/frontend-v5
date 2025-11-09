'use client';

import { useState, useEffect } from 'react';

interface HistoryItem {
  id: number;
  roundId: string;
  maxMultiplier: number;
  totalBetAmount: number;
  totalCashout: number;
  casinoProfit: number;
  betsCount: number;
  onlinePlayers: number;
  createdAt: Date;
}

interface HistoryChartProps {
  history: HistoryItem[];
}

export default function HistoryChart({ history }: HistoryChartProps) {
  const [displayHistory, setDisplayHistory] = useState<HistoryItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Mostrar solo las últimas 20 rondas (invertidas para que la más reciente esté al final)
    setDisplayHistory(history.slice(0, 20).reverse());
  }, [history]);

  const getMultiplierColor = (multiplier: number): string => {
    if (multiplier >= 1.00 && multiplier <= 1.99) {
      return 'rgb(52, 180, 255)'; // Azul cyan
    } else if (multiplier >= 2.00 && multiplier <= 9.99) {
      return 'rgb(145, 62, 248)'; // Púrpura
    } else if (multiplier >= 10.00) {
      return 'rgb(192, 23, 180)'; // Magenta
    }
    return 'rgb(52, 180, 255)'; // Color por defecto
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (history.length === 0) {
    return (
      <div className="stats">
        <div className="loading">Cargando historial...</div>
      </div>
    );
  }

  return (
    <div className={`stats dropdown ${isDropdownOpen ? 'show' : ''} modern-scroll`}>
      <div className="multipliers-text-grid">
        {displayHistory.map((item) => (
          <span 
            key={item.id} 
            className="multiplier-text"
            style={{ color: getMultiplierColor(item.maxMultiplier) }}
            title={`Ronda ${item.roundId}: ${item.maxMultiplier.toFixed(2)}x`}
          >
            {item.maxMultiplier.toFixed(2)}x
          </span>
        ))}
      </div>
      <div className="button-block">
        <div 
          className="dropdown-toggle button" 
          onClick={toggleDropdown}
          aria-expanded={isDropdownOpen}
        >
          <div className="button-icon"></div>
        </div>
      </div>
      
      {/* Dropdown con historial de rondas */}
      {isDropdownOpen && (
        <div className="dropdown-menu show modern-scroll-chat">
          <div className="wrapper">
            <div className="wrapper-header">
              <div className="text">Round History</div>
            </div>
            <div className="payouts-block">
              {displayHistory.map((item, index) => (
                <div 
                  key={item.id} 
                  className="payout"
                  style={{ color: getMultiplierColor(item.maxMultiplier) }}
                >
                  {item.maxMultiplier.toFixed(2)}x
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
