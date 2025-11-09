'use client';

import React, { useState, useMemo } from 'react';
import { RoundData, Bookmaker, Prediction } from '@/types/portal';
import styles from '../styles/AviatorPortal.module.css';
import PortalHeader from './PortalHeader';
import SmallCards from './SmallCards';
import MultiplierTrend from './MultiplierTrend';
import BetsBlock from './BetsBlock';
import StatsCard from './StatsCard';
import DistributionChart from './DistributionChart';
import FinancesTable from './FinancesTable';
import RoundInfo from './RoundInfo';
import LiveMultiplier from './LiveMultiplier';

interface AviatorPortalProps {
  selectedBookmaker: Bookmaker;
  roundData: RoundData;
  history: any[];
  prediction?: Prediction | null;
}

export default function AviatorPortal({ selectedBookmaker, roundData, history, prediction }: AviatorPortalProps) {
  const [isAboveEma, setIsAboveEma] = useState(false);
  const [currentView, setCurrentView] = useState<'tendencia' | 'finanzas'>('tendencia');
  
  // Estados para controlar la visibilidad de elementos del gráfico
  const [showEma, setShowEma] = useState(true);
  const [showBollingerBands, setShowBollingerBands] = useState(true);
  const [showSupportResistance, setShowSupportResistance] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // Transformar el historial - con reverse para el gráfico
  const transformedHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    
    return history
      .filter(item => item.maxMultiplier !== undefined && item.maxMultiplier !== null)
      .slice()
      .reverse() // Invertir para que el gráfico lea al revés
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
            {/* Columna izquierda (2.5fr) - MultiplierTrend con historial integrado */}
            <div className={styles.card} style={{ minHeight: 0, padding: 0 }}>
              <MultiplierTrend
                rounds={transformedHistory}
                isLoadingRounds={history.length === 0}
                onEmaStatusChange={setIsAboveEma}
                showEma={showEma}
                showBollingerBands={showBollingerBands}
                showSupportResistance={showSupportResistance}
                showGrid={showGrid}
                onBollingerBandsChange={setShowBollingerBands}
                onSupportResistanceChange={setShowSupportResistance}
                onGridChange={setShowGrid}
                onViewChange={setCurrentView}
                currentView={currentView}
              />
            </div>

            {/* Desktop: BetsBlock completo / Mobile: Dos tarjetas separadas */}
            <div className={`${styles.card} ${styles.betsBlockDesktop}`}>
              <BetsBlock 
                history={history}
                showEma={showEma}
                setShowEma={setShowEma}
                showBollingerBands={showBollingerBands}
                setShowBollingerBands={setShowBollingerBands}
                showSupportResistance={showSupportResistance}
                setShowSupportResistance={setShowSupportResistance}
                showGrid={showGrid}
                setShowGrid={setShowGrid}
                roundData={roundData}
                prediction={prediction}
                trend={isAboveEma ? 'alcista' : 'bajista'}
              />
            </div>
            
            {/* Mobile only: Tarjeta 1 - Predicción */}
            <div className={`${styles.card} ${styles.predictionCardMobile}`}>
              <RoundInfo 
                roundData={roundData} 
                prediction={prediction} 
                trend={isAboveEma ? 'alcista' : 'bajista'} 
              />
            </div>
            
            {/* Mobile only: Tarjeta 2 - Multiplicador */}
            <div className={`${styles.card} ${styles.multiplierCardMobile}`}>
              <LiveMultiplier roundData={roundData} />
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
    </div>
  );
}
