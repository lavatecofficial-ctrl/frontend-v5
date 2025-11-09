'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaTelegram, FaFacebook } from 'react-icons/fa';
import styles from '@/shared/styles/WinnerBlock.module.css';

type AnimationPhase = 'intro' | 'cards' | 'promo';

export const WinnerBlock: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<AnimationPhase>('intro');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const runAnimationCycle = async () => {
      // Fase 1: Intro - 8 segundos (más tiempo)
      setCurrentPhase('intro');
      setIsTransitioning(false);
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      // Transición a Cards - 800ms (más suave)
      setIsTransitioning(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Fase 2: Cards - 10 segundos (más tiempo)
      setCurrentPhase('cards');
      setIsTransitioning(false);
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Transición a Promo - 800ms (más suave)
      setIsTransitioning(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Fase 3: Promo - 8 segundos (más tiempo)
      setCurrentPhase('promo');
      setIsTransitioning(false);
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      // Transición de vuelta al inicio - 800ms (más suave)
      setIsTransitioning(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Reiniciar ciclo
      runAnimationCycle();
    };

    runAnimationCycle();
  }, []);

  const containerClass = `relative z-[1] w-full flex flex-col justify-center transition-opacity duration-700 ease-in-out ${
    isTransitioning ? 'opacity-0' : 'opacity-100'
  }`;

  return (
    <div className={containerClass} style={{ 
      maxHeight: '100%', 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      {/* Fase 1: Intro Message */}
      {currentPhase === 'intro' && (
        <div className={styles.introMessage}>
          <h1 className={styles.introTitle}>
            PREDICCIONES EN TIEMPO REAL
          </h1>
          
          <p className={styles.introSubtitle}>
            Únete a miles de ganadores que ya están transformando sus vidas con nuestras predicciones precisas y confiables.
          </p>

          <div className={styles.gameLogos}>
            <div className={styles.gameLogo}>
              <Image src="/logos/aviator-logo.svg" alt="Aviator" width={160} height={160} priority />
            </div>
            <div className={styles.gameLogo}>
              <Image src="/logos/ruleta-logo.svg" alt="Ruleta" width={160} height={160} priority />
            </div>
            <div className={styles.gameLogo}>
              <Image src="/logos/spaceman-logo.svg" alt="Spaceman" width={160} height={160} priority />
            </div>
          </div>

          <p className={styles.compatibilityText}>
            Compatible con los principales casinos en línea
          </p>
        </div>
      )}

      {/* Fase 2: Cards Section */}
      {currentPhase === 'cards' && (
        <div className={styles.cardsSection}>
          <div className={styles.cardsHeader}>
            <h2 className={styles.cardsTitle}>
              GANANCIAS REALES & VERIFICABLES
            </h2>
            <p className={styles.cardsSubtitle}>
              Últimos ganadores verificables en tiempo real
            </p>
          </div>

          <div className={styles.notificationCards}>
            {[
              { casino: '888Starz', logo: '/home-bets/888starz.png', game: 'Aviator' },
              { casino: 'GoBet', logo: '/home-bets/gobet.png', game: 'Aviator' },
              { casino: '888Starz', logo: '/home-bets/888starz.png', game: 'Ruleta' },
              { casino: '888Starz', logo: '/home-bets/888starz.png', game: 'Spaceman' }
            ].map((item, i) => (
              <div key={i} className={styles.notificationCard}>
                <div className={styles.notificationLogo}>
                  <Image
                    src={item.logo}
                    alt={item.casino}
                    width={48}
                    height={48}
                  />
                </div>
                <div className={styles.notificationContent}>
                  <p className={styles.casinoName}>
                    {item.casino}
                  </p>
                  <p className={styles.notificationMessage}>
                    <span className={styles.notificationTitle}>¡Felicidades!</span>
                    Tu apuesta de{' '}
                    <span className={styles.notificationAmount}>
                      ${(Math.random() * 400000 + 50000).toFixed(2)} COP
                    </span>{' '}
                    en {item.game} ha generado un retorno de{' '}
                    <span className={styles.notificationAmount}>
                      ${(Math.random() * 800000 + 100000).toFixed(2)} COP
                    </span>
                  </p>
                  <p className={styles.notificationTime}>
                    {new Date().toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fase 3: Promo Section */}
      {currentPhase === 'promo' && (
        <div className={styles.promoSection}>
          <div className={styles.promoCard}>
            <h2 className={styles.promoTitle}>
              EL SOFTWARE PREDICTIVO #1 PARA CASINOS EN VIVO
            </h2>
            
            <p className={styles.promoDescription}>
              Más de 10,000 personas ya están ganando cada día.
            </p>

            <div className={styles.promoButtons}>
              <button
                onClick={() => window.open('https://t.me/+SmIGA3hwmuowMGYx', '_blank')}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                <span className={styles.buttonIcon}>
                  <FaTelegram />
                </span>
                ÚNETE AL TELEGRAM
              </button>
              <button
                onClick={() => window.open('https://www.facebook.com/profile.php?id=61575684587937', '_blank')}
                className={`${styles.button} ${styles.buttonSecondary}`}
              >
                <span className={styles.buttonIcon}>
                  <FaFacebook />
                </span>
                VER FACEBOOK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WinnerBlock;
