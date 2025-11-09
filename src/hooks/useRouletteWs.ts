import { useState, useCallback } from 'react';
import { APP_CONFIG } from '@/config';

export interface RouletteWsItem {
  id: number;
  bookmakerId: number;
  gameId: number;
  page: string;
  createdAt: string;
  updatedAt: string;
  bookmaker?: any;
  game?: any;
  isEditable: boolean;
}

export const useRouletteWs = () => {
  const [websockets, setWebsockets] = useState<RouletteWsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    } as Record<string, string>;
  };

  const getAllWebSockets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${APP_CONFIG.api.baseUrl}/api/roulette/websockets`, {
        headers: getAuthHeader(),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Error al obtener websockets');
      setWebsockets(data.data || []);
    } catch (e: any) {
      setError(e.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }, []);

  const connectRoulette = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const res = await fetch(`${APP_CONFIG.api.baseUrl}/api/roulette/start`, {
        method: 'POST',
        headers: getAuthHeader(),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Error al conectar ruleta');
      await getAllWebSockets();
      return { success: true, message: data.message };
    } catch (e: any) {
      setError(e.message || 'Error inesperado');
      return { success: false, message: e.message };
    } finally {
      setConnecting(false);
    }
  }, [getAllWebSockets]);

  // Edición deshabilitada: función retirada

  return {
    websockets,
    loading,
    error,
    getAllWebSockets,
    connecting,
    connectRoulette,
  };
};
