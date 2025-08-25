// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  
  // API Endpoints
  ENDPOINTS: {
    EXTRACT: '/extract',
    SOCIAL_PROOF: '/social-proof',
    FEEDBACK_ACCURACY: '/feedback/accuracy'
  }
}

// Helper function to build full API URL
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function for API requests with proper headers
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = getApiUrl(endpoint)
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }
  
  return fetch(url, defaultOptions)
}