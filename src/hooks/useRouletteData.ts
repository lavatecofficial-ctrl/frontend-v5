import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getCookie } from '@/utils/cookies';

interface RouletteRoundData {
  number: number;
  color: string;
}

interface RouletteHistoryData {
  bookmakerId: number;
  rounds: RouletteRoundData[];
}

interface UseRouletteDataReturn {
  isConnected: boolean;
  roundData: RouletteRoundData | null;
  historyData: RouletteRoundData[] | null;
  error: string | null;
  rawPrediction: {
    bookmakerId: number;
    prediction_type: string;
    predicted_values: string[];
    probability: number;
    round_id?: string;
  } | null;
  subscribeRoulette: (bookmakerId: number) => void;
  unsubscribeRoulette: (bookmakerId: number) => void;
  disconnect: () => void;
}

export const useRouletteData = (): UseRouletteDataReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [roundData, setRoundData] = useState<RouletteRoundData | null>(null);
  const [historyData, setHistoryData] = useState<RouletteRoundData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawPrediction, setRawPrediction] = useState<{
    bookmakerId: number;
    prediction_type: string;
    predicted_values: string[];
    probability: number;
    round_id?: string;
  } | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const currentBookmakerId = useRef<number | null>(null);

  // Función para configurar los listeners del socket
  const setupSocketListeners = useCallback(() => {
    if (!socketRef.current) return;

    socketRef.current.on('connect', () => {
      console.log('Conectado al WebSocket de ruleta');
      setIsConnected(true);
      setError(null);
    });

    // Predicción cruda en el mismo namespace '/roulette'
    socketRef.current.on('prediction', (data: { bookmakerId: number; prediction_type: string; predicted_values: string[]; probability: number; round_id?: string }) => {
      console.log('Predicción recibida (useRouletteData):', data);
      setRawPrediction(data);
      setError(null);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Desconectado del WebSocket de ruleta:', reason);
      setIsConnected(false);
      
      // Reconexión automática si no fue una desconexión manual
      if (reason !== 'io client disconnect' && currentBookmakerId.current) {
        console.log('Intentando reconexión automática...');
        setTimeout(() => {
          if (currentBookmakerId.current && socketRef.current && !socketRef.current.connected) {
            console.log('Reconectando automáticamente...');
            // Usar una función interna para evitar dependencia circular
            const reconnect = () => {
              const s = socketRef.current;
              if (s && !s.connected) {
                s.connect();
              }
            };
            reconnect();
          }
        }, 2000); // Esperar 2 segundos antes de reconectar
      }
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Error de conexión:', err);
      setError('Error de conexión al servidor');
      setIsConnected(false);
      
      // Limpiar el error después de 5 segundos
      setTimeout(() => {
        setError(null);
      }, 5000);
    });

    // Manejar errores de transporte
    socketRef.current.on('error', (err) => {
      console.error('Error de transporte WebSocket:', err);
      setError('Error de conexión - Reintentando...');
      setIsConnected(false);
      
      // Limpiar el error después de 3 segundos
      setTimeout(() => {
        setError(null);
      }, 3000);
    });

    // Eventos de reconexión
    socketRef.current.on('reconnect', (attemptNumber) => {
      console.log(`Reconectado exitosamente después de ${attemptNumber} intentos`);
      setIsConnected(true);
      setError(null);
      
      // Re-suscribirse al bookmaker si existe
      if (currentBookmakerId.current) {
        console.log(`Re-suscribiendo al bookmaker ${currentBookmakerId.current}`);
        socketRef.current.emit('joinBookmaker', currentBookmakerId.current);
      }
    });

    socketRef.current.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Intento de reconexión ${attemptNumber}`);
      setError(`Reconectando... Intento ${attemptNumber}`);
    });

    socketRef.current.on('reconnect_error', (error) => {
      console.error('Error en reconexión:', error);
      setError('Error en reconexión');
    });

    socketRef.current.on('reconnect_failed', () => {
      console.error('Falló la reconexión después de todos los intentos');
      setError('No se pudo reconectar - Verifica tu conexión');
    });

    socketRef.current.on('newRound', (data: RouletteRoundData) => {
      console.log('Nueva ronda recibida:', data);
      setRoundData(data);
      console.log('Estado actualizado con nueva ronda');
      
      // Agregar el nuevo número al historial
      setHistoryData(prevHistory => {
        console.log('Historial anterior:', prevHistory?.length || 0, 'rondas');
        if (!prevHistory) {
          console.log('No hay historial previo, creando nuevo con:', data);
          return [data];
        }
        
        // Agregar al inicio del array (número más reciente primero)
        const newHistory = [data, ...prevHistory];
        console.log('Nuevo historial creado con:', newHistory.length, 'rondas');
        
        // Mantener solo los últimos 40 números
        const finalHistory = newHistory.slice(0, 40);
        console.log('Historial final después de slice:', finalHistory.length, 'rondas');
        return finalHistory;
      });
      
      setError(null);
    });

    socketRef.current.on('history', (data: RouletteHistoryData) => {
      console.log('Historial recibido:', data);
      console.log('Número de rondas en historial:', data.rounds?.length || 0);
      if (data.rounds && data.rounds.length > 0) {
        console.log('Primera ronda del historial recibido:', data.rounds[0]);
        console.log('Última ronda del historial recibido:', data.rounds[data.rounds.length - 1]);
      }
      setHistoryData(data.rounds);
      setError(null);
    });

    socketRef.current.on('joinedBookmaker', (data: { bookmakerId: number; success: boolean }) => {
      console.log('Unido al bookmaker:', data);
      if (data.success) {
        currentBookmakerId.current = data.bookmakerId;
        console.log(`Confirmado: Suscrito al bookmaker ${data.bookmakerId}`);
        setRoundData(null);
      }
    });

    socketRef.current.on('leftBookmaker', (data: { bookmakerId: number; success: boolean }) => {
      console.log('Desuscrito del bookmaker:', data);
      if (data.success && currentBookmakerId.current === data.bookmakerId) {
        currentBookmakerId.current = null;
        setRoundData(null);
        setHistoryData(null);
      }
    });

    socketRef.current.on('error', (data: { message: string }) => {
      console.error('Error en ruleta:', data.message);
      setError(data.message);
    });
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('WebSocket ya conectado');
      return;
    }

    // Si ya hay una conexión, desconectarla primero
    if (socketRef.current) {
      console.log('Desconectando conexión anterior...');
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    console.log('Conectando al WebSocket de ruleta...');
    
    // Obtener el token de autenticación desde cookies
    const token = getCookie('authToken');
    console.log('🔍 [ROULETTE-DATA] Token obtenido:', token ? `${token.substring(0, 20)}...` : 'NULL');
    
    socketRef.current = io(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://grupoaviatorcolombia.app'}/roulette`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: {
        token: token || '',
      },
      // Configuración para mayor estabilidad
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // Configurar los listeners
    setupSocketListeners();
  }, [setupSocketListeners]);

  const subscribeRoulette = useCallback((bookmakerId: number) => {
    console.log(`Suscribiendo a bookmaker ${bookmakerId}`);
    
    // Si es el mismo bookmaker, no hacer nada
    if (currentBookmakerId.current === bookmakerId) {
      console.log(`Ya suscrito al bookmaker ${bookmakerId}`);
      return;
    }

    // Si hay un bookmaker diferente, desuscribirse primero
    if (currentBookmakerId.current && currentBookmakerId.current !== bookmakerId) {
      console.log(`Cambiando de bookmaker ${currentBookmakerId.current} a ${bookmakerId}`);
      if (socketRef.current?.connected) {
        socketRef.current.emit('leaveBookmaker', currentBookmakerId.current);
      }
    }
    
    // Actualizar el bookmaker actual
    currentBookmakerId.current = bookmakerId;

    // Conectar si no está conectado
    if (!socketRef.current?.connected) {
      connect();
      // Esperar a que se conecte antes de suscribirse
      const checkConnection = () => {
        if (socketRef.current?.connected) {
          socketRef.current.emit('joinBookmaker', bookmakerId);
        } else {
          // Reintentar cada 500ms hasta que se conecte
          setTimeout(checkConnection, 500);
        }
      };
      setTimeout(checkConnection, 500);
    } else {
      socketRef.current.emit('joinBookmaker', bookmakerId);
    }
  }, [connect]);

  const unsubscribeRoulette = useCallback((bookmakerId: number) => {
    if (socketRef.current?.connected) {
      console.log(`Desuscribiendo de bookmaker ${bookmakerId}`);
      socketRef.current.emit('leaveBookmaker', bookmakerId);
      currentBookmakerId.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('Desconectando WebSocket de ruleta...');
      // Remover todos los listeners antes de desconectar
      socketRef.current.off('connect');
      socketRef.current.off('disconnect');
      socketRef.current.off('connect_error');
      socketRef.current.off('newRound');
      socketRef.current.off('history');
      socketRef.current.off('joinedBookmaker');
      socketRef.current.off('leftBookmaker');
      socketRef.current.off('error');
      
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setRoundData(null);
      setHistoryData(null);
      setError(null);
      currentBookmakerId.current = null;
    }
  }, []);

  // Limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    roundData,
    historyData,
    error,
    rawPrediction,
    subscribeRoulette,
    unsubscribeRoulette,
    disconnect,
  };
};
