'use client';

import { useState, useMemo } from 'react';
import { Bookmaker } from '@/types/portal';
import SmallCards from './SmallCards';
import LiveMultiplier from './LiveMultiplier';
import RoundInfo from './RoundInfo';
import PortalHeader from './PortalHeader';
import HistoryChart from './HistoryChart';
import MultiplierTrend from './MultiplierTrend';
import BetsBlock from './BetsBlock';
import StatsCard from './StatsCard';
import DistributionChart from './DistributionChart';
import FinancesTable from './FinancesTable';
import useSpacemanSocket from '@/hooks/useSpacemanSocket';
import styles from '../styles/SpacemanPortal.module.css';

interface SpacemanPortalProps {
  selectedBookmaker: Bookmaker;
}

export default function SpacemanPortal({ selectedBookmaker }: SpacemanPortalProps) {
  // Usar el hook de Spaceman para datos en tiempo real
  const { 
    roundData, 
    history, 
    serviceStatus, 
    isConnected, 
    notification, 
    clearNotification,
    prediction
  } = useSpacemanSocket(selectedBookmaker.id);

  const [isAboveEma, setIsAboveEma] = useState(false);
  
  // Estados para controlar la visibilidad de elementos del gráfico
  const [showEma, setShowEma] = useState(true);
  const [showBollingerBands, setShowBollingerBands] = useState(true);
  const [showSupportResistance, setShowSupportResistance] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // Transformar el historial para el formato que espera MultiplierTrend
  const transformedHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    
    return history
      .filter(item => item.maxMultiplier !== undefined && item.maxMultiplier !== null)
      .map(item => {
        let dateString: string;
        
        try {
          if (typeof item.createdAt === 'string') {
            dateString = item.createdAt;
          } else if (item.createdAt instanceof Date) {
            dateString = item.createdAt.toISOString();
          } else if (item.createdAt) {
            dateString = new Date(item.createdAt).toISOString();
          } else {
            dateString = new Date().toISOString();
          }
        } catch (error) {
          dateString = new Date().toISOString();
        }
        
        return {
          max_multiplier: item.maxMultiplier || 0,
          created_at: dateString,
          round_id: item.roundId || 'unknown'
        };
      });
  }, [history]);

  return (
    <div className={styles.portalContainer}>
      {/* Header - Primera fila del grid */}
      <PortalHeader selectedBookmaker={selectedBookmaker} />

      {/* Portal Content - Segunda fila del grid */}
      <div className={styles.portalContent}>
        <div className={styles.gridContainer}>
          {/* Fila Superior - Small Cards */}
          <div className={styles.topRow}>
            <SmallCards roundData={roundData} />
          </div>

          {/* Fila Media - Dos columnas */}
          <div className={styles.middleRow}>
            {/* Columna izquierda (2.5fr) - Solo MultiplierTrend */}
            <div className={styles.card} style={{ minHeight: 0, display: 'flex', flexDirection: 'column', padding: 0 }}>
              {/* MultiplierTrend - ocupa todo el espacio */}
              <div style={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
                <MultiplierTrend
                  rounds={transformedHistory}
                  isLoadingRounds={history.length === 0}
                  onEmaStatusChange={setIsAboveEma}
                  showEma={showEma}
                  showBollingerBands={showBollingerBands}
                  showSupportResistance={showSupportResistance}
                  showGrid={showGrid}
                />
              </div>
            </div>

            {/* Desktop: BetsBlock completo / Mobile: Dos tarjetas separadas */}
            <div className={`${styles.card} ${styles.betsBlockDesktop}`}>
              <BetsBlock 
                history={history}
                serviceStatus={serviceStatus}
                isConnected={isConnected}
                showEma={showEma}
                setShowEma={setShowEma}
                showBollingerBands={showBollingerBands}
                setShowBollingerBands={setShowBollingerBands}
                showSupportResistance={showSupportResistance}
                setShowSupportResistance={setShowSupportResistance}
                showGrid={showGrid}
                setShowGrid={setShowGrid}
              />
            </div>
            
            {/* Mobile only: Tarjeta 1 - Predicción */}
            <div className={`${styles.card} ${styles.predictionCardMobile}`}>
              <RoundInfo 
                roundData={roundData} 
                isConnected={isConnected}
                prediction={prediction} 
                trend={isAboveEma ? 'alcista' : 'bajista'} 
              />
            </div>
            
            {/* Mobile only: Tarjeta 2 - Multiplicador */}
            <div className={`${styles.card} ${styles.multiplierCardMobile}`}>
              <LiveMultiplier 
                roundData={roundData}
                isConnected={isConnected}
              />
            </div>
          </div>

          {/* Fila Inferior - Tres columnas */}
          <div className={styles.bottomRow}>
            <div className={styles.card}>
              <StatsCard history={history} />
            </div>
            <div className={styles.card}>
              <DistributionChart history={history} />
            </div>
            <div className={styles.card}>
              <FinancesTable history={history} />
            </div>
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      {notification?.message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification?.type === 'success' 
            ? 'bg-green-600 text-white' 
            : notification?.type === 'error' 
            ? 'bg-red-600 text-white' 
            : 'bg-blue-600 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{notification.message}</span>
            <button 
              onClick={clearNotification}
              className="text-white hover:text-gray-200 text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
