import React, { useState, useEffect } from 'react';
import {
  Lembaga,
  AppSettings,
  Jenjang,
  AdminSubTab,
} from '../types';
import {
  Settings,
  BarChart3,
  FileText,
  FileSpreadsheet,
  LogOut,
  ArrowLeft,
  Save,
  RotateCcw,
  Printer,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Search,
  Check,
  Info,
  ChevronRight,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  exportRekapToExcel,
  exportAllMembersToExcel,
  downloadTemplateExcel,
} from '../utils/excelExport';
import { printOfficialDocDirectly } from '../utils/printDocHelper';

import { PgriLogo } from './PgriLogo';

interface AdminDashboardViewProps {
  lembagas: Lembaga[];
  settings: AppSettings;
  initialTab?: AdminSubTab;
  onSaveSettings: (newSettings: AppSettings) => void;
  onResetData: (resetSettings?: boolean) => void;
  onImportNewMembers: (newLembagas: Lembaga[]) => void;
  onImportPrintedMembers: (count: number, updatedLembagas: Lembaga[]) => void;
  onNavigateToLembaga: (lembagaId: string, jenjang: Jenjang) => void;
  onLogout: () => void;
  onBackToHome: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  lembagas,
  settings,
  initialTab,
  onSaveSettings,
  onResetData,
  onImportNewMembers,
  onImportPrintedMembers,
  onNavigateToLembaga,
  onLogout,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<AdminSubTab>(initialTab || 'REKAPITULASI');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Reset Modal & Status State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetAlsoSettings, setResetAlsoSettings] = useState(false);
  const [resetSuccessToast, setResetSuccessToast] = useState(false);

  // 1. Settings State
  const [settingsForm, setSettingsForm] = useState<AppSettings>(settings);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // 2. Rekapitulasi Filter State
  const [rekapJenjangFilter, setRekapJenjangFilter] = useState<string>('SEMUA');
  const [rekapSearchTerm, setRekapSearchTerm] = useState<string>('');

  // 3. Export PDF State
  const [pdfPrintMode, setPdfPrintMode] = useState<'REKAP_SEMUA' | 'DETAIL_LEMBAGA'>('REKAP_SEMUA');
  const [pdfSelectedJenjang, setPdfSelectedJenjang] = useState<string>('SEMUA');
  const [pdfSelectedLembagaId, setPdfSelectedLembagaId] = useState<string>(lembagas[0]?.id || '');
  const [pdfIncludeMembers, setPdfIncludeMembers] = useState<boolean>(true);

  // 4. Excel Import/Export State
  const [excelSubTab, setExcelSubTab] = useState<'IMPORT_PRINTED' | 'IMPORT_NEW' | 'EXPORT'>('IMPORT_PRINTED');
  const [excelFileData, setExcelFileData] = useState<any[] | null>(null);
  const [excelStatus, setExcelStatus] = useState<{ success?: string; error?: string } | null>(null);

  // General Metrics
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
  const totalSudahCetak = lembagas.reduce(
    (acc, l) => acc + l.anggota.filter((a) => a.statusCetak === 'SUDAH_TERCETAK').length,
    0
  );
  const totalTervalidasi = lembagas.filter((l) => l.statusValidasi === 'TERVALIDASI').length;

  // Handle Settings Save
  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(settingsForm);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  // Filtered Rekapitulasi Data
  const filteredRekapLembagas = lembagas.filter((l) => {
    const matchJenjang = rekapJenjangFilter === 'SEMUA' || l.jenjang === rekapJenjangFilter;
    const matchSearch =
      l.nama.toLowerCase().includes(rekapSearchTerm.toLowerCase()) ||
      (l.kecamatan && l.kecamatan.toLowerCase().includes(rekapSearchTerm.toLowerCase()));
    return matchJenjang && matchSearch;
  });

  // Handle Excel File Reading
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelStatus(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rawJson || rawJson.length === 0) {
          setExcelStatus({ error: 'File Excel kosong atau format tidak terbaca.' });
          setExcelFileData(null);
        } else {
          setExcelFileData(rawJson);
          setExcelStatus({ success: `Berhasil membaca ${rawJson.length} baris data dari file "${file.name}".` });
        }
      } catch (err: any) {
        setExcelStatus({ error: `Gagal membaca file: ${err.message || 'Format tidak valid'}` });
        setExcelFileData(null);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Execute Excel Import: Anggota Baru
  const handleExecuteImportNew = () => {
    if (!excelFileData || excelFileData.length === 0) return;

    try {
      const cloned = JSON.parse(JSON.stringify(lembagas)) as Lembaga[];
      let count = 0;

      excelFileData.forEach((row, idx) => {
        const rawJenjang = (row['Jenjang'] || row['JENJANG'] || 'SD').trim();
        const validJenjang: Jenjang = ['PAUD', 'TK', 'SD', 'SMP/MTs', 'SMA/SMK'].includes(rawJenjang)
          ? (rawJenjang as Jenjang)
          : 'SD';
        const rawLembagaName = (row['Nama Lembaga'] || row['Nama Sekolah'] || row['LEMBAGA'] || 'Lembaga Umum').trim();
        const rawNpa = String(row['NPA'] || row['NPA PGRI'] || row['No Anggota'] || `131405${Date.now().toString().slice(-4)}${idx}`).trim();
        const rawNama = (row['Nama Lengkap'] || row['Nama'] || row['Nama Anggota'] || `Anggota ${idx + 1}`).trim();
        const rawStatusPegawai = (row['Status Pegawai'] || row['Status'] || 'ASN/PNS').trim();
        const rawNoHp = String(row['Nomor HP'] || row['No HP'] || row['WhatsApp'] || '-').trim();
        const rawStatusCetak = (row['Status Cetak'] || row['Konfirmasi'] || 'CETAK').toUpperCase();
        const rawKet = (row['Keterangan'] || row['Catatan'] || '').trim();

        let statusCetak: any = 'CETAK';
        if (rawStatusCetak.includes('TIDAK')) statusCetak = 'TIDAK_CETAK';
        else if (rawStatusCetak.includes('SUDAH')) statusCetak = 'SUDAH_TERCETAK';

        let targetLembaga = cloned.find((l) => l.nama.toLowerCase() === rawLembagaName.toLowerCase());
        if (!targetLembaga) {
          targetLembaga = {
            id: `lembaga-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            jenjang: validJenjang,
            nama: rawLembagaName,
            statusValidasi: 'BELUM_VALIDASI',
            anggota: [],
          };
          cloned.push(targetLembaga);
        }

        targetLembaga.anggota.push({
          id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          npa: rawNpa,
          nama: rawNama,
          statusPegawai: rawStatusPegawai,
          noHp: rawNoHp,
          statusCetak,
          keterangan: rawKet || undefined,
          updatedAt: new Date().toISOString(),
        });
        count++;
      });

      onImportNewMembers(cloned);
      setExcelStatus({ success: `Sukses mengimpor ${count} data anggota ke sistem!` });
      setExcelFileData(null);
    } catch (err: any) {
      setExcelStatus({ error: `Gagal memproses data: ${err.message}` });
    }
  };

  // Execute Excel Import: Sudah Tercetak
  const handleExecuteImportPrinted = () => {
    if (!excelFileData || excelFileData.length === 0) return;

    try {
      const cloned = JSON.parse(JSON.stringify(lembagas)) as Lembaga[];
      let matchedCount = 0;

      const printedKeys = excelFileData.map((row) => {
        const npa = String(row['NPA'] || row['NPA PGRI'] || row['NPA_PGRI'] || '').trim().toLowerCase();
        const nama = String(row['Nama Lengkap'] || row['Nama'] || row['Nama Anggota'] || '').trim().toLowerCase();
        const ket = String(row['Keterangan'] || row['Catatan'] || 'Sudah dicetak sebelumnya').trim();
        return { npa, nama, ket };
      });

      cloned.forEach((lembaga) => {
        lembaga.anggota.forEach((member) => {
          const mNpa = member.npa.trim().toLowerCase();
          const mNama = member.nama.trim().toLowerCase();
          const match = printedKeys.find(
            (pk) => (pk.npa && pk.npa === mNpa) || (pk.nama && mNama.includes(pk.nama))
          );
          if (match) {
            member.statusCetak = 'SUDAH_TERCETAK';
            member.keterangan = match.ket || member.keterangan || 'Sudah dicetak sebelumnya';
            matchedCount++;
          }
        });
      });

      if (matchedCount === 0) {
        setExcelStatus({
          error: 'Tidak ditemukan kecocokan data anggota berdasarkan NPA atau Nama pada file yang diunggah.',
        });
      } else {
        onImportPrintedMembers(matchedCount, cloned);
        setExcelStatus({
          success: `Berhasil mencocokkan dan memperbarui status ${matchedCount} anggota menjadi "SUDAH TERCETAK"!`,
        });
        setExcelFileData(null);
      }
    } catch (err: any) {
      setExcelStatus({ error: `Gagal memperbarui status: ${err.message}` });
    }
  };

  // Execute Reset Data
  const handleConfirmReset = () => {
    onResetData(resetAlsoSettings);
    setIsResetModalOpen(false);
    setResetSuccessToast(true);
    setTimeout(() => setResetSuccessToast(false), 4000);
  };

  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
  }).format(new Date());

  const currentPdfLembaga = lembagas.find((l) => l.id === pdfSelectedLembagaId) || lembagas[0];
  const pdfFilteredLembagas = lembagas.filter((l) => {
    if (pdfSelectedJenjang === 'SEMUA') return true;
    return l.jenjang === pdfSelectedJenjang;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Reset Success Toast */}
      {resetSuccessToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-900 shadow-sm animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Berhasil Mengosongkan Data</p>
              <p className="text-emerald-700">Seluruh data lembaga dan anggota telah dibersihkan. Sistem siap menerima unggahan data real.</p>
            </div>
          </div>
          <button
            onClick={() => setResetSuccessToast(false)}
            className="text-emerald-600 hover:text-emerald-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Top Header Card */}
      <div className="bg-gradient-to-r from-[#4e92a2] to-[#3f7e8c] text-white rounded-2xl p-5 shadow-sm border border-[#3f7e8c] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <PgriLogo className="w-12 h-12 shadow-sm" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Menu & Dashboard Admin Cabang
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 text-[10px] font-bold">
                Terautentikasi (admin)
              </span>
            </div>
            <p className="text-xs text-teal-100 mt-1">
              Pengurus PGRI {settings.namaCabang}, {settings.kabupatenKota}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs"
            title="Kosongkan seluruh data lembaga dan anggota"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset / Kosongkan Data</span>
          </button>
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs transition-colors border border-white/30"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            <span>Ke Beranda Publik</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-xs transition-colors shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Admin</span>
          </button>
        </div>
      </div>

      {/* 4 Admin Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex space-x-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('REKAPITULASI')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'REKAPITULASI'
              ? 'bg-[#4e92a2] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>1. Rekapitulasi Cabang</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'REKAPITULASI' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {totalLembaga}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('EXPORT_PDF')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'EXPORT_PDF'
              ? 'bg-[#4e92a2] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>2. Export ke PDF / Cetak Resmi</span>
        </button>

        <button
          onClick={() => setActiveTab('IMPORT_EXCEL')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'IMPORT_EXCEL'
              ? 'bg-[#4e92a2] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>3. Impor & Ekspor Data Excel</span>
        </button>

        <button
          onClick={() => setActiveTab('PENGATURAN')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'PENGATURAN'
              ? 'bg-[#4e92a2] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>4. Pengaturan Kop & Pejabat</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REKAPITULASI CABANG */}
      {/* ========================================================================= */}
      {activeTab === 'REKAPITULASI' && (
        <div className="space-y-6">
          {/* Summary Stat Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 block">Total Lembaga</span>
              <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{totalLembaga}</span>
              <span className="text-[11px] text-slate-500">Unit Sekolah</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 block">Total Anggota</span>
              <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{totalAnggota}</span>
              <span className="text-[11px] text-slate-500">Guru & Tenaga Kependidikan</span>
            </div>
            <div className="bg-emerald-50/70 p-5 rounded-3xl border border-emerald-200 shadow-xs">
              <span className="text-xs font-semibold text-emerald-800 block">🟢 Siap Dicetak</span>
              <span className="text-2xl font-extrabold text-emerald-900 mt-1 block">{totalCetak}</span>
              <span className="text-[11px] text-emerald-700">Usulan Cetak KTA Fisik</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 block">Status Validasi</span>
              <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{totalTervalidasi} / {totalLembaga}</span>
              <span className="text-[11px] text-slate-500">{totalLembaga > 0 ? Math.round((totalTervalidasi / totalLembaga) * 100) : 0}% Lembaga Selesai</span>
            </div>
          </div>

          {/* Table of Rekapitulasi */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-800">
                  Tabel Rekapitulasi Data Usulan KTA per Lembaga
                </h3>
                <p className="text-xs text-slate-400">
                  Klik tombol &quot;Buka&quot; untuk langsung menuju ke halaman konfirmasi lembaga terkait.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari lembaga..."
                    value={rekapSearchTerm}
                    onChange={(e) => setRekapSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={rekapJenjangFilter}
                  onChange={(e) => setRekapJenjangFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="SEMUA">Semua Jenjang</option>
                  <option value="PAUD">PAUD</option>
                  <option value="TK">TK</option>
                  <option value="SD">SD</option>
                  <option value="SMP/MTs">SMP/MTs</option>
                  <option value="SMA/SMK">SMA/SMK</option>
                </select>

                <button
                  onClick={() => exportRekapToExcel(lembagas, settings)}
                  className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Excel</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4 text-center w-10">No</th>
                    <th className="py-3 px-4 w-20 text-center">Jenjang</th>
                    <th className="py-3 px-4">Nama Lembaga / Sekolah</th>
                    <th className="py-3 px-4 text-center">Total Anggota</th>
                    <th className="py-3 px-4 text-center">Akan Cetak</th>
                    <th className="py-3 px-4 text-center">Tidak Cetak</th>
                    <th className="py-3 px-4 text-center">Sudah Tercetak</th>
                    <th className="py-3 px-4 text-center">Status Validasi</th>
                    <th className="py-3 px-4 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRekapLembagas.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <FileSpreadsheet className="w-8 h-8 text-slate-300" />
                          <p className="font-semibold text-slate-700">Belum ada data lembaga terdaftar</p>
                          <p className="text-xs text-slate-400">Data dummy telah dibersihkan. Silakan unggah data Excel real Anda.</p>
                          <button
                            onClick={() => setActiveTab('IMPORT_EXPORT_EXCEL')}
                            className="mt-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Buka Menu Impor Excel</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRekapLembagas.map((l, idx) => {
                      const total = l.anggota.length;
                      const cetak = l.anggota.filter((a) => a.statusCetak === 'CETAK').length;
                      const tidakCetak = l.anggota.filter((a) => a.statusCetak === 'TIDAK_CETAK').length;
                      const sudahCetak = l.anggota.filter((a) => a.statusCetak === 'SUDAH_TERCETAK').length;
                      const isTervalidasi = l.statusValidasi === 'TERVALIDASI';

                      return (
                        <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-600">
                            <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px]">
                              {l.jenjang}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800">{l.nama}</td>
                          <td className="py-3 px-4 text-center font-semibold">{total}</td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-700 bg-emerald-50/50">
                            {cetak}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-rose-700">
                            {tidakCetak}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-blue-700">
                            {sudahCetak}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isTervalidasi ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                VALID
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                BELUM
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => onNavigateToLembaga(l.id, l.jenjang)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold rounded-lg text-xs transition-colors"
                            >
                              <span>Buka</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
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
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EXPORT KE PDF / CETAK RESMI */}
      {/* ========================================================================= */}
      {activeTab === 'EXPORT_PDF' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-800">
                  Ekspor ke PDF & Format Dokumen Resmi PGRI
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                  Format Standar A4
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dokumen dilengkapi Kop Surat Resmi PGRI, Tabel Nominatif Usulan Cetak, Kolom Tanda Tangan Anggota, dan Dua Kolom Pengesahan Tanda Tangan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  printOfficialDocDirectly({
                    settings,
                    lembagas,
                    printMode: pdfPrintMode,
                    selectedJenjang: pdfSelectedJenjang,
                    selectedLembagaId: pdfSelectedLembagaId,
                    showMemberDetails: pdfIncludeMembers,
                  });
                }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-100 transition-all hover:scale-[1.01] active:scale-[0.99]"
                title="Cetak atau simpan ke PDF dokumen resmi PGRI"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF Sekarang</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                title="Cetak langsung halaman pratinjau"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Cetak Pratinjau</span>
              </button>
            </div>
          </div>

          {/* Options Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilihan Format Dokumen:</label>
              <select
                value={pdfPrintMode}
                onChange={(e) => setPdfPrintMode(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="REKAP_SEMUA">Rekapitulasi Seluruh Lembaga</option>
                <option value="DETAIL_LEMBAGA">Laporan Khusus Per Lembaga</option>
              </select>
            </div>

            {pdfPrintMode === 'REKAP_SEMUA' ? (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Filter Jenjang:</label>
                <select
                  value={pdfSelectedJenjang}
                  onChange={(e) => setPdfSelectedJenjang(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
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
                  value={pdfSelectedLembagaId}
                  onChange={(e) => setPdfSelectedLembagaId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  {lembagas.map((l) => (
                    <option key={l.id} value={l.id}>
                      [{l.jenjang}] {l.nama}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-end">
              <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer pb-1.5">
                <input
                  type="checkbox"
                  checked={pdfIncludeMembers}
                  onChange={(e) => setPdfIncludeMembers(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Sertakan Rincian Daftar Anggota</span>
              </label>
            </div>
          </div>

          {/* Printable Document Preview Area */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm font-serif text-slate-900 overflow-x-auto">
            {/* OFFICIAL PGRI KOP SURAT */}
            <div className="border-b-4 border-double border-black pb-3 mb-6 text-center relative font-sans">
              <div className="px-10">
                <h2 className="text-base sm:text-lg font-black tracking-wider uppercase">
                  PENGURUS PERSATUAN GURU REPUBLIK INDONESIA (PGRI)
                </h2>
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide">
                  PENGURUS {settings.namaCabang.toUpperCase()}
                </h3>
                <p className="text-xs sm:text-sm">
                  {settings.kabupatenKota}, Provinsi {settings.provinsi}
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Surat Keputusan / No. Dokumen: {settings.nomorSurat}
                </p>
              </div>
            </div>

            {/* Title */}
            <div className="text-center my-5 font-sans">
              <h1 className="text-base sm:text-lg font-black uppercase underline decoration-2 underline-offset-4 tracking-wide">
                LAPORAN KONFIRMASI PENCETAKAN KARTU TANDA ANGGOTA (KTA) PGRI
              </h1>
              <p className="text-xs sm:text-sm text-slate-700 mt-1">
                Tanggal Cetak Dokumen: <strong>{currentDateFormatted}</strong> &bull; Semester Ganjil TA 2026/2027
              </p>
              {pdfPrintMode === 'DETAIL_LEMBAGA' && currentPdfLembaga && (
                <p className="text-xs sm:text-sm font-bold mt-1 bg-slate-100 inline-block px-3 py-1 rounded">
                  Lembaga: {currentPdfLembaga.nama} ({currentPdfLembaga.jenjang}) - Status: {currentPdfLembaga.statusValidasi}
                </p>
              )}
            </div>

            {/* Table in Print */}
            {pdfPrintMode === 'REKAP_SEMUA' && (
              <div className="mb-6 font-sans">
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
                    </tr>
                  </thead>
                  <tbody>
                    {pdfFilteredLembagas.map((l, idx) => {
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
                      <td className="border border-black p-2 text-center text-[11px]">
                        {totalTervalidasi} Lembaga Tervalidasi
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Nominatif Rincian Anggota */}
            {(pdfIncludeMembers || pdfPrintMode === 'DETAIL_LEMBAGA') && (
              <div className="mb-6 font-sans">
                {(pdfPrintMode === 'DETAIL_LEMBAGA' ? [currentPdfLembaga] : pdfFilteredLembagas).map((l) => (
                  <div key={l.id} className="mb-4">
                    <div className="bg-slate-100 p-1.5 font-bold text-xs border border-black mb-0.5 flex justify-between">
                      <span>{l.nama} ({l.jenjang})</span>
                      <span>Total: {l.anggota.length} Orang</span>
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
                        </tr>
                      </thead>
                      <tbody>
                        {l.anggota.map((m, idx) => (
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

            {/* DUAL SIGNATURE VERIFICATION */}
            <div className="mt-8 pt-4 font-sans text-xs break-inside-avoid">
              <div className="grid grid-cols-2 gap-8 text-center">
                <div className="flex flex-col items-center justify-between h-32">
                  <div>
                    <p>Petugas Verifikator / Admin KTA,</p>
                    <p className="text-[11px] text-slate-600">Tim Pendataan KTA PGRI</p>
                  </div>
                  <div>
                    <p className="font-bold underline uppercase">{settings.namaVerifikator}</p>
                    <p className="text-[10px] text-slate-600">NIP/NPA Terlampir</p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between h-32">
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
      )}

      {/* ========================================================================= */}
      {/* TAB 3: IMPOR & EKSPOR DATA EXCEL */}
      {/* ========================================================================= */}
      {activeTab === 'IMPORT_EXCEL' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-base text-slate-800 mb-1">
              Pusat Manajemen & Integrasi Spreadsheet Excel
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Impor data anggota gelombang baru, perbarui status kartu yang sudah dicetak, atau unduh arsip data.
            </p>

            <div className="flex space-x-2 border-b border-slate-100 pb-3 text-xs font-semibold">
              <button
                onClick={() => {
                  setExcelSubTab('IMPORT_PRINTED');
                  setExcelFileData(null);
                  setExcelStatus(null);
                }}
                className={`px-4 py-2 rounded-xl transition-all ${
                  excelSubTab === 'IMPORT_PRINTED'
                    ? 'bg-blue-700 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                1. Impor Kartu Sudah Dicetak
              </button>

              <button
                onClick={() => {
                  setExcelSubTab('IMPORT_NEW');
                  setExcelFileData(null);
                  setExcelStatus(null);
                }}
                className={`px-4 py-2 rounded-xl transition-all ${
                  excelSubTab === 'IMPORT_NEW'
                    ? 'bg-blue-700 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                2. Impor Anggota Baru
              </button>

              <button
                onClick={() => {
                  setExcelSubTab('EXPORT');
                  setExcelFileData(null);
                  setExcelStatus(null);
                }}
                className={`px-4 py-2 rounded-xl transition-all ${
                  excelSubTab === 'EXPORT'
                    ? 'bg-blue-700 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                3. Ekspor Data (.xlsx)
              </button>
            </div>
          </div>

          {/* Feedback status */}
          {excelStatus && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-2.5 ${
                excelStatus.success
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              {excelStatus.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <p className="font-bold">{excelStatus.success ? 'Berhasil' : 'Pemberitahuan'}</p>
                <p className="mt-0.5">{excelStatus.success || excelStatus.error}</p>
              </div>
            </div>
          )}

          {/* Sub Tab: Impor Sudah Tercetak */}
          {excelSubTab === 'IMPORT_PRINTED' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5">
                <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Pembaruan Anggota Yang Telah Tercetak</p>
                  <p className="mt-0.5 text-blue-800">
                    Unggah daftar anggota yang kartunya sudah selesai dicetak pada gelombang sebelumnya (berdasarkan <strong>NPA PGRI</strong> atau <strong>Nama Anggota</strong>). Sistem akan secara otomatis memperbarui status menjadi <span className="font-bold text-blue-800">SUDAH TERCETAK</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Format Kolom: [NPA PGRI], [Nama Anggota], [Keterangan]
                </span>
                <button
                  onClick={() => downloadTemplateExcel('anggota_sudah_cetak')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                >
                  <Download className="w-3 h-3" />
                  <span>Unduh Contoh Format Excel</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="font-bold text-slate-800 text-sm">
                  Pilih File Excel / CSV Daftar Anggota Sudah Tercetak
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Mendukung format .xlsx, .xls, .csv</p>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="mt-3 text-xs block mx-auto file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-800 cursor-pointer"
                />
              </div>

              {excelFileData && excelFileData.length > 0 && (
                <button
                  onClick={handleExecuteImportPrinted}
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Terapkan Pembaruan Status Sudah Tercetak</span>
                </button>
              )}
            </div>
          )}

          {/* Sub Tab: Impor Anggota Baru */}
          {excelSubTab === 'IMPORT_NEW' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5">
                <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Impor Data Anggota Baru dari Excel</p>
                  <p className="mt-0.5 text-blue-800">
                    Tambahkan data anggota sekaligus beserta jenjang dan nama lembaganya.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Kolom: Jenjang, Nama Lembaga, NPA, Nama Lengkap, Status Pegawai, Nomor HP, Status Cetak
                </span>
                <div className="flex items-center gap-3">
                  {totalLembaga > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsResetModalOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Kosongkan Data Dulu ({totalLembaga} Lembaga)</span>
                    </button>
                  )}
                  <button
                    onClick={() => downloadTemplateExcel('anggota_baru')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                  >
                    <Download className="w-3 h-3" />
                    <span>Unduh Template Anggota Baru</span>
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="font-bold text-slate-800 text-sm">Pilih File Excel Anggota Baru</p>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="mt-3 text-xs block mx-auto file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-800 cursor-pointer"
                />
              </div>

              {excelFileData && excelFileData.length > 0 && (
                <button
                  onClick={handleExecuteImportNew}
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Tambahkan {excelFileData.length} Anggota ke Database</span>
                </button>
              )}
            </div>
          )}

          {/* Sub Tab: Ekspor Excel */}
          {excelSubTab === 'EXPORT' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">1. Rekap Seluruh Lembaga</h4>
                  <p className="text-xs text-slate-400 mb-4">
                    Ringkasan jumlah anggota, kuota cetak, status validasi per lembaga.
                  </p>
                </div>
                <button
                  onClick={() => exportRekapToExcel(lembagas, settings)}
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Rekap (.xlsx)</span>
                </button>
              </div>

              <div className="bg-emerald-50/70 p-5 rounded-3xl border border-emerald-200 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm mb-1">2. Data Siap Cetak (Vendor)</h4>
                  <p className="text-xs text-emerald-800/80 mb-4">
                    Khusus anggota berstatus 🟢 CETAK KARTU (NPA, nama lengkap, unit kerja).
                  </p>
                </div>
                <button
                  onClick={() => exportAllMembersToExcel(lembagas, settings, true)}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Siap Cetak (.xlsx)</span>
                </button>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">3. Master Semua Anggota</h4>
                  <p className="text-xs text-slate-400 mb-4">
                    Database lengkap seluruh anggota dengan status konfirmasi dan nomor WhatsApp.
                  </p>
                </div>
                <button
                  onClick={() => exportAllMembersToExcel(lembagas, settings, false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Master (.xlsx)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PENGATURAN KOP & PEJABAT */}
      {/* ========================================================================= */}
      {activeTab === 'PENGATURAN' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-lg text-slate-800">
              Pengaturan Kop Surat & Pejabat Pengesah Cabang
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Informasi ini digunakan secara otomatis pada Kop Surat Dokumen Resmi dan Lembar Pengesahan Tanda Tangan.
            </p>
          </div>

          {settingsSavedMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pengaturan berhasil disimpan ke penyimpanan sistem!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettingsSubmit} className="space-y-6 text-xs sm:text-sm">
            {/* Bagian Cabang */}
            <div className="space-y-3">
              <p className="font-bold text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
                Informasi Pengurus Cabang
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nama Cabang PGRI</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.namaCabang}
                    onChange={(e) => setSettingsForm({ ...settingsForm, namaCabang: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kabupaten / Kota</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.kabupatenKota}
                    onChange={(e) => setSettingsForm({ ...settingsForm, kabupatenKota: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nomor Dokumen / Surat</label>
                <input
                  type="text"
                  value={settingsForm.nomorSurat}
                  onChange={(e) => setSettingsForm({ ...settingsForm, nomorSurat: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            {/* Bagian Pejabat TTD */}
            <div className="space-y-3 pt-2">
              <p className="font-bold text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
                Pejabat Tanda Tangan & Verifikator
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nama Ketua Cabang</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.namaKetua}
                    onChange={(e) => setSettingsForm({ ...settingsForm, namaKetua: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NPA Ketua Cabang</label>
                  <input
                    type="text"
                    value={settingsForm.npaKetua}
                    onChange={(e) => setSettingsForm({ ...settingsForm, npaKetua: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Petugas Verifikator / Admin KTA
                </label>
                <input
                  type="text"
                  value={settingsForm.namaVerifikator}
                  onChange={(e) => setSettingsForm({ ...settingsForm, namaVerifikator: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-100 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Pengaturan</span>
              </button>
            </div>
          </form>

          {/* Danger Zone: Reset Data */}
          <div className="mt-8 pt-6 border-t-2 border-rose-100">
            <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Zona Bahaya: Reset & Kosongkan Seluruh Data</span>
                </div>
                <p className="text-xs text-rose-700 max-w-xl">
                  Gunakan tombol ini untuk menghapus seluruh data lembaga dan anggota KTA yang tersimpan. Fitur ini berguna saat Anda ingin membersihkan database sebelum mengunggah file Excel data real.
                </p>
                <div className="flex items-center gap-3 text-[11px] font-semibold text-rose-800 pt-1">
                  <span>Status saat ini: <strong>{totalLembaga}</strong> lembaga, <strong>{totalAnggota}</strong> anggota</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span>Kosongkan Seluruh Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL KONFIRMASI RESET / KOSONGKAN DATA */}
      {/* ========================================================================= */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Kosongkan Seluruh Data?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tindakan ini akan menghapus seluruh data lembaga dan anggota KTA dari memori sistem.
                </p>
              </div>
            </div>

            {/* Info Rincian Data */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <p className="font-bold text-slate-700">Data yang akan dibersihkan:</p>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div className="p-2 bg-white rounded-xl border border-slate-200 text-center">
                  <span className="block text-[10px] text-slate-400">Total Lembaga</span>
                  <span className="text-base font-extrabold text-slate-800">{totalLembaga}</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200 text-center">
                  <span className="block text-[10px] text-slate-400">Total Anggota</span>
                  <span className="text-base font-extrabold text-slate-800">{totalAnggota}</span>
                </div>
              </div>
            </div>

            {/* Option Checkbox: Reset Kop */}
            <label className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-colors text-xs text-slate-700">
              <input
                type="checkbox"
                checked={resetAlsoSettings}
                onChange={(e) => setResetAlsoSettings(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Reset juga pengaturan nama cabang & pejabat ke nilai awal</span>
            </label>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-rose-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Kosongkan Semua Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
