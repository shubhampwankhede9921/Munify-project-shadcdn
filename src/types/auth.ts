/**
 * Authentication Types
 */

/**
 * Login API Response Structure
 */
export interface LoginResponse {
  authData: {
    access_token: string
    mfa?: boolean
    [key: string]: any
  }
  [key: string]: any
}

