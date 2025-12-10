import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { tokenStorage, userStorage, clearAuthData } from '@/lib/session-storage'
import { getUserAccount } from '@/services/auth'
import { alerts } from '@/lib/alerts'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: any | null
  token: string | null
  login: (token: string, userData: any) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = tokenStorage.get()
        const storedUser = userStorage.get()

        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(storedUser)
          setIsAuthenticated(true)
        } else if (storedToken && !storedUser) {
          // Token exists but user data is missing - cannot fetch without username
          // Clear token and require re-login
          clearAuthData()
          setIsAuthenticated(false)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        clearAuthData()
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = (newToken: string, userData: any) => {
    try {
      tokenStorage.set(newToken)
      userStorage.set(userData)
      setToken(newToken)
      setUser(userData)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Failed to login:', error)
      alerts.error('Login Error', 'Failed to store authentication data')
    }
  }

  const logout = () => {
    clearAuthData()
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  const refreshUser = async () => {
    const currentToken = tokenStorage.get()
    const currentUser = userStorage.get()
    
    if (!currentToken || !currentUser) {
      logout()
      return
    }

    // Extract username from stored user data
    // User data might have: userId, username, login, or user_id fields
    const username = currentUser?.userId || currentUser?.username || currentUser?.login || currentUser?.user_id
    
    if (!username) {
      console.error('Cannot refresh user: username not found in user data')
      logout()
      return
    }

    try {
      const userData = await getUserAccount(currentToken, username)
      userStorage.set(userData)
      setUser(userData)
    } catch (error: any) {
      console.error('Failed to refresh user data:', error)
      logout()
      alerts.error('Session Expired', 'Please login again')
    }
  }

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    token,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

