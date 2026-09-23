import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let isInitialized = false;

export function getFirebaseAdminApp(): App | null {
  const existingApps = getApps();
  if (isInitialized && existingApps.length > 0) {
    return existingApps[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Handle escaped newlines from environment variable strings
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (!projectId || !clientEmail || !privateKey) {
    // Graceful warning: credentials not yet provided in .env
    return null;
  }

  try {
    if (existingApps.length === 0) {
      const app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      isInitialized = true;
      return app;
    }
    isInitialized = true;
    return existingApps[0]!;
  } catch (error) {
    console.warn('[FirebaseAdmin] Failed to initialize Firebase Admin SDK:', error);
    return null;
  }
}

export function getFirestoreDb(): Firestore | null {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  try {
    return getFirestore(app);
  } catch (err) {
    console.warn('[FirebaseAdmin] Could not get Firestore instance:', err);
    return null;
  }
}
