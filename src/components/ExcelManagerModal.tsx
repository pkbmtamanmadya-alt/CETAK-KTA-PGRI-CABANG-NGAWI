import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Lembaga, AppSettings, Jenjang, StatusCetak } from '../types';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Info,
  Check
} from 'lucide-react';
import {
  exportRekapToExcel,
  exportAllMembersToExcel,
  downloadTemplateExcel
} from '../utils/excelExport';

interface ExcelManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lembagas: Lembaga[];
  settings: AppSettings;
  onImportNewMembers: (newLembagas: Lembaga[]) => void;
  onImportPrintedMembers: (matchedCount: number, updatedLembagas: Lembaga[]) => void;
}

export const ExcelManagerModal: React.FC<ExcelManagerModalProps> = ({
  isOpen,
  onClose,
  lembagas,
  settings,
  onImportNewMembers,
  onImportPrintedMembers,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'EXPORT' | 'IMPORT_NEW' | 'IMPORT_PRINTED'>('EXPORT');
  const [fileData, setFileData] = useState<any[] | null>(null);
  const [_fileName, setFileName] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{ success?: string; error?: string } | null>(null);
  const [_isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, _type: 'new' | 'printed') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportStatus(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rawJson || rawJson.length === 0) {
          setImportStatus({ error: 'File Excel kosong atau format tidak terbaca.' });
          setFileData(null);
        } else {
          setFileData(rawJson);
          setImportStatus({ success: `Berhasil membaca ${rawJson.length} baris data dari file "${file.name}".` });
        }
      } catch (err: any) {
        setImportStatus({ error: `Gagal membaca file: ${err.message || 'Format tidak valid'}` });
        setFileData(null);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Process Import Data Anggota Baru
  const handleExecuteImportNew = () => {
    if (!fileData || fileData.length === 0) return;

    try {
      const clonedLembagas = JSON.parse(JSON.stringify(lembagas)) as Lembaga[];
      let addedMembersCount = 0;

      fileData.forEach((row, idx) => {
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

        let statusCetak: StatusCetak = 'CETAK';
        if (rawStatusCetak.includes('TIDAK')) statusCetak = 'TIDAK_CETAK';
        else if (rawStatusCetak.includes('SUDAH')) statusCetak = 'SUDAH_TERCETAK';

        let targetLembaga = clonedLembagas.find(
          (l) => l.nama.toLowerCase() === rawLembagaName.toLowerCase()
        );

        if (!targetLembaga) {
          targetLembaga = {
            id: `lembaga-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            jenjang: validJenjang,
            nama: rawLembagaName,
            statusValidasi: 'BELUM_VALIDASI',
            anggota: [],
          };
          clonedLembagas.push(targetLembaga);
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

        addedMembersCount++;
      });

      onImportNewMembers(clonedLembagas);
      setImportStatus({
        success: `Sukses mengimpor ${addedMembersCount} data anggota ke sistem!`,
      });
      setFileData(null);
    } catch (err: any) {
      setImportStatus({ error: `Gagal memproses data: ${err.message}` });
    }
  };

  // Process Import Kartu yang Sudah Tercetak
  const handleExecuteImportPrinted = () => {
    if (!fileData || fileData.length === 0) return;

    try {
      const clonedLembagas = JSON.parse(JSON.stringify(lembagas)) as Lembaga[];
      let matchedCount = 0;

      const printedKeys = fileData.map((row) => {
        const npa = String(row['NPA'] || row['NPA PGRI'] || row['NPA_PGRI'] || '').trim().toLowerCase();
        const nama = String(row['Nama Lengkap'] || row['Nama'] || row['Nama Anggota'] || '').trim().toLowerCase();
        const ket = String(row['Keterangan'] || row['Catatan'] || 'Sudah dicetak sebelumnya').trim();
        return { npa, nama, ket };
      });

      clonedLembagas.forEach((lembaga) => {
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
        setImportStatus({
          error: 'Tidak ditemukan kecocokan data anggota berdasarkan NPA atau Nama pada file yang diunggah.',
        });
      } else {
        onImportPrintedMembers(matchedCount, clonedLembagas);
        setImportStatus({
          success: `Berhasil mencocokkan dan memperbarui status ${matchedCount} anggota menjadi "SUDAH TERCETAK"!`,
        });
        setFileData(null);
      }
    } catch (err: any) {
      setImportStatus({ error: `Gagal memperbarui status: ${err.message}` });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-blue-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-blue-200" />
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                Manajemen Impor & Ekspor Data Excel
              </h3>
              <p className="text-xs text-blue-100 opacity-80">
                Konfirmasi dan sinkronisasi data pencetakan KTA PGRI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex space-x-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => {
              setActiveSubTab('EXPORT');
              setFileData(null);
              setImportStatus(null);
            }}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeSubTab === 'EXPORT'
                ? 'bg-blue-700 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            1. Ekspor ke Excel (.xlsx)
          </button>

          <button
            onClick={() => {
              setActiveSubTab('IMPORT_PRINTED');
              setFileData(null);
              setImportStatus(null);
            }}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeSubTab === 'IMPORT_PRINTED'
                ? 'bg-blue-700 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            2. Impor Data yang Telah Tercetak
          </button>

          <button
            onClick={() => {
              setActiveSubTab('IMPORT_NEW');
              setFileData(null);
              setImportStatus(null);
            }}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeSubTab === 'IMPORT_NEW'
                ? 'bg-blue-700 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            3. Impor Data Anggota Baru
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm">
          {/* NOTIFICATION MESSAGE */}
          {importStatus && (
            <div
              className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${
                importStatus.success
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              {importStatus.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <p className="font-bold">{importStatus.success ? 'Berhasil' : 'Pemberitahuan'}</p>
                <p className="mt-0.5">{importStatus.success || importStatus.error}</p>
              </div>
            </div>
          )}

          {/* TAB 1: EXPORT OPTIONS */}
          {activeSubTab === 'EXPORT' && (
            <div className="space-y-4">
              <p className="text-slate-500 text-xs">
                Unduh file spreadsheet (.xlsx) untuk arsip cabang, bahan cetak vendor kartu, atau rekapan resmi:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Rekap Semua Lembaga */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block mb-1 text-sm">
                      1. Rekap Seluruh Lembaga
                    </span>
                    <p className="text-xs text-slate-400 mb-3">
                      Tabel ringkasan jumlah anggota, kuota cetak, status validasi per lembaga.
                    </p>
                  </div>
                  <button
                    onClick={() => exportRekapToExcel(lembagas, settings)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Rekap</span>
                  </button>
                </div>

                {/* 2. Khusus Siap Dicetak (Vendor) */}
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-emerald-950 block mb-1 text-sm">
                      2. Data Siap Cetak (Vendor)
                    </span>
                    <p className="text-xs text-emerald-800/80 mb-3">
                      Khusus anggota berstatus 🟢 CETAK KARTU (NPA, nama lengkap, gelar, unit kerja).
                    </p>
                  </div>
                  <button
                    onClick={() => exportAllMembersToExcel(lembagas, settings, true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Siap Cetak</span>
                  </button>
                </div>

                {/* 3. Semua Anggota Lengkap */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block mb-1 text-sm">
                      3. Data Lengkap Semua Anggota
                    </span>
                    <p className="text-xs text-slate-400 mb-3">
                      Master data seluruh anggota dengan status konfirmasi dan nomor HP.
                    </p>
                  </div>
                  <button
                    onClick={() => exportAllMembersToExcel(lembagas, settings, false)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Master</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT PRINTED CARDS */}
          {activeSubTab === 'IMPORT_PRINTED' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5">
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

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="font-bold text-slate-800 text-sm">
                  Pilih File Excel / CSV Daftar Anggota Sudah Tercetak
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Mendukung format .xlsx, .xls, .csv</p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => handleFileUpload(e, 'printed')}
                  className="mt-3 text-xs block mx-auto file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-800 cursor-pointer"
                />
              </div>

              {/* Preview & Execute */}
              {fileData && fileData.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Pratinjau Data ({fileData.length} baris):</span>
                  </div>

                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="p-2.5">No</th>
                          <th className="p-2.5">NPA</th>
                          <th className="p-2.5">Nama</th>
                          <th className="p-2.5">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {fileData.slice(0, 5).map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2.5">{i + 1}</td>
                            <td className="p-2.5 font-mono font-semibold text-slate-700">{row['NPA'] || row['NPA PGRI'] || '-'}</td>
                            <td className="p-2.5 font-medium text-slate-800">{row['Nama'] || row['Nama Anggota'] || row['Nama Lengkap'] || '-'}</td>
                            <td className="p-2.5 text-slate-500">{row['Keterangan'] || 'Sudah Tercetak'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={handleExecuteImportPrinted}
                    className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Terapkan Pembaruan Status Sudah Tercetak</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: IMPORT NEW MEMBERS */}
          {activeSubTab === 'IMPORT_NEW' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5">
                <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Impor Data Anggota Baru dari Excel</p>
                  <p className="mt-0.5 text-blue-800">
                    Tambahkan data anggota beserta jenjang dan nama lembaganya sekaligus.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Kolom: Jenjang, Nama Lembaga, NPA, Nama Lengkap, Status Pegawai, Nomor HP, Status Cetak
                </span>
                <button
                  onClick={() => downloadTemplateExcel('anggota_baru')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                >
                  <Download className="w-3 h-3" />
                  <span>Unduh Template Anggota Baru</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="font-bold text-slate-800 text-sm">Pilih File Excel Anggota Baru</p>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => handleFileUpload(e, 'new')}
                  className="mt-3 text-xs block mx-auto file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-800 cursor-pointer"
                />
              </div>

              {fileData && fileData.length > 0 && (
                <button
                  onClick={handleExecuteImportNew}
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Tambahkan {fileData.length} Anggota ke Database</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
