import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';

// Authorized Google-only Admin Allowlist (Exact case-normalized emails)
export const AUTHORIZED_ADMIN_EMAILS = [
  'admin@neurojanaai.com',
  'admin@netsyc.com',
];

// Safe environment variable accessor compatible with Vite browser builds and Node test runners
const safeEnv = (typeof import.meta !== 'undefined' && import.meta && import.meta.env)
  ? import.meta.env
  : (typeof process !== 'undefined' && process && process.env ? process.env : {});

// Browser-safe Firebase Configuration from Vite environment variables
const firebaseConfig = {
  apiKey: safeEnv.VITE_FIREBASE_API_KEY || 'AIzaSyByaf2n_XOBhwv5FVZsaHaJ_0GP3IMAXx4',
  authDomain: safeEnv.VITE_FIREBASE_AUTH_DOMAIN || 'neurojna-ai-web.firebaseapp.com',
  projectId: safeEnv.VITE_FIREBASE_PROJECT_ID || 'neurojna-ai-web',
  storageBucket: safeEnv.VITE_FIREBASE_STORAGE_BUCKET || 'neurojna-ai-web.firebasestorage.app',
  messagingSenderId: safeEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '926291662952',
  appId: safeEnv.VITE_FIREBASE_APP_ID || '1:926291662952:web:1d340e89d817c03fa4c3dd',
  measurementId: safeEnv.VITE_FIREBASE_MEASUREMENT_ID || 'G-T5VSMBRS75',
};

// Initialize Firebase App safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Check if the given user is an authorized admin
 * @param {import('firebase/auth').User | null} user
 * @returns {boolean}
 */
export function isAuthorizedAdmin(user) {
  if (!user || !user.email) return false;
  const normalized = user.email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.includes(normalized);
}

export {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
};
