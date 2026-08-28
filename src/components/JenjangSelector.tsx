import React from 'react';
import { Jenjang, Lembaga } from '../types';
import { School, GraduationCap, BookOpen, Baby, Shapes } from 'lucide-react';

interface JenjangSelectorProps {
  selectedJenjang: Jenjang;
  onSelectJenjang: (jenjang: Jenjang) => void;
  lembagas: Lembaga[];
}

const JENJANG_LIST: { id: Jenjang; label: string; icon: React.FC<{ className?: string }>; desc: string }[] = [
  { id: 'PAUD', label: 'PAUD', icon: Baby, desc: 'Pendidikan Anak Usia Dini' },
  { id: 'TK', label: 'TK', icon: Shapes, desc: 'Taman Kanak-Kanak / RA' },
  { id: 'SD', label: 'SD / MI', icon: BookOpen, desc: 'Sekolah Dasar / MI' },
  { id: 'SMP/MTs', label: 'SMP / MTs', icon: School, desc: 'Sekolah Menengah Pertama' },
  { id: 'SMA/SMK', label: 'SMA / SMK / MA', icon: GraduationCap, desc: 'SMA / SMK / MA' },
];

export const JenjangSelector: React.FC<JenjangSelectorProps> = ({
  selectedJenjang,
  onSelectJenjang,
  lembagas,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 mb-6">
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Langkah 1 &bull; Kategori
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 mt-0.5">
            Pilihan Jenjang Pendidikan
          </h2>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Pilih jenjang untuk menampilkan daftar sekolah / lembaga
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {JENJANG_LIST.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedJenjang === item.id;
          const lembagasInJenjang = lembagas.filter((l) => l.jenjang === item.id);
          const totalLembaga = lembagasInJenjang.length;
          const totalAnggota = lembagasInJenjang.reduce((acc, l) => acc + l.anggota.length, 0);
          const tervalidasiCount = lembagasInJenjang.filter((l) => l.statusValidasi === 'TERVALIDASI').length;

          return (
            <button
              key={item.id}
              onClick={() => onSelectJenjang(item.id)}
              className={`relative flex flex-col items-start p-3.5 rounded-xl border text-left transition-all duration-150 ${
                isSelected
                  ? 'bg-blue-50 text-blue-800 border-blue-600 shadow-xs ring-1 ring-blue-600'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-blue-200/80 text-blue-900'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {totalLembaga} Lembaga
                </span>
              </div>

              <span className="text-sm sm:text-base font-bold tracking-tight">{item.label}</span>
              <span className={`text-[11px] line-clamp-1 mt-0.5 ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>
                {item.desc}
              </span>

              <div
                className={`mt-2.5 pt-2 border-t w-full flex items-center justify-between text-[11px] ${
                  isSelected ? 'border-blue-200 text-blue-800 font-medium' : 'border-slate-100 text-slate-500'
                }`}
              >
                <span>{totalAnggota} Anggota</span>
                <span className={tervalidasiCount === totalLembaga && totalLembaga > 0 ? 'text-emerald-600 font-bold' : ''}>
                  {tervalidasiCount}/{totalLembaga} Valid
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
