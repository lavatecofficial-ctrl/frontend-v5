'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MdLogout, MdHome } from 'react-icons/md';

interface AdminPageLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
}

export default function AdminPageLayout({ children, pageTitle, pageDescription }: AdminPageLayoutProps) {
  const { isAuthenticated, isLoading, isAdmin, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleBackToAdmin = () => {
    router.push('/admin');
  };

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (el useEffect redirigirá)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div 
      suppressHydrationWarning
      className="min-h-screen relative w-full overflow-hidden flex flex-col"
      style={{
        backgroundColor: '#000',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='120' height='120' fill='%23000000'/%3E%3Cpath d='M120 0 L0 0 0 120' fill='none' stroke='%230d0d0d' stroke-width='4'/%3E%3Cg fill='%230d0d0d'%3E%3Ccircle cx='11' cy='11' r='1'/%3E%3Ccircle cx='22' cy='11' r='1'/%3E%3Ccircle cx='33' cy='11' r='1'/%3E%3Ccircle cx='44' cy='11' r='1'/%3E%3Ccircle cx='55' cy='11' r='1'/%3E%3Ccircle cx='66' cy='11' r='1'/%3E%3Ccircle cx='77' cy='11' r='1'/%3E%3Ccircle cx='88' cy='11' r='1'/%3E%3Ccircle cx='99' cy='11' r='1'/%3E%3Ccircle cx='110' cy='11' r='1'/%3E%3Ccircle cx='11' cy='22' r='1'/%3E%3Ccircle cx='22' cy='22' r='1'/%3E%3Ccircle cx='33' cy='22' r='1'/%3E%3Ccircle cx='44' cy='22' r='1'/%3E%3Ccircle cx='55' cy='22' r='1'/%3E%3Ccircle cx='66' cy='22' r='1'/%3E%3Ccircle cx='77' cy='22' r='1'/%3E%3Ccircle cx='88' cy='22' r='1'/%3E%3Ccircle cx='99' cy='22' r='1'/%3E%3Ccircle cx='110' cy='22' r='1'/%3E%3Ccircle cx='11' cy='33' r='1'/%3E%3Ccircle cx='22' cy='33' r='1'/%3E%3Ccircle cx='33' cy='33' r='1'/%3E%3Ccircle cx='44' cy='33' r='1'/%3E%3Ccircle cx='55' cy='33' r='1'/%3E%3Ccircle cx='66' cy='33' r='1'/%3E%3Ccircle cx='77' cy='33' r='1'/%3E%3Ccircle cx='88' cy='33' r='1'/%3E%3Ccircle cx='99' cy='33' r='1'/%3E%3Ccircle cx='110' cy='33' r='1'/%3E%3Ccircle cx='11' cy='44' r='1'/%3E%3Ccircle cx='22' cy='44' r='1'/%3E%3Ccircle cx='33' cy='44' r='1'/%3E%3Ccircle cx='44' cy='44' r='1'/%3E%3Ccircle cx='55' cy='44' r='1'/%3E%3Ccircle cx='66' cy='44' r='1'/%3E%3Ccircle cx='77' cy='44' r='1'/%3E%3Ccircle cx='88' cy='44' r='1'/%3E%3Ccircle cx='99' cy='44' r='1'/%3E%3Ccircle cx='110' cy='44' r='1'/%3E%3Ccircle cx='11' cy='55' r='1'/%3E%3Ccircle cx='22' cy='55' r='1'/%3E%3Ccircle cx='33' cy='55' r='1'/%3E%3Ccircle cx='44' cy='55' r='1'/%3E%3Ccircle cx='55' cy='55' r='1'/%3E%3Ccircle cx='66' cy='55' r='1'/%3E%3Ccircle cx='77' cy='55' r='1'/%3E%3Ccircle cx='88' cy='55' r='1'/%3E%3Ccircle cx='99' cy='55' r='1'/%3E%3Ccircle cx='110' cy='55' r='1'/%3E%3Ccircle cx='11' cy='66' r='1'/%3E%3Ccircle cx='22' cy='66' r='1'/%3E%3Ccircle cx='33' cy='66' r='1'/%3E%3Ccircle cx='44' cy='66' r='1'/%3E%3Ccircle cx='55' cy='66' r='1'/%3E%3Ccircle cx='66' cy='66' r='1'/%3E%3Ccircle cx='77' cy='66' r='1'/%3E%3Ccircle cx='88' cy='66' r='1'/%3E%3Ccircle cx='99' cy='66' r='1'/%3E%3Ccircle cx='110' cy='66' r='1'/%3E%3Ccircle cx='11' cy='77' r='1'/%3E%3Ccircle cx='22' cy='77' r='1'/%3E%3Ccircle cx='33' cy='77' r='1'/%3E%3Ccircle cx='44' cy='77' r='1'/%3E%3Ccircle cx='55' cy='77' r='1'/%3E%3Ccircle cx='66' cy='77' r='1'/%3E%3Ccircle cx='77' cy='77' r='1'/%3E%3Ccircle cx='88' cy='77' r='1'/%3E%3Ccircle cx='99' cy='77' r='1'/%3E%3Ccircle cx='110' cy='77' r='1'/%3E%3Ccircle cx='11' cy='88' r='1'/%3E%3Ccircle cx='22' cy='88' r='1'/%3E%3Ccircle cx='33' cy='88' r='1'/%3E%3Ccircle cx='44' cy='88' r='1'/%3E%3Ccircle cx='55' cy='88' r='1'/%3E%3Ccircle cx='66' cy='88' r='1'/%3E%3Ccircle cx='77' cy='88' r='1'/%3E%3Ccircle cx='88' cy='88' r='1'/%3E%3Ccircle cx='99' cy='88' r='1'/%3E%3Ccircle cx='110' cy='88' r='1'/%3E%3Ccircle cx='11' cy='99' r='1'/%3E%3Ccircle cx='22' cy='99' r='1'/%3E%3Ccircle cx='33' cy='99' r='1'/%3E%3Ccircle cx='44' cy='99' r='1'/%3E%3Ccircle cx='55' cy='99' r='1'/%3E%3Ccircle cx='66' cy='99' r='1'/%3E%3Ccircle cx='77' cy='99' r='1'/%3E%3Ccircle cx='88' cy='99' r='1'/%3E%3Ccircle cx='99' cy='99' r='1'/%3E%3Ccircle cx='110' cy='99' r='1'/%3E%3Ccircle cx='11' cy='110' r='1'/%3E%3Ccircle cx='22' cy='110' r='1'/%3E%3Ccircle cx='33' cy='110' r='1'/%3E%3Ccircle cx='44' cy='110' r='1'/%3E%3Ccircle cx='55' cy='110' r='1'/%3E%3Ccircle cx='66' cy='110' r='1'/%3E%3Ccircle cx='77' cy='110' r='1'/%3E%3Ccircle cx='88' cy='110' r='1'/%3E%3Ccircle cx='99' cy='110' r='1'/%3E%3Ccircle cx='110' cy='110' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '120px 120px',
        backgroundRepeat: 'repeat'
      }}>
      {/* Topbar */}
      <div suppressHydrationWarning className="w-full py-4 px-6 border-b border-gray-800">
        <div suppressHydrationWarning className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            {pageTitle && <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>}
            {pageDescription && <p className="text-sm text-gray-400 mt-1">{pageDescription}</p>}
          </div>
          
          <div suppressHydrationWarning className="flex items-center gap-3">
            {/* Botón de volver al panel admin */}
            <button
              onClick={handleBackToAdmin}
              className="p-3 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              style={{
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)'
              }}
              title="Panel Admin"
            >
              <MdHome className="w-6 h-6" />
            </button>

            {/* Botón de logout */}
            <button
              onClick={handleLogout}
              className="p-3 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-gray-300 hover:from-red-600 hover:to-red-700 hover:text-white transition-all duration-200"
              style={{
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'
              }}
              title="Cerrar Sesión"
            >
              <MdLogout className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Page content */}
      <main suppressHydrationWarning className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
