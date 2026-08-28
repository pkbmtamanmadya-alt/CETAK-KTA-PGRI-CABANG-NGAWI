import React, { useState } from 'react';
import { Lembaga, AnggotaPGRI, StatusCetak, FilterStatusAnggota, AppSettings } from '../types';
import {
  ArrowLeft,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Lock,
  Download,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Building,
  RotateCcw,
  Printer,
} from 'lucide-react';
import { exportLembagaToExcel } from '../utils/excelExport';
import { printOfficialDocDirectly } from '../utils/printDocHelper';

interface KonfirmasiTableViewProps {
  lembaga: Lembaga;
  settings?: AppSettings;
  onBackToLembagaList: () => void;
  onBackToJenjang: () => void;
  onUpdateMemberStatus: (memberId: string, status: StatusCetak) => void;
  onUpdateMemberKeterangan: (memberId: string, keterangan: string) => void;
  onDeleteMember: (memberId: string) => void;
  onOpenAddMember: () => void;
  onOpenEditMember: (member: AnggotaPGRI) => void;
  onBulkSetStatus: (status: StatusCetak) => void;
  onValidateLembaga: (lembagaId: string, catatan?: string) => void;
  onUnlockLembaga: (lembagaId: string) => void;
  validatorName: string;
}

export const KonfirmasiTableView: React.FC<KonfirmasiTableViewProps> = ({
  lembaga,
  settings,
  onBackToLembagaList,
  onBackToJenjang,
  onUpdateMemberStatus,
  onUpdateMemberKeterangan,
  onDeleteMember,
  onOpenAddMember,
  onOpenEditMember,
  onBulkSetStatus,
  onValidateLembaga,
  onUnlockLembaga,
  validatorName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatusAnggota>('SEMUA');
  const [filterPegawai, setFilterPegawai] = useState<string>('SEMUA');
  const [editingKetId, setEditingKetId] = useState<string | null>(null);
  const [editingKetValue, setEditingKetValue] = useState<string>('');
  const [validationCatatan, setValidationCatatan] = useState(lembaga.catatan || '');

  const isLocked = lembaga.statusValidasi === 'TERVALIDASI';

  // Filter members
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

  const handleValidate = () => {
    onValidateLembaga(lembaga.id, validationCatatan);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={onBackToJenjang}
            className="flex items-center gap-1 font-semibold text-slate-500 hover:text-blue-700 transition-colors"
          >
            <span>Pilihan Jenjang</span>
          </button>
          <span className="text-slate-300">/</span>
          <button
            onClick={onBackToLembagaList}
            className="flex items-center gap-1 font-semibold text-slate-500 hover:text-blue-700 transition-colors"
          >
            <span>Jenjang {lembaga.jenjang}</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
            {lembaga.nama}
          </span>
        </div>

        <button
          onClick={onBackToLembagaList}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors shadow-2xs self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Kembali ke Daftar Sekolah</span>
        </button>
      </div>

      {/* School Info Hero Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs">
                Jenjang {lembaga.jenjang}
              </span>
              {isLocked ? (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  DATA TERVALIDASI
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  MENUNGGU VALIDASI
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              {lembaga.nama}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Kecamatan: <strong>{lembaga.kecamatan || '-'}</strong> &bull; Total Anggota Terdaftar:{' '}
              <strong>{lembaga.anggota.length} Orang</strong>
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                🟢 SIAP CETAK
              </span>
              <span className="text-lg font-black text-emerald-800">{countCetak} KTA</span>
            </div>
            <div className="px-4 py-2 bg-rose-50 border border-rose-200 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                🔴 TIDAK CETAK
              </span>
              <span className="text-lg font-black text-rose-800">{countTidakCetak} Orang</span>
            </div>
            {countSudahCetak > 0 && (
              <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                  🔵 SUDAH CETAK
                </span>
                <span className="text-lg font-black text-blue-800">{countSudahCetak} Orang</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Action Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, NPA, nomor HP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="SEMUA">Semua Status Cetak</option>
              <option value="CETAK">🟢 Hanya Siap Cetak</option>
              <option value="TIDAK_CETAK">🔴 Hanya Tidak Cetak</option>
              <option value="SUDAH_TERCETAK">🔵 Hanya Sudah Cetak</option>
            </select>

            <select
              value={filterPegawai}
              onChange={(e) => setFilterPegawai(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="SEMUA">Semua Status Pegawai</option>
              <option value="ASN/PNS">ASN / PNS</option>
              <option value="PPPK">PPPK</option>
              <option value="Non-ASN">Non-ASN</option>
              <option value="Honorer Daerah">Honorer Daerah</option>
              <option value="GTT/PTT">GTT / PTT</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (settings) {
                  printOfficialDocDirectly({
                    settings,
                    lembagas: [lembaga],
                    printMode: 'DETAIL_LEMBAGA',
                    selectedLembagaId: lembaga.id,
                    showMemberDetails: true,
                  });
                } else {
                  window.print();
                }
              }}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Cetak atau unduh dokumen resmi konfirmasi KTA lembaga ini"
            >
              <Printer className="w-3.5 h-3.5 text-blue-700" />
              <span>Cetak PDF Resmi</span>
            </button>

            <button
              onClick={() => exportLembagaToExcel(lembaga)}
              className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel Sekolah</span>
            </button>

            {!isLocked && (
              <>
                <button
                  onClick={() => onBulkSetStatus('CETAK')}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Set Semua Cetak</span>
                </button>

                <button
                  onClick={onOpenAddMember}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Anggota</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-32">NPA PGRI</th>
                <th className="py-3 px-4">Nama Lengkap & Gelar</th>
                <th className="py-3 px-4 w-28">Status</th>
                <th className="py-3 px-4 w-32">No. WhatsApp</th>
                <th className="py-3 px-4 w-72 text-center">Konfirmasi Cetak KTA</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAnggota.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Tidak ada data anggota yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredAnggota.map((member, idx) => (
                  <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 font-semibold">
                      {member.npa}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {member.nama}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs">
                        {member.statusPegawai}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                      {member.noHp && member.noHp !== '-' ? (
                        <a
                          href={`https://wa.me/${member.noHp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span>{member.noHp}</span>
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl gap-1 border border-slate-200/60">
                        {/* Option 1: CETAK */}
                        <button
                          disabled={isLocked}
                          onClick={() => onUpdateMemberStatus(member.id, 'CETAK')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            member.statusCetak === 'CETAK'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 disabled:hover:text-slate-600'
                          }`}
                        >
                          🟢 CETAK
                        </button>

                        {/* Option 2: TIDAK CETAK */}
                        <button
                          disabled={isLocked}
                          onClick={() => onUpdateMemberStatus(member.id, 'TIDAK_CETAK')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            member.statusCetak === 'TIDAK_CETAK'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 disabled:hover:text-slate-600'
                          }`}
                        >
                          🔴 TIDAK
                        </button>

                        {/* Option 3: SUDAH CETAK */}
                        <button
                          disabled={isLocked}
                          onClick={() => onUpdateMemberStatus(member.id, 'SUDAH_TERCETAK')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            member.statusCetak === 'SUDAH_TERCETAK'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 disabled:hover:text-slate-600'
                          }`}
                        >
                          🔵 SUDAH
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {editingKetId === member.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editingKetValue}
                            onChange={(e) => setEditingKetValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveKeterangan(member.id)}
                            className="w-full px-2 py-1 bg-white border border-blue-400 rounded text-xs focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveKeterangan(member.id)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingKetId(null)}
                            className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            if (!isLocked) {
                              setEditingKetId(member.id);
                              setEditingKetValue(member.keterangan || '');
                            }
                          }}
                          className={`truncate max-w-[150px] cursor-pointer py-1 px-1.5 rounded ${
                            !isLocked ? 'hover:bg-slate-100 text-slate-700' : ''
                          }`}
                          title={member.keterangan || 'Klik untuk isi catatan'}
                        >
                          {member.keterangan || <span className="text-slate-300 italic">Tambah catatan...</span>}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {!isLocked ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenEditMember(member)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit data anggota"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus data anggota "${member.nama}"?`)) {
                                onDeleteMember(member.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus data"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation / Lock Box at Bottom */}
      <div
        className={`p-6 rounded-3xl border transition-all ${
          isLocked
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : 'bg-white border-slate-200/80 text-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-base">
                {isLocked ? 'Data Lembaga Ini Telah Tervalidasi & Terkunci' : 'Validasi Data Konfirmasi KTA Lembaga'}
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-xl">
              {isLocked
                ? `Divalidasi oleh ${lembaga.validatorName || validatorName} pada ${lembaga.validatedAt || '-'}. Data telah siap untuk diproses oleh Pengurus Cabang PGRI.`
                : 'Setelah seluruh status cetak anggota dipastikan benar, klik tombol Validasi untuk mengunci data konfirmasi ini.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isLocked ? (
              <button
                onClick={() => onUnlockLembaga(lembaga.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 border border-emerald-300 text-emerald-900 rounded-xl font-bold text-xs shadow-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Buka Kunci untuk Koreksi</span>
              </button>
            ) : (
              <button
                onClick={handleValidate}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-100 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Validasi & Kunci Lembaga</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
