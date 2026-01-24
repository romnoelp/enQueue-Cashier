"use client";

import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "@/lib/config/firebase";
import axios, { isAxiosError } from "axios";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken(); 

    await axios.get(`${process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL}/auth/me`, {
        headers:{
            Authorization: `Bearer ${idToken}`
        }
    });


  } catch (error) {
    
    if (isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        await signOut(auth);
      } else {
        console.error("/auth/me error:", error.response?.data ?? error.message);
      }
    } else {
      console.error("Sign in error:", error);
    }
  }
}