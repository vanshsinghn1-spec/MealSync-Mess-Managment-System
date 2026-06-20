import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    let token = localStorage.getItem("mealsync-token");
    if (!token) {
      const session = await getSession();
      const accessToken = (session?.user as any)?.accessToken;
      if (accessToken) {
        token = accessToken;
        localStorage.setItem("mealsync-token", accessToken);
      }
    }
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

