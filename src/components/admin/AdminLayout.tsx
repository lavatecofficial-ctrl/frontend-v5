'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MdLogout, MdHome } from 'react-icons/md';
import { FaUsers } from 'react-icons/fa';
import { PiAirplaneTiltFill } from 'react-icons/pi';
import { BsRocket } from 'react-icons/bs';
import { GiDiceFire } from 'react-icons/gi';
import SpacemanControl from './SpacemanControl';
import AviatorControl from './AviatorControl';
import RouletteControl from './RouletteControl'; // ensure file exists
import UsersManagement from './UsersManagement';

type AdminSection = 'dashboard' | 'users' | 'aviator' | 'spaceman' | 'roulette';

const menuItems = [
  {
    name: 'Usuarios',
    icon: FaUsers,
    section: 'users' as AdminSection,
  },
  {
    name: 'Aviator',
    icon: PiAirplaneTiltFill,
    section: 'aviator' as AdminSection,
  },
  {
    name: 'Spaceman',
    icon: BsRocket,
    section: 'spaceman' as AdminSection,
  },
  {
    name: 'Roulettes',
    icon: GiDiceFire,
    section: 'roulette' as AdminSection,
  }
];

export default function AdminLayout() {
  const { logout, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<AdminSection>('users');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  // Menú filtrado por rol: solo superadmin ve Usuarios
  const itemsToShow = menuItems.filter((item) => {
    if (!isSuperAdmin() && item.section === 'users') {
      return false;
    }
    return true;
  });

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
      <div suppressHydrationWarning className="w-full py-4 px-6">
        <div suppressHydrationWarning className="max-w-7xl mx-auto flex items-center justify-center">
          {/* Todos los iconos centrados */}
          <div suppressHydrationWarning className="flex items-center justify-center gap-3">
            {itemsToShow.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveSection(item.section)}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    activeSection === item.section
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                      : 'bg-gradient-to-br from-gray-800 to-gray-900 text-gray-300 hover:from-gray-700 hover:to-gray-800 hover:text-white'
                  }`}
                  style={{
                    boxShadow: activeSection === item.section
                      ? 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)'
                      : 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'
                  }}
                  title={item.name}
                >
                  <Icon className="w-6 h-6" />
                </button>
              );
            })}

            {/* Separador visual */}
            <div suppressHydrationWarning className="w-px h-6 bg-gray-700 mx-1" />

            {/* Botón de volver al dashboard */}
            <button
              onClick={handleBackToDashboard}
              className="p-3 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-gray-300 hover:from-gray-700 hover:to-gray-800 hover:text-white transition-all duration-200"
              style={{
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'
              }}
              title="Volver al Dashboard"
            >
              <MdHome className="w-6 h-6" style={{ display: 'block' }} />
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
              <MdLogout className="w-6 h-6" style={{ display: 'block' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Page content */}
      <main suppressHydrationWarning className="flex-1 p-6">
        {activeSection === 'users' && <UsersManagement />}
        {activeSection === 'aviator' && <AviatorControl />}
        {activeSection === 'spaceman' && <SpacemanControl />}
        {activeSection === 'roulette' && <RouletteControl />}
      </main>
    </div>
  );
}
