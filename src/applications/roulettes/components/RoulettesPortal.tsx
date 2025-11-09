'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { Bookmaker } from '@/types/portal';
import { useRouletteData } from '@/hooks/useRouletteData';
import { useRoulettePrediction } from '@/hooks/useRoulettePrediction';
import { useAuth } from '@/hooks/useAuth';
import { BiLogOutCircle } from 'react-icons/bi';
import { IoHome } from 'react-icons/io5';
import RouletteSpinner from './RouletteSpinner';
import ColumnPercentagesCard from './ColumnPercentagesCard';
import DozenPercentagesCard from './DozenPercentagesCard';
import ColorPercentagesCard from './ColorPercentagesCard';
import RangePercentagesCard from './RangePercentagesCard';
import RoulettePredictionCard from './RoulettePredictionCard';
import '../styles/portal.css';

interface RouletteRoundData {
  number: number;
  color: string;
}

interface RoulettesPortalProps {
  selectedBookmaker: Bookmaker;
}

export default function RoulettesPortal({ selectedBookmaker }: RoulettesPortalProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { logout } = useAuth();
  const {
    isConnected,
    roundData,
    historyData,
    error: rouletteError,
    rawPrediction: rawPredictionData,
    subscribeRoulette,
    unsubscribeRoulette,
    disconnect: disconnectRoulette,
  } = useRouletteData();

  // Predicción de ruleta
  const {
    predictionData,
    rawPrediction,
    subscribePrediction,
    unsubscribePrediction,
    getLatestHistory,
    requestImmediateUpdate,
    joinBookmaker,
  } = useRoulettePrediction();

  const toggleMenu = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  // Cerrar el menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        // Verificar que no se hizo clic en el menú dropdown
        if (!target.closest('[data-dropdown-menu]')) {
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Función para calcular estadísticas de docenas
  const calculateDozenStats = (rounds: RouletteRoundData[]) => {
    if (!rounds || rounds.length === 0) {
      return { zero: 0, first: 0, second: 0, third: 0 };
    }

    let zeroCount = 0, firstDozenCount = 0, secondDozenCount = 0, thirdDozenCount = 0;

    rounds.forEach((round) => {
      const num = round.number;
      if (num === 0) {
        zeroCount++;
      } else if (num >= 1 && num <= 12) {
        firstDozenCount++;
      } else if (num >= 13 && num <= 24) {
        secondDozenCount++;
      } else if (num >= 25 && num <= 36) {
        thirdDozenCount++;
      }
    });

    const total = rounds.length;
    return {
      zero: total > 0 ? Math.round((zeroCount / total) * 100) : 0,
      first: total > 0 ? Math.round((firstDozenCount / total) * 100) : 0,
      second: total > 0 ? Math.round((secondDozenCount / total) * 100) : 0,
      third: total > 0 ? Math.round((thirdDozenCount / total) * 100) : 0
    };
  };

  // Función para calcular estadísticas de columnas
  const calculateColumnStats = (rounds: RouletteRoundData[]) => {
    if (!rounds || rounds.length === 0) {
      return { zero: 0, first: 0, second: 0, third: 0 };
    }

    let zeroCount = 0, firstColumnCount = 0, secondColumnCount = 0, thirdColumnCount = 0;

    rounds.forEach((round) => {
      const num = round.number;
      if (num === 0) {
        zeroCount++;
      } else if (num % 3 === 1) {
        firstColumnCount++;
      } else if (num % 3 === 2) {
        secondColumnCount++;
      } else if (num % 3 === 0) {
        thirdColumnCount++;
      }
    });

    const total = rounds.length;
    return {
      zero: total > 0 ? Math.round((zeroCount / total) * 100) : 0,
      first: total > 0 ? Math.round((firstColumnCount / total) * 100) : 0,
      second: total > 0 ? Math.round((secondColumnCount / total) * 100) : 0,
      third: total > 0 ? Math.round((thirdColumnCount / total) * 100) : 0
    };
  };

  // Función para calcular estadísticas de rangos
  const calculateRangeStats = (rounds: RouletteRoundData[]) => {
    if (!rounds || rounds.length === 0) {
      return { low: 0, high: 0, zero: 0 };
    }

    let lowCount = 0, highCount = 0, zeroCount = 0;

    rounds.forEach((round) => {
      const num = round.number;
      if (num === 0) {
        zeroCount++;
      } else if (num >= 1 && num <= 18) {
        lowCount++;
      } else if (num >= 19 && num <= 36) {
        highCount++;
      }
    });

    const total = rounds.length;
    return {
      low: total > 0 ? Math.round((lowCount / total) * 100) : 0,
      high: total > 0 ? Math.round((highCount / total) * 100) : 0,
      zero: total > 0 ? Math.round((zeroCount / total) * 100) : 0
    };
  };

  // Función para calcular estadísticas de colores
  const calculateColorStats = (rounds: RouletteRoundData[]) => {
    if (!rounds || rounds.length === 0) {
      return { red: 0, black: 0, green: 0 };
    }

    let redCount = 0, blackCount = 0, greenCount = 0;

    rounds.forEach((round) => {
      const color = round.color?.toLowerCase();
      if (color === 'red') {
        redCount++;
      } else if (color === 'black') {
        blackCount++;
      } else if (color === 'green' || round.number === 0) {
        greenCount++;
      }
    });

    const total = rounds.length;
    return {
      red: total > 0 ? Math.round((redCount / total) * 100) : 0,
      black: total > 0 ? Math.round((blackCount / total) * 100) : 0,
      green: total > 0 ? Math.round((greenCount / total) * 100) : 0
    };
  };

  // Función para calcular estadísticas de la ruleta
  const calculateRouletteStats = (rounds: RouletteRoundData[]) => {
    if (!rounds || rounds.length === 0) {
      return {
        dozens: { first: 0, second: 0, third: 0 },
        columns: { first: 0, second: 0, third: 0 },
        lastSpins: { 
          firstDozen: '-', 
          secondDozen: '-', 
          thirdDozen: '-',
          firstColumn: '-', 
          secondColumn: '-', 
          thirdColumn: '-'
        }
      };
    }

    let firstDozen = 0, secondDozen = 0, thirdDozen = 0;
    let firstColumn = 0, secondColumn = 0, thirdColumn = 0;
    
    // Variables para rastrear la última aparición de cada docena y columna
    let lastFirstDozen = '-', lastSecondDozen = '-', lastThirdDozen = '-';
    let lastFirstColumn = '-', lastSecondColumn = '-', lastThirdColumn = '-';

    // Recorrer las rondas desde la más reciente (índice 0) hasta la más antigua
    rounds.forEach((round, index) => {
      const num = round.number;
      
      // Calcular docenas (1-12, 13-24, 25-36)
      if (num >= 1 && num <= 12) {
        firstDozen++;
        // Solo actualizar si no hemos encontrado una aparición más reciente
        if (lastFirstDozen === '-') {
          lastFirstDozen = index === 0 ? 'AHORA' : `${index}`;
        }
      } else if (num >= 13 && num <= 24) {
        secondDozen++;
        if (lastSecondDozen === '-') {
          lastSecondDozen = index === 0 ? 'AHORA' : `${index}`;
        }
      } else if (num >= 25 && num <= 36) {
        thirdDozen++;
        if (lastThirdDozen === '-') {
          lastThirdDozen = index === 0 ? 'AHORA' : `${index}`;
        }
      }

      // Calcular columnas (1,4,7,10,13,16,19,22,25,28,31,34)
      if (num !== 0) { // Solo procesar columnas si no es 0
        if (num % 3 === 1) {
          firstColumn++;
          if (lastFirstColumn === '-') {
            lastFirstColumn = index === 0 ? 'AHORA' : `${index}`;
          }
        } else if (num % 3 === 2) {
          secondColumn++;
          if (lastSecondColumn === '-') {
            lastSecondColumn = index === 0 ? 'AHORA' : `${index}`;
          }
        } else if (num % 3 === 0) {
          thirdColumn++;
          if (lastThirdColumn === '-') {
            lastThirdColumn = index === 0 ? 'AHORA' : `${index}`;
          }
        }
      }
    });

    const total = rounds.length;

    return {
      dozens: {
        first: firstDozen,
        second: secondDozen,
        third: thirdDozen,
        firstPct: total > 0 ? Math.round((firstDozen / total) * 100) : 0,
        secondPct: total > 0 ? Math.round((secondDozen / total) * 100) : 0,
        thirdPct: total > 0 ? Math.round((thirdDozen / total) * 100) : 0
      },
      columns: {
        first: firstColumn,
        second: secondColumn,
        third: thirdColumn,
        firstPct: total > 0 ? Math.round((firstColumn / total) * 100) : 0,
        secondPct: total > 0 ? Math.round((secondColumn / total) * 100) : 0,
        thirdPct: total > 0 ? Math.round((thirdColumn / total) * 100) : 0
      },
      lastSpins: {
        firstDozen: lastFirstDozen,
        secondDozen: lastSecondDozen,
        thirdDozen: lastThirdDozen,
        firstColumn: lastFirstColumn,
        secondColumn: lastSecondColumn,
        thirdColumn: lastThirdColumn
      }
    };
  };

  // Calcular estadísticas con los datos del historial
  const stats = calculateRouletteStats(historyData || []);
  const colorStats = calculateColorStats(historyData || []);
  const rangeStats = calculateRangeStats(historyData || []);
  const dozenStats = calculateDozenStats(historyData || []);
  const columnStats = calculateColumnStats(historyData || []);

  // Debug: Log cuando cambia historyData
  useEffect(() => {
    console.log('RoulettesPortal: historyData actualizado:', historyData);
    console.log('RoulettesPortal: Número de rondas en historial:', historyData?.length || 0);
    if (historyData && historyData.length > 0) {
      console.log('RoulettesPortal: Primera ronda del historial:', historyData[0]);
      console.log('RoulettesPortal: Última ronda del historial:', historyData[historyData.length - 1]);
    }
  }, [historyData]);

  // Debug: Log cuando cambia roundData
  useEffect(() => {
    console.log('RoulettesPortal: roundData actualizado:', roundData);
  }, [roundData]);

  // Forzar re-render cuando cambian los datos para actualización en tiempo real
  useEffect(() => {
    if (roundData) {
      console.log('RoulettesPortal: Nueva ronda detectada, actualizando estadísticas...');
    }
  }, [roundData, historyData]);

  useEffect(() => {
    if (selectedBookmaker?.id) {
      console.log(`RoulettesPortal: Suscribiendo a bookmaker ${selectedBookmaker.id}`);
      subscribeRoulette(selectedBookmaker.id);
      // Unirse también al canal de predicciones para ese bookmaker
      joinBookmaker(selectedBookmaker.id);
      
      return () => {
        console.log(`RoulettesPortal: Desuscribiendo de bookmaker ${selectedBookmaker.id}`);
        unsubscribeRoulette(selectedBookmaker.id);
      };
    }
  }, [selectedBookmaker?.id]); // Removidas las dependencias que causan re-renders

  // Cargar historial más reciente del canal de predicciones
  useEffect(() => {
    if (selectedBookmaker?.id) {
      getLatestHistory(selectedBookmaker.id);
    }
  }, [selectedBookmaker?.id, getLatestHistory]);

  useEffect(() => {
    if (selectedBookmaker?.id && roundData?.number) {
      subscribePrediction(selectedBookmaker.id, roundData.number);
    }

    return () => {
      if (selectedBookmaker?.id && roundData?.number) {
        unsubscribePrediction(selectedBookmaker.id, roundData.number);
      }
    };
  }, [selectedBookmaker?.id, roundData?.number, subscribePrediction, unsubscribePrediction]);

  // Obtener el número más reciente del historial o usar datos por defecto
  const getCurrentRoundData = () => {
    // Si hay datos de ronda actual, usarlos
    if (roundData) {
      return roundData;
    }
    
    // Si hay historial, usar el número más reciente
    if (historyData && historyData.length > 0) {
      return historyData[0]; // El primer elemento es el más reciente
    }
    
    // Si no hay nada, devolver undefined para respetar tipos opcionales
    return undefined;
  };

  const currentRoundData = getCurrentRoundData();

  // Forzar re-cálculo cuando cambie el historial para actualizar el spinner
  useEffect(() => {
    if (historyData && historyData.length > 0) {
      console.log('RoulettesPortal: Historial actualizado, spinner mostrará:', historyData[0]);
      console.log('RoulettesPortal: Estadísticas de colores:', colorStats);
      console.log('RoulettesPortal: Estadísticas de rangos:', rangeStats);
      console.log('RoulettesPortal: Estadísticas de docenas:', dozenStats);
      console.log('RoulettesPortal: Estadísticas de columnas:', columnStats);
    }
  }, [historyData, colorStats, rangeStats, dozenStats, columnStats]);

  return (
    <div className="h-screen grid grid-cols-12 gap-1 p-1 overflow-hidden roulettes-container relative bg-[radial-gradient(900px_600px_at_20%_0%,rgba(16,185,129,0.08),transparent_60%),radial-gradient(1200px_800px_at_100%_100%,rgba(220,38,38,0.06),transparent_65%),linear-gradient(to_bottom,#050709,#0A0D10,#050709)] modern-scroll" style={{ gap: '4px', padding: '4px', gridTemplateRows: '50px 35px 1fr 1fr' }}>
      {/* Overlay radial adicional con efecto de profundidad */}
      <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.4),transparent_70%)] pointer-events-none"></div>
      
      {/* Header - Fila 1 completa */}
      <div className="col-span-12 bg-gradient-to-br from-[#0E1419]/80 via-[#0A0F13]/90 to-[#0E1419]/80 border border-[#10B981]/20 rounded-[20px] flex items-center justify-between px-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(16,185,129,0.12),inset_0_1px_0_rgba(16,185,129,0.1)] relative overflow-visible">
        <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/5 via-transparent to-[#DC2626]/5 pointer-events-none rounded-[20px]"></div>
        <div className="flex items-center relative z-10">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-white to-[#10B981] font-orbitron drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
            {selectedBookmaker.bookmaker}
          </h1>
        </div>
        
        {/* Burger Menu */}
        <div className="relative z-10">
          <button
            ref={buttonRef}
            onClick={toggleMenu}
            className="flex flex-col justify-center items-center w-10 h-10 space-y-1 transition-all duration-300 cursor-pointer hover:bg-[#10B981]/10 rounded-lg p-2"
          >
            <span className={`block w-6 h-0.5 bg-gradient-to-r from-[#10B981] to-white shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gradient-to-r from-[#10B981] to-white shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gradient-to-r from-[#10B981] to-white shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Fila completa - Fila 2 - Historial de números */}
      <div className="col-span-12 relative mx-auto flex items-center" style={{ maxWidth: '90%' }}>
        <div className="w-full h-full flex items-center">
          <div className="flex gap-2 items-center overflow-hidden modern-scroll-horizontal w-full">
            {historyData && historyData.length > 0 ? (
              historyData.map((round, index) => {
                console.log(`Renderizando ronda ${index}:`, round);
                return (
                  <div
                    key={index}
                    className={`relative flex-shrink-0 group cursor-pointer transition-all duration-300 hover:scale-125 hover:-translate-y-1 ${
                      round.color === 'Red' 
                        ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-800 shadow-[0_6px_20px_rgba(239,68,68,0.6),0_0_0_1px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.3)]' 
                        : round.color === 'Black' 
                        ? 'bg-gradient-to-br from-gray-500 via-gray-700 to-gray-900 shadow-[0_6px_20px_rgba(55,65,81,0.6),0_0_0_1px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)]' 
                        : 'bg-gradient-to-br from-green-400 via-green-600 to-green-800 shadow-[0_6px_20px_rgba(34,197,94,0.6),0_0_0_1px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.3)]'
                    }`}
                    style={{
                      minWidth: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      border: round.color === 'Red' 
                        ? '1.5px solid rgba(248, 113, 113, 0.4)' 
                        : round.color === 'Black' 
                        ? '1.5px solid rgba(156, 163, 175, 0.4)' 
                        : '1.5px solid rgba(74, 222, 128, 0.4)'
                    }}
                  >
                    {/* Efecto de brillo superior permanente */}
                    <div className={`absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent pointer-events-none ${
                      round.color === 'Red' ? 'to-red-900/20' : round.color === 'Black' ? 'to-gray-900/30' : 'to-green-900/20'
                    }`}></div>
                    
                    {/* Efecto de brillo interno en hover mejorado */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100"></div>
                    
                    {/* Patrón de textura sutil */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
                    }}></div>
                    
                    {/* Número */}
                    <span className={`text-white font-extrabold relative z-10 transition-all duration-300 ${
                      round.number === 0 ? 'text-base' : 'text-sm'
                    }`} style={{
                      textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(255,255,255,0.3)',
                      letterSpacing: '0.5px'
                    }}>
                      {round.number}
                    </span>
                    
                    {/* Borde brillante en hover mejorado con glow */}
                    <div className={`absolute inset-0 rounded-[8px] opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                      round.color === 'Red' 
                        ? 'border-2 border-red-300/80 shadow-[inset_0_0_15px_rgba(239,68,68,0.5),0_0_20px_rgba(239,68,68,0.4)]' 
                        : round.color === 'Black' 
                        ? 'border-2 border-gray-300/80 shadow-[inset_0_0_15px_rgba(156,163,175,0.5),0_0_20px_rgba(156,163,175,0.3)]' 
                        : 'border-2 border-green-300/80 shadow-[inset_0_0_15px_rgba(34,197,94,0.5),0_0_20px_rgba(34,197,94,0.4)]'
                    }`}></div>
                    
                    {/* Efecto de pulso en hover */}
                    <div className={`absolute inset-0 rounded-[8px] opacity-0 group-hover:opacity-30 group-hover:animate-ping pointer-events-none ${
                      round.color === 'Red' ? 'bg-red-400' : round.color === 'Black' ? 'bg-gray-400' : 'bg-green-400'
                    }`} style={{ animationDuration: '1s', animationIterationCount: '1' }}></div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <span className="text-gray-400 text-sm font-medium">
                  Sin datos de historial
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primera fila completa dividida en 4 partes */}
      <div className="col-span-6 relative overflow-y-auto rounded-[20px] p-3 backdrop-blur-2xl border border-[#10B981]/30 shadow-[0_10px_40px_rgba(16,185,129,0.2),0_0_0_1px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(16,185,129,0.15),inset_0_0_30px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(135deg, rgba(10,15,19,0.95) 0%, rgba(14,20,25,0.98) 25%, rgba(16,185,129,0.03) 50%, rgba(14,20,25,0.98) 75%, rgba(10,15,19,0.95) 100%)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(220,38,38,0.05),transparent_50%)] pointer-events-none rounded-[20px]"></div>
        <div className="absolute inset-0 opacity-30 pointer-events-none rounded-[20px]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(16,185,129,0.03) 2px, rgba(16,185,129,0.03) 4px)' }}></div>
        <div className="w-full h-full relative z-10">
          {/* Header de la tabla */}
          <div className="grid grid-cols-4 gap-1.5 mb-2 pb-1.5 border-b border-[#10B981]/30">
            <div className="text-center">
              <h4 className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-white font-sans tracking-wider drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">BET</h4>
            </div>
            <div className="text-center">
              <h4 className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-white font-sans tracking-wider drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">TOTAL</h4>
            </div>
            <div className="text-center">
              <h4 className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-white font-sans tracking-wider drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">PCT</h4>
            </div>
            <div className="text-center">
              <h4 className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-white font-sans tracking-wider drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">LAST</h4>
            </div>
          </div>
          
          {/* Filas de datos */}
          <div className="space-y-1">
            {/* 1st DOZEN */}
            <div className="grid grid-cols-4 gap-1.5 items-center border-b border-[#10B981]/20 pb-1 hover:bg-[#10B981]/5 rounded-lg px-1.5 py-0.5 transition-all duration-200 hover:border-[#10B981]/40">
              <div className="text-center">
                <span className="text-[10px] text-gray-300 font-sans font-medium">1st DOZ</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-white font-sans font-bold">{stats.dozens.first}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-[#10B981] font-sans font-bold">{stats.dozens.firstPct}%</span>
              </div>
              <div className="text-center">
                <span className={`text-[10px] font-sans font-bold ${
                  stats.lastSpins.firstDozen === 'AHORA' 
                    ? 'text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]' 
                    : stats.lastSpins.firstDozen !== '-' 
                    ? 'text-yellow-400' 
                    : 'text-gray-400'
                }`}>
                  {stats.lastSpins.firstDozen}
                </span>
              </div>
            </div>
            
            {/* 2nd DOZEN */}
            <div className="grid grid-cols-4 gap-1.5 items-center border-b border-[#10B981]/20 pb-1 hover:bg-[#10B981]/5 rounded-lg px-1.5 py-0.5 transition-all duration-200 hover:border-[#10B981]/40">
              <div className="text-center">
                <span className="text-[10px] text-gray-300 font-sans font-medium">2nd DOZ</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-white font-sans font-bold">{stats.dozens.second}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-[#10B981] font-sans font-bold">{stats.dozens.secondPct}%</span>
              </div>
              <div className="text-center">
                <span className={`text-[10px] font-sans font-bold ${
                  stats.lastSpins.secondDozen === 'AHORA' 
                    ? 'text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]' 
                    : stats.lastSpins.secondDozen !== '-' 
                    ? 'text-yellow-400' 
                    : 'text-gray-400'
                }`}>
                  {stats.lastSpins.secondDozen}
                </span>
              </div>
            </div>
            
            {/* 3rd DOZEN */}
            <div className="grid grid-cols-4 gap-1.5 items-center border-b border-[#10B981]/20 pb-1 hover:bg-[#10B981]/5 rounded-lg px-1.5 py-0.5 transition-all duration-200 hover:border-[#10B981]/40">
              <div className="text-center">
                <span className="text-[10px] text-gray-300 font-sans font-medium">3rd DOZ</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-white font-sans font-bold">{stats.dozens.third}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-[#10B981] font-sans font-bold">{stats.dozens.thirdPct}%</span>
              </div>
              <div className="text-center">
                <span className={`text-[10px] font-sans font-bold ${
                  stats.lastSpins.thirdDozen === 'AHORA' 
                    ? 'text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]' 
                    : stats.lastSpins.thirdDozen !== '-' 
                    ? 'text-yellow-400' 
                    : 'text-gray-400'
                }`}>
                  {stats.lastSpins.thirdDozen}
                </span>
              </div>
            </div>
            
            {/* 1st COLUMN */}
            <div className="grid grid-cols-4 gap-1.5 items-center border-b border-[#10B981]/20 pb-1 hover:bg-[#10B981]/5 rounded-lg px-1.5 py-0.5 transition-all duration-200 hover:border-[#10B981]/40">
              <div className="text-center">
                <span className="text-[10px] text-gray-300 font-sans font-medium">1st COL</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-white font-sans font-bold">{stats.columns.first}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-[#10B981] font-sans font-bold">{stats.columns.firstPct}%</span>
              </div>
              <div className="text-center">
                <span className={`text-[10px] font-sans font-bold ${
                  stats.lastSpins.firstColumn === 'AHORA' 
                    ? 'text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]' 
                    : stats.lastSpins.firstColumn !== '-' 
                    ? 'text-yellow-400' 
                    : 'text-gray-400'
                }`}>
                  {stats.lastSpins.firstColumn}
                </span>
              </div>
            </div>
            
            {/* 2nd COLUMN */}
            <div className="grid grid-cols-4 gap-1.5 items-center border-b border-[#10B981]/20 pb-1 hover:bg-[#10B981]/5 rounded-lg px-1.5 py-0.5 transition-all duration-200 hover:border-[#10B981]/40">
              <div className="text-center">
                <span className="text-[10px] text-gray-300 font-sans font-medium">2nd COL</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-white font-sans font-bold">{stats.columns.second}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-[#10B981] font-sans font-bold">{stats.columns.secondPct}%</span>
              </div>
              <div className="text-center">
                <span className={`text-[10px] font-sans font-bold ${
                  stats.lastSpins.secondColumn === 'AHORA' 
                    ? 'text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]' 
                    : stats.lastSpins.secondColumn !== '-' 
                    ? 'text-yellow-400' 
                    : 'text-gray-400'
                }`}>
                  {stats.lastSpins.secondColumn}
                </span>
              </div>
            </div>
            
            {/* 3rd COLUMN */}
            <div className="grid grid-cols-4 gap-1.5 items-center pb-1 hover:bg-[#10B981]/5 rounded-lg px-1.5 py-0.5 transition-all duration-200">
              <div className="text-center">
                <span className="text-[10px] text-gray-300 font-sans font-medium">3rd COL</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-white font-sans font-bold">{stats.columns.third}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-[#10B981] font-sans font-bold">{stats.columns.thirdPct}%</span>
              </div>
              <div className="text-center">
                <span className={`text-[10px] font-sans font-bold ${
                  stats.lastSpins.thirdColumn === 'AHORA' 
                    ? 'text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]' 
                    : stats.lastSpins.thirdColumn !== '-' 
                    ? 'text-yellow-400' 
                    : 'text-gray-400'
                }`}>
                  {stats.lastSpins.thirdColumn}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-span-3 relative overflow-hidden rounded-[20px] p-2 flex backdrop-blur-2xl border border-[#10B981]/30 shadow-[0_12px_48px_rgba(16,185,129,0.18),0_0_0_1px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(16,185,129,0.15),inset_0_0_30px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(135deg, rgba(10,15,19,0.95) 0%, rgba(220,38,38,0.08) 30%, rgba(14,20,25,0.98) 50%, rgba(10,15,19,0.95) 100%)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.12),transparent_70%)] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(220,38,38,0.05) 10px, rgba(220,38,38,0.05) 20px)' }}></div>
        <ColorPercentagesCard 
          stats={colorStats}
          roundData={currentRoundData}
        />
      </div>
      
      <div className="col-span-3 relative overflow-hidden rounded-[20px] p-2 flex backdrop-blur-2xl border border-[#10B981]/30 shadow-[0_12px_48px_rgba(16,185,129,0.18),0_0_0_1px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(16,185,129,0.15),inset_0_0_30px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(135deg, rgba(10,15,19,0.95) 0%, rgba(16,185,129,0.08) 30%, rgba(14,20,25,0.98) 50%, rgba(10,15,19,0.95) 100%)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.12),transparent_70%)] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(16,185,129,0.05) 10px, rgba(16,185,129,0.05) 20px)' }}></div>
        <RangePercentagesCard 
          stats={rangeStats}
          roundData={currentRoundData}
        />
      </div>

      {/* Segunda fila completa dividida en 4 partes */}
      <div className="col-span-3 relative overflow-hidden rounded-[20px] flex items-center justify-center p-0 backdrop-blur-2xl border border-[#10B981]/35 shadow-[0_16px_64px_rgba(16,185,129,0.25),0_0_0_1px_rgba(0,0,0,0.9),inset_0_2px_0_rgba(16,185,129,0.2),inset_0_0_40px_rgba(0,0,0,0.6)]" style={{ background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.15) 0%, rgba(10,15,19,0.95) 40%, rgba(14,20,25,0.98) 100%)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_60%)] pointer-events-none animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(16,185,129,0.08) 15deg, transparent 30deg)' }}></div>
        <RouletteSpinner roundData={currentRoundData} />
      </div>
      
      <div className="col-span-3 relative overflow-hidden rounded-[20px] flex items-center justify-center p-2 backdrop-blur-2xl border border-[#10B981]/35 shadow-[0_16px_64px_rgba(16,185,129,0.25),0_0_0_1px_rgba(0,0,0,0.9),inset_0_2px_0_rgba(16,185,129,0.2),inset_0_0_40px_rgba(0,0,0,0.6)]" style={{ background: 'linear-gradient(135deg, rgba(10,15,19,0.95) 0%, rgba(16,185,129,0.12) 50%, rgba(10,15,19,0.95) 100%)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.15),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-25 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(16,185,129,0.04) 40px, rgba(16,185,129,0.04) 80px)' }}></div>
        <RoulettePredictionCard predictionData={predictionData} rawPrediction={rawPrediction || rawPredictionData} />
      </div>
      
      <div className="col-span-3 relative overflow-hidden rounded-[20px] p-2 flex backdrop-blur-2xl border border-[#10B981]/30 shadow-[0_12px_48px_rgba(16,185,129,0.18),0_0_0_1px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(16,185,129,0.15),inset_0_0_30px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(135deg, rgba(10,15,19,0.95) 0%, rgba(14,20,25,0.98) 20%, rgba(16,185,129,0.06) 50%, rgba(14,20,25,0.98) 80%, rgba(10,15,19,0.95) 100%)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.1),transparent_60%)] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(16,185,129,0.05) 10px, rgba(16,185,129,0.05) 20px)' }}></div>
        <DozenPercentagesCard 
          stats={dozenStats}
          roundData={currentRoundData}
        />
      </div>
      
      <div className="col-span-3 relative overflow-hidden rounded-[20px] p-2 flex backdrop-blur-2xl border border-[#10B981]/30 shadow-[0_12px_48px_rgba(16,185,129,0.18),0_0_0_1px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(16,185,129,0.15),inset_0_0_30px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(135deg, rgba(10,15,19,0.95) 0%, rgba(14,20,25,0.98) 20%, rgba(16,185,129,0.06) 50%, rgba(14,20,25,0.98) 80%, rgba(10,15,19,0.95) 100%)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.1),transparent_60%)] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(16,185,129,0.05) 10px, rgba(16,185,129,0.05) 20px)' }}></div>
        <ColumnPercentagesCard 
          stats={columnStats}
          roundData={currentRoundData}
        />
      </div>

      {/* Dropdown Menu usando Portal */}
      {typeof window !== 'undefined' && isMenuOpen && createPortal(
        <div 
          data-dropdown-menu
          className="fixed w-48 bg-gradient-to-br from-[#0A0F13]/98 to-[#0E1419]/98 border border-[#10B981]/30 rounded-xl backdrop-blur-2xl transition-all duration-300 shadow-[0_10px_40px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(16,185,129,0.15)] opacity-100 translate-y-0"
          style={{
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
            zIndex: 99999
          }}
        >
          <div className="py-2">
            <button
              onClick={handleGoHome}
              className="flex items-center w-full px-4 py-3 text-sm text-gray-200 hover:bg-[#10B981]/15 hover:text-[#10B981] transition-all duration-200 cursor-pointer font-orbitron-medium border-b border-[#10B981]/10 hover:border-[#10B981]/30"
            >
              <IoHome className="mr-3 text-lg" />
              Inicio
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm text-gray-200 hover:bg-[#DC2626]/15 hover:text-[#DC2626] transition-all duration-200 cursor-pointer font-orbitron-medium"
            >
              <BiLogOutCircle className="mr-3 text-lg" />
              Cerrar Sesión
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
