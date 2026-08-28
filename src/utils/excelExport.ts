import * as XLSX from 'xlsx';
import { Lembaga, AnggotaPGRI, AppSettings } from '../types';

export function exportRekapToExcel(lembagas: Lembaga[], settings: AppSettings) {
  const data = lembagas.map((l, index) => {
    const total = l.anggota.length;
    const cetak = l.anggota.filter((a) => a.statusCetak === 'CETAK').length;
    const tidakCetak = l.anggota.filter((a) => a.statusCetak === 'TIDAK_CETAK').length;
    const sudahCetak = l.anggota.filter((a) => a.statusCetak === 'SUDAH_TERCETAK').length;

    return {
      'No': index + 1,
      'Jenjang': l.jenjang,
      'Nama Lembaga / Sekolah': l.nama,
      'Kecamatan': l.kecamatan || '-',
      'Total Anggota': total,
      'Akan Cetak KTA': cetak,
      'Tidak Cetak': tidakCetak,
      'Sudah Tercetak': sudahCetak,
      'Status Validasi': l.statusValidasi === 'TERVALIDASI' ? 'TERVALIDASI' : 'BELUM VALIDASI',
      'Waktu Validasi': l.validatedAt || '-',
      'Petugas Verifikator': l.validatorName || '-',
      'Keterangan / Catatan': l.catatan || '-',
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },  // No
    { wch: 12 }, // Jenjang
    { wch: 32 }, // Nama Lembaga
    { wch: 16 }, // Kecamatan
    { wch: 14 }, // Total Anggota
    { wch: 16 }, // Akan Cetak
    { wch: 14 }, // Tidak Cetak
    { wch: 16 }, // Sudah Cetak
    { wch: 18 }, // Status
    { wch: 18 }, // Waktu
    { wch: 25 }, // Verifikator
    { wch: 35 }, // Keterangan
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekapitulasi KTA');

  const fileName = `Rekap_KTA_PGRI_${settings.namaCabang.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportAllMembersToExcel(lembagas: Lembaga[], settings: AppSettings, onlyCetak: boolean = false) {
  const rows: any[] = [];
  let no = 1;

  lembagas.forEach((l) => {
    l.anggota.forEach((a) => {
      if (onlyCetak && a.statusCetak !== 'CETAK') {
        return;
      }
      rows.push({
        'No': no++,
        'Jenjang': l.jenjang,
        'Nama Lembaga': l.nama,
        'NPA PGRI': a.npa,
        'Nama Lengkap & Gelar': a.nama,
        'Status Pegawai': a.statusPegawai,
        'Nomor HP / WhatsApp': a.noHp,
        'Konfirmasi Status': a.statusCetak === 'CETAK' ? 'CETAK KARTU' : (a.statusCetak === 'SUDAH_TERCETAK' ? 'SUDAH TERCETAK' : 'TIDAK CETAK'),
        'Keterangan': a.keterangan || '-',
        'Status Lembaga': l.statusValidasi
      });
    });
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 5 },  // No
    { wch: 12 }, // Jenjang
    { wch: 30 }, // Lembaga
    { wch: 16 }, // NPA
    { wch: 32 }, // Nama
    { wch: 16 }, // Status Pegawai
    { wch: 18 }, // No HP
    { wch: 18 }, // Konfirmasi
    { wch: 30 }, // Keterangan
    { wch: 16 }, // Validasi
  ];

  const wb = XLSX.utils.book_new();
  const sheetName = onlyCetak ? 'Daftar Cetak KTA' : 'Semua Anggota PGRI';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const prefix = onlyCetak ? 'Daftar_Siap_Cetak_KTA_PGRI' : 'Data_Lengkap_Anggota_PGRI';
  const fileName = `${prefix}_${settings.namaCabang.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportLembagaToExcel(lembaga: Lembaga) {
  const rows = lembaga.anggota.map((a, index) => ({
    'No': index + 1,
    'NPA PGRI': a.npa,
    'Nama Lengkap': a.nama,
    'Status Pegawai': a.statusPegawai,
    'Nomor HP': a.noHp,
    'Konfirmasi Cetak': a.statusCetak === 'CETAK' ? 'CETAK KARTU' : (a.statusCetak === 'SUDAH_TERCETAK' ? 'SUDAH TERCETAK' : 'TIDAK CETAK'),
    'Keterangan': a.keterangan || '-',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 5 },
    { wch: 16 },
    { wch: 32 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 30 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, lembaga.nama.slice(0, 30));
  const fileName = `KTA_${lembaga.nama.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function downloadTemplateExcel(type: 'anggota_baru' | 'anggota_sudah_cetak') {
  const wb = XLSX.utils.book_new();
  
  if (type === 'anggota_baru') {
    const templateData = [
      {
        'Jenjang': 'SD',
        'Nama Lembaga': 'SD Negeri Kandangan 1',
        'NPA PGRI': '1314051099',
        'Nama Lengkap': 'Drs. Suparman, M.Pd.',
        'Status Pegawai': 'ASN/PNS',
        'Nomor HP': '081234567890',
        'Status Cetak': 'CETAK', // CETAK / TIDAK CETAK / SUDAH TERCETAK
        'Keterangan': 'Pengajuan Baru'
      },
      {
        'Jenjang': 'SD',
        'Nama Lembaga': 'SD Negeri Kandangan 1',
        'NPA PGRI': '1314051098',
        'Nama Lengkap': 'Siti Maryam, S.Pd.',
        'Status Pegawai': 'PPPK',
        'Nomor HP': '081234567891',
        'Status Cetak': 'TIDAK CETAK',
        'Keterangan': 'KTA masih bagus'
      },
      {
        'Jenjang': 'SMP/MTs',
        'Nama Lembaga': 'SMPN 1 Ngawi',
        'NPA PGRI': '1314054099',
        'Nama Lengkap': 'Rudi Hartono, S.Kom.',
        'Status Pegawai': 'Non-ASN',
        'Nomor HP': '081234567892',
        'Status Cetak': 'CETAK',
        'Keterangan': 'GTT Baru'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 16 }, { wch: 30 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Template Anggota');
    XLSX.writeFile(wb, 'Template_Impor_Anggota_PGRI.xlsx');
  } else {
    // Template for already printed members
    const templateData = [
      {
        'NPA PGRI': '1314051001',
        'Nama Anggota': 'Ahmad Muzakki, S.Pd.',
        'Status': 'SUDAH TERCETAK',
        'Keterangan': 'Batch Cetak 1 (Juli 2026)'
      },
      {
        'NPA PGRI': '1314052001',
        'Nama Anggota': 'Suratno, M.Pd.',
        'Status': 'SUDAH TERCETAK',
        'Keterangan': 'Batch Cetak 1 (Juli 2026)'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [{ wch: 18 }, { wch: 32 }, { wch: 20 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Anggota Sudah Tercetak');
    XLSX.writeFile(wb, 'Template_Impor_Kartu_Sudah_Tercetak.xlsx');
  }
}
