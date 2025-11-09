'use client';

import React, { useState, useEffect } from 'react';
import { adminService, UserStats } from '@/services/adminService';
import SpacemanControl from './SpacemanControl';
import { 
  MdDashboard,
  MdPerson,
  MdRocket,
  MdCasino,
  MdSettings
} from 'react-icons/md';

type AdminSection = 'dashboard' | 'usuarios' | 'aviator' | 'roulettes' | 'spaceman';

export default function AdminDashboard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  useEffect(() => {
    if (activeSection === 'dashboard') {
      loadStats();
    }
  }, [activeSection]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getUserStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => {
    if (loading) {
      return (
        <div suppressHydrationWarning className="flex items-center justify-center h-64">
          <div suppressHydrationWarning className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div suppressHydrationWarning className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-red-500 rounded-full p-2 mr-4">
              <MdSettings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-red-400 font-semibold">Error al cargar estadísticas</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={loadStats}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (!stats) return null;

    return (
      <div suppressHydrationWarning className="grid grid-cols-2 gap-1" style={{ height: 'calc(100vh - 120px)' }}>
        {/* Columna Izquierda - KPIs 2x2x2 */}
        <div className="grid grid-cols-2 gap-1" style={{ gridTemplateRows: 'repeat(3, 1fr)' }}>
          {/* Total */}
          <div className="group relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-black/60 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
            <div className="relative flex flex-col justify-between h-full">
              <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-2">Total</div>
              <div className="text-4xl font-black text-white tracking-tighter">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-[10px] text-zinc-600 mt-1">usuarios</div>
            </div>
          </div>

          {/* Activos */}
          <div className="group relative bg-black/40 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-4 hover:bg-black/60 hover:border-emerald-500/40 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="relative flex flex-col justify-between h-full">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Activos</div>
              </div>
              <div className="text-4xl font-black text-emerald-400 tracking-tighter">{stats.usersByStatus.active.toLocaleString()}</div>
              <div className="text-[10px] text-emerald-600/60 mt-1">con plan</div>
            </div>
          </div>

          {/* Inactivos */}
          <div className="group relative bg-black/40 backdrop-blur-sm border border-red-500/20 rounded-lg p-4 hover:bg-black/60 hover:border-red-500/40 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all" />
            <div className="relative flex flex-col justify-between h-full">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Inactivos</div>
              </div>
              <div className="text-4xl font-black text-red-400 tracking-tighter">{stats.usersByStatus.expired.toLocaleString()}</div>
              <div className="text-[10px] text-red-600/60 mt-1">expirados</div>
            </div>
          </div>

          {/* Nuevos */}
          <div className="group relative bg-black/40 backdrop-blur-sm border border-violet-500/20 rounded-lg p-4 hover:bg-black/60 hover:border-violet-500/40 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all" />
            <div className="relative flex flex-col justify-between h-full">
              <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-2">Nuevos</div>
              <div className="text-4xl font-black text-violet-400 tracking-tighter">{stats.recentUsers.toString()}</div>
              <div className="text-[10px] text-violet-600/60 mt-1">últimos 30d</div>
            </div>
          </div>

          {/* Hoy */}
          <div className="group relative bg-black/40 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-4 hover:bg-black/60 hover:border-cyan-500/40 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
            <div className="relative flex flex-col justify-between h-full">
              <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-2">Hoy</div>
              <div className="text-4xl font-black text-cyan-400 tracking-tighter">0</div>
              <div className="text-[10px] text-cyan-600/60 mt-1">registros</div>
            </div>
          </div>

          {/* Verificados */}
          <div className="group relative bg-black/40 backdrop-blur-sm border border-amber-500/20 rounded-lg p-4 hover:bg-black/60 hover:border-amber-500/40 transition-all overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
            <div className="relative flex flex-col justify-between h-full">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Verificados</div>
              </div>
              <div className="text-4xl font-black text-amber-400 tracking-tighter">{stats.verification.verified.toLocaleString()}</div>
              <div className="text-[10px] text-amber-600/60 mt-1">confirmados</div>
            </div>
          </div>
        </div>

        {/* Columna Derecha - Tablas */}
        <div className="grid grid-rows-2 gap-1">
          {/* Usuarios por Plan */}
          <div className="bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 rounded-lg p-6 overflow-auto">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full" />
              Usuarios por Plan
            </h3>
            <div className="space-y-2">
              {stats.usersByPlan && Object.entries(stats.usersByPlan).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-white/5 transition-colors group">
                  <span className="text-sm text-zinc-400 capitalize group-hover:text-zinc-300">{plan}</span>
                  <span className="text-lg font-bold text-white tabular-nums">{String(count)}</span>
                </div>
              ))}
              {!stats.usersByPlan && <p className="text-zinc-500 text-sm text-center py-8">Sin datos</p>}
            </div>
          </div>

          {/* Usuarios por Rol */}
          <div className="bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 rounded-lg p-6 overflow-auto">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
              Usuarios por Rol
            </h3>
            <div className="space-y-2">
              {stats.usersByRole && Object.entries(stats.usersByRole).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-white/5 transition-colors group">
                  <span className="text-sm text-zinc-400 capitalize group-hover:text-zinc-300">{role}</span>
                  <span className="text-lg font-bold text-white tabular-nums">{String(count)}</span>
                </div>
              ))}
              {!stats.usersByRole && <p className="text-zinc-500 text-sm text-center py-8">Sin datos</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'spaceman':
        return <SpacemanControl />;
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <MdSettings className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
              </h3>
              <p className="text-gray-500">Funcionalidad en desarrollo</p>
            </div>
          </div>
        );
    }
  };

  // Solo renderizar el contenido, sin sidebar duplicado
  return renderContent();
}
