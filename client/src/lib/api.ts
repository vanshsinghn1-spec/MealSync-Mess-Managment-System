import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
// Optimized: check localStorage synchronously first, only call getSession() once as fallback
let sessionCheckPromise: Promise<string | null> | null = null;

api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    // Fast path: token already in localStorage
    const cachedToken = localStorage.getItem("mealsync-token");
    if (cachedToken) {
      config.headers.Authorization = `Bearer ${cachedToken}`;
      return config;
    }

    // Slow path: fetch session once and cache the token
    // Use a shared promise to avoid multiple concurrent getSession() calls
    if (!sessionCheckPromise) {
      sessionCheckPromise = getSession().then((session) => {
        const accessToken = (session?.user as any)?.accessToken;
        if (accessToken) {
          localStorage.setItem("mealsync-token", accessToken);
          return accessToken as string;
        }
        return null;
      }).finally(() => {
        // Allow retry after 30 seconds if the first attempt found no token
        setTimeout(() => { sessionCheckPromise = null; }, 30000);
      });
    }

    const token = await sessionCheckPromise;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});


// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("mealsync-token");
      signOut({ callbackUrl: "/login" });
    }
    return Promise.reject(error);
  }
);

export default api;

