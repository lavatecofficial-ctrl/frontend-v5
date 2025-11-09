'use client';

import { LiaUsersSolid, LiaCashRegisterSolid } from 'react-icons/lia';
import { MdDoNotDisturbOnTotalSilence } from 'react-icons/md';
import { HiOutlineCreditCard } from 'react-icons/hi';
import { memo } from 'react';
import styles from '../styles/SmallCards.module.css';

interface SpacemanRoundData {
  online_players: number;
  bets_count: number;
  total_bet_amount: number;
  total_cashout: number;
  current_multiplier: number;
  max_multiplier: number;
  game_state: 'Bet' | 'Run' | 'End';
  round_id?: string;
  casino_profit?: number;
  service_status: 'connected' | 'disconnected' | 'error';
  last_update: string;
}

interface SmallCardsProps {
  roundData: SpacemanRoundData;
}

const SmallCards = memo(({ roundData }: SmallCardsProps) => {
  return (
    <>
      {/* Card 1 - Jugadores */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <LiaUsersSolid className={styles.iconPurple} />
          <span className={styles.kpiLabel}>JUGADORES</span>
        </div>
        <div className={`${styles.kpiValue} ${styles.valuePurple}`}>
          {roundData.online_players.toLocaleString()}
        </div>
      </div>

      {/* Card 2 - Apuestas */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <MdDoNotDisturbOnTotalSilence className={styles.iconViolet} />
          <span className={styles.kpiLabel}>APUESTAS</span>
        </div>
        <div className={`${styles.kpiValue} ${styles.valueViolet}`}>
          {roundData.bets_count.toLocaleString()}
        </div>
      </div>

      {/* Card 3 - Total Apostado */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <HiOutlineCreditCard className={styles.iconPink} />
          <span className={styles.kpiLabel}>TOTAL APOSTADO</span>
        </div>
        <div className={`${styles.kpiValue} ${styles.valuePink}`}>
          ${roundData.total_bet_amount.toLocaleString(undefined, {maximumFractionDigits: 0})}
        </div>
      </div>

      {/* Card 4 - Total Cashout */}
      <div className={styles.kpiCard}>
        <div className={styles.kpiHeader}>
          <LiaCashRegisterSolid className={styles.iconLavender} />
          <span className={styles.kpiLabel}>TOTAL CASHOUT</span>
        </div>
        <div className={`${styles.kpiValue} ${styles.valueLavender}`}>
          ${roundData.total_cashout.toLocaleString(undefined, {maximumFractionDigits: 0})}
        </div>
      </div>
    </>
  );
});

SmallCards.displayName = 'SmallCards';

export default SmallCards;
