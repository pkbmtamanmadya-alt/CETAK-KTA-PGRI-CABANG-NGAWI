import React, { useState } from 'react';
import { Jenjang, Lembaga } from '../types';
import {
  ArrowLeft,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  School,
  ChevronRight,
  MapPin,
  X,
  Building,
} from 'lucide-react';

interface LembagaListViewProps {
  selectedJenjang: Jenjang;
  lembagas: Lembaga[];
  onSelectLembaga: (lembagaId: string) => void;
  onBackToJenjang: () => void;
  onAddNewLembaga: (nama: string, jenjang: Jenjang, kecamatan?: string) => void;
  namaCabang: string;
}

export const LembagaListView: React.FC<LembagaListViewProps> = ({
  selectedJenjang,
  lembagas,
  onSelectLembaga,
  onBackToJenjang,
  onAddNewLembaga,
  namaCabang,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValidasi, setFilterValidasi] = useState<'SEMUA' | 'TERVALIDASI' | 'BELUM_VALIDASI'>('SEMUA');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newKecamatan, setNewKecamatan] = useState('');

  const lembagasInJenjang = lembagas.filter((l) => l.jenjang === selectedJenjang);

  const filteredLembagas = lembagasInJenjang.filter((l) => {
    const matchesSearch =
      l.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.kecamatan && l.kecamatan.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesValidasi =
      filterValidasi === 'SEMUA' || l.statusValidasi === filterValidasi;

    return matchesSearch && matchesValidasi;
  });

  const totalSekolah = lembagasInJenjang.length;
  const totalAnggota = lembagasInJenjang.reduce((acc, l) => acc + l.anggota.length, 0);
  const totalCetak = lembagasInJenjang.reduce(
    (acc, l) => acc + l.anggota.filter((a) => a.statusCetak === 'CETAK').length,
    0
  );
  const totalTervalidasi = lembagasInJenjang.filter((l) => l.statusValidasi === 'TERVALIDASI').length;

  const handleCreateLembaga = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;
    onAddNewLembaga(newSchoolName.trim(), selectedJenjang, newKecamatan.trim() || undefined);
    setNewSchoolName('');
    setNewKecamatan('');
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToJenjang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Pilihan Jenjang</span>
          </button>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs">
              Jenjang {selectedJenjang}
            </span>
            <span className="text-xs text-slate-500 hidden md:inline">
              ({totalSekolah} Lembaga terdaftar)
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Lembaga {selectedJenjang}</span>
        </button>
      </div>

      {/* Summary Stat Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block">Total Sekolah</span>
          <span className="text-lg font-bold text-slate-800">{totalSekolah} Lembaga</span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block">Total Anggota</span>
          <span className="text-lg font-bold text-slate-800">{totalAnggota} Orang</span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-emerald-600 block">Siap Dicetak</span>
          <span className="text-lg font-bold text-emerald-700">{totalCetak} KTA</span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block">Status Validasi</span>
          <span className="text-lg font-bold text-slate-800">{totalTervalidasi}/{totalSekolah} Valid</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Cari nama sekolah / kecamatan di jenjang ${selectedJenjang}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterValidasi}
            onChange={(e) => setFilterValidasi(e.target.value as any)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
          >
            <option value="SEMUA">Semua Status Validasi</option>
            <option value="TERVALIDASI">Hanya Tervalidasi</option>
            <option value="BELUM_VALIDASI">Hanya Belum Validasi</option>
          </select>
        </div>
      </div>

      {/* Add New School Modal / Form */}
      {isAddingNew && (
        <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-3xl animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-700" />
              <h3 className="font-bold text-sm text-blue-900">
                Tambah Lembaga / Sekolah Baru ({selectedJenjang})
              </h3>
            </div>
            <button
              onClick={() => setIsAddingNew(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateLembaga} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Lembaga / Sekolah *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SD Negeri Kandangan 3"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Kecamatan / Wilayah Ranting
                </label>
                <input
                  type="text"
                  placeholder={`Contoh: ${namaCabang.replace('Cabang ', '')}`}
                  value={newKecamatan}
                  onChange={(e) => setNewKecamatan(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow-xs transition-colors"
              >
                Simpan Lembaga
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Lembaga Cards */}
      {filteredLembagas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
            <School className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">
            {lembagasInJenjang.length === 0
              ? `Belum ada lembaga ${selectedJenjang} terdaftar`
              : 'Tidak ada data lembaga ditemukan'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {lembagasInJenjang.length === 0
              ? `Data dummy telah dibersihkan. Anda dapat menambahkan sekolah/unit kerja baru secara manual atau mengunggah data Excel melalui Menu Admin.`
              : `Tidak ada lembaga pada jenjang ${selectedJenjang} yang cocok dengan kata kunci "${searchTerm}".`}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            {lembagasInJenjang.length === 0 ? (
              <button
                onClick={() => setIsAddingNew(true)}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Lembaga {selectedJenjang} Sekarang</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterValidasi('SEMUA');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLembagas.map((lembaga) => {
            const total = lembaga.anggota.length;
            const cetak = lembaga.anggota.filter((a) => a.statusCetak === 'CETAK').length;
            const tidakCetak = lembaga.anggota.filter((a) => a.statusCetak === 'TIDAK_CETAK').length;
            const sudahCetak = lembaga.anggota.filter((a) => a.statusCetak === 'SUDAH_TERCETAK').length;
            const isTervalidasi = lembaga.statusValidasi === 'TERVALIDASI';

            return (
              <div
                key={lembaga.id}
                onClick={() => onSelectLembaga(lembaga.id)}
                className="group relative flex flex-col justify-between p-5 rounded-3xl bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden transform hover:-translate-y-0.5"
              >
                <div>
                  {/* Top line: Name & Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-blue-700 transition-colors">
                      {lembaga.nama}
                    </h3>
                  </div>

                  {/* Kecamatan Pill */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Kec. {lembaga.kecamatan || namaCabang.replace('Cabang ', '')}</span>
                  </div>
                </div>

                {/* Bottom stats & action */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{total} Anggota</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                        🟢 {cetak} Cetak
                      </span>
                      {tidakCetak > 0 && (
                        <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md text-[11px]">
                          🔴 {tidakCetak} Tidak
                        </span>
                      )}
                      {sudahCetak > 0 && (
                        <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md text-[11px]">
                          🔵 {sudahCetak} Sudah
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {isTervalidasi ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        TERVALIDASI
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-200">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        BELUM VALIDASI
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 font-bold text-xs text-blue-700 group-hover:translate-x-0.5 transition-transform">
                      <span>Buka Form</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
