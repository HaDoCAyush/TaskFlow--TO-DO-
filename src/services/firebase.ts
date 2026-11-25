import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, signInAnonymously, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured. Follow FIREBASE_SETUP.md.");
  }

  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }

  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }

  return auth;
}

export function getCloudDatabase(): Firestore {
  if (!firestore) {
    firestore = getFirestore(getFirebaseApp());
  }

  return firestore;
}

export async function ensureAnonymousUser(): Promise<string> {
  const currentAuth = getFirebaseAuth();

  if (currentAuth.currentUser) {
    return currentAuth.currentUser.uid;
  }

  const result = await signInAnonymously(currentAuth);
  return result.user.uid;
}
