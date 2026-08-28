import { Lembaga, AppSettings, FilterStatusAnggota } from '../types';

interface GenerateOfficialPrintOptions {
  settings: AppSettings;
  lembagas: Lembaga[];
  printMode: 'REKAP_SEMUA' | 'DETAIL_LEMBAGA';
  selectedJenjang?: string;
  selectedLembagaId?: string;
  memberFilter?: FilterStatusAnggota;
  showMemberDetails?: boolean;
}

export function printOfficialDocDirectly(options: GenerateOfficialPrintOptions) {
  const {
    settings,
    lembagas,
    printMode,
    selectedJenjang = 'SEMUA',
    selectedLembagaId,
    memberFilter = 'SEMUA',
    showMemberDetails = true,
  } = options;

  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
  }).format(new Date());

  const filteredLembagas = lembagas.filter((l) => {
    if (selectedJenjang === 'SEMUA') return true;
    return l.jenjang === selectedJenjang;
  });

  const currentLembaga =
    lembagas.find((l) => l.id === selectedLembagaId) ||
    filteredLembagas[0] ||
    lembagas[0];

  const targetLembagas =
    printMode === 'DETAIL_LEMBAGA'
      ? currentLembaga
        ? [currentLembaga]
        : []
      : filteredLembagas;

  const totalAnggota = targetLembagas.reduce((acc, l) => acc + l.anggota.length, 0);
  const totalCetak = targetLembagas.reduce(
    (acc, l) => acc + l.anggota.filter((a) => a.statusCetak === 'CETAK').length,
    0
  );
  const totalTidakCetak = targetLembagas.reduce(
    (acc, l) => acc + l.anggota.filter((a) => a.statusCetak === 'TIDAK_CETAK').length,
    0
  );
  const totalSudahCetak = targetLembagas.reduce(
    (acc, l) => acc + l.anggota.filter((a) => a.statusCetak === 'SUDAH_TERCETAK').length,
    0
  );

  // Build Rekap Table Rows HTML
  let rekapRowsHtml = '';
  targetLembagas.forEach((l, idx) => {
    const total = l.anggota.length;
    const cetak = l.anggota.filter((a) => a.statusCetak === 'CETAK').length;
    const tidakCetak = l.anggota.filter((a) => a.statusCetak === 'TIDAK_CETAK').length;
    const sudahCetak = l.anggota.filter((a) => a.statusCetak === 'SUDAH_TERCETAK').length;
    const isValid = l.statusValidasi === 'TERVALIDASI';

    rekapRowsHtml += `
      <tr>
        <td style="text-align: center; padding: 6px 8px; border: 1px solid #1e293b;">${idx + 1}</td>
        <td style="text-align: center; padding: 6px 8px; border: 1px solid #1e293b; font-weight: bold;">${l.jenjang}</td>
        <td style="padding: 6px 8px; border: 1px solid #1e293b; font-weight: bold;">${l.nama}</td>
        <td style="text-align: center; padding: 6px 8px; border: 1px solid #1e293b;">${total}</td>
        <td style="text-align: center; padding: 6px 8px; border: 1px solid #1e293b; font-weight: bold; background-color: #f0fdf4;">${cetak}</td>
        <td style="text-align: center; padding: 6px 8px; border: 1px solid #1e293b;">${tidakCetak}</td>
        <td style="text-align: center; padding: 6px 8px; border: 1px solid #1e293b;">${sudahCetak}</td>
        <td style="text-align: center; padding: 6px 8px; border: 1px solid #1e293b; font-size: 10px; font-weight: bold;">
          ${isValid ? 'TERVALIDASI' : 'BELUM'}
        </td>
        <td style="padding: 6px 8px; border: 1px solid #1e293b; font-size: 11px;">${l.catatan || '-'}</td>
      </tr>
    `;
  });

  // Build Members Detail HTML
  let membersDetailHtml = '';
  if (showMemberDetails || printMode === 'DETAIL_LEMBAGA') {
    targetLembagas.forEach((l) => {
      const members = l.anggota.filter((a) => {
        if (memberFilter === 'CETAK') return a.statusCetak === 'CETAK';
        if (memberFilter === 'TIDAK_CETAK') return a.statusCetak === 'TIDAK_CETAK';
        if (memberFilter === 'SUDAH_TERCETAK') return a.statusCetak === 'SUDAH_TERCETAK';
        return true;
      });

      if (members.length === 0) return;

      let memberRowsHtml = '';
      members.forEach((m, mIdx) => {
        const statusLabel =
          m.statusCetak === 'CETAK'
            ? '<span style="color:#15803d; font-weight:bold;">🟢 CETAK KTA</span>'
            : m.statusCetak === 'SUDAH_TERCETAK'
            ? '<span style="color:#1d4ed8; font-weight:bold;">🔵 SUDAH CETAK</span>'
            : '<span style="color:#b91c1c; font-weight:bold;">🔴 TIDAK CETAK</span>';

        memberRowsHtml += `
          <tr>
            <td style="text-align:center; padding: 5px 6px; border: 1px solid #334155;">${mIdx + 1}</td>
            <td style="text-align:center; padding: 5px 6px; border: 1px solid #334155; font-family: monospace; font-weight: bold;">${m.npa || '-'}</td>
            <td style="padding: 5px 6px; border: 1px solid #334155; font-weight: 600;">${m.nama}</td>
            <td style="text-align:center; padding: 5px 6px; border: 1px solid #334155;">${m.statusPegawai || '-'}</td>
            <td style="text-align:center; padding: 5px 6px; border: 1px solid #334155; font-family: monospace; font-size: 10px;">${m.noHp || '-'}</td>
            <td style="text-align:center; padding: 5px 6px; border: 1px solid #334155; font-size: 11px;">${statusLabel}</td>
            <td style="padding: 5px 6px; border: 1px solid #334155; font-size: 10px;">${m.keterangan || '-'}</td>
            <td style="text-align:center; padding: 5px 6px; border: 1px solid #334155; font-size: 9px; color: #94a3b8; width: 60px;">${mIdx + 1}. .........</td>
          </tr>
        `;
      });

      membersDetailHtml += `
        <div style="margin-top: 20px; page-break-inside: auto;">
          <div style="background-color: #f1f5f9; padding: 6px 10px; font-weight: bold; font-size: 12px; border: 1px solid #1e293b; border-bottom: none; display: flex; justify-content: space-between;">
            <span>${l.nama} (${l.jenjang}) - Status: ${l.statusValidasi}</span>
            <span>Total: ${members.length} Anggota</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px;">
            <thead>
              <tr style="background-color: #e2e8f0; font-weight: bold; text-align: center;">
                <th style="padding: 6px 4px; border: 1px solid #334155; width: 30px;">No</th>
                <th style="padding: 6px 4px; border: 1px solid #334155; width: 100px;">NPA PGRI</th>
                <th style="padding: 6px 4px; border: 1px solid #334155; text-align: left;">Nama Lengkap & Gelar</th>
                <th style="padding: 6px 4px; border: 1px solid #334155; width: 85px;">Status</th>
                <th style="padding: 6px 4px; border: 1px solid #334155; width: 95px;">No. WhatsApp</th>
                <th style="padding: 6px 4px; border: 1px solid #334155; width: 110px;">Konfirmasi Cetak</th>
                <th style="padding: 6px 4px; border: 1px solid #334155; text-align: left;">Keterangan</th>
                <th style="padding: 6px 4px; border: 1px solid #334155; width: 70px;">TTD Anggota</th>
              </tr>
            </thead>
            <tbody>
              ${memberRowsHtml}
            </tbody>
          </table>
        </div>
      `;
    });
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Laporan_KTA_PGRI_${settings.namaCabang.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 15mm 15mm 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: Arial, Helvetica, sans-serif;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 10px;
          font-size: 10pt;
          line-height: 1.35;
        }
        .header-kop {
          border-bottom: 4px double #000000;
          padding-bottom: 10px;
          margin-bottom: 18px;
          text-align: center;
          position: relative;
          font-family: Arial, Helvetica, sans-serif;
        }
        .kop-logo {
          position: absolute;
          left: 10px;
          top: 0;
          width: 65px;
          height: 65px;
          border: 2px solid #000000;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 900;
          line-height: 1;
        }
        .kop-title-1 {
          font-size: 14pt;
          font-weight: 900;
          letter-spacing: 0.5px;
          margin: 0;
          text-transform: uppercase;
        }
        .kop-title-2 {
          font-size: 13pt;
          font-weight: 800;
          margin: 2px 0;
          text-transform: uppercase;
        }
        .kop-address {
          font-size: 9.5pt;
          margin: 2px 0;
          color: #334155;
        }
        .kop-doc-num {
          font-size: 8.5pt;
          margin: 2px 0 0 0;
          color: #64748b;
        }
        .report-title {
          text-align: center;
          margin: 16px 0 14px 0;
          font-family: Arial, Helvetica, sans-serif;
        }
        .report-title h1 {
          font-size: 12pt;
          font-weight: 900;
          text-transform: uppercase;
          text-decoration: underline;
          margin: 0;
          letter-spacing: 0.5px;
        }
        .report-title p {
          font-size: 9.5pt;
          color: #475569;
          margin: 4px 0 0 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10pt;
          font-family: Arial, Helvetica, sans-serif;
        }
        th, td {
          border: 1px solid #1e293b;
        }
        th {
          background-color: #f1f5f9;
          color: #0f172a;
          font-weight: bold;
        }
        tr {
          page-break-inside: avoid;
        }
        .signature-block {
          margin-top: 30px;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 10pt;
          page-break-inside: avoid;
        }
        .signature-grid {
          display: flex;
          justify-content: space-between;
          text-align: center;
        }
        .sig-col {
          width: 45%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 130px;
        }
        .sig-name {
          font-weight: bold;
          text-decoration: underline;
          text-transform: uppercase;
        }
        .no-print-bar {
          background: #1e3a8a;
          color: white;
          padding: 12px 18px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: Arial, sans-serif;
        }
        .print-btn {
          background: #2563eb;
          color: white;
          border: none;
          padding: 8px 18px;
          font-weight: bold;
          font-size: 13px;
          border-radius: 8px;
          cursor: pointer;
        }
        @media print {
          .no-print-bar {
            display: none !important;
          }
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print-bar">
        <div>
          <strong style="font-size: 14px;">Pratinjau Dokumen Resmi PGRI Siap Cetak / Unduh PDF</strong>
          <div style="font-size: 11px; opacity: 0.9; margin-top: 2px;">
            Pilih opsi "Save as PDF" (Simpan sebagai PDF) pada menu printer browser untuk mengunduh berkas PDF.
          </div>
        </div>
        <button class="print-btn" onclick="window.print()">
          🖨️ Cetak / Simpan PDF Sekarang
        </button>
      </div>

      <!-- KOP SURAT RESMI -->
      <div class="header-kop">
        <div class="kop-logo">
          <span>★</span>
          <span>PGRI</span>
          <span>★</span>
        </div>
        <div style="padding: 0 75px;">
          <div class="kop-title-1">PENGURUS PERSATUAN GURU REPUBLIK INDONESIA (PGRI)</div>
          <div class="kop-title-2">PENGURUS ${settings.namaCabang.toUpperCase()}</div>
          <div class="kop-address">${settings.kabupatenKota}, Provinsi ${settings.provinsi}</div>
          ${settings.nomorSurat ? `<div class="kop-doc-num">Nomor Berkas: ${settings.nomorSurat}</div>` : ''}
        </div>
      </div>

      <!-- JUDUL LAPORAN -->
      <div class="report-title">
        <h1>LAPORAN KONFIRMASI PENCETAKAN KARTU TANDA ANGGOTA (KTA) PGRI</h1>
        <p>
          Tanggal Dokumen: <strong>${currentDateFormatted}</strong> &bull;
          ${
            printMode === 'DETAIL_LEMBAGA' && currentLembaga
              ? `Lembaga: <strong>${currentLembaga.nama} (${currentLembaga.jenjang})</strong>`
              : `Jenjang: <strong>${selectedJenjang}</strong> &bull; Total Lembaga: <strong>${targetLembagas.length}</strong>`
          }
        </p>
      </div>

      <!-- TABEL REKAPITULASI -->
      <div style="margin-bottom: 16px;">
        <div style="font-family: Arial; font-weight: bold; font-size: 11px; margin-bottom: 6px; text-transform: uppercase;">
          I. Tabel Rekapitulasi Konfirmasi Cetak KTA per Lembaga:
        </div>
        <table>
          <thead>
            <tr>
              <th style="padding: 6px 4px; width: 30px; text-align: center;">No</th>
              <th style="padding: 6px 4px; width: 65px; text-align: center;">Jenjang</th>
              <th style="padding: 6px 8px; text-align: left;">Nama Lembaga / Sekolah</th>
              <th style="padding: 6px 4px; width: 60px; text-align: center;">Anggota</th>
              <th style="padding: 6px 4px; width: 65px; text-align: center; background-color: #dcfce7; color: #166534;">🟢 Cetak</th>
              <th style="padding: 6px 4px; width: 65px; text-align: center; color: #991b1b;">🔴 Tidak</th>
              <th style="padding: 6px 4px; width: 65px; text-align: center; color: #1e40af;">🔵 Sudah</th>
              <th style="padding: 6px 4px; width: 85px; text-align: center;">Status</th>
              <th style="padding: 6px 8px; text-align: left;">Catatan</th>
            </tr>
          </thead>
          <tbody>
            ${rekapRowsHtml || '<tr><td colspan="9" style="text-align:center; padding: 12px;">Belum ada data lembaga terdaftar.</td></tr>'}
          </tbody>
          <tfoot>
            <tr style="background-color: #e2e8f0; font-weight: bold; border-top: 2px solid #0f172a;">
              <td colspan="3" style="text-align: right; padding: 6px 8px;">TOTAL REKAPITULASI:</td>
              <td style="text-align: center; padding: 6px 4px;">${totalAnggota}</td>
              <td style="text-align: center; padding: 6px 4px; color: #166534;">${totalCetak}</td>
              <td style="text-align: center; padding: 6px 4px; color: #991b1b;">${totalTidakCetak}</td>
              <td style="text-align: center; padding: 6px 4px; color: #1e40af;">${totalSudahCetak}</td>
              <td colspan="2" style="text-align: center; font-size: 10px;">
                ${targetLembagas.filter((l) => l.statusValidasi === 'TERVALIDASI').length} Lembaga Tervalidasi
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- DAFTAR NOMINATIF ANGGOTA -->
      ${
        showMemberDetails || printMode === 'DETAIL_LEMBAGA'
          ? `<div style="margin-top: 20px;">
              <div style="font-family: Arial; font-weight: bold; font-size: 11px; margin-bottom: 6px; text-transform: uppercase;">
                II. Daftar Nominatif Anggota & Usulan Cetak KTA:
              </div>
              ${membersDetailHtml || '<div style="font-size:11px; color:#64748b; font-style:italic;">Tidak ada data rincian anggota.</div>'}
            </div>`
          : ''
      }

      <!-- PENGESAHAN DUA KOLOM -->
      <div class="signature-block">
        <div class="signature-grid">
          <!-- Petugas Verifikator / Admin -->
          <div class="sig-col">
            <div>
              <div>Petugas Verifikator / Admin KTA,</div>
              <div style="font-size: 9pt; color: #475569;">Tim Pelaksana Pendataan KTA Cabang</div>
            </div>
            <div>
              <div class="sig-name">${settings.namaVerifikator || '...................................................'}</div>
              <div style="font-size: 8.5pt; color: #64748b;">NPA/NIP Terlampir</div>
            </div>
          </div>

          <!-- Ketua Cabang PGRI -->
          <div class="sig-col">
            <div>
              <div>${settings.kabupatenKota}, ${currentDateFormatted}</div>
              <div style="font-weight: bold;">Ketua PGRI ${settings.namaCabang}</div>
            </div>
            <div>
              <div class="sig-name">${settings.namaKetua || '...................................................'}</div>
              <div style="font-size: 8.5pt; color: #64748b;">NPA. ${settings.npaKetua || '.....................'}</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Open printable window and trigger print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 450);
  } else {
    // Fallback if popup is blocked
    window.print();
  }
}
