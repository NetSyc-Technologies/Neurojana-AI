import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export function getDatabase() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin credentials are not configured.');
  }
  const normalizedKey = privateKey.replace(/^['"]|['"]$/g, '').replace(/\\n/g, '\n');
  const app = getApps()[0] || initializeApp({
    credential: cert({ projectId, clientEmail, privateKey: normalizedKey }),
  });
  return getFirestore(app);
}
