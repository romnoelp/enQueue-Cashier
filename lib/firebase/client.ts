import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";

let app: FirebaseApp | undefined;

export const getFirebaseApp = (): FirebaseApp => {
  if (app) return app;

  if (!getApps().length) {
    app = initializeApp({
      apiKey: process.env.NEXT_PUBLIC_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_APP_ID,
    });
  } else {
    app = getApps()[0]!;
  }

  return app;
};

export const getFirebaseAuth = (): Auth => getAuth(getFirebaseApp());

export const signInToFirebaseWithCustomToken = async (
  auth: Auth,
  customToken: string
): Promise<User> => {
  const credential = await signInWithCustomToken(auth, customToken);
  return credential.user;
};

export { onAuthStateChanged, signOut };
