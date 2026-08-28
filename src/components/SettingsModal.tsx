import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { Settings, X, Save, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetData,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="bg-blue-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-blue-200" />
            <h3 className="font-bold text-base">Pengaturan Kop Surat & Pejabat</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-blue-200 hover:text-white rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm text-slate-700">
          <div className="space-y-3">
            <p className="font-bold text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              Informasi Pengurus Cabang
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-xs">Nama Cabang PGRI</label>
                <input
                  type="text"
                  required
                  value={formData.namaCabang}
                  onChange={(e) => setFormData({ ...formData, namaCabang: e.target.value })}
                  placeholder="Contoh: Cabang Kandangan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-xs">Kabupaten / Kota</label>
                <input
                  type="text"
                  required
                  value={formData.kabupatenKota}
                  onChange={(e) => setFormData({ ...formData, kabupatenKota: e.target.value })}
                  placeholder="Contoh: Kabupaten Ngawi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-xs">Nomor Dokumen / Surat</label>
              <input
                type="text"
                value={formData.nomorSurat}
                onChange={(e) => setFormData({ ...formData, nomorSurat: e.target.value })}
                placeholder="Contoh: 045/PGRI-KND/KTA/VIII/2026"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <p className="font-bold text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              Pejabat Tanda Tangan & Verifikator
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-xs">Nama Ketua Cabang</label>
                <input
                  type="text"
                  required
                  value={formData.namaKetua}
                  onChange={(e) => setFormData({ ...formData, namaKetua: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-xs">NPA Ketua Cabang</label>
                <input
                  type="text"
                  value={formData.npaKetua}
                  onChange={(e) => setFormData({ ...formData, npaKetua: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-xs">Nama Petugas Verifikator / Admin</label>
              <input
                type="text"
                value={formData.namaVerifikator}
                onChange={(e) => setFormData({ ...formData, namaVerifikator: e.target.value })}
                placeholder="Nama Petugas Verifikasi KTA"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Reset Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Kembalikan semua data ke contoh data awal PGRI? Perubahan sebelumnya akan diganti.')) {
                  onResetData();
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Sampel</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-100 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
