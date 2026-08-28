import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Building,
  User,
  School,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Lembaga, AppSettings, Jenjang } from '../types';

interface PgriDashboardBannerProps {
  lembagas: Lembaga[];
  settings: AppSettings;
  onSelectLembaga: (lembagaId: string, jenjang: Jenjang) => void;
  onSelectJenjang: (jenjang: Jenjang) => void;
}

export const PgriDashboardBanner: React.FC<PgriDashboardBannerProps> = ({
  lembagas,
  settings,
  onSelectLembaga,
  onSelectJenjang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Compute stats across all lembagas
  const allMembers = lembagas.flatMap((l) => l.anggota);
  const totalPendaftar = allMembers.length;

  const totalAsn = allMembers.filter((a) => {
    const s = (a.statusPegawai || '').toUpperCase();
    return s.includes('PNS') || s.includes('PPPK') || s.includes('ASN');
  }).length;

  const totalNonAsn = allMembers.filter((a) => {
    const s = (a.statusPegawai || '').toUpperCase();
    return (
      s.includes('GTT') ||
      s.includes('HONORER') ||
      s.includes('NON') ||
      s.includes('GTY') ||
      s.includes('PTT') ||
      (!s.includes('PNS') && !s.includes('PPPK') && !s.includes('ASN'))
    );
  }).length;

  const totalLembaga = lembagas.length;

  // Filtered schools and members based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();

    const matchedSchools = lembagas.filter(
      (l) => l.nama.toLowerCase().includes(q) || l.jenjang.toLowerCase().includes(q)
    );

    const matchedMembers: { anggota: Lembaga['anggota'][0]; lembaga: Lembaga }[] = [];
    for (const l of lembagas) {
      for (const a of l.anggota) {
        if (
          a.nama.toLowerCase().includes(q) ||
          a.npa.toLowerCase().includes(q) ||
          (a.nip && a.nip.toLowerCase().includes(q))
        ) {
          matchedMembers.push({ anggota: a, lembaga: l });
        }
      }
    }

    return { schools: matchedSchools, members: matchedMembers };
  }, [lembagas, searchQuery]);

  return (
    <div className="space-y-6 mb-8 print:hidden font-sans">
      {/* 1. Main Search Bar Banner (Searching Lembaga dan Nama) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-base sm:text-lg text-slate-800 tracking-tight flex items-center gap-2">
              <Search className="w-5 h-5 text-[#4e92a2]" />
              <span>Pencarian Cepat Lembaga & Nama Guru</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cari nama sekolah/madrasah atau nama guru/NPA untuk langsung melihat & konfirmasi KTA (tanpa login admin).
            </p>
          </div>
          <div className="flex items-center gap-1.5 self-start md:self-auto">
            <span className="px-2.5 py-1 rounded-full bg-teal-50 text-[#2c6572] border border-teal-200 text-xs font-bold">
              {totalLembaga} Lembaga Terdaftar
            </span>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
              {totalPendaftar} Anggota
            </span>
          </div>
        </div>

        {/* Big Search Input Field */}
        <div className="relative">
          <input
            type="text"
            placeholder="Ketik nama lembaga (misal: SDN 1, SMP, TK) atau nama guru / NPA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4e92a2] focus:border-[#4e92a2] transition-all shadow-inner"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1 rounded-md"
              title="Bersihkan Pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown/Box */}
        {searchResults && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in space-y-4">
            {/* Lembaga Results */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#4e92a2]" />
                  <span>Hasil Lembaga / Sekolah ({searchResults.schools.length})</span>
                </span>
              </div>

              {searchResults.schools.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {searchResults.schools.slice(0, 6).map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        onSelectLembaga(l.id, l.jenjang);
                        setSearchQuery('');
                      }}
                      className="p-3 rounded-xl border border-slate-200 hover:border-[#4e92a2] bg-white hover:bg-teal-50/50 text-left transition-all group flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-xs text-slate-800 group-hover:text-[#2c6572] block truncate">
                          {l.nama}
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-600">{l.jenjang}</span>
                          <span>&bull;</span>
                          <span>{l.anggota.length} Guru/Anggota</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#4e92a2] shrink-0 transform group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Tidak ada nama lembaga yang cocok.</p>
              )}
            </div>

            {/* Anggota Results */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Hasil Nama Guru / Anggota ({searchResults.members.length})</span>
                </span>
              </div>

              {searchResults.members.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {searchResults.members.slice(0, 9).map((item) => (
                    <button
                      key={item.anggota.id}
                      onClick={() => {
                        onSelectLembaga(item.lembaga.id, item.lembaga.jenjang);
                        setSearchQuery('');
                      }}
                      className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 text-left transition-all group flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-800 block truncate">
                          {item.anggota.nama}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                          <span>NPA: {item.anggota.npa || '-'}</span>
                          <span>&bull;</span>
                          <span className="text-emerald-700 font-medium truncate">{item.lembaga.nama}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 shrink-0 transform group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Tidak ada nama guru yang cocok.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Stat Cards (The Classic PGRI 3-Column Cyan/Teal Header Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Stat Card 1: Total Pendaftar */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xs flex flex-col bg-white">
          <div className="bg-[#4e92a2] text-white p-5 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-100 mb-0.5">
              Total
            </span>
            <h3 className="text-base font-extrabold mb-2">Pendaftar</h3>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
              <Users className="w-7 h-7" />
            </div>
          </div>
          <div className="p-4 text-center bg-white flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-slate-800 tracking-tight">
              {totalPendaftar}
            </span>
            <span className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Total Anggota Terdaftar ({totalLembaga} Lembaga)
            </span>
          </div>
        </div>

        {/* Stat Card 2: Total Guru ASN (PNS & PPPK) */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xs flex flex-col bg-white">
          <div className="bg-[#4e92a2] text-white p-5 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-100 mb-0.5">
              Total
            </span>
            <h3 className="text-base font-extrabold mb-2">Guru ASN (PNS & PPPK)</h3>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
              <Users className="w-7 h-7" />
            </div>
          </div>
          <div className="p-4 text-center bg-white flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-slate-800 tracking-tight">
              {totalAsn}
            </span>
            <span className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Status Pegawai Negeri & PPPK
            </span>
          </div>
        </div>

        {/* Stat Card 3: Total Guru Non ASN */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xs flex flex-col bg-white">
          <div className="bg-[#4e92a2] text-white p-5 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-100 mb-0.5">
              Total
            </span>
            <h3 className="text-base font-extrabold mb-2">Guru Non ASN</h3>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
              <Users className="w-7 h-7" />
            </div>
          </div>
          <div className="p-4 text-center bg-white flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-slate-800 tracking-tight">
              {totalNonAsn}
            </span>
            <span className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Honorer, GTT, GTY & Swasta
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
