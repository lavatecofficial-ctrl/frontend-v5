'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { FaTelegramPlane } from 'react-icons/fa';
import CircularLoader from '@/components/CircularLoader';
import LoginHeader from '@/shared/components/LoginHeader';
import styles from './no-plan.module.css';

// Dynamic import del CanvasEffect
const CanvasEffect = dynamic(
  () => import('@/components/CanvasEffect'),
  { ssr: false }
);

export default function NoPlanPage() {
  const { user, isAuthenticated, isLoading, hasAccess, logout } = useAuth();
  const router = useRouter();

  // Si no está autenticado, redirigir al login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Si tiene plan activo, redirigir al dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && hasAccess()) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, hasAccess, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleContactSupport = () => {
    window.open('https://t.me/+SmIGA3hwmuowMGYx', '_blank');
  };

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return <CircularLoader />;
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.pageWrapper}>
      {/* Canvas Effect Background */}
      <div className={styles.canvasContainer}>
        <CanvasEffect />
      </div>

      {/* Header */}
      <LoginHeader />

      {/* Content */}
      <div className={styles.contentWrapper}>
        {/* Left Side - Info */}
        <div className={styles.leftSide}>
          <div className={styles.infoContainer}>
            {/* Main Message */}
            <div className={styles.mainMessage}>
              <h1 className={styles.title}>Sin plan, no hay problema</h1>
              <p className={styles.description}>
                Para continuar disfrutando de predicciones en tiempo real y todas las funcionalidades premium, 
                activa tu plan ahora.
              </p>
            </div>

            {/* CTA Section */}
            <div className={styles.ctaSection}>
              <button className={styles.ctaPrimary} onClick={handleContactSupport}>
                <FaTelegramPlane />
                Unirme para activar mi plan
              </button>
              <button className={styles.ctaSecondary} onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>

            {/* Footer Note */}
            <p className={styles.footerNote}>
              ¿Necesitas ayuda? Nuestro equipo está disponible 24/7 para asistirte
            </p>
          </div>
        </div>

        {/* Right Side - Support Image */}
        <div className={styles.rightSide}>
          <div className={styles.imageContainer}>
            <img 
              src="/extras/no-plan.png" 
              alt="Soporte 24/7" 
              className={styles.supportImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
