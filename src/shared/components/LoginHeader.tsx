'use client';

import React from 'react';
import Image from 'next/image';
import { FaTelegram, FaFacebook } from 'react-icons/fa';
import { MdOutlineAdminPanelSettings } from 'react-icons/md';
import { BiLogOutCircle } from 'react-icons/bi';

interface LoginHeaderProps {
  isDashboard?: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
  onAdminClick?: () => void;
}

export const LoginHeader: React.FC<LoginHeaderProps> = ({ 
  isDashboard = false, 
  isAdmin = false,
  onLogout,
  onAdminClick 
}) => {
  return (
    <header className="w-full flex items-center justify-between lg:justify-between justify-center px-8 py-3 h-[60px]">
      {/* Logo - Centrado en mobile, izquierda en desktop */}
      <div className="flex items-center h-full">
        <Image
          src="/logo.png"
          alt="Logo"
          width={180}
          height={50}
          className="object-contain h-[45px] w-auto"
          priority
        />
      </div>

      {isDashboard ? (
        // Botones de Dashboard - Oculto en < 1024px
        <div className="hidden lg:flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={onAdminClick}
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium bg-[rgba(16,185,129,0.15)] backdrop-blur-[20px] border border-[rgba(16,185,129,0.3)] rounded-full text-[#10B981] transition-all duration-300 hover:bg-[rgba(16,185,129,0.25)] hover:border-[rgba(16,185,129,0.5)] hover:scale-105"
              style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}
            >
              <MdOutlineAdminPanelSettings className="text-[18px]" />
              ADMIN
            </button>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium bg-[rgba(220,38,38,0.15)] backdrop-blur-[20px] border border-[rgba(220,38,38,0.3)] rounded-full text-[#DC2626] transition-all duration-300 hover:bg-[rgba(220,38,38,0.25)] hover:border-[rgba(220,38,38,0.5)] hover:scale-105"
            style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}
          >
            <BiLogOutCircle className="text-[18px]" />
            CERRAR SESIÓN
          </button>
        </div>
      ) : (
        // Redes Sociales - Oculto en < 1024px
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-[13px] text-[rgba(180,180,180,0.9)] font-medium" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
            Nuestras redes:
          </span>
          <a
            href="https://t.me/+SmIGA3hwmuowMGYx"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 bg-[rgba(20,20,20,0.6)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-full text-white transition-all duration-300 hover:bg-[rgba(30,30,30,0.7)] hover:border-[rgba(255,255,255,0.15)] hover:scale-110"
          >
            <FaTelegram className="text-[16px]" />
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61575684587937"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 bg-[rgba(20,20,20,0.6)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-full text-white transition-all duration-300 hover:bg-[rgba(30,30,30,0.7)] hover:border-[rgba(255,255,255,0.15)] hover:scale-110"
          >
            <FaFacebook className="text-[16px]" />
          </a>
        </div>
      )}
    </header>
  );
};

export default LoginHeader;
