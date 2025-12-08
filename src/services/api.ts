import axios from "axios"
import { tokenStorage } from "@/lib/session-storage"
// Read env vars once at module load (Vite injects these at build time)
const { VITE_PERDIX_JWT } = import.meta.env as { VITE_PERDIX_JWT?: string }

// Base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor: Automatically attach JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get()
    if (token) {
      // Add Authorization header with JWT token
      // Format: "Authorization: JWT <token>" as per your API requirement
      config.headers.Authorization = `JWT ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor: Handle 401 Unauthorized (token expired/invalid)
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth data
      tokenStorage.remove()
      // Optionally redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Generic API functions
export const apiService = {
  // GET request
  get: async <T = any>(endpoint: string, params?: Record<string, any>) => {
    const response = await api.get<T>(endpoint, { params })
    return response.data
  },

  // POST request
  post: async <T = any>(endpoint: string, data?: any) => {
    const response = await api.post<T>(endpoint, data)
    return response.data
  },

  // PUT request
  put: async <T = any>(endpoint: string, data?: any) => {
    const response = await api.put<T>(endpoint, data)
    return response.data
  },

  // PATCH request
  patch: async <T = any>(endpoint: string, data?: any) => {
    const response = await api.patch<T>(endpoint, data)
    return response.data
  },

  // DELETE request
  delete: async <T = any>(endpoint: string) => {
    const response = await api.delete<T>(endpoint)
    return response.data
  },
}


// Perdix API specific service
export const perdixApiService = {
  // Create user with Perdix API
  createUser: async (userData: any) => {
    const perdixJwt = VITE_PERDIX_JWT?.trim()
    if (!perdixJwt) {
      throw new Error("Missing VITE_PERDIX_JWT. Please set it in your .env file.")
    }
    const response = await axios.post('https://uat-lp.perdix.co.in/perdix-server/api/users', userData, {
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        'authorization': `JWT ${perdixJwt}`,
        'content-type': 'application/json;charset=UTF-8',
        'origin': 'https://uat-lp.perdix.co.in',
        'page_uri': 'Page/Engine/user.UserMaintanence',
        'priority': 'u=1, i',
        'referer': 'https://uat-lp.perdix.co.in/perdix-client/',
        'sec-ch-ua': '"Not;A=Brand";v="99", "Microsoft Edge";v="139", "Chromium";v="139"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0'
      }
    })
    return response.data
  }
}

// Export the axios instance for custom calls that need direct access
export { api }

// Export the base API service for custom calls
export default apiService
