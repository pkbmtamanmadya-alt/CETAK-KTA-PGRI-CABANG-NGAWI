import React, { useState } from 'react';
import { Jenjang, Lembaga } from '../types';
import { Search, Plus, CheckCircle2, AlertCircle, School, ChevronRight } from 'lucide-react';

interface LembagaSelectorProps {
  selectedJenjang: Jenjang;
  lembagas: Lembaga[];
  selectedLembagaId: string;
  onSelectLembaga: (lembagaId: string) => void;
  onAddNewLembaga: (nama: string, jenjang: Jenjang, kecamatan?: string) => void;
}

export const LembagaSelector: React.FC<LembagaSelectorProps> = ({
  selectedJenjang,
  lembagas,
  selectedLembagaId,
  onSelectLembaga,
  onAddNewLembaga,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newKecamatan, setNewKecamatan] = useState('');

  const filteredLembagas = lembagas.filter(
    (l) =>
      l.jenjang === selectedJenjang &&
      (l.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.kecamatan && l.kecamatan.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleCreateLembaga = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;
    onAddNewLembaga(newSchoolName.trim(), selectedJenjang, newKecamatan.trim() || undefined);
    setNewSchoolName('');
    setNewKecamatan('');
    setIsAddingNew(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Langkah 2 &bull; Unit Kerja
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 mt-0.5">
            Pilihan Lembaga ({selectedJenjang})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Cari lembaga ${selectedJenjang}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-md bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Add New Form */}
      {isAddingNew && (
        <form onSubmit={handleCreateLembaga} className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-xs">
          <p className="font-bold text-slate-800 mb-2.5">Tambah Lembaga / Sekolah Baru ({selectedJenjang})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Nama Lembaga *</label>
              <input
                type="text"
                placeholder="Contoh: SD Negeri Kandangan 3"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-md border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Kecamatan / Ranting</label>
              <input
                type="text"
                placeholder="Contoh: Kandangan"
                value={newKecamatan}
                onChange={(e) => setNewKecamatan(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-md font-bold shadow-xs transition-colors"
            >
              Simpan Lembaga
            </button>
          </div>
        </form>
      )}

      {/* List of Lembagas */}
      {filteredLembagas.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm">
          <School className="w-8 h-8 mx-auto text-slate-400 mb-1.5" />
          <p className="font-semibold text-slate-700">Tidak ada data lembaga pada jenjang {selectedJenjang}</p>
          <p className="text-xs text-slate-400 mt-0.5">Silakan tambahkan lembaga baru atau sesuaikan kata kunci pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredLembagas.map((lembaga) => {
            const isSelected = selectedLembagaId === lembaga.id;
            const total = lembaga.anggota.length;
            const cetak = lembaga.anggota.filter((a) => a.statusCetak === 'CETAK').length;
            const tidakCetak = lembaga.anggota.filter((a) => a.statusCetak === 'TIDAK_CETAK').length;
            const isTervalidasi = lembaga.statusValidasi === 'TERVALIDASI';

            return (
              <button
                key={lembaga.id}
                onClick={() => onSelectLembaga(lembaga.id)}
                className={`relative text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-bold text-slate-800 text-sm leading-tight flex-1">
                      {lembaga.nama}
                    </span>
                    {isTervalidasi ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        TERVALIDASI
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        BELUM VALIDASI
                      </span>
                    )}
                  </div>

                  {lembaga.kecamatan && (
                    <p className="text-[11px] text-slate-400 mb-2">
                      Kec. {lembaga.kecamatan}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">{total} Anggota</span>
                    <span>&bull;</span>
                    <span className="text-emerald-600 font-semibold">{cetak} Cetak</span>
                    <span>&bull;</span>
                    <span className="text-rose-600 font-semibold">{tidakCetak} Tidak</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
