import { useState, useCallback } from 'react';
import { APP_CONFIG } from '../config';
import { getCookie } from '../utils/cookies';

interface RouletteStatus {
  isActive: boolean;
  activeConnections: number;
  totalBookmakers: number;
  connectionsStatus: any;
  timestamp: string;
}

interface RouletteBookmakerInfo {
  id: number;
  bookmakerId: number;
  gameId: number;
  page: string;
  createdAt: string;
  bookmaker: any;
  game: any;
}

export const useRoulette = () => {
  const [status, setStatus] = useState<RouletteStatus | null>(null);
  const [bookmakerInfo, setBookmakerInfo] = useState<RouletteBookmakerInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeader = () => {
    const token = getCookie('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const getStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/roulette/connections/status`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      const data = await response.json();

      if (data.success) {
        setStatus(data.data);
      } else {
        setError(data.message || 'Error al obtener estado');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      console.error('Error getting Roulette status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getBookmakerInfo = useCallback(async (bookmakerId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const headers = getAuthHeader();
      console.log('=== ROULETTE DEBUG ===');
      console.log('URL:', `${APP_CONFIG.api.baseUrl}/api/roulette/bookmaker/${bookmakerId}`);
      console.log('Headers:', headers);
      console.log('Token from cookies:', getCookie('authToken'));
      console.log('========================');
      
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/roulette/bookmaker/${bookmakerId}`, {
        method: 'GET',
        headers: headers,
      });

      const data = await response.json();

      if (data.success) {
        setBookmakerInfo(data.data);
      } else {
        setError(data.message || 'Error al obtener información del bookmaker');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      console.error('Error getting Roulette bookmaker info:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWebSocketUrl = useCallback(async (bookmakerId: number, url: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/roulette/bookmaker/${bookmakerId}/websocket-url`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        // Recargar la información del bookmaker
        await getBookmakerInfo(bookmakerId);
        return { success: true, message: data.message };
      } else {
        setError(data.message || 'Error al actualizar la URL WebSocket');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error de conexión';
      setError(errorMsg);
      console.error('Error updating WebSocket URL:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [getBookmakerInfo]);

  const start = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/roulette/start`, {
        method: 'POST',
        headers: getAuthHeader(),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, message: data.message };
      } else {
        setError(data.message || 'Error al iniciar Roulette');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error de conexión';
      setError(errorMsg);
      console.error('Error starting Roulette:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/roulette/stop`, {
        method: 'POST',
        headers: getAuthHeader(),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, message: data.message };
      } else {
        setError(data.message || 'Error al detener Roulette');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error de conexión';
      setError(errorMsg);
      console.error('Error stopping Roulette:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const restart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/roulette/restart`, {
        method: 'POST',
        headers: getAuthHeader(),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, message: data.message };
      } else {
        setError(data.message || 'Error al reiniciar Roulette');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error de conexión';
      setError(errorMsg);
      console.error('Error restarting Roulette:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetConnections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/roulette/reset-connections`, {
        method: 'POST',
        headers: getAuthHeader(),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, message: data.message || 'Todas las conexiones de ruleta reseteadas exitosamente' };
      } else {
        setError(data.message || 'Error al resetear conexiones');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error de conexión';
      setError(errorMsg);
      console.error('Error resetting all Roulette connections:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(() => ({
    status,
    bookmakerInfo,
    loading,
    error,
    getStatus,
    getBookmakerInfo,
    updateWebSocketUrl,
    start,
    stop,
    restart,
    resetConnections,
  }), [status, bookmakerInfo, loading, error, getStatus, getBookmakerInfo, updateWebSocketUrl, start, stop, restart, resetConnections]);
};
