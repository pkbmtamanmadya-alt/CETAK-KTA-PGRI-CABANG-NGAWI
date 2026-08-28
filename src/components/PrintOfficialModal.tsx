import React, { useState } from 'react';
import { Lembaga, AppSettings, FilterStatusAnggota } from '../types';
import { Printer, X, FileText } from 'lucide-react';
import { printOfficialDocDirectly } from '../utils/printDocHelper';

interface PrintOfficialModalProps {
  isOpen: boolean;
  onClose: () => void;
  lembagas: Lembaga[];
  settings: AppSettings;
  activeLembaga?: Lembaga | null;
}

export const PrintOfficialModal: React.FC<PrintOfficialModalProps> = ({
  isOpen,
  onClose,
  lembagas,
  settings,
  activeLembaga,
}) => {
  const [printMode, setPrintMode] = useState<'REKAP_SEMUA' | 'DETAIL_LEMBAGA'>(
    activeLembaga ? 'DETAIL_LEMBAGA' : 'REKAP_SEMUA'
  );
  const [selectedJenjang, setSelectedJenjang] = useState<string>(
    activeLembaga?.jenjang || 'SEMUA'
  );
  const [selectedLembagaId, setSelectedLembagaId] = useState<string>(
    activeLembaga?.id || lembagas[0]?.id || ''
  );
  const [memberFilter, setMemberFilter] = useState<FilterStatusAnggota>('SEMUA');
  const [showMemberDetails, setShowMemberDetails] = useState<boolean>(true);

  if (!isOpen) return null;

  const handlePrint = () => {
    printOfficialDocDirectly({
      settings,
      lembagas,
      printMode,
      selectedJenjang,
      selectedLembagaId,
      memberFilter,
      showMemberDetails,
    });
  };

  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
  }).format(new Date());

  const currentLembaga = lembagas.find((l) => l.id === selectedLembagaId) || lembagas[0];

  const filteredLembagas = lembagas.filter((l) => {
    if (selectedJenjang === 'SEMUA') return true;
    return l.jenjang === selectedJenjang;
  });

  const totalAnggota = filteredLembagas.reduce((acc, l) => acc + l.anggota.length, 0);
  const totalCetak = filteredLembagas.reduce(
    (acc, l) => acc + l.anggota.filter((a) => a.statusCetak === 'CETAK').length,
    0
  );
  const totalTidakCetak = filteredLembagas.reduce(
    (acc, l) => acc + l.anggota.filter((a) => a.statusCetak === 'TIDAK_CETAK').length,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-5xl my-8 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Modal Top Action Bar (Hidden in Print) */}
        <div className="bg-blue-800 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <Printer className="w-5 h-5 text-blue-200" />
            <h2 className="font-bold text-sm sm:text-base">
              Cetak / Ekspor PDF Dokumen Resmi PGRI
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Bar in Modal (Hidden in Print) */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs shrink-0 print:hidden">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Format Laporan:</label>
            <select
              value={printMode}
              onChange={(e) => setPrintMode(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-blue-500"
            >
              <option value="REKAP_SEMUA">Rekapitulasi Seluruh Lembaga</option>
              <option value="DETAIL_LEMBAGA">Laporan Khusus Per Lembaga</option>
            </select>
          </div>

          {printMode === 'REKAP_SEMUA' ? (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Filter Jenjang:</label>
              <select
                value={selectedJenjang}
                onChange={(e) => setSelectedJenjang(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-blue-500"
              >
                <option value="SEMUA">Semua Jenjang</option>
                <option value="PAUD">PAUD</option>
                <option value="TK">TK</option>
                <option value="SD">SD</option>
                <option value="SMP/MTs">SMP/MTs</option>
                <option value="SMA/SMK">SMA/SMK</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Lembaga:</label>
              <select
                value={selectedLembagaId}
                onChange={(e) => setSelectedLembagaId(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-blue-500"
              >
                {lembagas.map((l) => (
                  <option key={l.id} value={l.id}>
                    [{l.jenjang}] {l.nama}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Filter Status Anggota:</label>
            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-blue-500"
            >
              <option value="SEMUA">Semua Anggota</option>
              <option value="CETAK">Hanya Yang Akan Dicetak</option>
              <option value="TIDAK_CETAK">Hanya Yang Tidak Dicetak</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer pb-1.5">
              <input
                type="checkbox"
                checked={showMemberDetails}
                onChange={(e) => setShowMemberDetails(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>Sertakan Rincian Anggota</span>
            </label>
          </div>
        </div>

        {/* Printable Preview Area */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-white text-slate-900 font-serif print:p-0 print:m-0 print:overflow-visible">
          {/* OFFICIAL PGRI KOP SURAT */}
          <div className="border-b-4 border-double border-black pb-3 mb-6 text-center relative">
            {/* Left PGRI Emblem Placeholder */}
            <div className="absolute left-0 top-0 w-16 h-16 rounded-full border-2 border-black flex flex-col items-center justify-center p-1 text-center font-sans font-black text-xs leading-none">
              <span>★</span>
              <span className="text-[10px]">PGRI</span>
              <span>★</span>
            </div>

            <div className="px-16">
              <h2 className="text-base sm:text-lg font-black tracking-wider uppercase font-sans">
                PENGURUS PERSATUAN GURU REPUBLIK INDONESIA (PGRI)
              </h2>
              <h3 className="text-sm sm:text-base font-bold uppercase font-sans tracking-wide">
                PENGURUS {settings.namaCabang.toUpperCase()}
              </h3>
              <p className="text-xs sm:text-sm font-sans">
                {settings.kabupatenKota}, Provinsi {settings.provinsi}
              </p>
              <p className="text-[10px] font-sans text-slate-600 mt-0.5">
                Surat Keputusan / No. Dokumen: {settings.nomorSurat}
              </p>
            </div>
          </div>

          {/* REPORT TITLE */}
          <div className="text-center my-5">
            <h1 className="text-base sm:text-lg font-black uppercase underline decoration-2 underline-offset-4 tracking-wide font-sans">
              LAPORAN KONFIRMASI PENCETAKAN KARTU TANDA ANGGOTA (KTA) PGRI
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-sans mt-1">
              Tanggal Cetak Dokumen: <strong>{currentDateFormatted}</strong> &bull; Semester Ganjil TA 2026/2027
            </p>
            {printMode === 'DETAIL_LEMBAGA' && currentLembaga && (
              <p className="text-xs sm:text-sm font-bold font-sans mt-1 bg-slate-100 inline-block px-3 py-1 rounded">
                Lembaga: {currentLembaga.nama} ({currentLembaga.jenjang}) - Status: {currentLembaga.statusValidasi}
              </p>
            )}
          </div>

          {/* RECAPITULATION TABLE PER LEMBAGA */}
          {printMode === 'REKAP_SEMUA' && (
            <div className="mb-6 font-sans">
              <div className="flex justify-between items-center mb-2 text-xs">
                <span className="font-bold uppercase text-slate-800">
                  I. Tabel Rekapitulasi Usulan Cetak KTA per Lembaga:
                </span>
                <span className="text-slate-600">
                  Total Lembaga: <strong>{filteredLembagas.length}</strong>
                </span>
              </div>

              <table className="w-full border border-black border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-black text-center">
                    <th className="border border-black p-2 w-10">NO</th>
                    <th className="border border-black p-2 w-20">JENJANG</th>
                    <th className="border border-black p-2 text-left">NAMA LEMBAGA / SEKOLAH</th>
                    <th className="border border-black p-2 w-16">TOTAL ANGGOTA</th>
                    <th className="border border-black p-2 w-16">AKAN CETAK</th>
                    <th className="border border-black p-2 w-16">TIDAK CETAK</th>
                    <th className="border border-black p-2 w-28">STATUS VALIDASI</th>
                    <th className="border border-black p-2 text-left">KETERANGAN</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLembagas.map((l, idx) => {
                    const total = l.anggota.length;
                    const cetak = l.anggota.filter((a) => a.statusCetak === 'CETAK').length;
                    const tidakCetak = l.anggota.filter((a) => a.statusCetak === 'TIDAK_CETAK').length;

                    return (
                      <tr key={l.id} className="border-b border-black">
                        <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-black p-1.5 text-center font-semibold">{l.jenjang}</td>
                        <td className="border border-black p-1.5 font-bold text-left">{l.nama}</td>
                        <td className="border border-black p-1.5 text-center">{total}</td>
                        <td className="border border-black p-1.5 text-center font-bold">{cetak}</td>
                        <td className="border border-black p-1.5 text-center">{tidakCetak}</td>
                        <td className="border border-black p-1.5 text-center font-semibold text-[10px]">
                          {l.statusValidasi}
                        </td>
                        <td className="border border-black p-1.5 text-left text-[11px]">
                          {l.catatan || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-200 font-bold border-t-2 border-black">
                    <td colSpan={3} className="border border-black p-2 text-right">
                      TOTAL KESELURUHAN:
                    </td>
                    <td className="border border-black p-2 text-center">{totalAnggota}</td>
                    <td className="border border-black p-2 text-center">{totalCetak}</td>
                    <td className="border border-black p-2 text-center">{totalTidakCetak}</td>
                    <td colSpan={2} className="border border-black p-2 text-center text-[11px]">
                      {filteredLembagas.filter((l) => l.statusValidasi === 'TERVALIDASI').length} Lembaga Tervalidasi
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* DETAIL PER MEMBER (IF REQUESTED OR IN DETAIL MODE) */}
          {(showMemberDetails || printMode === 'DETAIL_LEMBAGA') && (
            <div className="mb-6 font-sans">
              <div className="flex justify-between items-center mb-2 text-xs">
                <span className="font-bold uppercase text-slate-800">
                  {printMode === 'REKAP_SEMUA' ? 'II. Rincian Nominatif Anggota:' : 'Daftar Anggota Lembaga:'}
                </span>
                <span className="text-slate-600">
                  Filter: <strong>{memberFilter}</strong>
                </span>
              </div>

              {(printMode === 'DETAIL_LEMBAGA' ? [currentLembaga] : filteredLembagas).map((l) => {
                const members = l.anggota.filter((a) => {
                  if (memberFilter === 'CETAK') return a.statusCetak === 'CETAK';
                  if (memberFilter === 'TIDAK_CETAK') return a.statusCetak === 'TIDAK_CETAK';
                  if (memberFilter === 'SUDAH_TERCETAK') return a.statusCetak === 'SUDAH_TERCETAK';
                  return true;
                });

                if (members.length === 0) return null;

                return (
                  <div key={l.id} className="mb-4">
                    <div className="bg-slate-100 p-1.5 font-bold text-xs border border-black mb-0.5 flex justify-between">
                      <span>{l.nama} ({l.jenjang})</span>
                      <span>Total: {members.length} Orang</span>
                    </div>

                    <table className="w-full border border-black border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-50 font-bold border-b border-black text-center">
                          <th className="border border-black p-1 w-8">No</th>
                          <th className="border border-black p-1 w-24">NPA</th>
                          <th className="border border-black p-1 text-left">Nama Lengkap</th>
                          <th className="border border-black p-1 w-20">Status</th>
                          <th className="border border-black p-1 w-24">No HP</th>
                          <th className="border border-black p-1 w-28">Konfirmasi</th>
                          <th className="border border-black p-1 text-left">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((m, idx) => (
                          <tr key={m.id} className="border-b border-black">
                            <td className="border border-black p-1 text-center">{idx + 1}</td>
                            <td className="border border-black p-1 text-center font-mono">{m.npa}</td>
                            <td className="border border-black p-1 text-left font-medium">{m.nama}</td>
                            <td className="border border-black p-1 text-center">{m.statusPegawai}</td>
                            <td className="border border-black p-1 text-center">{m.noHp}</td>
                            <td className="border border-black p-1 text-center font-bold">
                              {m.statusCetak === 'CETAK'
                                ? 'CETAK KARTU'
                                : m.statusCetak === 'SUDAH_TERCETAK'
                                ? 'SUDAH TERCETAK'
                                : 'TIDAK CETAK'}
                            </td>
                            <td className="border border-black p-1 text-left">{m.keterangan || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}

          {/* DUAL SIGNATURE VERIFICATION BLOCK */}
          <div className="mt-8 pt-4 font-sans text-xs break-inside-avoid">
            <div className="grid grid-cols-2 gap-8 text-center">
              {/* Kolom TTD 1: Petugas Verifikator / Admin KTA */}
              <div className="flex flex-col items-center justify-between h-36">
                <div>
                  <p>Petugas Verifikator / Admin KTA,</p>
                  <p className="text-[11px] text-slate-600">Tim Pendataan KTA PGRI</p>
                </div>

                <div>
                  <p className="font-bold underline uppercase">{settings.namaVerifikator}</p>
                  <p className="text-[10px] text-slate-600">NIP/NPA Terlampir</p>
                </div>
              </div>

              {/* Kolom TTD 2: Ketua Cabang PGRI */}
              <div className="flex flex-col items-center justify-between h-36">
                <div>
                  <p>{settings.kabupatenKota}, {currentDateFormatted}</p>
                  <p className="font-bold">Ketua PGRI {settings.namaCabang}</p>
                </div>

                <div>
                  <p className="font-bold underline uppercase">{settings.namaKetua}</p>
                  <p className="text-[10px] text-slate-600">NPA. {settings.npaKetua}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
