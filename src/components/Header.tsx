import React from 'react';
import { PageView, Lembaga } from '../types';
import {
  ShieldCheck,
  Lock,
  Home,
  Menu,
  Database,
  UserCheck,
} from 'lucide-react';
import { PgriLogo } from './PgriLogo';

interface HeaderProps {
  currentPage: PageView;
  onNavigateHome: () => void;
  onOpenAdmin: () => void;
  isAdminAuthenticated: boolean;
  lembagas: Lembaga[];
  namaCabang: string;
  kabupatenKota: string;
  isCloudConnected?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigateHome,
  onOpenAdmin,
  isAdminAuthenticated,
  lembagas,
  namaCabang,
  kabupatenKota,
  isCloudConnected = true,
  onToggleSidebar,
}) => {
  const totalLembaga = lembagas.length;
  const totalTervalidasi = lembagas.filter((l) => l.statusValidasi === 'TERVALIDASI').length;
  const percentValidasi = totalLembaga > 0 ? Math.round((totalTervalidasi / totalLembaga) * 100) : 0;

  return (
    <header className="bg-[#4e92a2] text-white shadow-md sticky top-0 z-40 border-b border-[#3f7e8c] print:hidden">
      <div className="w-full px-2.5 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left Section: Menu Toggle & Official Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 -ml-1 rounded-lg hover:bg-white/20 active:bg-white/30 text-white transition-colors focus:outline-none shrink-0 flex items-center justify-center"
              title="Buka / Lipat Menu"
              aria-label="Buka / Lipat Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={onNavigateHome}
            className="flex items-center gap-2 cursor-pointer select-none group min-w-0"
          >
            <PgriLogo className="w-7 h-7 sm:w-8 h-8 shrink-0 group-hover:scale-105 transition-transform" />
            <div className="min-w-0">
              <h1 className="text-[11px] sm:text-sm md:text-base font-black tracking-wide uppercase text-white leading-tight truncate">
                KTA DIGITAL PGRI
              </h1>
              <p className="text-[9px] sm:text-[11px] text-teal-100 font-normal truncate">
                {namaCabang} &bull; {kabupatenKota} &bull; <span className="text-teal-200 font-semibold">{percentValidasi}% Tervalidasi</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Cloud DB Status, Navigation, Admin Action & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Cloud DB Status Indicator */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-teal-800/40 border border-teal-300/30 rounded-full text-[11px] text-teal-100 font-medium"
            title="Database Cloud Firestore Aktif & Tersinkronisasi Realtime"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Database className="w-3 h-3 text-emerald-300" />
            <span>Cloud DB Aktif</span>
          </div>

          {/* Home Button */}
          {currentPage !== 'JENJANG_SELECTION' && (
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white rounded-lg text-xs font-semibold transition-colors"
              title="Kembali ke Beranda"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Beranda</span>
            </button>
          )}

          {/* Admin Entry Button */}
          <button
            onClick={onOpenAdmin}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
              currentPage === 'ADMIN_DASHBOARD'
                ? 'bg-slate-900 text-white ring-1 ring-white/40'
                : isAdminAuthenticated
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            {isAdminAuthenticated ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                <span className="hidden sm:inline">Admin (Aktif)</span>
                <span className="sm:hidden">Admin</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-white/80" />
                <span className="hidden sm:inline">Menu Admin</span>
                <span className="sm:hidden">Admin</span>
              </>
            )}
          </button>

          {/* User Profile Avatar with Online Badge */}
          <div
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 pl-0.5 sm:pl-1.5 py-1 cursor-pointer group"
            title={isAdminAuthenticated ? `Admin Aktif: ${namaCabang}` : 'Login Admin Cabang'}
          >
            <div className="relative">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#4e92a2] border-2 border-white/80 flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
                <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4e92a2]" />
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 border-2 border-[#4e92a2]"></span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
