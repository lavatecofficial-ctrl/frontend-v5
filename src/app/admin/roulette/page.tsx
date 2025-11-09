'use client';

import React, { useState, useEffect } from 'react';
import { useRoulette } from '@/hooks/useRoulette';
import { useBookmakers } from '@/hooks/useBookmakers';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { MdRestartAlt } from 'react-icons/md';
import AdminLayout from '@/components/admin/AdminLayout';
import Image from 'next/image';

export default function RoulettePage() {
  const roulette = useRoulette();
  const { bookmakers, loading: bookmakersLoading, error: bookmakersError, fetchBookmakersByGameId } = useBookmakers();
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
  if (isLoading) {
    return null;
  }
  if (!isAuthenticated || !isAdmin()) {
    return null;
  }
  return <AdminLayout />;
          min-height: 100% !important;
        }
        
        .roulette-card [data-nimg] {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 20px !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          max-width: none !important;
          max-height: none !important;
          min-width: 100% !important;
          min-height: 100% !important;
        }
      `}</style>
    </AdminLayout>
  );
}
