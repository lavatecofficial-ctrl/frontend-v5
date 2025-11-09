import { useState, useCallback, useMemo } from 'react';
import { APP_CONFIG } from '../config';

interface SpacemanStatus {
  isActive: boolean;
  activeConnections: number;
  totalSpaceman: number;
  connectionsStatus: any;
  timestamp: string;
  lastTokenUpdate?: string;
  sessionUrl?: string;
}

interface SpacemanBookmakerInfo {
  id: number;
  bookmakerId: number;
  gameId: number;
  urlWebsocket: string;
  apiMessage: string;
  authMessage: string;
  pingMessage: string;
  statusWs: string;
  createdAt: string;
  tokenUpdatedAt?: string;
  bookmaker: any;
  game: any;
}

export const useSpaceman = () => {
  const [status, setStatus] = useState<SpacemanStatus | null>(null);
  const [bookmakerInfo, setBookmakerInfo] = useState<SpacemanBookmakerInfo | null>(null);
  const [websockets, setWebsockets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('backendToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const getStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Making Spaceman status request...');
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/spaceman/status`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      const data = await response.json();

      if (data.success) {
        setStatus(data.data);
        console.log('✅ Spaceman status updated successfully');
      } else {
        setError(data.message || 'Error al obtener estado');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      console.error('Error getting Spaceman status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const start = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/spaceman/start`, {
        method: 'POST',
        headers: getAuthHeader(),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, message: data.message };
      } else {
        setError(data.message || 'Error al iniciar Spaceman');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error de conexión';
      setError(errorMsg);
      console.error('Error starting Spaceman:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllWebSockets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/spaceman/websockets`, {
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
      console.error('Error getting all spaceman websockets:', err);
      return { success: false, message: errorMessage, data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAuthMessageById = useCallback(async (id: number, authMessage: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = `${APP_CONFIG.api.baseUrl}/api/spaceman/websocket/${id}/auth-message`;
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ authMessage }),
      });

      const data = await response.json();
      if (data.success) {
        return { success: true };
      } else {
        setError(data.message || 'Error al actualizar Auth Message');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error de conexión';
      setError(errorMessage);
      console.error('Error updating Spaceman auth message by ID:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSessionUrl = useCallback(async (url: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/spaceman/session-url`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, message: data.message };
      } else {
        setError(data.message || 'Error al actualizar URL');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error de conexión';
      setError(errorMsg);
      console.error('Error updating session URL:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getBookmakerInfo = useCallback(async (bookmakerId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      if (status) {
        const mockBookmakerInfo = {
          id: 1,
          bookmakerId: bookmakerId,
          gameId: 2,
          urlWebsocket: status.sessionUrl || '',
          apiMessage: '',
          authMessage: '',
          pingMessage: '',
          statusWs: status.isActive ? 'CONNECTED' : 'DISCONNECTED',
          createdAt: status.timestamp || new Date().toISOString(),
          tokenUpdatedAt: status.lastTokenUpdate,
          bookmaker: { bookmaker: '888Starz', isActive: true },
          game: { name: 'Spaceman' }
        };
        setBookmakerInfo(mockBookmakerInfo);
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      console.error('Error getting Spaceman bookmaker info:', err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  const updateWebSocketUrl = useCallback(async (bookmakerId: number, url: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/spaceman/bookmaker/${bookmakerId}/websocket-url`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
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
  }, []);

  const updateWebSocketStatus = useCallback(async (bookmakerId: number, status: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/spaceman/bookmaker/${bookmakerId}/status`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true };
      } else {
        setError(data.message || 'Error al actualizar estado del WebSocket');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error de conexión';
      setError(errorMessage);
      console.error('Error updating Spaceman WebSocket status:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(() => ({
    status,
    bookmakerInfo,
    websockets,
    loading,
    error,
    getStatus,
    getBookmakerInfo,
    getAllWebSockets,
    updateWebSocketUrl,
    updateWebSocketStatus,
    start,
    updateSessionUrl,
    updateAuthMessageById,
  }), [status, bookmakerInfo, websockets, loading, error, getStatus, getBookmakerInfo, getAllWebSockets, updateWebSocketUrl, updateWebSocketStatus, start, updateSessionUrl, updateAuthMessageById]);
};
