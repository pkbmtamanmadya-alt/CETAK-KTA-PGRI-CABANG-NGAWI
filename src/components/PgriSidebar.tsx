import React, { useState, useMemo } from 'react';
import { PageView, Jenjang, AppSettings, Lembaga } from '../types';
import {
  Search,
  Users,
  Shield,
  Layers,
  Building,
  User,
  ChevronRight,
  School,
  Lock,
  Unlock,
  X,
  FileSpreadsheet,
  FileText,
  Settings,
  BarChart3,
} from 'lucide-react';
import { PgriLogo } from './PgriLogo';

interface PgriSidebarProps {
  currentPage: PageView;
  selectedJenjang?: Jenjang;
  settings: AppSettings;
  lembagas: Lembaga[];
  isAdminAuthenticated: boolean;
  onNavigateHome: () => void;
  onOpenAdmin: (initialTab?: number) => void;
  onSelectJenjang: (jenjang: Jenjang) => void;
  onSelectLembaga?: (lembagaId: string, jenjang: Jenjang) => void;
  onClose?: () => void;
}

export const PgriSidebar: React.FC<PgriSidebarProps> = ({
  currentPage,
  selectedJenjang,
  settings,
  lembagas,
  isAdminAuthenticated,
  onNavigateHome,
  onOpenAdmin,
  onSelectJenjang,
  onSelectLembaga,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Search Results across Lembagas and Anggota
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return { lembagas: [], anggota: [] };
    const query = searchTerm.toLowerCase().trim();

    const matchedLembagas = lembagas.filter(
      (l) => l.nama.toLowerCase().includes(query) || l.jenjang.toLowerCase().includes(query)
    ).slice(0, 5);

    const matchedAnggota: { anggota: Lembaga['anggota'][0]; lembaga: Lembaga }[] = [];
    for (const l of lembagas) {
      for (const a of l.anggota) {
        if (
          a.nama.toLowerCase().includes(query) ||
          a.npa.toLowerCase().includes(query) ||
          (a.nip && a.nip.toLowerCase().includes(query))
        ) {
          matchedAnggota.push({ anggota: a, lembaga: l });
          if (matchedAnggota.length >= 8) break;
        }
      }
      if (matchedAnggota.length >= 8) break;
    }

    return { lembagas: matchedLembagas, anggota: matchedAnggota };
  }, [lembagas, searchTerm]);

  const jenjangList: { id: Jenjang; label: string; iconColor: string }[] = [
    { id: 'PAUD', label: 'PAUD', iconColor: 'text-amber-500' },
    { id: 'TK', label: 'TK / RA', iconColor: 'text-orange-500' },
    { id: 'SD', label: 'SD / MI', iconColor: 'text-red-500' },
    { id: 'SMP/MTs', label: 'SMP / MTs', iconColor: 'text-blue-500' },
    { id: 'SMA/SMK', label: 'SMA / SMK / MA', iconColor: 'text-emerald-500' },
  ];

  const handleSelectFoundLembaga = (lembaga: Lembaga) => {
    if (onSelectLembaga) {
      onSelectLembaga(lembaga.id, lembaga.jenjang);
    } else {
      onSelectJenjang(lembaga.jenjang);
    }
    setSearchTerm('');
    setIsSearchFocused(false);
    if (onClose) onClose();
  };

  const handleSelectFoundMember = (item: { anggota: Lembaga['anggota'][0]; lembaga: Lembaga }) => {
    if (onSelectLembaga) {
      onSelectLembaga(item.lembaga.id, item.lembaga.jenjang);
    } else {
      onSelectJenjang(item.lembaga.jenjang);
    }
    setSearchTerm('');
    setIsSearchFocused(false);
    if (onClose) onClose();
  };

  const handleNavHome = () => {
    onNavigateHome();
    if (onClose) onClose();
  };

  const handleNavJenjang = (jenjang: Jenjang) => {
    onSelectJenjang(jenjang);
    if (onClose) onClose();
  };

  const handleNavAdmin = (tabIndex?: number) => {
    onOpenAdmin(tabIndex);
    if (onClose) onClose();
  };

  const usernameDisplay = settings.namaCabang.toLowerCase().replace(/cabang\s*/i, '').trim() || 'ngawi';

  return (
    <aside className="w-72 sm:w-64 max-w-[85vw] shrink-0 bg-white border-r border-slate-200 flex flex-col h-full print:hidden select-none font-sans z-50">
      {/* 1. Top Branding Header */}
      <div className="bg-[#4e92a2] px-4 py-3.5 flex items-center justify-between gap-2 border-b border-[#3f7e8c] text-white">
        <div className="flex items-center gap-2 min-w-0">
          <PgriLogo className="w-8 h-8 shrink-0" />
          <div className="min-w-0">
            <span className="font-bold text-sm tracking-tight text-white uppercase block leading-tight truncate">
              KTA DIGITAL PGRI
            </span>
            <span className="text-[10px] text-teal-100 block truncate">
              {settings.namaCabang}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          <span className="bg-white text-[#2c6572] text-[10px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
            2024
          </span>
          {/* Mobile Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-md transition-colors ml-1"
              title="Tutup Menu"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. User Info Card */}
      <div className="p-3.5 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full border border-slate-300 bg-white flex items-center justify-center text-slate-400 overflow-hidden shadow-2xs shrink-0">
            <Users className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-bold text-xs text-slate-800 truncate">
                👤 {usernameDisplay}
              </span>
              <span className="w-3.5 h-3.5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0">
                ✓
              </span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {settings.kabupatenKota}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Real Searching Lembaga & Nama */}
      <div className="p-3 border-b border-slate-100 relative">
        <label className="block text-[11px] font-bold text-slate-700 mb-1">
          Cari Lembaga & Nama Guru
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Ketik sekolah / guru..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full pl-8 pr-7 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4e92a2] focus:border-[#4e92a2] text-slate-800 placeholder:text-slate-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Popup Dropdown */}
        {isSearchFocused && searchTerm.trim().length > 0 && (
          <div className="absolute left-3 right-3 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto p-1.5 space-y-1 animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
              <span>Hasil Pencarian</span>
              <button
                onClick={() => setIsSearchFocused(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                Tutup
              </button>
            </div>

            {/* Lembaga Results */}
            {searchResults.lembagas.length > 0 && (
              <div>
                <span className="px-2 py-0.5 text-[10px] font-bold text-[#4e92a2] block">
                  Lembaga / Sekolah ({searchResults.lembagas.length})
                </span>
                {searchResults.lembagas.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleSelectFoundLembaga(l)}
                    className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-100 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <School className="w-3.5 h-3.5 text-[#4e92a2] shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{l.nama}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 font-medium">
                      {l.jenjang}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Member Results */}
            {searchResults.anggota.length > 0 && (
              <div>
                <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-600 block mt-1">
                  Nama Guru / Anggota ({searchResults.anggota.length})
                </span>
                {searchResults.anggota.map((item) => (
                  <button
                    key={item.anggota.id}
                    onClick={() => handleSelectFoundMember(item)}
                    className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-100 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-slate-800 block truncate leading-tight">
                          {item.anggota.nama}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          NPA: {item.anggota.npa || '-'} &bull; {item.lembaga.nama}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchResults.lembagas.length === 0 && searchResults.anggota.length === 0 && (
              <div className="p-3 text-center text-xs text-slate-500">
                Tidak ditemukan lembaga atau nama guru dengan kata kunci "<strong>{searchTerm}</strong>".
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Focused Navigation Menu: Pilih Jenjang (Public, No Login) & Admin (Login Required) */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
        {/* ========================================================================= */}
        {/* MENU 1: PILIH JENJANG (Tanpa Login Admin - Langsung Diakses) */}
        {/* ========================================================================= */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#4e92a2]" />
              <span>Pilih Jenjang</span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Publik
            </span>
          </div>

          <button
            onClick={handleNavHome}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-left ${
              currentPage === 'JENJANG_SELECTION'
                ? 'bg-[#4e92a2] text-white font-bold shadow-2xs'
                : 'text-slate-700 hover:bg-slate-100 font-medium'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span>Semua Jenjang (Beranda)</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              currentPage === 'JENJANG_SELECTION' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {lembagas.length} Sekolah
            </span>
          </button>

          {/* Sub-Items: Jenjang List (PAUD, TK, SD, SMP/MTs, SMA/SMK) */}
          <div className="pt-1 pl-2 space-y-1">
            {jenjangList.map((j) => {
              const count = lembagas.filter((l) => l.jenjang === j.id).length;
              const isSelected =
                (currentPage === 'LEMBAGA_SELECTION' || currentPage === 'KONFIRMASI_ANGGOTA') &&
                selectedJenjang === j.id;

              return (
                <button
                  key={j.id}
                  onClick={() => handleNavJenjang(j.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                    isSelected
                      ? 'bg-teal-50 text-[#2c6572] font-bold border border-teal-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#4e92a2]"></span>
                    <span className="font-semibold">{j.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {count} sekolah
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MENU 2: ADMIN CABANG (Membutuhkan Login Admin / Masuk Dashboard) */}
        {/* ========================================================================= */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between px-2 pb-1">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin Cabang</span>
            </span>
            {isAdminAuthenticated ? (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Unlock className="w-2.5 h-2.5" /> Terbuka
              </span>
            ) : (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Terkunci
              </span>
            )}
          </div>

          <button
            onClick={() => handleNavAdmin(0)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left font-bold ${
              currentPage === 'ADMIN_DASHBOARD'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#4e92a2]" />
              <span>Menu Admin</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Quick Submenu when Admin is open or authenticated */}
          <div className="pt-1 pl-2 space-y-1">
            <button
              onClick={() => handleNavAdmin(0)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-md text-slate-600 hover:bg-slate-100 text-xs text-left"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                <span>1. Rekapitulasi Cabang</span>
              </div>
            </button>
            <button
              onClick={() => handleNavAdmin(1)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-md text-slate-600 hover:bg-slate-100 text-xs text-left"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>2. Cetak Dokumen Resmi</span>
              </div>
            </button>
            <button
              onClick={() => handleNavAdmin(2)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-md text-slate-600 hover:bg-slate-100 text-xs text-left"
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                <span>3. Impor / Ekspor Excel</span>
              </div>
            </button>
            <button
              onClick={() => handleNavAdmin(3)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-md text-slate-600 hover:bg-slate-100 text-xs text-left"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>4. Pengaturan Kop & Pejabat</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-[10px] text-slate-400 text-center">
        PGRI {settings.namaCabang} &bull; v2024
      </div>
    </aside>
  );
};
