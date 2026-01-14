import React from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRoles, getUserRoleId, getUserRoleName, hasRole, hasAnyRole, hasAllRoles } from '@/services/roleService'

/**
 * Custom hook for role-based validation
 * Provides easy access to role checking functions
 * 
 * @example
 * ```tsx
 * const { userRoleName, hasRole: checkRole, isLoading } = useRoleValidation()
 * 
 * if (checkRole('Admin')) {
 *   // Show admin-only content
 * }
 * ```
 */
export function useRoleValidation() {
  const { user } = useAuth()
  const { data: roles = [], isLoading, error } = useRoles()

  const userRoleId = getUserRoleId(user)
  const userRoleName = getUserRoleName(user, roles)

  /**
   * Check if current user has a specific role
   */
  const checkRole = (roleName: string): boolean => {
    return hasRole(userRoleId, roleName, roles)
  }

  /**
   * Check if current user has any of the specified roles
   */
  const checkAnyRole = (roleNames: string[]): boolean => {
    return hasAnyRole(userRoleId, roleNames, roles)
  }

  /**
   * Check if current user has all of the specified roles
   */
  const checkAllRoles = (roleNames: string[]): boolean => {
    return hasAllRoles(userRoleId, roleNames, roles)
  }

  return {
    // User role info
    userRoleId,
    userRoleName,
    roles,
    
    // Validation functions
    hasRole: checkRole,
    hasAnyRole: checkAnyRole,
    hasAllRoles: checkAllRoles,
    
    // Loading/error states
    isLoading,
    error,
  }
}

/**
 * Higher-order component for role-based component rendering
 * 
 * @example
 * ```tsx
 * <RoleGuard role="Admin">
 *   <AdminOnlyComponent />
 * </RoleGuard>
 * ```
 */
export interface RoleGuardProps {
  role?: string
  roles?: string[]
  requireAll?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function RoleGuard({ role, roles, requireAll = false, fallback = null, children }: RoleGuardProps) {
  const { hasRole, hasAnyRole, hasAllRoles } = useRoleValidation()

  let hasAccess = false

  if (role) {
    hasAccess = hasRole(role)
  } else if (roles && roles.length > 0) {
    hasAccess = requireAll ? hasAllRoles(roles) : hasAnyRole(roles)
  } else {
    // No role specified, allow access
    hasAccess = true
  }

  if (hasAccess) {
    return children
  }
  return fallback
}
