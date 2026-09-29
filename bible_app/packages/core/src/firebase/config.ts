export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function getFirebaseConfigFromEnv(env: Record<string, string | undefined>): FirebaseConfig | null {
  const apiKey = env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const projectId = env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) return null;
  return {
    apiKey,
    authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
    messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  };
}

export const FIRESTORE_COLLECTIONS = {
  users: 'users',
  churches: 'churches',
  groupSessions: 'groupSessions',
  aiAssets: 'aiAssets',
} as const;
