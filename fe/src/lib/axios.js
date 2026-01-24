import axios from "axios";
import { supabase } from "./supabase";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    console.log(`Making request to: ${config.baseURL}${config.url}`, config);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
      console.log("Attached token to request");
    } else {
      console.warn("No access token found in session");
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error("API Error Link:", error.config?.url);
    console.error("API Error Details:", error);
    if (error.response) {
      console.error("Error Status:", error.response.status);
      console.error("Error Data:", error.response.data);
    } else if (error.request) {
      console.error(
        "No response received (Network Error likely)",
        error.request,
      );
    } else {
      console.error("Error setting up request", error.message);
    }

    if (error.response?.status === 401) {
      console.warn("Unauthorized, signing out...");
      supabase.auth.signOut();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
