'use client';

interface LiveMultiplierProps {
  roundData: {
    current_multiplier: number;
  };
  isConnected?: boolean;
}

export default function LiveMultiplier({ roundData }: LiveMultiplierProps) {
  const formatMultiplier = (multiplier: number) => {
    if (multiplier === 0) return '0.00x';
    return `${multiplier.toFixed(2)}x`;
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '1rem',
      height: '100%',
      position: 'relative',
      zIndex: 2
    }}>
      <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: '0.875rem', color: 'rgba(192, 132, 252, 0.9)', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.5px' }}>
          MULTIPLICADOR ACTUAL
        </div>
        <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#ffffff', textShadow: '0 0 20px rgba(6, 182, 212, 0.5)' }}>
          {formatMultiplier(roundData.current_multiplier)}
        </div>
      </div>
    </div>
  );
}
