import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  getDoc,
} from 'firebase/firestore';
import { Lembaga, AppSettings } from '../types';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if specified
export const db = firebaseConfigJson.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

const LEMBAGAS_COLLECTION = 'lembagas';
const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'app_config';

/**
 * Real-time listener for lembagas collection
 */
export function subscribeToLembagas(
  onData: (lembagas: Lembaga[]) => void,
  onError?: (error: Error) => void
) {
  const colRef = collection(db, LEMBAGAS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const lembagas: Lembaga[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Lembaga;
        lembagas.push({
          ...data,
          id: docSnap.id,
          anggota: data.anggota || [],
        });
      });
      onData(lembagas);
    },
    (err) => {
      console.error('Firestore lembagas subscribe error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Real-time listener for app settings
 */
export function subscribeToSettings(
  onData: (settings: AppSettings) => void,
  onError?: (error: Error) => void
) {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onData(docSnap.data() as AppSettings);
      }
    },
    (err) => {
      console.error('Firestore settings subscribe error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save / Update a single Lembaga document
 */
export async function saveLembagaToCloud(lembaga: Lembaga) {
  const docRef = doc(db, LEMBAGAS_COLLECTION, lembaga.id);
  await setDoc(docRef, {
    ...lembaga,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

/**
 * Delete a single Lembaga document
 */
export async function deleteLembagaFromCloud(lembagaId: string) {
  const docRef = doc(db, LEMBAGAS_COLLECTION, lembagaId);
  await deleteDoc(docRef);
}

/**
 * Save AppSettings to Cloud
 */
export async function saveSettingsToCloud(settings: AppSettings) {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  await setDoc(docRef, {
    ...settings,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

/**
 * Sync entire list of lembagas (batch save/replace)
 */
export async function syncAllLembagasToCloud(lembagas: Lembaga[]) {
  const colRef = collection(db, LEMBAGAS_COLLECTION);
  const existingDocs = await getDocs(colRef);
  
  const batch = writeBatch(db);
  
  // Delete existing
  existingDocs.forEach((d) => {
    batch.delete(d.ref);
  });
  
  // Insert new
  for (const lem of lembagas) {
    const dRef = doc(db, LEMBAGAS_COLLECTION, lem.id);
    batch.set(dRef, {
      ...lem,
      updatedAt: new Date().toISOString(),
    });
  }
  
  await batch.commit();
}

/**
 * Seed initial data if database is empty on first boot
 */
export async function seedInitialDataIfEmpty(
  defaultLembagas: Lembaga[],
  defaultSettings: AppSettings
) {
  try {
    const colRef = collection(db, LEMBAGAS_COLLECTION);
    const snapshot = await getDocs(colRef);
    
    if (snapshot.empty && defaultLembagas.length > 0) {
      const batch = writeBatch(db);
      for (const lem of defaultLembagas) {
        const dRef = doc(db, LEMBAGAS_COLLECTION, lem.id);
        batch.set(dRef, {
          ...lem,
          updatedAt: new Date().toISOString(),
        });
      }
      await batch.commit();
    }

    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const settingsSnap = await getDoc(settingsRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsRef, {
        ...defaultSettings,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('Error seeding initial data to Firestore:', err);
  }
}
