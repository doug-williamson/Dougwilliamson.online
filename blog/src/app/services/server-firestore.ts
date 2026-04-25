/**
 * Server-side Firestore singleton using firebase-admin.
 *
 * FolioKit's client services inject the firebase-js-sdk Firestore, which is
 * null on the server. These helpers + the Server* service classes (below)
 * override the FolioKit service tokens on the platform=server platform so
 * SSR resolvers can read Firestore via the Admin SDK.
 *
 * Emulator detection: when environment.useEmulator is true, set
 * FIRESTORE_EMULATOR_HOST *before* getFirestore() is called. The Admin SDK
 * reads that env var lazily on first use.
 */
import { cert, getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { environment } from '../../environments/environment';

export const SITE_ID = 'dougwilliamson';

let firestore: Firestore | null = null;

export function getAdminFirestore(): Firestore {
  if (firestore) return firestore;

  if (environment.useEmulator && !process.env['FIRESTORE_EMULATOR_HOST']) {
    process.env['FIRESTORE_EMULATOR_HOST'] = '127.0.0.1:8080';
  }

  if (getApps().length === 0) {
    if (environment.useEmulator) {
      // Emulator accepts any credentials — skip ADC lookup entirely.
      initializeApp({ projectId: environment.firebaseConfig.projectId });
    } else if (process.env['GOOGLE_APPLICATION_CREDENTIALS']) {
      initializeApp({ credential: applicationDefault(), projectId: environment.firebaseConfig.projectId });
    } else {
      // App Hosting injects default service account at runtime.
      initializeApp({ projectId: environment.firebaseConfig.projectId });
    }
  }

  firestore = getFirestore();
  return firestore;
}

export function collectionPath(name: string): string {
  return `tenants/${SITE_ID}/${name}`;
}

export function siteConfigDocPath(): string {
  return `tenants/${SITE_ID}/site-config/${SITE_ID}`;
}

// Silence unused import warning when not using cert path.
void cert;
