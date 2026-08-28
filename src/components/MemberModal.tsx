import React, { useState, useEffect } from 'react';
import { AnggotaPGRI, StatusPegawai, StatusCetak } from '../types';
import { X, UserPlus, Edit2 } from 'lucide-react';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: Omit<AnggotaPGRI, 'id'>, editId?: string) => void;
  editMember?: AnggotaPGRI | null;
  lembagaName: string;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editMember,
  lembagaName,
}) => {
  const [npa, setNpa] = useState('');
  const [nama, setNama] = useState('');
  const [statusPegawai, setStatusPegawai] = useState<StatusPegawai | string>('ASN/PNS');
  const [noHp, setNoHp] = useState('');
  const [statusCetak, setStatusCetak] = useState<StatusCetak>('CETAK');
  const [keterangan, setKeterangan] = useState('');

  useEffect(() => {
    if (editMember) {
      setNpa(editMember.npa || '');
      setNama(editMember.nama || '');
      setStatusPegawai(editMember.statusPegawai || 'ASN/PNS');
      setNoHp(editMember.noHp || '');
      setStatusCetak(editMember.statusCetak || 'CETAK');
      setKeterangan(editMember.keterangan || '');
    } else {
      setNpa('');
      setNama('');
      setStatusPegawai('ASN/PNS');
      setNoHp('');
      setStatusCetak('CETAK');
      setKeterangan('');
    }
  }, [editMember, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    onSave(
      {
        npa: npa.trim() || '-',
        nama: nama.trim(),
        statusPegawai,
        noHp: noHp.trim() || '-',
        statusCetak,
        keterangan: keterangan.trim() || undefined,
        updatedAt: new Date().toISOString(),
      },
      editMember?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="bg-blue-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {editMember ? <Edit2 className="w-5 h-5 text-blue-200" /> : <UserPlus className="w-5 h-5 text-blue-200" />}
            <h3 className="font-bold text-base">
              {editMember ? 'Edit Data Anggota PGRI' : 'Tambah Anggota PGRI Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-blue-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-100 text-xs text-slate-600">
          Lembaga: <span className="font-bold text-slate-800">{lembagaName}</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-xs">
                NPA PGRI
              </label>
              <input
                type="text"
                value={npa}
                onChange={(e) => setNpa(e.target.value)}
                placeholder="Contoh: 1314051001"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-xs">
                Status Pegawai *
              </label>
              <select
                value={statusPegawai}
                onChange={(e) => setStatusPegawai(e.target.value as StatusPegawai)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800 text-xs sm:text-sm"
              >
                <option value="ASN/PNS">ASN / PNS</option>
                <option value="PPPK">PPPK</option>
                <option value="Non-ASN">Non-ASN</option>
                <option value="Honorer Daerah">Honorer Daerah</option>
                <option value="GTT/PTT">GTT / PTT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1 text-xs">
              Nama Lengkap & Gelar *
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Ahmad Muzakki, S.Pd."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1 text-xs">
              Nomor WhatsApp / HP
            </label>
            <input
              type="tel"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              placeholder="Contoh: 08123456789"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1.5 text-xs">
              Konfirmasi Status Cetak KTA *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border cursor-pointer font-bold text-xs transition-all ${
                  statusCetak === 'CETAK'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="statusCetak"
                  value="CETAK"
                  checked={statusCetak === 'CETAK'}
                  onChange={() => setStatusCetak('CETAK')}
                  className="sr-only"
                />
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>CETAK</span>
              </label>

              <label
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border cursor-pointer font-bold text-xs transition-all ${
                  statusCetak === 'TIDAK_CETAK'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="statusCetak"
                  value="TIDAK_CETAK"
                  checked={statusCetak === 'TIDAK_CETAK'}
                  onChange={() => setStatusCetak('TIDAK_CETAK')}
                  className="sr-only"
                />
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>TIDAK CETAK</span>
              </label>

              <label
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border cursor-pointer font-bold text-xs transition-all ${
                  statusCetak === 'SUDAH_TERCETAK'
                    ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="statusCetak"
                  value="SUDAH_TERCETAK"
                  checked={statusCetak === 'SUDAH_TERCETAK'}
                  onChange={() => setStatusCetak('SUDAH_TERCETAK')}
                  className="sr-only"
                />
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>SUDAH CETAK</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1 text-xs">
              Catatan / Keterangan
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Pengajuan Baru / Kartu Hilang / Pensiun"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none text-slate-800 text-xs sm:text-sm"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-100 transition-colors"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
