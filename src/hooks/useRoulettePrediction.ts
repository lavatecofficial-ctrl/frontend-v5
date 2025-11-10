import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getCookie } from '@/utils/cookies';

interface PredictionData {
  bookmakerId: number;
  number: number;
  data: {
    nextNumbers: Array<{
      id: number;
      number: number;
      color: string;
      dozen: string;
      column: string;
      timestamp: string;
    }>;
    percentages: {
      colors: { red: string; black: string; green: string };
      columns: { zero: string; first: string; second: string; third: string };
      dozens: { zero: string; first: string; second: string; third: string };
      ranges: { zero: string; low: string; high: string };
      totalOccurrences: number;
    };
  };
  timestamp: string;
}

interface HistoryData {
  bookmakerId: number;
  history: Array<{
    id: number;
    roulette_id: number;
    round_id: string;
    number: number;
    color: string;
    timestamp: string;
    name: string;
  }>;
  timestamp: string;
}

interface UseRoulettePredictionReturn {
  isConnected: boolean;
  predictionData: PredictionData | null;
  rawPrediction: {
    bookmakerId: number;
    prediction_type: string;
    predicted_values: string[];
    probability: number;
    round_id?: string;
  } | null;
  historyData: HistoryData | null;
  error: string | null;
  subscribePrediction: (bookmakerId: number, number: number) => void;
  unsubscribePrediction: (bookmakerId: number, number: number) => void;
  getLatestHistory: (bookmakerId: number) => void;
  requestImmediateUpdate: (bookmakerId: number, number: number) => void;
  joinBookmaker: (bookmakerId: number) => void;
  disconnect: () => void;
}

export const useRoulettePrediction = (): UseRoulettePredictionReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [rawPrediction, setRawPrediction] = useState<{
    bookmakerId: number;
    prediction_type: string;
    predicted_values: string[];
    probability: number;
    round_id?: string;
  } | null>(null);
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const currentSubscription = useRef<{ bookmakerId: number; number: number } | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const token = typeof window !== 'undefined' ? getCookie('authToken') : '';
    const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://grupoaviatorcolombia.app'}/roulette`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: { token: token || '' },
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      // console.log('Conectado al websocket de predicción de ruleta');
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      // console.log('Desconectado del websocket de predicción de ruleta');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      // console.error('Error de conexión al websocket de predicción:', err);
      setError('Error de conexión al servidor');
      setIsConnected(false);
    });

    socket.on('predictionData', (data: PredictionData) => {
      // console.log('Datos de predicción recibidos:', data);
      setPredictionData(data);
      setError(null);
    });

    socket.on('predictionUpdate', (data: PredictionData) => {
      // console.log('Actualización de predicción recibida:', data);
      setPredictionData(data);
      setError(null);
    });

    // Evento real que llega desde websocket: 'prediction'
    socket.on('prediction', (data: { bookmakerId: number; prediction_type: string; predicted_values: string[]; probability: number; round_id?: string }) => {
      // console.log('Predicción (raw) recibida:', data);
      setRawPrediction(data);
      setError(null);
    });

    socket.on('latestHistory', (data: HistoryData) => {
      // console.log('Historial recibido:', data);
      setHistoryData(data);
      setError(null);
    });

    socket.on('predictionError', (data: { message: string }) => {
      // console.error('Error en predicción:', data.message);
      setError(data.message);
    });

    socket.on('historyError', (data: { message: string }) => {
      // console.error('Error en historial:', data.message);
      setError(data.message);
    });

    socket.on('subscribedPrediction', (data: { bookmakerId: number; number: number; success: boolean }) => {
      // console.log('Suscripción exitosa a predicción:', data);
      if (data.success) {
        currentSubscription.current = { bookmakerId: data.bookmakerId, number: data.number };
      }
    });

    socketRef.current = socket;
  }, []);

  const subscribePrediction = useCallback((bookmakerId: number, number: number) => {
    if (!socketRef.current?.connected) {
      connect();
      // Esperar a que se conecte antes de suscribirse
      setTimeout(() => {
        socketRef.current?.emit('subscribePrediction', { bookmakerId, number });
      }, 1000);
    } else {
      socketRef.current.emit('subscribePrediction', { bookmakerId, number });
    }
  }, [connect]);

  const joinBookmaker = useCallback((bookmakerId: number) => {
    if (!socketRef.current?.connected) {
      connect();
      const tryJoin = () => {
        if (socketRef.current?.connected) {
          socketRef.current.emit('joinBookmaker', bookmakerId);
        } else {
          setTimeout(tryJoin, 500);
        }
      };
      setTimeout(tryJoin, 500);
    } else {
      socketRef.current.emit('joinBookmaker', bookmakerId);
    }
  }, [connect]);

  const unsubscribePrediction = useCallback((bookmakerId: number, number: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribePrediction', { bookmakerId, number });
      currentSubscription.current = null;
    }
  }, []);

  const getLatestHistory = useCallback((bookmakerId: number) => {
    if (!socketRef.current?.connected) {
      connect();
      // Esperar a que se conecte antes de solicitar historial
      setTimeout(() => {
        socketRef.current?.emit('getLatestHistory', bookmakerId);
      }, 1000);
    } else {
      socketRef.current.emit('getLatestHistory', bookmakerId);
    }
  }, [connect]);

  const requestImmediateUpdate = useCallback((bookmakerId: number, number: number) => {
    if (!socketRef.current?.connected) {
      connect();
      // Esperar a que se conecte antes de solicitar actualización
      setTimeout(() => {
        socketRef.current?.emit('requestImmediateUpdate', { bookmakerId, number });
      }, 1000);
    } else {
      socketRef.current.emit('requestImmediateUpdate', { bookmakerId, number });
    }
  }, [connect]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setPredictionData(null);
      setHistoryData(null);
      setError(null);
      currentSubscription.current = null;
    }
  }, []);

  // Conectar automáticamente al montar el componente
  useEffect(() => {
    connect();

    // Limpiar al desmontar
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    predictionData,
    rawPrediction,
    historyData,
    error,
    subscribePrediction,
    unsubscribePrediction,
    getLatestHistory,
    requestImmediateUpdate,
    joinBookmaker,
    disconnect,
  };
};
