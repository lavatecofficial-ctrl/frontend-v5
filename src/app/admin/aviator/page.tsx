'use client';

import React, { useEffect } from 'react';
import { useAviator } from '@/hooks/useAviator';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AviatorPage() {
  const aviator = useAviator();
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (!isAdmin()) {
        router.push('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, isLoading, router, isAdmin]);

  useEffect(() => {
    if (isAuthenticated && isAdmin()) {
      aviator.getAllWebSockets().then((result) => {
        console.log('📥 Resultado:', result);
        console.log('📊 Websockets:', aviator.websockets);
      });
    }
  }, [isAuthenticated, isAdmin, aviator]);

  const getStatusColor = (status: string) => {
    if (status === 'CONNECTED') return 'bg-green-500';
    if (status === 'CONNECTING') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = (status: string) => {
    if (status === 'CONNECTED') return 'Conectado';
    if (status === 'CONNECTING') return 'Conectando';
    return 'Desconectado';
  };

  if (isLoading) {
    return null;
  }
  if (!isAuthenticated || !isAdmin()) {
    return null;
  }
  return <AdminLayout />;
}
