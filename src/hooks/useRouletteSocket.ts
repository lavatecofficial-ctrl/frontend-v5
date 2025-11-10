import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { getCookie } from '@/utils/cookies';

interface RouletteHistoryItem {
  id: number;
  bookmakerId: number;
  roundId: string;
  number: number;
  color: string;
  timestamp: string;
  bookmakerName: string;
}

interface RouletteRoundData {
  bookmakerId: number;
  rouletteName: string;
  roundId: string;
  number: number;
  color: string;
  dozen: string;
  column: string;
  timestamp: string;
  predictionStats: {
    nextNumbers: any[];
    percentages: {
      colors: {
        red: string;
        black: string;
        green: string;
      };
      columns: {
        zero: string;
        first: string;
        second: string;
        third: string;
      };
      dozens: {
        zero: string;
        first: string;
        second: string;
        third: string;
      };
      ranges: {
        zero: string;
        low: string;
        high: string;
      };
      totalOccurrences: number;
    };
  };
}

const useRouletteSocket = (bookmakerId: number) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [history, setHistory] = useState<RouletteHistoryItem[]>([]);
  const [latestRound, setLatestRound] = useState<RouletteRoundData | null>(null);
  const [notification, setNotification] = useState({ message: '', type: 'success' | 'error' | 'info' });
  const [isConnected, setIsConnected] = useState(false);
  const processedRoundIds = useRef<Set<string>>(new Set());

  // Conectar al WebSocket
  useEffect(() => {
    if (!isAuthenticated || !bookmakerId) return;

    const token = getCookie('authToken');
    if (!token) {
      setNotification({ message: 'No autenticado. Redirigiendo al login...', type: 'error' });
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    // URL del WebSocket
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'https://grupoaviatorcolombia.app';
    const newSocket = io(`${wsUrl}/roulette`, {
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
      console.error('Error de conexión WebSocket de ruleta:', error);
      setNotification({ message: 'Error de conexión con el servidor.', type: 'error' });
      setIsConnected(false);
    });

    // Escuchar confirmación de unión a bookmaker
    newSocket.on('joinedBookmaker', (data) => {
      console.log('Conectado a ruleta bookmaker:', data);
    });

    // Escuchar historial de rondas
    newSocket.on('history', (data) => {
      if (data.rounds && Array.isArray(data.rounds)) {
        setHistory(data.rounds);
        // Limpiar el Set de IDs procesados cuando se recibe nuevo historial
        processedRoundIds.current.clear();
        console.log('🧹 Set de IDs procesados limpiado al recibir nuevo historial de ruleta');
      }
    });

    // Escuchar nuevas rondas
    newSocket.on('newRound', (data: RouletteRoundData) => {
      // Verificar que no hayamos procesado ya esta ronda
      if (!processedRoundIds.current.has(data.roundId)) {
        processedRoundIds.current.add(data.roundId);
        
        setLatestRound(data);
        
        // Agregar la nueva ronda al historial
        const newHistoryItem: RouletteHistoryItem = {
          id: Date.now(), // ID temporal
          bookmakerId: data.bookmakerId,
          roundId: data.roundId,
          number: data.number,
          color: data.color,
          timestamp: data.timestamp,
          bookmakerName: data.rouletteName
        };

        setHistory(prevHistory => {
          // Verificar que la ronda no esté ya en el historial
          const roundExists = prevHistory.some(item => item.roundId === data.roundId);
          if (roundExists) {
            console.log('⚠️ Ronda ya existe en historial de ruleta, ignorando:', data.roundId);
            return prevHistory;
          }
          
          return [newHistoryItem, ...prevHistory.slice(0, 499)]; // Mantener solo las últimas 500 rondas
        });
        
        console.log('🔄 Nueva ronda de ruleta recibida:', data);
        
        // Mostrar notificación
        setNotification({
          message: `Nueva ronda: ${data.number} (${data.color})`,
          type: 'success'
        });
        
        // Limpiar notificación después de 3 segundos
        setTimeout(() => {
          setNotification({ message: '', type: 'success' });
        }, 3000);
      } else {
        console.log('⚠️ Ronda de ruleta ya procesada, ignorando:', data.roundId);
      }
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
    history,
    latestRound,
    notification,
    isConnected,
    clearNotification,
    setNotification,
  };
};
export default useRouletteSocket;

