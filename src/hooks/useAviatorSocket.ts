import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

interface RoundData {
  online_players: number;
  bets_count: number;
  total_bet_amount: number;
  total_cashout: number;
  current_multiplier: number;
  max_multiplier: number;
  game_state: 'Bet' | 'Run' | 'End';
  round_id?: string;
  casino_profit?: number;
}

interface Prediction {
  prediction: number;
  score: number;
  apostar: 'SI' | 'NO';
  round_id: string;
}

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

const useAviatorSocket = (bookmakerId: number) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roundData, setRoundData] = useState<RoundData>({
    online_players: 0,
    bets_count: 0,
    total_bet_amount: 0,
    total_cashout: 0,
    current_multiplier: 0,
    max_multiplier: 0,
    game_state: 'Bet',
  });
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [notification, setNotification] = useState({ message: '', type: 'success' | 'error' | 'info' });
  const [isConnected, setIsConnected] = useState(false);
  const lastGameState = useRef('Bet');
  const lastProcessedRoundId = useRef<string | null>(null);
  const processedRoundIds = useRef<Set<string>>(new Set());

  // Conectar al WebSocket
  useEffect(() => {
    if (!isAuthenticated || !bookmakerId) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      setNotification({ message: 'No autenticado. Redirigiendo al login...', type: 'error' });
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    // URL del WebSocket (ajusta según tu configuración)
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'https://grupoaviatorcolombia.app';
    const newSocket = io(`${wsUrl}/aviator`, {
      transports: ['websocket', 'polling'],
      auth: {
        token: token,
      },
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('joinBookmaker', bookmakerId);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Error de conexión WebSocket:', error);
      setNotification({ message: 'Error de conexión con el servidor.', type: 'error' });
      setIsConnected(false);
    });

    // Escuchar confirmación de unión a bookmaker
    newSocket.on('joinedBookmaker', (data) => {
      // Confirmación recibida
    });

    // Debounce timer para evitar actualizaciones múltiples
    let historyUpdateTimer: NodeJS.Timeout | null = null;

    // Escuchar historial (inicial al conectarse Y actualizaciones en cada crash)
    newSocket.on('history', (data) => {
      // VALIDAR que los datos sean del bookmaker correcto
      if (data.bookmakerId && data.bookmakerId !== bookmakerId) {
        console.warn(`⚠️ Historial recibido de bookmaker ${data.bookmakerId}, pero esperaba ${bookmakerId}. Ignorando.`);
        return;
      }
      
      if (data.rounds && Array.isArray(data.rounds)) {
        // Cancelar actualización pendiente
        if (historyUpdateTimer) {
          clearTimeout(historyUpdateTimer);
        }

        const transformedRounds = data.rounds.map((round: any) => ({
          id: round.id || `${round.round_id || round.roundId}`,
          roundId: round.roundId || round.round_id || '',
          maxMultiplier: parseFloat(round.maxMultiplier || round.max_multiplier || 0),
          totalBetAmount: parseFloat(round.totalBetAmount || round.total_bet_amount || 0),
          totalCashout: parseFloat(round.totalCashout || round.total_cashout || 0),
          casinoProfit: parseFloat(round.casinoProfit || round.casino_profit || 0),
          betsCount: parseInt(round.betsCount || round.bets_count || 0),
          onlinePlayers: parseInt(round.onlinePlayers || round.online_players || 0),
          createdAt: new Date(round.createdAt || round.created_at || Date.now())
        }));
        
        console.log(`📊 [HISTORY] Actualizando historial para bookmaker ${bookmakerId}: ${transformedRounds.length} rondas`);
        
        // Actualizar después de un pequeño delay para evitar renders múltiples
        historyUpdateTimer = setTimeout(() => {
          setHistory(transformedRounds);
          historyUpdateTimer = null;
        }, 50);
      }
    });

    // Escuchar datos RAW en tiempo real (sin procesamiento del backend)
    newSocket.on('aviator_raw', (msg) => {
      // VALIDAR que los datos sean del bookmaker correcto
      if (msg.bookmakerId !== bookmakerId) {
        console.warn(`⚠️ Datos recibidos de bookmaker ${msg.bookmakerId}, pero esperaba ${bookmakerId}. Ignorando.`);
        return;
      }
      
      const { data } = msg;
      if (data.p && data.p.c) {
        const command = data.p.c;
        const payload = data.p.p;

        switch(command) {
          case 'x':
            // SOLO actualizar multiplicador, mantener el estado actual si ya es Run
            if (payload.x) {
              setRoundData(prev => ({
                ...prev,
                current_multiplier: payload.x,
                // Solo cambiar a Run si no está en Run o End
                game_state: prev.game_state === 'Bet' ? 'Run' as const : prev.game_state,
                max_multiplier: payload.crashX || prev.max_multiplier,
              }));
            }
            break;
          
          case 'changeState':
            // Solo actualizar estado y round_id
            const states = {1: 'Bet', 2: 'Run', 3: 'End', 4: 'Bet'};
            const stateName = states[payload.state as keyof typeof states] || 'Bet';
            
            setRoundData(prev => ({
              ...prev,
              game_state: stateName as 'Bet' | 'Run' | 'End',
              round_id: payload.roundId || prev.round_id,
              // Resetear multiplicador y cashout cuando empieza nueva ronda
              current_multiplier: stateName === 'Bet' ? 0 : prev.current_multiplier,
              total_cashout: stateName === 'Bet' ? 0 : prev.total_cashout,
              // NO resetear apuestas aquí - se resetean cuando llegan nuevos datos
            }));
            break;
          
          case 'updateCurrentBets':
            // Actualizar apuestas actuales SOLO durante el estado Bet
            if (payload.betsCount !== undefined) {
              setRoundData(prev => {
                // Solo actualizar si estamos en estado Bet
                if (prev.game_state !== 'Bet') {
                  return prev;
                }
                
                const newTotalBet = payload.bets?.reduce((sum: number, bet: any) => sum + (bet.bet || 0), 0) || 0;
                
                // Contar jugadores únicos (algunos jugadores hacen 2 apuestas)
                const uniquePlayers = new Set(
                  payload.bets?.map((bet: any) => bet.player_id) || []
                ).size;
                
                return {
                  ...prev,
                  bets_count: payload.betsCount,
                  total_bet_amount: newTotalBet,
                  online_players: uniquePlayers || payload.activePlayersCount || prev.online_players,
                };
              });
            }
            break;
          
          case 'updateCurrentCashOuts':
            // Actualizar cashouts - el WebSocket ya envía el total acumulado
            if (payload.totalCashOut !== undefined) {
              setRoundData(prev => ({
                ...prev,
                total_cashout: payload.totalCashOut, // Usar el valor que ya viene calculado
                // NO actualizar jugadores aquí - solo durante Bet
              }));
            }
            break;
          
          case 'roundChartInfo':
            // Información final de la ronda
            if (payload.maxMultiplier !== undefined) {
              setRoundData(prev => ({
                ...prev,
                max_multiplier: payload.maxMultiplier,
                casino_profit: prev.total_bet_amount - prev.total_cashout,
              }));
            }
            break;
        }
      }
    });

    // Solo para bookmakers que NO sean GoBet (GoBet usa aviator_raw)
    if (bookmakerId !== 1) {
      newSocket.on('multiplier', (data) => {
        setRoundData(prev => ({
          ...prev,
          current_multiplier: parseFloat(data.current_multiplier) || 0,
          game_state: 'Run' as const,
        }));
      });

      newSocket.on('round', (data) => {
        const newGameState = data.game_state || 'Bet';

        setRoundData(prev => ({
          online_players: parseInt(data.online_players) || 0,
          bets_count: parseInt(data.bets_count) || 0,
          total_bet_amount: parseFloat(data.total_bet_amount) || 0,
          total_cashout: parseFloat(data.total_cashout) || 0,
          current_multiplier: prev.current_multiplier,
          max_multiplier: parseFloat(data.max_multiplier) || 0,
          game_state: newGameState as 'Bet' | 'Run' | 'End',
          round_id: data.round_id,
          casino_profit: parseFloat(data.casino_profit) || 0,
        }));
      });
    }
    // Fin del bloque if (bookmakerId !== 1)

    // Escuchar información del gráfico de la ronda
    newSocket.on('roundChartInfo', (data) => {
      setRoundData(prev => ({
        ...prev,
        max_multiplier: parseFloat(data.maxMultiplier) || 0,
        round_id: data.roundId,
      }));
    });

    // Escuchar inicio de ronda
    newSocket.on('roundStart', (data) => {
      setRoundData(prev => ({
        ...prev,
        round_id: data.roundId,
        game_state: 'Bet' as const,
        current_multiplier: 0,
        max_multiplier: 0,
      }));
    });

    // Escuchar predicciones (si las tienes)
    newSocket.on('prediction', (predictionData) => {
      // Normalizar el valor de apostar para manejar tanto "SÍ" como "SI"
      const apostarValue = predictionData.apostar === 'SÍ' ? 'SI' : (predictionData.apostar || 'NO');
      
      setPrediction({
        prediction: parseFloat(predictionData.prediction) || 0,
        score: parseFloat(predictionData.score) || 0,
        apostar: apostarValue,
        round_id: predictionData.round_id,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [bookmakerId, isAuthenticated, router]);

  // Función para limpiar notificaciones
  const clearNotification = useCallback(() => {
    setNotification({ message: '', type: 'success' });
  }, []);

  return {
    socket,
    roundData,
    prediction,
    history,
    notification,
    isConnected,
    clearNotification,
    setNotification,
  };
};

export default useAviatorSocket;
