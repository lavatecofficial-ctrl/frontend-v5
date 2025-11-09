'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { useGames } from '@/hooks/useGames';
import { useBookmakers } from '@/hooks/useBookmakers';
import Image from 'next/image';
import { MdOutlineAdminPanelSettings } from 'react-icons/md';
import { BiLogOutCircle } from 'react-icons/bi';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';
import CircularLoader from '@/components/CircularLoader';
import LoginHeader from '@/shared/components/LoginHeader';
import styles from './dashboard.module.css';

// Dynamic import del CanvasEffect
const CanvasEffect = dynamic(
  () => import('@/components/CanvasEffect'),
  { ssr: false }
);

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, hasAccess, isAdmin, logout } = useAuth();
  const { games, loading: gamesLoading, error: gamesError } = useGames();
  const { bookmakers, loading: bookmakersLoading, error: bookmakersError, fetchBookmakersByGameId } = useBookmakers();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [showBookmakers, setShowBookmakers] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    // Si no está autenticado y no está cargando, redirigir al login
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
      return;
    }

    // Si está autenticado pero no tiene acceso (plan free), redirigir a no-plan
    if (isAuthenticated && !isLoading && !hasAccess()) {
      router.push('/no-plan');
      return;
    }
  }, [isAuthenticated, isLoading, hasAccess, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleGameClick = async (game: any) => {
    // Primero ocultar bookmakers para forzar unmount
    setShowBookmakers(false);
    setSelectedGame(game);
    
    await fetchBookmakersByGameId(game.id);
    
    // Usar setTimeout para asegurar que React haya desmontado completamente
    setTimeout(() => {
      setAnimationKey(prev => prev + 1);
      setShowBookmakers(true);
    }, 50);
  };

  const handleBackToGames = () => {
    setShowBookmakers(false);
    setSelectedGame(null);
    setAnimationKey(0);
  };

  const handleBookmakerClick = (bookmakerId: number, isActive: boolean) => {
    if (isActive) {
      router.push(`/portal/${bookmakerId}`);
    }
  };

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return <CircularLoader />;
  }

  // Si no está autenticado, no mostrar el dashboard
  if (!isAuthenticated) {
    return null;
  }

  // Si no tiene acceso (plan free), no mostrar el dashboard
  if (!hasAccess()) {
    return null;
  }

  return (
    <div 
      className="min-h-screen relative w-full overflow-hidden flex flex-col"
      style={{
        backgroundColor: '#000',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='120' height='120' fill='%23000000'/%3E%3Cpath d='M120 0 L0 0 0 120' fill='none' stroke='%230d0d0d' stroke-width='4'/%3E%3Cg fill='%230d0d0d'%3E%3Ccircle cx='11' cy='11' r='1'/%3E%3Ccircle cx='22' cy='11' r='1'/%3E%3Ccircle cx='33' cy='11' r='1'/%3E%3Ccircle cx='44' cy='11' r='1'/%3E%3Ccircle cx='55' cy='11' r='1'/%3E%3Ccircle cx='66' cy='11' r='1'/%3E%3Ccircle cx='77' cy='11' r='1'/%3E%3Ccircle cx='88' cy='11' r='1'/%3E%3Ccircle cx='99' cy='11' r='1'/%3E%3Ccircle cx='110' cy='11' r='1'/%3E%3Ccircle cx='11' cy='22' r='1'/%3E%3Ccircle cx='22' cy='22' r='1'/%3E%3Ccircle cx='33' cy='22' r='1'/%3E%3Ccircle cx='44' cy='22' r='1'/%3E%3Ccircle cx='55' cy='22' r='1'/%3E%3Ccircle cx='66' cy='22' r='1'/%3E%3Ccircle cx='77' cy='22' r='1'/%3E%3Ccircle cx='88' cy='22' r='1'/%3E%3Ccircle cx='99' cy='22' r='1'/%3E%3Ccircle cx='110' cy='22' r='1'/%3E%3Ccircle cx='11' cy='33' r='1'/%3E%3Ccircle cx='22' cy='33' r='1'/%3E%3Ccircle cx='33' cy='33' r='1'/%3E%3Ccircle cx='44' cy='33' r='1'/%3E%3Ccircle cx='55' cy='33' r='1'/%3E%3Ccircle cx='66' cy='33' r='1'/%3E%3Ccircle cx='77' cy='33' r='1'/%3E%3Ccircle cx='88' cy='33' r='1'/%3E%3Ccircle cx='99' cy='33' r='1'/%3E%3Ccircle cx='110' cy='33' r='1'/%3E%3Ccircle cx='11' cy='44' r='1'/%3E%3Ccircle cx='22' cy='44' r='1'/%3E%3Ccircle cx='33' cy='44' r='1'/%3E%3Ccircle cx='44' cy='44' r='1'/%3E%3Ccircle cx='55' cy='44' r='1'/%3E%3Ccircle cx='66' cy='44' r='1'/%3E%3Ccircle cx='77' cy='44' r='1'/%3E%3Ccircle cx='88' cy='44' r='1'/%3E%3Ccircle cx='99' cy='44' r='1'/%3E%3Ccircle cx='110' cy='44' r='1'/%3E%3Ccircle cx='11' cy='55' r='1'/%3E%3Ccircle cx='22' cy='55' r='1'/%3E%3Ccircle cx='33' cy='55' r='1'/%3E%3Ccircle cx='44' cy='55' r='1'/%3E%3Ccircle cx='55' cy='55' r='1'/%3E%3Ccircle cx='66' cy='55' r='1'/%3E%3Ccircle cx='77' cy='55' r='1'/%3E%3Ccircle cx='88' cy='55' r='1'/%3E%3Ccircle cx='99' cy='55' r='1'/%3E%3Ccircle cx='110' cy='55' r='1'/%3E%3Ccircle cx='11' cy='66' r='1'/%3E%3Ccircle cx='22' cy='66' r='1'/%3E%3Ccircle cx='33' cy='66' r='1'/%3E%3Ccircle cx='44' cy='66' r='1'/%3E%3Ccircle cx='55' cy='66' r='1'/%3E%3Ccircle cx='66' cy='66' r='1'/%3E%3Ccircle cx='77' cy='66' r='1'/%3E%3Ccircle cx='88' cy='66' r='1'/%3E%3Ccircle cx='99' cy='66' r='1'/%3E%3Ccircle cx='110' cy='66' r='1'/%3E%3Ccircle cx='11' cy='77' r='1'/%3E%3Ccircle cx='22' cy='77' r='1'/%3E%3Ccircle cx='33' cy='77' r='1'/%3E%3Ccircle cx='44' cy='77' r='1'/%3E%3Ccircle cx='55' cy='77' r='1'/%3E%3Ccircle cx='66' cy='77' r='1'/%3E%3Ccircle cx='77' cy='77' r='1'/%3E%3Ccircle cx='88' cy='77' r='1'/%3E%3Ccircle cx='99' cy='77' r='1'/%3E%3Ccircle cx='110' cy='77' r='1'/%3E%3Ccircle cx='11' cy='88' r='1'/%3E%3Ccircle cx='22' cy='88' r='1'/%3E%3Ccircle cx='33' cy='88' r='1'/%3E%3Ccircle cx='44' cy='88' r='1'/%3E%3Ccircle cx='55' cy='88' r='1'/%3E%3Ccircle cx='66' cy='88' r='1'/%3E%3Ccircle cx='77' cy='88' r='1'/%3E%3Ccircle cx='88' cy='88' r='1'/%3E%3Ccircle cx='99' cy='88' r='1'/%3E%3Ccircle cx='110' cy='88' r='1'/%3E%3Ccircle cx='11' cy='99' r='1'/%3E%3Ccircle cx='22' cy='99' r='1'/%3E%3Ccircle cx='33' cy='99' r='1'/%3E%3Ccircle cx='44' cy='99' r='1'/%3E%3Ccircle cx='55' cy='99' r='1'/%3E%3Ccircle cx='66' cy='99' r='1'/%3E%3Ccircle cx='77' cy='99' r='1'/%3E%3Ccircle cx='88' cy='99' r='1'/%3E%3Ccircle cx='99' cy='99' r='1'/%3E%3Ccircle cx='110' cy='99' r='1'/%3E%3Ccircle cx='11' cy='110' r='1'/%3E%3Ccircle cx='22' cy='110' r='1'/%3E%3Ccircle cx='33' cy='110' r='1'/%3E%3Ccircle cx='44' cy='110' r='1'/%3E%3Ccircle cx='55' cy='110' r='1'/%3E%3Ccircle cx='66' cy='110' r='1'/%3E%3Ccircle cx='77' cy='110' r='1'/%3E%3Ccircle cx='88' cy='110' r='1'/%3E%3Ccircle cx='99' cy='110' r='1'/%3E%3Ccircle cx='110' cy='110' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '120px 120px',
        backgroundRepeat: 'repeat'
      }}>
      {/* Canvas Effect Background */}
      <CanvasEffect />
      
      {/* Header */}
      <LoginHeader 
        isDashboard={true}
        isAdmin={isAdmin()}
        onLogout={handleLogout}
        onAdminClick={() => router.push('/admin')}
      />

      {/* Main Content */}
      {showBookmakers ? (
        // Vista de Bookmakers
        <div className={styles.content}>
          {/* Header simplificado: Flecha arriba, Logo centro, subtítulo abajo */}
          <div className={styles.bookmakerHeader}>
            {/* Botón circular de regreso - Arriba */}
            <div className={styles.backButtonContainer}>
              <button
                onClick={handleBackToGames}
                className={styles.backButton}
                aria-label="Volver a juegos"
              >
                <IoArrowBack className={styles.backIcon} />
              </button>
            </div>

            {/* Logo del juego seleccionado - Centro */}
            {selectedGame && (
              <div className={styles.gameLogo}>
                <Image
                  src={selectedGame.game_img}
                  alt={`${selectedGame.name} Logo`}
                  width={0}
                  height={0}
                  className={styles.gameLogoImage}
                  style={{ width: 'auto', height: '40px' }}
                />
              </div>
            )}
            
            {/* Subtítulo pequeño - Abajo */}
            <p className={styles.bookmakerSubtitle}>Selecciona tu bookmaker</p>
          </div>

          {/* Grid de Bookmakers */}
          <div className={styles.grid} key={animationKey}>
            {bookmakersLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
              </div>
            ) : bookmakersError ? (
              <div className={styles.errorContainer}>
                <p className={styles.errorText}>Error: {bookmakersError}</p>
              </div>
            ) : bookmakers.length === 0 ? (
              <div className={styles.emptyContainer}>
                <p className={styles.emptyText}>No hay casas de apuestas disponibles</p>
              </div>
            ) : (
              bookmakers
                .map(bookmaker => {
                  const isGoBet = bookmaker.bookmaker.toLowerCase().includes('gobet');
                  const isSpaceman = selectedGame?.name.toLowerCase().includes('spaceman');
                  const isDisabled = !bookmaker.isActive || (isGoBet && isSpaceman);
                  return { ...bookmaker, isDisabled };
                })
                .sort((a, b) => {
                  if (a.isDisabled !== b.isDisabled) {
                    return a.isDisabled ? 1 : -1;
                  }
                  return 0;
                })
                .map((bookmaker, index) => {
                  const isDisabled = bookmaker.isDisabled;
                  
                  return (
                  <div 
                    key={`${animationKey}-${bookmaker.id}`} 
                    className={`${styles.card} ${styles.bookmakerCard} ${isDisabled ? styles.cardInactive : styles.cardActive}`}
                    onClick={() => handleBookmakerClick(bookmaker.id, !isDisabled)}
                    style={{
                      background: `
                        linear-gradient(145deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%),
                        radial-gradient(circle at 20% 20%, ${selectedGame?.color}40 0%, ${selectedGame?.color}15 25%, transparent 60%),
                        linear-gradient(180deg, #0a0a0f 0%, #050508 50%, #000000 100%)
                      `,
                      boxShadow: `
                        0 8px 32px rgba(0, 0, 0, 0.6),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.5),
                        0 0 40px ${selectedGame?.color}20
                      `,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      animationDelay: `${250 * index}ms`
                    }}
                    role="button"
                    aria-label={`${bookmaker.bookmaker} - ${isDisabled ? 'No disponible para este juego' : 'Disponible para conectar'}`}
                    aria-disabled={isDisabled}
                    tabIndex={isDisabled ? -1 : 0}
                  >
                      {/* Logo del Bookmaker */}
                      <div className={styles.cardLogoContainer}>
                        <Image
                          src={bookmaker.bookmakerImg}
                          alt={`${bookmaker.bookmaker} Logo`}
                          width={0}
                          height={0}
                          className={`${styles.cardLogo} ${isDisabled ? styles.cardLogoInactive : ''} ${(bookmaker.bookmaker.toLowerCase().includes('mega') || bookmaker.bookmaker.toLowerCase().includes('roulette')) ? styles.cardLogoLarge : ''}`}
                          style={{ 
                            width: (bookmaker.bookmaker.toLowerCase().includes('mega') || bookmaker.bookmaker.toLowerCase().includes('roulette')) ? 'auto' : `${bookmaker.scaleImg}%`, 
                            height: 'auto' 
                          }}
                        />
                      </div>

                      {/* Botón circular de flecha derecha */}
                      <div className={styles.bookmakerArrowContainer}>
                        <IoArrowForward className={styles.bookmakerArrowIcon} />
                      </div>

                      {/* Franja OFFLINE */}
                      {isDisabled && (
                        <div className={styles.offlineBanner}>
                          <span>OFFLINE</span>
                        </div>
                      )}
                  </div>
                  );
                })
            )}
          </div>
        </div>
      ) : (
        // Vista de Juegos
        <div className={styles.content}>
          {/* Título y subtítulo centrados */}
          <div className={styles.header}>
            <h1 className={styles.title}>
              ¿DÓNDE APLICARÁS TU ESTRATEGIA?
            </h1>
            <p className={styles.subtitle}>
              Predicciones precisas • Análisis en tiempo real • Resultados comprobados
            </p>
          </div>

          <div className={styles.grid}>
            {gamesLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
              </div>
            ) : gamesError ? (
              <div className={styles.errorContainer}>
                <p className={styles.errorText}>Error: {gamesError}</p>
              </div>
            ) : games.length === 0 ? (
              <div className={styles.emptyContainer}>
                <p className={styles.emptyText}>No hay juegos disponibles</p>
              </div>
            ) : (
              games.map((game, index) => (
                  <div 
                    key={game.id} 
                    className={styles.cardWrapper}
                    style={{ 
                      animation: `fadeInUp 0.5s ease-out forwards`,
                      animationDelay: `${600 + index * 100}ms`,
                      opacity: 0
                    }}
                  >
                    <div className={styles.card} onClick={() => handleGameClick(game)}
                      style={{
                        background: `
                          linear-gradient(145deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%),
                          radial-gradient(circle at 20% 20%, ${game.color}40 0%, ${game.color}15 25%, transparent 60%),
                          linear-gradient(180deg, #0a0a0f 0%, #050508 50%, #000000 100%)
                        `,
                        boxShadow: `
                          0 8px 32px rgba(0, 0, 0, 0.6),
                          inset 0 1px 0 rgba(255, 255, 255, 0.1),
                          inset 0 -1px 0 rgba(0, 0, 0, 0.5),
                          0 0 40px ${game.color}20
                        `
                      }}
                    >
                      <div className={styles.cardLogoContainer}>
                        <Image
                          src={game.game_img}
                          alt={`${game.name} Logo`}
                          width={0}
                          height={0}
                          className={styles.cardLogo}
                          style={{ width: `${game.scale_img}%`, height: 'auto' }}
                        />
                      </div>
                    </div>
                  </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
