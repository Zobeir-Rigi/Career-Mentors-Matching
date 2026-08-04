const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error("VITE_API_URL not configured");
}

export const API_URL = apiUrl;
