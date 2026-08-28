import { Lembaga, AppSettings } from '../types';

export const defaultSettings: AppSettings = {
  namaCabang: 'Cabang PGRI',
  kabupatenKota: 'Kabupaten/Kota',
  provinsi: 'Jawa Timur',
  namaKetua: '',
  npaKetua: '',
  namaSekretaris: '',
  npaSekretaris: '',
  namaVerifikator: '',
  nomorSurat: '',
};

// Data lembaga kosong siap diisi dengan data riil dari upload Excel atau input manual
export const initialLembagaData: Lembaga[] = [];
