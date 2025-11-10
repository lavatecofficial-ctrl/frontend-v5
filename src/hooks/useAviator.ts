import { useState, useCallback, useMemo } from 'react';
import { APP_CONFIG } from '../config';
import { getCookie } from '../utils/cookies';

interface AviatorStatus {
  isActive: boolean;
  connections: any[];
  lastUpdate: Date;
}

interface AviatorBookmakerInfo {
  id: number;
  bookmakerId: number;
  gameId: number;
  urlWebsocket: string;
  apiMessage: string;
  authMessage: string;
  pingMessage: string;
  statusWs: string;
  createdAt: string;
  updatedAt: string;
  isEditable?: boolean;
  bookmaker: any;
  game: any;
}

export const useAviator = () => {
  const [status, setStatus] = useState<AviatorStatus | null>(null);
  const [bookmakerInfo, setBookmakerInfo] = useState<AviatorBookmakerInfo | null>(null);
  const [websockets, setWebsockets] = useState<AviatorBookmakerInfo[]>([]);
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
      
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/aviator/connections/status`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      const data = await response.json();

      if (data.success) {
        // Transformar el estado para que sea compatible con la UI
        const transformedStatus = {
          isActive: data.data.some((conn: any) => conn.status === 'CONNECTED'),
          connections: data.data,
          lastUpdate: new Date()
        };
        setStatus(transformedStatus);
      } else {
        setError(data.message || 'Error al obtener estado');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      console.error('Error getting Aviator status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getBookmakerInfo = useCallback(async (bookmakerId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/aviator/bookmaker/${bookmakerId}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      const data = await response.json();

      if (data.success) {
        setBookmakerInfo(data.data);
      } else {
        setError(data.message || 'Error al obtener información del bookmaker');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      console.error('Error getting Aviator bookmaker info:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAuthMessage = useCallback(async (bookmakerId: number, authMessage: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/aviator/bookmaker/${bookmakerId}/auth-message`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ authMessage }),
      });

      const data = await response.json();

      if (data.success) {
        // Recargar la información del bookmaker
        await getBookmakerInfo(bookmakerId);
        return { success: true };
      } else {
        setError(data.message || 'Error al actualizar Auth Message');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error de conexión';
      setError(errorMessage);
      console.error('Error updating Aviator auth message:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [getBookmakerInfo]);

  const updateAuthMessageById = useCallback(async (id: number, authMessage: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `${APP_CONFIG.api.baseUrl}/api/aviator/websocket/${id}/auth-message`;
      console.log('🌐 Llamando endpoint:', url);
      console.log('📦 Payload:', { authMessage: authMessage.substring(0, 50) + '...' });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ authMessage }),
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);

      if (data.success) {
        return { success: true };
      } else {
        setError(data.message || 'Error al actualizar Auth Message');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error de conexión';
      setError(errorMessage);
      console.error('❌ Error updating Aviator auth message by ID:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWebSocketUrlById = useCallback(async (id: number, url: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/aviator/websocket/${id}/url`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true };
      } else {
        setError(data.message || 'Error al actualizar URL WebSocket');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error de conexión';
      setError(errorMessage);
      console.error('Error updating WebSocket URL by ID:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWebSocketStatus = useCallback(async (bookmakerId: number, status: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/aviator/bookmaker/${bookmakerId}/status`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        // Recargar la información del bookmaker
        await getBookmakerInfo(bookmakerId);
        return { success: true };
      } else {
        setError(data.message || 'Error al actualizar estado del WebSocket');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error de conexión';
      setError(errorMessage);
      console.error('Error updating Aviator WebSocket status:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [getBookmakerInfo]);

  const getAllWebSockets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/aviator/websockets`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      const data = await response.json();

      if (data.success) {
        setWebsockets(data.data);
        return { success: true, data: data.data };
      } else {
        setError(data.message || 'Error al obtener websockets');
        return { success: false, message: data.message, data: [] };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error de conexión';
      setError(errorMessage);
      console.error('Error getting all websockets:', err);
      return { success: false, message: errorMessage, data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const start = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/aviator/start`, {
        method: 'POST',
        headers: getAuthHeader(),
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Actualizar el estado después de iniciar
        await getStatus();
        return { success: true, message: data.message };
      } else {
        setError(data.message || 'Error al iniciar Aviator');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error de conexión';
      setError(errorMsg);
      console.error('Error starting Aviator:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [getStatus]);

  return useMemo(() => ({
    status,
    bookmakerInfo,
    websockets,
    loading,
    error,
    getStatus,
    getBookmakerInfo,
    getAllWebSockets,
    updateAuthMessage,
    updateAuthMessageById,
    updateWebSocketUrlById,
    updateWebSocketStatus,
    start,
  }), [status, bookmakerInfo, websockets, loading, error, getStatus, getBookmakerInfo, getAllWebSockets, updateAuthMessage, updateAuthMessageById, updateWebSocketUrlById, updateWebSocketStatus, start]);
};
