import React, { useState } from 'react';
import { Lembaga, Jenjang, AppSettings } from '../types';
import {
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  Printer,
  FileText,
  FileSpreadsheet,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { exportRekapToExcel } from '../utils/excelExport';

interface RekapViewProps {
  lembagas: Lembaga[];
  settings: AppSettings;
  onSelectLembaga: (lembagaId: string, jenjang: Jenjang) => void;
  onOpenPrintOfficial: () => void;
  onOpenExcelManager: () => void;
}

export const RekapView: React.FC<RekapViewProps> = ({
  lembagas,
  settings,
  onSelectLembaga,
  onOpenPrintOfficial,
  onOpenExcelManager,
}) => {
  const [selectedJenjang, setSelectedJenjang] = useState<string>('SEMUA');
  const [selectedStatusValidasi, setSelectedStatusValidasi] = useState<string>('SEMUA');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Overall stats
  const totalLembaga = lembagas.length;
  const totalAnggota = lembagas.reduce((acc, l) => acc + l.anggota.length, 0);
  const totalCetak = lembagas.reduce(
    (acc, l) => acc + l.anggota.filter((a) => a.statusCetak === 'CETAK').length,
    0
  );
  const totalTidakCetak = lembagas.reduce(
    (acc, l) => acc + l.anggota.filter((a) => a.statusCetak === 'TIDAK_CETAK').length,
    0
  );
  const totalTervalidasi = lembagas.filter((l) => l.statusValidasi === 'TERVALIDASI').length;
  const totalBelumValidasi = totalLembaga - totalTervalidasi;

  // Filtered rows
  const filteredLembagas = lembagas.filter((l) => {
    const matchesJenjang = selectedJenjang === 'SEMUA' || l.jenjang === selectedJenjang;
    const matchesValidasi =
      selectedStatusValidasi === 'SEMUA' || l.statusValidasi === selectedStatusValidasi;
    const matchesSearch =
      l.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.kecamatan && l.kecamatan.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.catatan && l.catatan.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesJenjang && matchesValidasi && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards (Clean Minimalism) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Lembaga */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Lembaga</span>
            <Building2 className="w-4 h-4 text-blue-700" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-slate-800 block">
            {totalLembaga}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {totalTervalidasi} tervalidasi &bull; {totalBelumValidasi} belum
          </span>
        </div>

        {/* Total Anggota */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Anggota</span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-slate-800 block">
            {totalAnggota}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Guru & Tenaga Kependidikan</span>
        </div>

        {/* Total Cetak KTA */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Akan Cetak KTA</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-emerald-600 block">
            {totalCetak}
          </span>
          <span className="text-[11px] text-emerald-700 mt-1 block font-medium">
            {totalAnggota > 0 ? ((totalCetak / totalAnggota) * 100).toFixed(1) : 0}% dari seluruh anggota
          </span>
        </div>

        {/* Total Tidak Cetak */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Tidak Cetak</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-rose-600 block">
            {totalTidakCetak < 10 ? `0${totalTidakCetak}` : totalTidakCetak}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Sudah ada KTA / pensiun</span>
        </div>

        {/* Status Validasi */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Tervalidasi</span>
            <ShieldCheck className="w-4 h-4 text-blue-700" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-slate-800 block">
            {totalTervalidasi}{' '}
            <span className="text-sm font-normal text-slate-400">/ {totalLembaga}</span>
          </span>
          <span className="text-[11px] text-blue-700 mt-1 block font-semibold">
            {totalLembaga > 0 ? ((totalTervalidasi / totalLembaga) * 100).toFixed(0) : 0}% Lembaga Selesai
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-6">
        {/* Table Header & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-700" />
              Laporan Rekapitulasi Cabang
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {settings.namaCabang} &bull; {settings.kabupatenKota}, {settings.provinsi}
            </p>
          </div>

          {/* Quick Action Export & Print buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenPrintOfficial}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-md transition-colors shadow-xs"
              title="Cetak format resmi dengan kop surat, tanggal dan tanda tangan"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>CETAK REKAP</span>
            </button>

            <button
              onClick={onOpenPrintOfficial}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-md transition-colors"
              title="Export format PDF resmi"
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span>EXPORT PDF</span>
            </button>

            <button
              onClick={() => exportRekapToExcel(lembagas, settings)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-md transition-colors"
              title="Download Rekap format Excel .xlsx"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>EXPORT EXCEL</span>
            </button>

            <button
              onClick={onOpenExcelManager}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-medium text-xs rounded-md transition-colors"
            >
              <span>Impor / Ekspor</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          {/* Jenjang Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Filter Jenjang:
            </label>
            <select
              value={selectedJenjang}
              onChange={(e) => setSelectedJenjang(e.target.value)}
              className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none focus:bg-white text-slate-700"
            >
              <option value="SEMUA">Semua Jenjang (PAUD, TK, SD, SMP, SMA)</option>
              <option value="PAUD">PAUD</option>
              <option value="TK">TK</option>
              <option value="SD">SD</option>
              <option value="SMP/MTs">SMP / MTs</option>
              <option value="SMA/SMK">SMA / SMK</option>
            </select>
          </div>

          {/* Validasi Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Status Validasi:
            </label>
            <select
              value={selectedStatusValidasi}
              onChange={(e) => setSelectedStatusValidasi(e.target.value)}
              className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none focus:bg-white text-slate-700"
            >
              <option value="SEMUA">Semua Status Validasi</option>
              <option value="TERVALIDASI">Hanya TERVALIDASI</option>
              <option value="BELUM_VALIDASI">Hanya BELUM VALIDASI</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Cari Lembaga / Catatan:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama lembaga..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none focus:bg-white text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Rekapitulasi Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center text-[10px] uppercase font-bold text-slate-400">No</th>
                <th className="py-3 px-4 w-24 text-[10px] uppercase font-bold text-slate-400">Jenjang</th>
                <th className="py-3 px-4 text-[10px] uppercase font-bold text-slate-400">Lembaga / Sekolah</th>
                <th className="py-3 px-4 text-center w-20 text-[10px] uppercase font-bold text-slate-400">Anggota</th>
                <th className="py-3 px-4 text-center w-20 text-[10px] uppercase font-bold text-emerald-600">Cetak</th>
                <th className="py-3 px-4 text-center w-24 text-[10px] uppercase font-bold text-rose-600">Tidak Cetak</th>
                <th className="py-3 px-4 text-center w-36 text-[10px] uppercase font-bold text-slate-400">Status</th>
                <th className="py-3 px-4 min-w-44 text-[10px] uppercase font-bold text-slate-400">Catatan</th>
                <th className="py-3 px-4 text-center w-20 text-[10px] uppercase font-bold text-slate-400">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLembagas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400 text-xs italic">
                    Tidak ada lembaga yang sesuai dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredLembagas.map((lembaga, index) => {
                  const total = lembaga.anggota.length;
                  const cetak = lembaga.anggota.filter((a) => a.statusCetak === 'CETAK').length;
                  const tidakCetak = lembaga.anggota.filter((a) => a.statusCetak === 'TIDAK_CETAK').length;
                  const isTervalidasi = lembaga.statusValidasi === 'TERVALIDASI';

                  return (
                    <tr key={lembaga.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-500 font-medium">
                        {index + 1}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-700">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-600">
                          {lembaga.jenjang}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-800">
                        <button
                          onClick={() => onSelectLembaga(lembaga.id, lembaga.jenjang)}
                          className="hover:text-blue-600 text-left font-bold"
                        >
                          {lembaga.nama}
                        </button>
                        {lembaga.kecamatan && (
                          <span className="block text-[11px] font-normal text-slate-400">
                            Kec. {lembaga.kecamatan}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-slate-700">
                        {total}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-emerald-600">
                        {cetak}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-rose-600">
                        {tidakCetak}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isTervalidasi ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            TERVALIDASI
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            BELUM VALIDASI
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-500">
                        {lembaga.catatan || (
                          <span className="text-slate-300 italic">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onSelectLembaga(lembaga.id, lembaga.jenjang)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs font-medium transition-colors"
                        >
                          <span>Buka</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Table Footer with Sums */}
            {filteredLembagas.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 font-bold text-slate-800 border-t border-slate-200">
                  <td colSpan={3} className="py-3 px-4 text-right text-xs uppercase tracking-wider text-slate-500">
                    JUMLAH TOTAL:
                  </td>
                  <td className="py-3 px-4 text-center text-slate-800 font-bold">
                    {filteredLembagas.reduce((acc, l) => acc + l.anggota.length, 0)}
                  </td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                    {filteredLembagas.reduce(
                      (acc, l) => acc + l.anggota.filter((a) => a.statusCetak === 'CETAK').length,
                      0
                    )}
                  </td>
                  <td className="py-3 px-4 text-center text-rose-600 font-bold">
                    {filteredLembagas.reduce(
                      (acc, l) => acc + l.anggota.filter((a) => a.statusCetak === 'TIDAK_CETAK').length,
                      0
                    )}
                  </td>
                  <td colSpan={3} className="py-3 px-4 text-xs font-medium text-slate-500">
                    {filteredLembagas.filter((l) => l.statusValidasi === 'TERVALIDASI').length} dari{' '}
                    {filteredLembagas.length} Lembaga Selesai
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
