import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export const getAdminAuth = () => {
  if (!getApps().length) {
    const projectId = process.env.AUTH_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.AUTH_FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.AUTH_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Missing Firebase Admin env vars. Set AUTH_FIREBASE_PROJECT_ID, AUTH_FIREBASE_CLIENT_EMAIL, AUTH_FIREBASE_PRIVATE_KEY."
      );
    }

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  return getAuth();
};
