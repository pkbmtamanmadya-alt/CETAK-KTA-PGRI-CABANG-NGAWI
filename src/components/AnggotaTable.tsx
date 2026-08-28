import React, { useState } from 'react';
import { Lembaga, AnggotaPGRI, StatusCetak, FilterStatusAnggota } from '../types';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Lock,
  MessageCircle,
  Download,
  CheckCheck,
} from 'lucide-react';
import { exportLembagaToExcel } from '../utils/excelExport';

interface AnggotaTableProps {
  lembaga: Lembaga;
  onUpdateMemberStatus: (memberId: string, status: StatusCetak) => void;
  onUpdateMemberKeterangan: (memberId: string, keterangan: string) => void;
  onDeleteMember: (memberId: string) => void;
  onOpenAddMember: () => void;
  onOpenEditMember: (member: AnggotaPGRI) => void;
  onBulkSetStatus: (status: StatusCetak) => void;
}

export const AnggotaTable: React.FC<AnggotaTableProps> = ({
  lembaga,
  onUpdateMemberStatus,
  onUpdateMemberKeterangan,
  onDeleteMember,
  onOpenAddMember,
  onOpenEditMember,
  onBulkSetStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatusAnggota>('SEMUA');
  const [filterPegawai, setFilterPegawai] = useState<string>('SEMUA');
  const [editingKetId, setEditingKetId] = useState<string | null>(null);
  const [editingKetValue, setEditingKetValue] = useState<string>('');

  const isLocked = lembaga.statusValidasi === 'TERVALIDASI';

  // Filtering
  const filteredAnggota = lembaga.anggota.filter((a) => {
    const matchesSearch =
      a.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.npa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.noHp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.keterangan && a.keterangan.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterStatus === 'SEMUA' ||
      (filterStatus === 'CETAK' && a.statusCetak === 'CETAK') ||
      (filterStatus === 'TIDAK_CETAK' && a.statusCetak === 'TIDAK_CETAK') ||
      (filterStatus === 'SUDAH_TERCETAK' && a.statusCetak === 'SUDAH_TERCETAK');

    const matchesPegawai =
      filterPegawai === 'SEMUA' || a.statusPegawai.toLowerCase().includes(filterPegawai.toLowerCase());

    return matchesSearch && matchesStatus && matchesPegawai;
  });

  const countCetak = lembaga.anggota.filter((a) => a.statusCetak === 'CETAK').length;
  const countTidakCetak = lembaga.anggota.filter((a) => a.statusCetak === 'TIDAK_CETAK').length;
  const countSudahCetak = lembaga.anggota.filter((a) => a.statusCetak === 'SUDAH_TERCETAK').length;

  const handleSaveKeterangan = (id: string) => {
    onUpdateMemberKeterangan(id, editingKetValue.trim());
    setEditingKetId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Jenjang: {lembaga.jenjang}</span>
            <span>/</span>
            <span className="font-semibold text-blue-600">{lembaga.nama}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Daftar Anggota</h2>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportLembagaToExcel(lembaga)}
            className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium flex items-center gap-1.5 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
            title="Download Excel Khusus Lembaga Ini"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Excel Sekolah</span>
          </button>

          {!isLocked && (
            <>
              <button
                onClick={() => onBulkSetStatus('CETAK')}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Tandai Semua Anggota untuk Dicetak"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Semua Cetak</span>
              </button>

              <button
                onClick={() => onBulkSetStatus('TIDAK_CETAK')}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Tandai Semua Anggota Tidak Dicetak"
              >
                <X className="w-3.5 h-3.5 text-rose-600" />
                <span>Semua Tidak Cetak</span>
              </button>

              <button
                onClick={onOpenAddMember}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Anggota</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Lock Notice if Tervalidasi */}
      {isLocked && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              <strong>Data Telah Dikunci (TERVALIDASI):</strong> Pilihan konfirmasi dan data anggota terkunci untuk menjaga keakuratan cetak. Buka kunci di bagian bawah jika ingin merubah.
            </span>
          </div>
        </div>
      )}

      {/* Filter Bar (Matching Clean Minimalism theme) */}
      <div className="bg-white p-2.5 rounded-t-xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setFilterStatus('SEMUA')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterStatus === 'SEMUA'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Semua ({lembaga.anggota.length})
          </button>

          <button
            onClick={() => setFilterStatus('CETAK')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterStatus === 'CETAK'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-emerald-700'
            }`}
          >
            Cetak ({countCetak})
          </button>

          <button
            onClick={() => setFilterStatus('TIDAK_CETAK')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterStatus === 'TIDAK_CETAK'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-500 hover:text-rose-700'
            }`}
          >
            Tidak Cetak ({countTidakCetak})
          </button>

          {countSudahCetak > 0 && (
            <button
              onClick={() => setFilterStatus('SUDAH_TERCETAK')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                filterStatus === 'SUDAH_TERCETAK'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-blue-700'
              }`}
            >
              Sudah Tercetak ({countSudahCetak})
            </button>
          )}
        </div>

        {/* Search & Status Pegawai Filter */}
        <div className="flex items-center gap-2">
          <select
            value={filterPegawai}
            onChange={(e) => setFilterPegawai(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          >
            <option value="SEMUA">Semua Pegawai</option>
            <option value="ASN/PNS">ASN / PNS</option>
            <option value="PPPK">PPPK</option>
            <option value="Non-ASN">Non-ASN</option>
          </select>

          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari NPA atau Nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Table (Matching Clean Minimalism theme) */}
      <div className="bg-white border-x border-b border-slate-200 rounded-b-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase w-12 text-center">No</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase w-28">NPA</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">Nama Anggota</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase w-28">Status Pegawai</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase w-32">Nomor HP</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase min-w-36">Keterangan</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase text-center min-w-56">Konfirmasi</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase text-center w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm divide-y divide-slate-100">
              {filteredAnggota.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 text-xs italic">
                    Tidak ada data anggota yang sesuai dengan filter atau pencarian.
                  </td>
                </tr>
              ) : (
                filteredAnggota.map((anggota, index) => {
                  const isCetak = anggota.statusCetak === 'CETAK';
                  const isTidakCetak = anggota.statusCetak === 'TIDAK_CETAK';
                  const isSudahTercetak = anggota.statusCetak === 'SUDAH_TERCETAK';

                  return (
                    <tr key={anggota.id} className="hover:bg-blue-50/30 transition-colors">
                      {/* No */}
                      <td className="px-4 py-3 text-center text-slate-500 font-medium">
                        {index + 1}
                      </td>

                      {/* NPA */}
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">
                        {anggota.npa}
                      </td>

                      {/* Nama */}
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {anggota.nama}
                      </td>

                      {/* Status Pegawai */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            anggota.statusPegawai.includes('PNS') || anggota.statusPegawai.includes('ASN')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : anggota.statusPegawai.includes('PPPK')
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {anggota.statusPegawai}
                        </span>
                      </td>

                      {/* Nomor HP */}
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                        {anggota.noHp && anggota.noHp !== '-' ? (
                          <a
                            href={`https://wa.me/${anggota.noHp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
                          >
                            <MessageCircle className="w-3 h-3 text-slate-400" />
                            <span>{anggota.noHp}</span>
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Keterangan */}
                      <td className="px-4 py-3">
                        {editingKetId === anggota.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editingKetValue}
                              onChange={(e) => setEditingKetValue(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveKeterangan(anggota.id)}
                              placeholder="Catatan..."
                              autoFocus
                              className="w-full px-2 py-1 text-xs border border-blue-500 rounded focus:outline-none bg-white"
                            />
                            <button
                              onClick={() => handleSaveKeterangan(anggota.id)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              if (!isLocked) {
                                setEditingKetId(anggota.id);
                                setEditingKetValue(anggota.keterangan || '');
                              }
                            }}
                            className={`text-xs px-2 py-0.5 rounded cursor-pointer transition-colors ${
                              anggota.keterangan
                                ? 'text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/60'
                                : 'text-slate-400 italic hover:text-slate-600'
                            }`}
                            title={isLocked ? 'Terkunci' : 'Klik untuk edit catatan'}
                          >
                            {anggota.keterangan || '+ Catatan'}
                          </div>
                        )}
                      </td>

                      {/* Konfirmasi Buttons */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* 🟢 CETAK KARTU */}
                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={() => onUpdateMemberStatus(anggota.id, 'CETAK')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              isCetak
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border border-slate-200 opacity-60 hover:opacity-100'
                            } ${isLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isCetak ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                            <span>CETAK KARTU</span>
                          </button>

                          {/* 🔴 TIDAK CETAK */}
                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={() => onUpdateMemberStatus(anggota.id, 'TIDAK_CETAK')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              isTidakCetak
                                ? 'bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border border-slate-200 opacity-60 hover:opacity-100'
                            } ${isLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isTidakCetak ? 'bg-rose-500' : 'bg-slate-300'}`}></span>
                            <span>TIDAK CETAK</span>
                          </button>

                          {/* 🔵 SUDAH TERCETAK */}
                          {isSudahTercetak && (
                            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              <span>SUDAH CETAK</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            disabled={isLocked}
                            onClick={() => onOpenEditMember(anggota)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-30"
                            title="Edit Data Anggota"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={isLocked}
                            onClick={() => {
                              if (window.confirm(`Hapus anggota ${anggota.nama}?`)) {
                                onDeleteMember(anggota.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors disabled:opacity-30"
                            title="Hapus Anggota"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
