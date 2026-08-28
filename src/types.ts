export type Jenjang = 'PAUD' | 'TK' | 'SD' | 'SMP/MTs' | 'SMA/SMK';

export type StatusPegawai = 'ASN/PNS' | 'PPPK' | 'Non-ASN' | 'Honorer Daerah' | 'GTT/PTT';

export type StatusCetak = 'CETAK' | 'TIDAK_CETAK' | 'SUDAH_TERCETAK';

export type StatusValidasi = 'TERVALIDASI' | 'BELUM_VALIDASI';

export interface AnggotaPGRI {
  id: string;
  npa: string;
  nama: string;
  statusPegawai: StatusPegawai | string;
  noHp: string;
  statusCetak: StatusCetak;
  keterangan?: string;
  updatedAt?: string;
}

export interface Lembaga {
  id: string;
  jenjang: Jenjang;
  nama: string;
  kecamatan?: string;
  kode?: string;
  statusValidasi: StatusValidasi;
  validatedAt?: string;
  validatorName?: string;
  catatan?: string;
  anggota: AnggotaPGRI[];
}

export type PageView = 'JENJANG_SELECTION' | 'LEMBAGA_SELECTION' | 'KONFIRMASI_ANGGOTA' | 'ADMIN_DASHBOARD';

export type AdminSubTab = 'PENGATURAN' | 'REKAPITULASI' | 'EXPORT_PDF' | 'IMPORT_EXCEL';

export type TabMode = 'KONFIRMASI' | 'REKAP' | 'EXCEL_MANAGER' | 'PANDUAN';

export type FilterStatusAnggota = 'SEMUA' | 'CETAK' | 'TIDAK_CETAK' | 'SUDAH_TERCETAK';

export interface AppSettings {
  namaCabang: string;
  kabupatenKota: string;
  provinsi: string;
  namaKetua: string;
  npaKetua: string;
  namaSekretaris: string;
  npaSekretaris: string;
  namaVerifikator: string;
  nomorSurat: string;
}
