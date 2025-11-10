'use client';

import React from 'react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import AviatorControl from '@/components/admin/AviatorControl';

export default function AviatorPage() {
  return (
    <AdminPageLayout 
      pageTitle="Aviator Control"
      pageDescription="Gestiona los WebSockets de Aviator"
    >
      <AviatorControl />
    </AdminPageLayout>
  );
}
