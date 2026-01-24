import axios from "axios"
import { auth } from "@/lib/config/firebase";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL
})

// Request interceptor to automatically add Authorization header with Firebase ID token
api.interceptors.request.use(
  async (config) => {
    if (typeof window === "undefined") return config;
    await auth.authStateReady();
    const user = auth.currentUser
    if (user != null) {
      try {
        const idToken = await user.getIdToken()
        config.headers.Authorization = `Bearer ${idToken}`
      } catch (error) {
        console.error("Failed to get ID token:", error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export {api}