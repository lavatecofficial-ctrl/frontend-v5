'use client';

import React, { useState, useEffect } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

type TooltipPayload = ReadonlyArray<any>;

type Coordinate = {
  x: number;
  y: number;
};

type PieSectorData = {
  percent?: number;
  name?: string | number;
  midAngle?: number;
  middleRadius?: number;
  tooltipPosition?: Coordinate;
  value?: number;
  paddingAngle?: number;
  dataKey?: string;
  payload?: any;
  tooltipPayload?: ReadonlyArray<TooltipPayload>;
};

type GeometrySector = {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
};

type PieLabelProps = PieSectorData &
  GeometrySector & {
    tooltipPayload?: any;
  };

interface ColorPercentagesCardProps {
  stats?: {
    red: number;
    black: number;
    green: number;
  };
  roundData?: {
    number: number;
    color: string;
  };
}

const RADIAN = Math.PI / 180;
const COLORS = [
  'rgba(239, 68, 68, 0.95)', // Rojo más intenso
  'rgba(30, 41, 59, 0.95)',  // Negro más rico
  'rgba(34, 197, 94, 0.95)', // Verde más brillante
];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      style={{ 
        fontWeight: 'bold', 
        fontSize: '14px',
        textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(255,255,255,0.3)'
      }}
    >
      {`${((percent ?? 1) * 100).toFixed(0)}%`}
    </text>
  );
};

const ColorPercentagesCard: React.FC<ColorPercentagesCardProps> = ({ stats, roundData }) => {
  const [outerRadius, setOuterRadius] = useState(80);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 480) {
        setOuterRadius(50);
      } else if (window.innerWidth <= 768) {
        setOuterRadius(60);
      } else {
        setOuterRadius(80);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const percentages = stats || { red: 0, black: 0, green: 0 };

  const data = [
    { name: 'Rojo', value: percentages.red },
    { name: 'Negro', value: percentages.black },
    { name: 'Verde', value: percentages.green },
  ];

  return (
    <div className="flex-1 flex flex-col relative z-10">
      <div className="flex flex-col h-full">
        <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DC2626] via-white to-[#10B981] mb-3 text-center tracking-wide drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
          COLORES (#{roundData?.number ?? 'N/A'})
        </h3>
        <div className="flex-1 flex items-center justify-center relative" style={{ minHeight: outerRadius * 2 + 20 }}>
          {/* Glow effect detrás del gráfico */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-[#DC2626]/10 rounded-full blur-2xl"></div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart width={400} height={400}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={outerRadius}
                innerRadius={outerRadius * 0.6}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
                stroke="rgba(0,0,0,0.8)"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${entry.name}`} 
                    fill={COLORS[index % COLORS.length]}
                    style={{
                      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ColorPercentagesCard;
