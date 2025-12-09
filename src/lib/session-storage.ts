/**
 * Session Storage Utility
 * Centralized management for session storage operations.
 * Uses sessionStorage for security (data cleared on browser close).
 */

const TOKEN_KEY = 'munify_auth_token'
const USER_KEY = 'munify_user'

export type StoredUser = any

export const tokenStorage = {
  set: (token: string): void => {
    try {
      sessionStorage.setItem(TOKEN_KEY, token)
    } catch (error) {
      console.error('Failed to store token:', error)
      throw new Error('Failed to store authentication token')
    }
  },

  get: (): string | null => {
    try {
      return sessionStorage.getItem(TOKEN_KEY)
    } catch (error) {
      console.error('Failed to retrieve token:', error)
      return null
    }
  },

  remove: (): void => {
    try {
      sessionStorage.removeItem(TOKEN_KEY)
    } catch (error) {
      console.error('Failed to remove token:', error)
    }
  },

  exists: (): boolean => {
    return tokenStorage.get() !== null
  },
}

export const userStorage = {
  set: (user: StoredUser): void => {
    try {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    } catch (error) {
      console.error('Failed to store user data:', error)
      throw new Error('Failed to store user data')
    }
  },

  get: (): StoredUser | null => {
    try {
      const userStr = sessionStorage.getItem(USER_KEY)
      if (!userStr) return null
      return JSON.parse(userStr)
    } catch (error) {
      console.error('Failed to retrieve user data:', error)
      return null
    }
  },

  remove: (): void => {
    try {
      sessionStorage.removeItem(USER_KEY)
    } catch (error) {
      console.error('Failed to remove user data:', error)
    }
  },

  exists: (): boolean => {
    return userStorage.get() !== null
  },
}

export const clearAuthData = (): void => {
  tokenStorage.remove()
  userStorage.remove()
}

export const isAuthenticated = (): boolean => {
  return tokenStorage.exists() && userStorage.exists()
}

