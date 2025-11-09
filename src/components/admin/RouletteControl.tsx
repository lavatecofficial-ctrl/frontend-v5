'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouletteWs } from '@/hooks/useRouletteWs';

export default function RouletteControl() {
  const roulette = useRouletteWs();
  const [loading, setLoading] = useState(true);
  // Eliminamos funcionalidad de edición (solo vista)

  useEffect(() => {
    loadWebsockets();
  }, []);

  const loadWebsockets = async () => {
    setLoading(true);
    try {
      await roulette.getAllWebSockets();
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => {
    return (roulette.websockets || []).map((ws: any) => ({
      ...ws,
      bookmakerName: ws?.bookmaker?.bookmaker ?? '-',
      bookmakerImg: ws?.bookmaker?.bookmaker_img ?? null,
      page: ws?.page ?? '',
      isEditable: true,
    }));
  }, [roulette.websockets]);

  const truncate = (text: string, max: number = 40) => {
    if (!text) return '-';
    return text.length > max ? text.slice(0, max) + '...' : text;
  };

  // Quitado: openPageModal & handleSavePage (no edición)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-white">Roulette WebSockets</span>
        <button
          type="button"
          onClick={roulette.connectRoulette}
          disabled={roulette.connecting}
          className="px-4 py-2 rounded-md text-sm font-semibold text-white disabled:opacity-50 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
        >
          {roulette.connecting ? 'Conectando…' : 'CONECTAR RULETAS'}
        </button>
      </div>

      <div className="bg-black/40 border border-zinc-800 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left text-xs text-zinc-400">ID</th>
                <th className="px-4 py-3 text-left text-xs text-zinc-400">Bookmaker ID</th>
                <th className="px-4 py-3 text-left text-xs text-zinc-400">Bookmaker</th>
                <th className="px-4 py-3 text-left text-xs text-zinc-400">Page</th>
                {/* Columna de estado/acción eliminada */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Cargando...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8">Sin datos</td></tr>
              ) : (
                rows.map((ws) => (
                  <tr key={ws.id} className="border-b border-zinc-800/50 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-white">{ws.id}</td>
                    <td className="px-4 py-3 text-sm text-white">{ws.bookmakerId}</td>
                    <td className="px-4 py-3 text-sm text-white">
                      <div className="flex items-center gap-2">
                        {ws.bookmakerImg ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={ws.bookmakerImg} alt={ws.bookmakerName} className="h-5 w-5 rounded-full object-contain" />
                        ) : null}
                        <span>{ws.bookmakerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400 max-w-xs" title={ws.page}>{truncate(ws.page)}</td>
                    {/* Columna de acción eliminada */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal eliminado: edición de page deshabilitada */}
    </div>
  );
}
