'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BiLogOutCircle } from 'react-icons/bi';
import { IoHome } from 'react-icons/io5';
import { useAuth } from '@/hooks/useAuth';
import { Bookmaker } from '@/types/portal';
import styles from '../styles/PortalHeader.module.css';

interface PortalHeaderProps {
  selectedBookmaker: Bookmaker;
}

export default function PortalHeader({ selectedBookmaker }: PortalHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { logout, user } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  // Obtener iniciales del email del usuario
  const getInitials = () => {
    if (!user?.email) return 'U';
    // Tomar las primeras 2 letras del email antes del @
    const emailName = user.email.split('@')[0];
    if (emailName.length === 1) return emailName.charAt(0).toUpperCase();
    return (emailName.charAt(0) + emailName.charAt(1)).toUpperCase();
  };

  return (
    <header className={styles.portalHeader}>
      <div className={styles.headerContainer}>
        <div className={styles.headerLeft}>
          <Image
            src={selectedBookmaker.bookmakerImg}
            alt={`${selectedBookmaker.bookmaker} Logo`}
            width={60}
            height={32}
            className={styles.bookmakerLogo}
          />
        </div>
        
        <div className={styles.headerRight}>
          <button
            onClick={toggleMenu}
            className={styles.userAvatar}
            title={user?.email || 'Usuario'}
          >
            <Image
              src="/nino.png"
              alt="User Avatar"
              width={32}
              height={32}
              className={styles.avatarImage}
            />
          </button>

          <div className={`${styles.dropdown} ${isMenuOpen ? styles.dropdownOpen : ''}`}>
            <div className={styles.dropdownContent}>
              <button
                onClick={handleGoHome}
                className={styles.dropdownItem}
              >
                <IoHome className={styles.dropdownIcon} />
                Inicio
              </button>
              <button
                onClick={handleLogout}
                className={styles.dropdownItem}
              >
                <BiLogOutCircle className={styles.dropdownIcon} />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
