import React, { useState } from 'react';
import { Lembaga } from '../types';
import { CheckCircle2, Unlock, ShieldCheck, FileCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ValidationSectionProps {
  lembaga: Lembaga;
  onValidate: (lembagaId: string, catatan?: string) => void;
  onUnlock: (lembagaId: string) => void;
}

export const ValidationSection: React.FC<ValidationSectionProps> = ({
  lembaga,
  onValidate,
  onUnlock,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [catatanValidasi, setCatatanValidasi] = useState('');

  const totalAnggota = lembaga.anggota.length;
  const totalCetak = lembaga.anggota.filter((a) => a.statusCetak === 'CETAK').length;
  const totalTidakCetak = lembaga.anggota.filter((a) => a.statusCetak === 'TIDAK_CETAK').length;
  const totalSudahCetak = lembaga.anggota.filter((a) => a.statusCetak === 'SUDAH_TERCETAK').length;
  const isTervalidasi = lembaga.statusValidasi === 'TERVALIDASI';

  const handleConfirmValidation = () => {
    onValidate(lembaga.id, catatanValidasi);
    setShowConfirmModal(false);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#2563eb', '#10b981', '#f59e0b', '#3b82f6'],
      });
    } catch {
      // Ignore if confetti fails
    }
  };

  return (
    <div className="mt-6 bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6">
      {/* Stats & Validation Section (matching Clean Minimalism design) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6 sm:gap-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Anggota
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-800">
              {totalAnggota}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              Akan Cetak
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600">
              {totalCetak}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
              Tidak Cetak
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-rose-600">
              {totalTidakCetak < 10 ? `0${totalTidakCetak}` : totalTidakCetak}
            </span>
          </div>

          {totalSudahCetak > 0 && (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                Sudah Tercetak
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                {totalSudahCetak}
              </span>
            </div>
          )}
        </div>

        {/* Validation Action Button */}
        <div className="flex items-center gap-3">
          {isTervalidasi ? (
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2.5 rounded-xl text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>TERVALIDASI</span>
              </div>
              <button
                onClick={() => onUnlock(lembaga.id)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Buka Kunci</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setCatatanValidasi(lembaga.catatan || '');
                setShowConfirmModal(true);
              }}
              className="bg-blue-700 hover:bg-blue-800 text-white px-7 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2.5 transition-all text-sm cursor-pointer"
            >
              <span>✅</span>
              <span>VALIDASI DATA</span>
            </button>
          )}
        </div>
      </div>

      {/* OVERLAY MODAL (Matching Clean Minimalism theme) */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-[500px] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="p-7 sm:p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-5 mx-auto text-blue-700">
                <span className="text-3xl">📋</span>
              </div>
              
              <h3 className="text-xl font-bold text-center text-slate-800 mb-1">
                Konfirmasi Data Cetak KTA
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm text-center mb-6">
                Harap pastikan rincian data di bawah ini sudah benar sebelum melanjutkan.
              </p>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3.5 mb-6 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Lembaga</span>
                  <span className="text-xs font-bold text-slate-800">{lembaga.nama}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Jumlah Seluruh Anggota</span>
                  <span className="text-xs font-bold text-slate-800">{totalAnggota} Orang</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Jumlah KTA akan dicetak</span>
                  <span className="text-sm font-bold text-emerald-600">{totalCetak} Orang</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Jumlah Tidak Dicetak</span>
                  <span className="text-sm font-bold text-rose-600">{totalTidakCetak} Orang</span>
                </div>
                {totalSudahCetak > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Sudah Tercetak</span>
                    <span className="text-xs font-bold text-blue-600">{totalSudahCetak} Orang</span>
                  </div>
                )}
              </div>

              {/* Optional Note */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Catatan / Keterangan Lembaga (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Berkas foto lengkap, siap cetak"
                  value={catatanValidasi}
                  onChange={(e) => setCatatanValidasi(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 text-xs sm:text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  BATAL
                </button>
                <button
                  type="button"
                  onClick={handleConfirmValidation}
                  className="flex-[2] py-3 text-xs sm:text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-lg shadow-blue-100 transition-colors"
                >
                  YA, VALIDASI SEKARANG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
