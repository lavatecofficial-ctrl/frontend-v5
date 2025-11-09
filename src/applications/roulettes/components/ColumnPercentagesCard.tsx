import React from 'react';

interface ColumnPercentagesCardProps {
  stats?: {
    zero: number;
    first: number;
    second: number;
    third: number;
  };
  roundData?: {
    number: number;
    color: string;
  };
}

const ColumnPercentagesCard: React.FC<ColumnPercentagesCardProps> = ({ stats, roundData }) => {
  const percentages = stats || { zero: 0, first: 0, second: 0, third: 0 };

  const fixedPercentages = [
    { key: 'first', value: parseFloat(percentages.first.toString()), label: '1ª Columna' },
    { key: 'second', value: parseFloat(percentages.second.toString()), label: '2ª Columna' },
    { key: 'third', value: parseFloat(percentages.third.toString()), label: '3ª Columna' },
    { key: 'zero', value: parseFloat(percentages.zero.toString()), label: 'Zero' },
  ];

  const getBarClass = (key: string) => {
    const sortedValues = fixedPercentages.map(item => item.value).sort((a, b) => b - a);
    const index = sortedValues.indexOf(fixedPercentages.find(item => item.key === key)?.value || 0);
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[0_0_12px_rgba(16,185,129,0.6)]';
      case 1:
        return 'bg-gradient-to-r from-[#34D399] to-[#10B981] shadow-[0_0_10px_rgba(52,211,153,0.5)]';
      case 2:
        return 'bg-gradient-to-r from-[#6EE7B7] to-[#34D399] shadow-[0_0_8px_rgba(110,231,183,0.4)]';
      case 3:
        return 'bg-gradient-to-r from-[#A7F3D0] to-[#6EE7B7] shadow-[0_0_6px_rgba(167,243,208,0.3)]';
      default:
        return 'bg-gradient-to-r from-[#A7F3D0] to-[#6EE7B7]';
    }
  };

  return (
    <div className="flex-1 flex flex-col relative z-10">
      <div className="flex flex-col h-full">
        <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-white to-[#10B981] mb-3 text-center tracking-wide drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
          COLUMNAS (#{roundData?.number ?? 'N/A'})
        </h3>
        <div className="flex flex-col gap-3 flex-1">
          {fixedPercentages.map(({ key, label, value }) => (
            <div key={key} className="flex flex-col group">
              <div className="flex justify-between text-xs font-bold text-white/90 mb-1.5 transition-all duration-300 group-hover:text-[#10B981]">
                <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{label}</span>
                <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{value}%</span>
              </div>
              <div className="w-full bg-gradient-to-r from-gray-800/70 to-gray-900/70 rounded-full h-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-gray-700/50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getBarClass(key)}`}
                  style={{ 
                    width: `${value}%`,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColumnPercentagesCard;
