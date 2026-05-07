// Centralized API configuration
// In Docker, set VITE_API_URL to point to the backend service
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
