'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAviator } from '@/hooks/useAviator';
import { MdClose } from 'react-icons/md';
import { SiFusionauth } from 'react-icons/si';

export default function AviatorControl() {
  const aviator = useAviator();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [tempAuth, setTempAuth] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    console.log(' AviatorControl montado');
    loadWebsockets();
  }, []);

  const loadWebsockets = async () => {
    setLoading(true);
    try {
      await aviator.getAllWebSockets();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Normalizamos datos para mostrar nombre/imagen del bookmaker desde la relación
  const rows = useMemo(() => {
    return (aviator.websockets || []).map((ws: any) => ({
      ...ws,
      bookmakerName: ws?.bookmaker?.bookmaker ?? '-',
      bookmakerImg: ws?.bookmaker?.bookmaker_img ?? null,
      isEditable: ws?.isEditable !== undefined ? ws.isEditable : ws?.is_editable, // soporte ambos
      authMessage: ws?.authMessage ?? ws?.auth_message ?? '',
    }));
  }, [aviator.websockets]);

  const truncate = (text: string, max: number = 40) => {
    if (!text) return '-';
    return text.length > max ? text.slice(0, max) + '...' : text;
  };

  const openAuthModal = (ws: any) => {
    setSelectedId(ws.id);
    setSelectedRow(ws);
    setTempAuth(ws.authMessage || '');
    setSaveError(null);
    setShowModal(true);
  };

  const handleSaveAuth = async () => {
    if (selectedId == null) return;
    try {
      setSaving(true);
      setSaveError(null);
      const result = await aviator.updateAuthMessageById(selectedId, tempAuth);
      if (result.success) {
        // recargar lista para ver cambios
        await loadWebsockets();
        setShowModal(false);
      } else {
        setSaveError(result.message || 'Error al guardar');
      }
    } catch (e: any) {
      setSaveError(e?.message || 'Error inesperado');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-white">Aviator WebSockets</span>
        <button
          type="button"
          onClick={aviator.start}
          disabled={aviator.loading}
          className="px-4 py-2 rounded-md text-sm font-semibold text-white disabled:opacity-50 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
        >
          {aviator.loading ? 'Conectando…' : 'CONECTAR AVIATOR'}
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
              {/* Estado eliminado */}
              <th className="px-4 py-3 text-left text-xs text-zinc-400">Auth Message</th>
              <th className="px-4 py-3 text-right text-xs text-zinc-400">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">Cargando...</td></tr>
            ) : aviator.websockets.length === 0 ? (
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
                  <td className="px-4 py-3 text-xs text-zinc-400 max-w-xs" title={ws.authMessage}>{truncate(ws.authMessage)}</td>
                  <td className="px-4 py-3 text-right">
                    {ws.isEditable ? (
                      <button
                        type="button"
                        onClick={() => openAuthModal(ws)}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700"
                        title="Editar Auth Message"
                      >
                        EDITAR
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => !saving && setShowModal(false)}
          />
          <div className="relative w-full max-w-2xl mx-auto rounded-2xl border border-zinc-700/60 bg-gradient-to-b from-zinc-900 to-zinc-950 shadow-2xl ring-1 ring-black/30">
            {/* Header */}
            <div className="flex items-start gap-3 p-5 border-b border-zinc-800/60">
              <div className="shrink-0 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <SiFusionauth className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-white">Editar Auth Message</h3>
                <p className="mt-0.5 text-xs sm:text-sm text-zinc-400 truncate">
                  ID {selectedId}
                  {selectedRow?.bookmakerName ? ` • ${selectedRow.bookmakerName}` : ''}
                  {selectedRow?.bookmakerId ? ` (Bookmaker ID ${selectedRow.bookmakerId})` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => !saving && setShowModal(false)}
                className="p-2 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                aria-label="Cerrar"
                disabled={saving}
              >
                <MdClose className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 pt-4">
              <textarea
                className="w-full h-56 p-3 rounded-xl bg-zinc-950/80 border border-zinc-700/60 text-sm text-zinc-200 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 placeholder-zinc-600"
                value={tempAuth}
                onChange={(e) => setTempAuth(e.target.value)}
                placeholder="Pega o edita el contenido del auth message..."
                disabled={saving}
              />
              {saveError && (
                <div className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-md p-2">
                  {saveError}
                </div>
              )}
              <div className="mt-3 text-[11px] text-zinc-500">
                Se guardará en <span className="text-zinc-300 font-mono">aviator_ws.auth_message</span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 pt-0 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => !saving && setShowModal(false)}
                className="px-4 py-2 rounded-md text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-50"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveAuth}
                className="px-4 py-2 rounded-md text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
                disabled={saving}
              >
                {saving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
