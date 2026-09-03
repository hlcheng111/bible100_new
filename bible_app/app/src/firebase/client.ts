import { getFirebaseConfigFromEnv } from '@bible-app/core';

type FirebaseApp = import('firebase/app').FirebaseApp;
type Auth = import('firebase/auth').Auth;
type Firestore = import('firebase/firestore').Firestore;
type FirebaseStorage = import('firebase/storage').FirebaseStorage;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let initPromise: Promise<FirebaseApp | null> | null = null;

function readConfig() {
  return getFirebaseConfigFromEnv(process.env as Record<string, string | undefined>);
}

export function isFirebaseConfigured(): boolean {
  return readConfig() !== null;
}

async function ensureApp(): Promise<FirebaseApp | null> {
  if (app) return app;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const config = readConfig();
    if (!config) return null;
    const { initializeApp, getApps } = await import('firebase/app');
    app = getApps().length ? getApps()[0]! : initializeApp(config);
    return app;
  })();

  return initPromise;
}

export async function ensureFirebaseAuth(): Promise<Auth | null> {
  const firebaseApp = await ensureApp();
  if (!firebaseApp) return null;
  if (!auth) {
    const { getAuth } = await import('firebase/auth');
    auth = getAuth(firebaseApp);
  }
  return auth;
}

export async function ensureFirestoreDb(): Promise<Firestore | null> {
  const firebaseApp = await ensureApp();
  if (!firebaseApp) return null;
  if (!db) {
    const { getFirestore } = await import('firebase/firestore');
    db = getFirestore(firebaseApp);
  }
  return db;
}

export async function ensureFirebaseStorage(): Promise<FirebaseStorage | null> {
  const firebaseApp = await ensureApp();
  if (!firebaseApp) return null;
  if (!storage) {
    const { getStorage } = await import('firebase/storage');
    storage = getStorage(firebaseApp);
  }
  return storage;
}

/** Sync accessor — only valid after async init has completed. */
export function getFirebaseAuth(): Auth | null {
  return auth;
}

export function getFirestoreDb(): Firestore | null {
  return db;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  return storage;
}

export function getFirebaseApp(): FirebaseApp | null {
  return app;
}
