'use client';

import React from 'react';

type ColorKey = 'red' | 'black' | 'green';

interface PredictionData {
  bookmakerId: number;
  number: number;
  data: {
    nextNumbers: Array<{
      id: number;
      number: number;
      color: string;
      dozen: string;
      column: string;
      timestamp: string;
    }>;
    percentages: {
      colors: { red?: string | number; black?: string | number; green?: string | number; Red?: string | number; Black?: string | number; Green?: string | number };
      columns: { zero: string; first: string; second: string; third: string };
      dozens: { zero: string; first: string; second: string; third: string };
      ranges: { zero: string; low: string; high: string };
      totalOccurrences: number;
    };
  };
  timestamp: string;
}

type RawPrediction = {
  bookmakerId: number;
  prediction_type: string;
  predicted_values: string[];
  probability: number;
  round_id?: string;
};

interface Props {
  predictionData: PredictionData | null;
  rawPrediction?: RawPrediction | null;
}

function toNumber(val: string | number | undefined): number {
  if (val == null) return 0;
  if (typeof val === 'number') return val;
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function getTopColor(pd: PredictionData | null): { label: string; key: ColorKey; score: number } | null {
  if (!pd) return null;
  const colors = pd.data?.percentages?.colors || {};
  // Soportar claves en minúsculas y Mayúsculas
  const red = toNumber((colors as any).red ?? (colors as any).Red);
  const black = toNumber((colors as any).black ?? (colors as any).Black);
  const green = toNumber((colors as any).green ?? (colors as any).Green);

  let pairs: Array<{ key: ColorKey; value: number }> = [
    { key: 'red', value: red },
    { key: 'black', value: black },
    { key: 'green', value: green },
  ];

  // Si no hay porcentajes válidos, usar el primer número sugerido
  const total = pairs.reduce((s, p) => s + p.value, 0);
  if (total === 0 && pd.data?.nextNumbers?.length) {
    const c = (pd.data.nextNumbers[0].color || '').toLowerCase();
    const key: ColorKey = c === 'red' ? 'red' : c === 'black' ? 'black' : 'green';
    const label = key === 'red' ? 'ROJO' : key === 'black' ? 'NEGRO' : 'VERDE';
    return { label, key, score: 0 };
  }

  const top = pairs.sort((a, b) => b.value - a.value)[0];
  const label = top.key === 'red' ? 'ROJO' : top.key === 'black' ? 'NEGRO' : 'VERDE';
  return { label, key: top.key, score: top.value };
}

export default function RoulettePredictionCard({ predictionData, rawPrediction }: Props) {
  // Si viene la predicción cruda desde el websocket 'prediction', usarla primero
  let useRaw = false;
  let labelFromRaw = '';
  let secondaryLabelFromRaw = '';
  let scoreFromRaw: number | null = null;
  let colorKeyFromRaw: ColorKey | null = null;
  let friendlyType = '';
  let combinedOrdinalLabel = '';
  let ordinalValues: string[] = [];
  let percentText: string | null = null;
  let percentColorClass = '';

  if (rawPrediction) {
    useRaw = true;
    const primaryVal = rawPrediction.predicted_values?.[0] || '';
    const secondaryVal = rawPrediction.predicted_values?.[1] || '';
    // Mapear etiquetas amigables según el tipo
    const type = (rawPrediction.prediction_type || '').toLowerCase();
    friendlyType = type === 'color' ? 'COLOR' : type === 'column' ? 'COLUMNA' : type === 'dozen' ? 'DOCENA' : (type ? type.toUpperCase() : 'PREDICCIÓN');
    const toDozenLabel = (v: string) => {
      const low = v.toLowerCase();
      if (low.includes('1st')) return '1ª DOCENA';
      if (low.includes('2nd')) return '2ª DOCENA';
      if (low.includes('3rd')) return '3ª DOCENA';
      return v;
    };
    const toColumnLabel = (v: string) => {
      const map: Record<string, string> = {
        '1:1': 'COLUMNA 1',
        '2:1': 'COLUMNA 2',
        '3:1': 'COLUMNA 3',
      };
      return map[v] || v;
    };
    const toDozenOrdinal = (v: string) => {
      const low = v.toLowerCase();
      if (low.includes('1st')) return '1ra';
      if (low.includes('2nd')) return '2da';
      if (low.includes('3rd')) return '3ra';
      return v;
    };
    const toColumnOrdinal = (v: string) => {
      const map: Record<string, string> = {
        '1:1': '1ra',
        '2:1': '2da',
        '3:1': '3ra',
      };
      return map[v] || v;
    };
    const toColorLabel = (v: string) => {
      const low = v.toLowerCase();
      if (low === 'red') return 'ROJO';
      if (low === 'black') return 'NEGRO';
      if (low === 'green') return 'VERDE';
      return v;
    };
    const friendly = (v: string) => {
      if (!v) return v;
      if (type === 'dozen') return toDozenLabel(v);
      if (type === 'column') return toColumnLabel(v);
      if (type === 'color') return toColorLabel(v);
      return v;
    };
    // Etiqueta principal amigable
    labelFromRaw = friendly(primaryVal);
    secondaryLabelFromRaw = friendly(secondaryVal);
    scoreFromRaw = typeof rawPrediction.probability === 'number' ? rawPrediction.probability : null;
    if (typeof scoreFromRaw === 'number') {
      const percent = scoreFromRaw <= 1 ? scoreFromRaw * 100 : scoreFromRaw;
      percentText = `${Number(percent.toFixed(1))}%`;
    }

    // Si el tipo es color, intentar aplicar el gradiente por color
    if (rawPrediction.prediction_type?.toLowerCase() === 'color') {
      const v = (primaryVal || '').toLowerCase();
      colorKeyFromRaw = v === 'red' ? 'red' : v === 'black' ? 'black' : 'green';
    }

    // Para columnas/docenas, construir etiqueta ordinal combinada como "1ra y 3ra"
    if (type === 'column' || type === 'dozen') {
      const mapOrdinal = type === 'column' ? toColumnOrdinal : toDozenOrdinal;
      ordinalValues = (rawPrediction.predicted_values || []).slice(0, 2).map(mapOrdinal).filter(Boolean);
      combinedOrdinalLabel = ordinalValues.join(' y ');
    }

    // Estilo uniforme para el porcentaje: sin fondo y borde azul
    percentColorClass = 'text-blue-200 border-blue-400/30 bg-transparent';
  }

  const top = useRaw ? null : getTopColor(predictionData);
  // Si usamos fallback (sin raw), preparar porcentaje y estilo azul
  if (!useRaw && top) {
    const score = top.score;
    const percent = score <= 1 ? score * 100 : score;
    percentText = `${Number(percent.toFixed(1))}%`;
    percentColorClass = 'text-blue-200 border-blue-400/30 bg-transparent';
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-start p-4 relative">
      {/* Header superior con estilo premium */}
      <div className="w-full flex items-center justify-center mb-3">
        <div className="px-4 py-1.5 rounded-full border-2 border-[#10B981]/40 bg-gradient-to-r from-[#10B981]/10 to-emerald-600/10 backdrop-blur-sm shadow-[0_0_20px_rgba(16,185,129,0.15)] text-[11px] font-bold tracking-wider uppercase text-center">
          <span className="bg-gradient-to-r from-emerald-300 via-[#10B981] to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
            PREDICCIONES
          </span>
        </div>
      </div>

      {useRaw ? (
        <div className="flex-1 w-full flex flex-col items-center justify-center gap-4">
          {/* Título centrado con glow effect */}
          <div className="px-4 py-1.5 rounded-full border-2 border-rose-500/40 bg-gradient-to-r from-rose-500/10 to-red-600/10 backdrop-blur-sm shadow-[0_0_20px_rgba(244,63,94,0.15)] text-[11px] font-bold tracking-wider uppercase w-32 text-center">
            <span className="bg-gradient-to-r from-rose-300 via-rose-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">
              {friendlyType || 'Predicción'}
            </span>
          </div>
          
          {/* Si es COLOR: mostrar solo el color grande al centro con efecto premium */}
          {friendlyType === 'COLOR' ? (
            <div
              className={`text-4xl md:text-5xl leading-tight font-black tracking-tight bg-clip-text text-transparent text-center drop-shadow-[0_2px_20px_rgba(255,255,255,0.3)] ${
                colorKeyFromRaw === 'red'
                  ? 'bg-gradient-to-br from-rose-200 via-rose-300 to-pink-400'
                  : colorKeyFromRaw === 'black'
                  ? 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300'
                  : colorKeyFromRaw === 'green'
                  ? 'bg-gradient-to-br from-emerald-200 via-emerald-300 to-teal-400'
                  : 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300'
              }`}
            >
              {labelFromRaw || '—'}
            </div>
          ) : (
            // Para COLUMNA/DOCENA: tarjetas mejoradas con glassmorphism
            <div className="w-full flex items-center justify-center gap-3">
              {ordinalValues.length === 0 ? (
                <div className="text-sm text-gray-400/70">Sin datos</div>
              ) : (
                ordinalValues.map((ord, idx) => (
                  <div
                    key={`${ord}-${idx}`}
                    className="px-4 py-2 rounded-xl border-2 border-emerald-400/40 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 backdrop-blur-sm shadow-[0_0_20px_rgba(16,185,129,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] text-[11px] font-bold tracking-wider uppercase w-28 text-center hover:scale-105 transition-transform duration-200"
                  >
                    <span className="bg-gradient-to-r from-emerald-300 via-emerald-200 to-teal-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                      {ord}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
          
          {/* Porcentaje con diseño profesional y efecto glow */}
          {percentText ? (
            <div className="w-full flex items-center justify-center mt-2">
              <div className="px-5 py-2 rounded-full border-2 border-blue-400/40 bg-gradient-to-r from-blue-500/10 to-cyan-600/10 backdrop-blur-sm shadow-[0_0_20px_rgba(59,130,246,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] text-sm font-black tracking-wider uppercase w-32 text-center">
                <span className="bg-gradient-to-r from-blue-200 via-blue-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]">
                  {percentText}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      ) : top ? (
        <div className="flex-1 w-full flex flex-col items-center justify-center gap-4">
          {/* Título mejorado (fallback) */}
          <div className="px-4 py-1.5 rounded-full border-2 border-rose-500/40 bg-gradient-to-r from-rose-500/10 to-red-600/10 backdrop-blur-sm shadow-[0_0_20px_rgba(244,63,94,0.15)] text-[11px] font-bold tracking-wider uppercase w-32 text-center">
            <span className="bg-gradient-to-r from-rose-300 via-rose-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">
              COLOR
            </span>
          </div>
          
          <div
            className={`text-4xl md:text-5xl leading-tight font-black tracking-tight bg-clip-text text-transparent text-center drop-shadow-[0_2px_20px_rgba(255,255,255,0.3)]
              ${
                top.key === 'red'
                  ? 'bg-gradient-to-br from-rose-200 via-rose-300 to-pink-400'
                  : top.key === 'black'
                  ? 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300'
                  : 'bg-gradient-to-br from-emerald-200 via-emerald-300 to-teal-400'
            }`}
          >
            {top.label}
          </div>
          
          {percentText ? (
            <div className="w-full flex items-center justify-center mt-2">
              <div className="px-5 py-2 rounded-full border-2 border-blue-400/40 bg-gradient-to-r from-blue-500/10 to-cyan-600/10 backdrop-blur-sm shadow-[0_0_20px_rgba(59,130,246,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] text-sm font-black tracking-wider uppercase w-32 text-center">
                <span className="bg-gradient-to-r from-blue-200 via-blue-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]">
                  {percentText}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-gray-400/60 font-medium">Esperando predicción...</div>
        </div>
      )}
    </div>
  );
}
