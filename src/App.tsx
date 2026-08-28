/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Jenjang,
  Lembaga,
  AnggotaPGRI,
  StatusCetak,
  AppSettings,
  PageView,
  AdminSubTab,
} from './types';
import { initialLembagaData, defaultSettings } from './data/initialData';
import { Header } from './components/Header';
import { PgriSidebar } from './components/PgriSidebar';
import { PgriDashboardBanner } from './components/PgriDashboardBanner';
import { JenjangCardsHome } from './components/JenjangCardsHome';
import { LembagaListView } from './components/LembagaListView';
import { KonfirmasiTableView } from './components/KonfirmasiTableView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { MemberModal } from './components/MemberModal';
import { Building, X, AlertCircle } from 'lucide-react';
import {
  subscribeToLembagas,
  subscribeToSettings,
  saveLembagaToCloud,
  saveSettingsToCloud,
  syncAllLembagasToCloud,
  seedInitialDataIfEmpty,
} from './services/firebaseDb';

const STORAGE_KEY_LEMBAGA = 'pgri_kta_lembagas_v4';
const STORAGE_KEY_SETTINGS = 'pgri_kta_settings_v4';
const STORAGE_KEY_AUTH = 'pgri_kta_auth_v4';

const TAB_INDEX_TO_NAME: Record<number, AdminSubTab> = {
  0: 'REKAPITULASI',
  1: 'EXPORT_PDF',
  2: 'IMPORT_EXCEL',
  3: 'PENGATURAN',
};

