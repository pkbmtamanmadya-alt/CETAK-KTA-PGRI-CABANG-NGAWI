import React from 'react';
import { Jenjang, Lembaga, AppSettings } from '../types';
import {
  Baby,
  Shapes,
  BookOpen,
  School,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Users,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface JenjangCardsHomeProps {
  lembagas: Lembaga[];
  settings: AppSettings;
  onSelectJenjang: (jenjang: Jenjang) => void;
  onOpenAdminLogin: () => void;
  isAdminAuthenticated: boolean;
  onGoToAdmin: () => void;
}

interface JenjangConfig {
  id: Jenjang;
  title: string;
  subTitle: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
  theme: {
    bg: string;
    border: string;
    hoverBorder: string;
    hoverShadow: string;
    text: string;
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
    btnBg: string;
    btnHover: string;
    accentGlow: string;
  };
}

const JENJANG_CONFIGS: JenjangConfig[] = [
  {
    id: 'PAUD',
    title: 'PAUD',
    subTitle: 'Pendidikan Anak Usia Dini',
    desc: 'Kelompok Bermain, SPS, dan Satuan PAUD Sejenis',
    icon: Baby,
    theme: {
      bg: 'bg-rose-50/70 hover:bg-rose-50/90',
      border: 'border-rose-200/80',
      hoverBorder: 'hover:border-rose-400',
      hoverShadow: 'hover:shadow-rose-100/60',
      text: 'text-rose-950',
      iconBg: 'bg-rose-500/10 text-rose-600',
      iconColor: 'text-rose-600',
      badgeBg: 'bg-rose-100/80',
      badgeText: 'text-rose-700',
      btnBg: 'bg-rose-600 hover:bg-rose-700 text-white',
      btnHover: 'hover:bg-rose-700',
      accentGlow: 'from-rose-500/5 to-transparent',
    },
  },
  {
    id: 'TK',
    title: 'TK / RA',
    subTitle: 'Taman Kanak-Kanak & RA',
    desc: 'Taman Kanak-Kanak dan Raudhatul Athfal',
    icon: Shapes,
    theme: {
      bg: 'bg-amber-50/70 hover:bg-amber-50/90',
      border: 'border-amber-200/80',
      hoverBorder: 'hover:border-amber-400',
      hoverShadow: 'hover:shadow-amber-100/60',
      text: 'text-amber-950',
      iconBg: 'bg-amber-500/10 text-amber-600',
      iconColor: 'text-amber-600',
      badgeBg: 'bg-amber-100/80',
      badgeText: 'text-amber-800',
      btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
      btnHover: 'hover:bg-amber-700',
      accentGlow: 'from-amber-500/5 to-transparent',
    },
  },
  {
    id: 'SD',
    title: 'SD / MI',
    subTitle: 'Sekolah Dasar & MI',
    desc: 'Sekolah Dasar Negeri/Swasta dan Madrasah Ibtidaiyah',
    icon: BookOpen,
    theme: {
      bg: 'bg-emerald-50/70 hover:bg-emerald-50/90',
      border: 'border-emerald-200/80',
      hoverBorder: 'hover:border-emerald-400',
      hoverShadow: 'hover:shadow-emerald-100/60',
      text: 'text-emerald-950',
      iconBg: 'bg-emerald-500/10 text-emerald-600',
      iconColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-100/80',
      badgeText: 'text-emerald-800',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      btnHover: 'hover:bg-emerald-700',
      accentGlow: 'from-emerald-500/5 to-transparent',
    },
  },
  {
    id: 'SMP/MTs',
    title: 'SMP / MTs',
    subTitle: 'Sekolah Menengah Pertama & MTs',
    desc: 'SMP Negeri/Swasta dan Madrasah Tsanawiyah',
    icon: School,
    theme: {
      bg: 'bg-sky-50/70 hover:bg-sky-50/90',
      border: 'border-sky-200/80',
      hoverBorder: 'hover:border-sky-400',
      hoverShadow: 'hover:shadow-sky-100/60',
      text: 'text-sky-950',
      iconBg: 'bg-sky-500/10 text-sky-600',
      iconColor: 'text-sky-600',
      badgeBg: 'bg-sky-100/80',
      badgeText: 'text-sky-800',
      btnBg: 'bg-sky-600 hover:bg-sky-700 text-white',
      btnHover: 'hover:bg-sky-700',
      accentGlow: 'from-sky-500/5 to-transparent',
    },
  },
  {
    id: 'SMA/SMK',
    title: 'SMA / SMK / MA',
    subTitle: 'Menengah Atas & Kejuruan',
    desc: 'SMA, SMK Negeri/Swasta dan Madrasah Aliyah',
    icon: GraduationCap,
    theme: {
      bg: 'bg-violet-50/70 hover:bg-violet-50/90',
      border: 'border-violet-200/80',
      hoverBorder: 'hover:border-violet-400',
      hoverShadow: 'hover:shadow-violet-100/60',
      text: 'text-violet-950',
      iconBg: 'bg-violet-500/10 text-violet-600',
      iconColor: 'text-violet-600',
      badgeBg: 'bg-violet-100/80',
      badgeText: 'text-violet-800',
      btnBg: 'bg-violet-600 hover:bg-violet-700 text-white',
      btnHover: 'hover:bg-violet-700',
      accentGlow: 'from-violet-500/5 to-transparent',
    },
  },
];

export const JenjangCardsHome: React.FC<JenjangCardsHomeProps> = ({
  lembagas,
  settings,
  onSelectJenjang,
  onOpenAdminLogin,
  isAdminAuthenticated,
  onGoToAdmin,
}) => {
  const totalLembaga = lembagas.length;
  const totalAnggota = lembagas.reduce((acc, l) => acc + l.anggota.length, 0);
  const totalCetak = lembagas.reduce(
    (acc, l) => acc + l.anggota.filter((a) => a.statusCetak === 'CETAK').length,
    0
  );
  const totalTervalidasi = lembagas.filter((l) => l.statusValidasi === 'TERVALIDASI').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/70 rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-200/60 rounded-full text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Portal Layanan KTA &bull; {settings.namaCabang}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Pilih Jenjang Pendidikan
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Silakan pilih jenjang pendidikan lembaga/sekolah Anda di bawah ini untuk melihat daftar sekolah dan melakukan konfirmasi data pencetakan KTA PGRI.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0 bg-white/90 backdrop-blur-xs p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-center px-2">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Lembaga
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-800">{totalLembaga}</span>
              <span className="block text-[10px] text-slate-500">Unit Sekolah</span>
            </div>
            <div className="text-center px-2 border-x border-slate-100">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Anggota
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-800">{totalAnggota}</span>
              <span className="block text-[10px] text-slate-500">Guru & Tendik</span>
            </div>
            <div className="text-center px-2">
              <span className="block text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                Siap Cetak
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-700">{totalCetak}</span>
              <span className="block text-[10px] text-emerald-600 font-medium">KTA Fisik</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Soft Modern Jenjang Cards */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
            <h2 className="text-sm sm:text-base font-bold text-slate-800">
              Daftar Jenjang Pendidikan
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Klik card untuk membuka daftar lembaga
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {JENJANG_CONFIGS.map((config) => {
            const Icon = config.icon;
            const lembagasInJenjang = lembagas.filter((l) => l.jenjang === config.id);
            const countLembaga = lembagasInJenjang.length;
            const countAnggota = lembagasInJenjang.reduce((acc, l) => acc + l.anggota.length, 0);
            const countCetak = lembagasInJenjang.reduce(
              (acc, l) => acc + l.anggota.filter((a) => a.statusCetak === 'CETAK').length,
              0
            );
            const countValid = lembagasInJenjang.filter((l) => l.statusValidasi === 'TERVALIDASI').length;

            return (
              <div
                key={config.id}
                onClick={() => onSelectJenjang(config.id)}
                className={`group relative flex flex-col justify-between p-6 rounded-3xl border ${config.theme.bg} ${config.theme.border} ${config.theme.hoverBorder} shadow-xs hover:shadow-lg ${config.theme.hoverShadow} transition-all duration-200 cursor-pointer overflow-hidden transform hover:-translate-y-0.5`}
              >
                {/* Top Row: Icon & Badge */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${config.theme.iconBg} group-hover:scale-105 transition-transform duration-200`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl ${config.theme.badgeBg} ${config.theme.badgeText}`}
                      >
                        {countLembaga} Lembaga
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className={`text-xl font-bold ${config.theme.text} tracking-tight group-hover:underline decoration-2 underline-offset-4`}>
                    {config.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {config.subTitle}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {config.desc}
                  </p>
                </div>

                {/* Bottom Stats & Action */}
                <div className="mt-6 pt-4 border-t border-slate-200/60">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{countAnggota} Anggota</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{countCetak} Siap Cetak</span>
                    </div>
                  </div>

                  {/* Status Validasi Mini Progress */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3.5">
                    <span>Status Validasi:</span>
                    <span className={`font-bold ${countValid === countLembaga && countLembaga > 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {countValid} dari {countLembaga} Tervalidasi
                    </span>
                  </div>

                  {/* Button */}
                  <button
                    type="button"
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${config.theme.btnBg} transition-all shadow-xs group-hover:shadow-md`}
                  >
                    <span>Pilih Jenjang {config.id}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Admin Card Entry (Soft Slate Theme) */}
          <div
            onClick={isAdminAuthenticated ? onGoToAdmin : onOpenAdminLogin}
            className="group relative flex flex-col justify-between p-6 rounded-3xl border bg-slate-50/80 hover:bg-slate-100/80 border-slate-200 hover:border-slate-400 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden transform hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-800 text-white group-hover:scale-105 transition-transform duration-200">
                  {isAdminAuthenticated ? <ShieldCheck className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
                    isAdminAuthenticated ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isAdminAuthenticated ? 'Aktif' : 'Terkunci'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-800 tracking-tight group-hover:underline decoration-2 underline-offset-4">
                Area Khusus Pengurus Cabang
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Portal Manajemen & Rekapitulasi
              </p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Akses khusus Admin Cabang untuk pengaturan kop surat, rekapitulasi cabang, ekspor PDF resmi, dan impor data Excel.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/60">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-3.5">
                <span>Tervalidasi:</span>
                <span className="font-bold text-slate-800">{totalTervalidasi} / {totalLembaga} Sekolah</span>
              </div>

              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white transition-all shadow-xs group-hover:shadow-md"
              >
                <span>{isAdminAuthenticated ? 'Buka Dashboard Admin' : 'Login Admin Cabang'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
