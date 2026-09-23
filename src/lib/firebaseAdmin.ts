import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';

let isInitialized = false;

export function getFirebaseAdminApp(): App | null {
  const existingApps = admin.getApps ? admin.getApps() : [];
  if (isInitialized && existingApps.length > 0) {
    return existingApps[0] as unknown as App;
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
      const app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      isInitialized = true;
      return app as unknown as App;
    }
    isInitialized = true;
    return existingApps[0] as unknown as App;
  } catch (error) {
    console.warn('[FirebaseAdmin] Failed to initialize Firebase Admin SDK:', error);
    return null;
  }
}

export function getFirestoreDb(): Firestore | null {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  try {
    return admin.firestore(app as any) as unknown as Firestore;
  } catch (err) {
    console.warn('[FirebaseAdmin] Could not get Firestore instance:', err);
    return null;
  }
}