export default function App() {
  // 1. Data State (Persistent in Firestore + LocalStorage fallback)
  const [lembagas, setLembagas] = useState<Lembaga[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LEMBAGA);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialLembagaData;
      }
    }
    return initialLembagaData;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);

  // 2. Navigation State (4 Pages Flow)
  const [currentPage, setCurrentPage] = useState<PageView>('JENJANG_SELECTION');
  const [selectedJenjang, setSelectedJenjang] = useState<Jenjang>('SD');
  const [selectedLembagaId, setSelectedLembagaId] = useState<string>('');
  const [adminInitialTab, setAdminInitialTab] = useState<AdminSubTab>('REKAPITULASI');

  // Sidebar responsive & toggle state (Otomatis melipat pada tampilan HP / Mobile < 1024px)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        // Automatically close/collapse on mobile view
        setIsSidebarOpen(false);
      } else {
        // Automatically open on desktop view
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. Admin Authentication State (user: admin, password: 1234)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_AUTH) === 'true';
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);

  // 4. Modals State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AnggotaPGRI | null>(null);
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolJenjang, setNewSchoolJenjang] = useState<Jenjang>('SD');
  const [newSchoolKecamatan, setNewSchoolKecamatan] = useState('');

  // Quick Search Toast / Alert
  const [searchNotification, setSearchNotification] = useState<string | null>(null);

  // Firestore Real-time Subscription Setup
  useEffect(() => {
    // 1. Seed initial data if Firestore is completely empty
    seedInitialDataIfEmpty(initialLembagaData, defaultSettings);

    // 2. Real-time Lembagas Listener
    const unsubscribeLembagas = subscribeToLembagas(
      (cloudLembagas) => {
        if (cloudLembagas && cloudLembagas.length > 0) {
          setLembagas(cloudLembagas);
          localStorage.setItem(STORAGE_KEY_LEMBAGA, JSON.stringify(cloudLembagas));
        }
        setIsCloudConnected(true);
      },
      (err) => {
        console.warn('Firestore connection warning (using offline fallback):', err);
        setIsCloudConnected(false);
      }
    );

    // 3. Real-time Settings Listener
    const unsubscribeSettings = subscribeToSettings(
      (cloudSettings) => {
        if (cloudSettings && cloudSettings.namaCabang) {
          setSettings(cloudSettings);
          localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(cloudSettings));
        }
        setIsCloudConnected(true);
      },
      (err) => {
        console.warn('Firestore settings warning:', err);
      }
    );

    return () => {
      unsubscribeLembagas();
      unsubscribeSettings();
    };
  }, []);

  // Sync Auth with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUTH, String(isAdminAuthenticated));
  }, [isAdminAuthenticated]);

  // Current Active Lembaga Object
  const currentLembaga =
    lembagas.find((l) => l.id === selectedLembagaId) ||
    lembagas.find((l) => l.jenjang === selectedJenjang) ||
    lembagas[0];

  // ==========================================
  // Navigation Handlers
  // ==========================================
  const handleSelectJenjang = (jenjang: Jenjang) => {
    setSelectedJenjang(jenjang);
    setCurrentPage('LEMBAGA_SELECTION');
  };

  const handleSelectLembaga = (lembagaId: string) => {
    setSelectedLembagaId(lembagaId);
    setCurrentPage('KONFIRMASI_ANGGOTA');
  };

  const handleBackToJenjang = () => {
    setCurrentPage('JENJANG_SELECTION');
  };

  const handleBackToLembagaList = () => {
    setCurrentPage('LEMBAGA_SELECTION');
  };

  const handleOpenAdmin = (initialTabIndex?: number) => {
    const tabName = initialTabIndex !== undefined ? TAB_INDEX_TO_NAME[initialTabIndex] || 'REKAPITULASI' : 'REKAPITULASI';
    setAdminInitialTab(tabName);

    if (isAdminAuthenticated) {
      setCurrentPage('ADMIN_DASHBOARD');
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setCurrentPage('ADMIN_DASHBOARD');
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    setCurrentPage('JENJANG_SELECTION');
  };

  const handleNavigateToLembagaFromRekap = (lembagaId: string, jenjang: Jenjang) => {
    setSelectedJenjang(jenjang);
    setSelectedLembagaId(lembagaId);
    setCurrentPage('KONFIRMASI_ANGGOTA');
  };

  // Search NPA / Nama across all schools
  const handleSearchNpa = (keyword: string) => {
    if (!keyword) return;
    const lower = keyword.toLowerCase();

    for (const lem of lembagas) {
      const match = lem.anggota.find(
        (a) => a.npa.toLowerCase().includes(lower) || a.nama.toLowerCase().includes(lower)
      );
      if (match) {
        setSelectedJenjang(lem.jenjang);
        setSelectedLembagaId(lem.id);
        setCurrentPage('KONFIRMASI_ANGGOTA');
        setSearchNotification(`Ditemukan: ${match.nama} (NPA: ${match.npa}) di ${lem.nama}`);
        setTimeout(() => setSearchNotification(null), 4000);
        return;
      }
    }

    setSearchNotification(`Tidak ditemukan anggota dengan kata kunci "${keyword}".`);
    setTimeout(() => setSearchNotification(null), 3500);
  };

  // ==========================================
  // Member & Lembaga Mutations (with Cloud Sync)
  // ==========================================
  const handleUpdateMemberStatus = (memberId: string, status: StatusCetak) => {
    if (!currentLembaga) return;
    const updatedLembaga = {
      ...currentLembaga,
      anggota: currentLembaga.anggota.map((a) => (a.id === memberId ? { ...a, statusCetak: status } : a)),
    };

    setLembagas((prev) => prev.map((l) => (l.id === currentLembaga.id ? updatedLembaga : l)));
    saveLembagaToCloud(updatedLembaga).catch(console.error);
  };

  const handleUpdateMemberKeterangan = (memberId: string, keterangan: string) => {
    if (!currentLembaga) return;
    const updatedLembaga = {
      ...currentLembaga,
      anggota: currentLembaga.anggota.map((a) => (a.id === memberId ? { ...a, keterangan } : a)),
    };

    setLembagas((prev) => prev.map((l) => (l.id === currentLembaga.id ? updatedLembaga : l)));
    saveLembagaToCloud(updatedLembaga).catch(console.error);
  };

  const handleBulkSetStatus = (status: StatusCetak) => {
    if (!currentLembaga) return;
    const updatedLembaga = {
      ...currentLembaga,
      anggota: currentLembaga.anggota.map((a) => ({ ...a, statusCetak: status })),
    };

    setLembagas((prev) => prev.map((l) => (l.id === currentLembaga.id ? updatedLembaga : l)));
    saveLembagaToCloud(updatedLembaga).catch(console.error);
  };

  const handleSaveMember = (memberData: Omit<AnggotaPGRI, 'id'>, editId?: string) => {
    if (!currentLembaga) return;
    let updatedLembaga: Lembaga;

    if (editId) {
      updatedLembaga = {
        ...currentLembaga,
        anggota: currentLembaga.anggota.map((a) => (a.id === editId ? { ...a, ...memberData } : a)),
      };
    } else {
      const newMember: AnggotaPGRI = {
        ...memberData,
        id: `anggota-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      };
      updatedLembaga = {
        ...currentLembaga,
        anggota: [...currentLembaga.anggota, newMember],
      };
    }

    setLembagas((prev) => prev.map((l) => (l.id === currentLembaga.id ? updatedLembaga : l)));
    saveLembagaToCloud(updatedLembaga).catch(console.error);
  };

  const handleDeleteMember = (memberId: string) => {
    if (!currentLembaga) return;
    const updatedLembaga = {
      ...currentLembaga,
      anggota: currentLembaga.anggota.filter((a) => a.id !== memberId),
    };

    setLembagas((prev) => prev.map((l) => (l.id === currentLembaga.id ? updatedLembaga : l)));
    saveLembagaToCloud(updatedLembaga).catch(console.error);
  };

  const handleAddNewLembaga = (nama: string, jenjang: Jenjang, kecamatan?: string) => {
    const newLembaga: Lembaga = {
      id: `lembaga-${Date.now()}`,
      jenjang,
      nama,
      kecamatan: kecamatan || settings.namaCabang.replace(/cabang\s*/i, '').trim(),
      statusValidasi: 'BELUM_VALIDASI',
      anggota: [],
    };

    setLembagas((prev) => [...prev, newLembaga]);
    setSelectedLembagaId(newLembaga.id);
    setSelectedJenjang(jenjang);
    setCurrentPage('KONFIRMASI_ANGGOTA');
    saveLembagaToCloud(newLembaga).catch(console.error);
  };

  const handleValidateLembaga = (lembagaId: string, catatan?: string) => {
    const nowStr = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date());

    const targetLembaga = lembagas.find((l) => l.id === lembagaId);
    if (!targetLembaga) return;

    const updatedLembaga: Lembaga = {
      ...targetLembaga,
      statusValidasi: 'TERVALIDASI',
      validatedAt: nowStr,
      validatorName: settings.namaVerifikator,
      catatan: catatan || targetLembaga.catatan,
    };

    setLembagas((prev) => prev.map((l) => (l.id === lembagaId ? updatedLembaga : l)));
    saveLembagaToCloud(updatedLembaga).catch(console.error);
  };

  const handleUnlockLembaga = (lembagaId: string) => {
    const targetLembaga = lembagas.find((l) => l.id === lembagaId);
    if (!targetLembaga) return;

    const updatedLembaga: Lembaga = {
      ...targetLembaga,
      statusValidasi: 'BELUM_VALIDASI',
    };

    setLembagas((prev) => prev.map((l) => (l.id === lembagaId ? updatedLembaga : l)));
    saveLembagaToCloud(updatedLembaga).catch(console.error);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
    saveSettingsToCloud(newSettings).catch(console.error);
  };

  const handleResetData = (resetSettings: boolean = false) => {
    setLembagas([]);
    localStorage.setItem(STORAGE_KEY_LEMBAGA, JSON.stringify([]));
    syncAllLembagasToCloud([]).catch(console.error);
    if (resetSettings) {
      setSettings(defaultSettings);
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(defaultSettings));
      saveSettingsToCloud(defaultSettings).catch(console.error);
    }
  };

  const handleImportNewMembers = (newLembagas: Lembaga[]) => {
    setLembagas(newLembagas);
    localStorage.setItem(STORAGE_KEY_LEMBAGA, JSON.stringify(newLembagas));
    syncAllLembagasToCloud(newLembagas).catch(console.error);
  };

  const handleSaveAddSchoolModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;
    handleAddNewLembaga(newSchoolName.trim(), newSchoolJenjang, newSchoolKecamatan.trim() || undefined);
    setNewSchoolName('');
    setIsAddSchoolModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#edf2f7] text-slate-900 flex antialiased selection:bg-[#4e92a2] selection:text-white font-sans">
      {/* 1. Left Sidebar with Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <>
          {/* Backdrop Overlay for Mobile / HP */}
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Sidebar Drawer Container */}
          <div className="fixed inset-y-0 left-0 z-50 lg:static lg:z-auto h-full flex flex-col shadow-2xl lg:shadow-none animate-in slide-in-from-left duration-200">
            <PgriSidebar
              currentPage={currentPage}
              selectedJenjang={selectedJenjang}
              settings={settings}
              lembagas={lembagas}
              isAdminAuthenticated={isAdminAuthenticated}
              onNavigateHome={() => {
                handleBackToJenjang();
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              onOpenAdmin={(tab) => {
                handleOpenAdmin(tab);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              onSelectJenjang={(jenjang) => {
                handleSelectJenjang(jenjang);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              onSelectLembaga={(lembagaId, jenjang) => {
                setSelectedJenjang(jenjang);
                setSelectedLembagaId(lembagaId);
                setCurrentPage('KONFIRMASI_ANGGOTA');
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* 2. Main Layout Column */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          currentPage={currentPage}
          onNavigateHome={handleBackToJenjang}
          onOpenAdmin={() => handleOpenAdmin(0)}
          isAdminAuthenticated={isAdminAuthenticated}
          lembagas={lembagas}
          namaCabang={settings.namaCabang}
          kabupatenKota={settings.kabupatenKota}
          isCloudConnected={isCloudConnected}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Global Toast Notification for Search/Alerts */}
        {searchNotification && (
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-3 print:hidden">
            <div className="p-3 bg-blue-50 border border-blue-300 text-blue-900 rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{searchNotification}</span>
              </div>
              <button
                onClick={() => setSearchNotification(null)}
                className="text-blue-500 hover:text-blue-700 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Top Quick Actions Banner & Stats (Rendered on Home / Selection pages) */}
          {currentPage === 'JENJANG_SELECTION' && (
            <PgriDashboardBanner
              lembagas={lembagas}
              settings={settings}
              onSelectLembaga={(lembagaId, jenjang) => {
                setSelectedJenjang(jenjang);
                setSelectedLembagaId(lembagaId);
                setCurrentPage('KONFIRMASI_ANGGOTA');
              }}
              onSelectJenjang={handleSelectJenjang}
            />
          )}

          {/* ========================================================================= */}
          {/* HALAMAN 1: PILIHAN JENJANG (Landing / Home) */}
          {/* ========================================================================= */}
          {currentPage === 'JENJANG_SELECTION' && (
            <JenjangCardsHome
              lembagas={lembagas}
              settings={settings}
              onSelectJenjang={handleSelectJenjang}
              onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
              isAdminAuthenticated={isAdminAuthenticated}
              onGoToAdmin={() => handleOpenAdmin(0)}
            />
          )}

          {/* ========================================================================= */}
          {/* HALAMAN 2: PILIHAN LEMBAGA SESUAI JENJANG */}
          {/* ========================================================================= */}
          {currentPage === 'LEMBAGA_SELECTION' && (
            <LembagaListView
              selectedJenjang={selectedJenjang}
              lembagas={lembagas}
              onSelectLembaga={handleSelectLembaga}
              onBackToJenjang={handleBackToJenjang}
              onAddNewLembaga={handleAddNewLembaga}
              namaCabang={settings.namaCabang}
            />
          )}

          {/* ========================================================================= */}
          {/* HALAMAN 3: TABEL KONFIRMASI ANGGOTA LEMBAGA */}
          {/* ========================================================================= */}
          {currentPage === 'KONFIRMASI_ANGGOTA' && currentLembaga && (
            <KonfirmasiTableView
              lembaga={currentLembaga}
              settings={settings}
              onBackToLembagaList={handleBackToLembagaList}
              onBackToJenjang={handleBackToJenjang}
              onUpdateMemberStatus={handleUpdateMemberStatus}
              onUpdateMemberKeterangan={handleUpdateMemberKeterangan}
              onDeleteMember={handleDeleteMember}
              onOpenAddMember={() => {
                setEditingMember(null);
                setIsMemberModalOpen(true);
              }}
              onOpenEditMember={(member) => {
                setEditingMember(member);
                setIsMemberModalOpen(true);
              }}
              onBulkSetStatus={handleBulkSetStatus}
              onValidateLembaga={handleValidateLembaga}
              onUnlockLembaga={handleUnlockLembaga}
              validatorName={settings.namaVerifikator}
            />
          )}

          {/* ========================================================================= */}
          {/* HALAMAN 4: FITUR ADMIN (Pengaturan, Rekapitulasi, Export PDF, Impor Excel) */}
          {/* ========================================================================= */}
          {currentPage === 'ADMIN_DASHBOARD' && (
            <AdminDashboardView
              lembagas={lembagas}
              settings={settings}
              initialTab={adminInitialTab}
              onSaveSettings={handleSaveSettings}
              onResetData={handleResetData}
              onImportNewMembers={handleImportNewMembers}
              onImportPrintedMembers={(_count, updatedLembagas) => handleImportNewMembers(updatedLembagas)}
              onNavigateToLembaga={handleNavigateToLembagaFromRekap}
              onLogout={handleLogout}
              onBackToHome={handleBackToJenjang}
            />
          )}
        </main>

        {/* Global Minimal Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 text-center print:hidden mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              &copy; 2024-2026 <strong>Persatuan Guru Republik Indonesia (PGRI)</strong> &bull; {settings.namaCabang}, {settings.kabupatenKota}
            </p>
            <p className="text-slate-400">
              Sistem Layanan Konfirmasi & Pencetakan Kartu Tanda Anggota (KTA) Digital PGRI &bull; Database Cloud Firestore Terhubung
            </p>
          </div>
        </footer>
      </div>

      {/* Admin Login Modal (user: admin, password: 1234) */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Member Add/Edit Modal */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        editMember={editingMember}
        lembagaName={currentLembaga?.nama || 'Lembaga'}
      />

      {/* Quick Add School Modal from Sidebar / Menu Aplikasi */}
      {isAddSchoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#4e92a2]" />
                <h3 className="font-bold text-base text-slate-800">
                  Tambah Lembaga / Sekolah Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddSchoolModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddSchoolModal} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jenjang Pendidikan *
                </label>
                <select
                  value={newSchoolJenjang}
                  onChange={(e) => setNewSchoolJenjang(e.target.value as Jenjang)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-[#4e92a2] focus:outline-none"
                >
                  <option value="PAUD">PAUD</option>
                  <option value="TK">TK / RA</option>
                  <option value="SD">SD / MI</option>
                  <option value="SMP/MTs">SMP / MTs</option>
                  <option value="SMA/SMK">SMA / SMK / MA</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lembaga / Unit Kerja *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SD Negeri 1 Ngawi"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-[#4e92a2] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kecamatan / Ranting
                </label>
                <input
                  type="text"
                  placeholder={`Contoh: ${settings.namaCabang.replace(/cabang\s*/i, '').trim() || 'Ngawi'}`}
                  value={newSchoolKecamatan}
                  onChange={(e) => setNewSchoolKecamatan(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-[#4e92a2] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSchoolModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4e92a2] hover:bg-[#3f7e8c] text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Simpan Lembaga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
