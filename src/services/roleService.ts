import apiService from './api'
import { useQuery } from '@tanstack/react-query'

/**
 * Role Service
 * Centralized service for managing roles and role-based validation
 */

export interface Role {
  id: number
  name: string
  accessLevel?: number
}

/**
 * Fetch all roles from the API
 * Uses React Query for caching and automatic refetching
 */
export function useRoles() {
  return useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const rolesData = await apiService.get<Role[]>('/master/roles')
      return rolesData || []
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
}

/**
 * Get role name from roleId
 * @param roleId - The role ID to look up
 * @param roles - Array of roles (from useRoles hook)
 * @returns Role name or null if not found
 */
export function getRoleName(roleId: number | string | null | undefined, roles: Role[]): string | null {
  if (!roleId || !roles || roles.length === 0) {
    return null
  }

  const roleIdNum = typeof roleId === 'string' ? Number(roleId) : roleId
  const role = roles.find((r) => r.id === roleIdNum)
  return role?.name || null
}

/**
 * Check if user has a specific role by name
 * @param roleId - User's role ID
 * @param roleName - Role name to check (case-insensitive)
 * @param roles - Array of roles (from useRoles hook)
 * @returns true if user has the role, false otherwise
 */
export function hasRole(
  roleId: number | string | null | undefined,
  roleName: string,
  roles: Role[]
): boolean {
  const userRoleName = getRoleName(roleId, roles)
  if (!userRoleName) {
    return false
  }
  
  // Case-insensitive comparison
  return userRoleName.toLowerCase().trim() === roleName.toLowerCase().trim()
}

/**
 * Check if user has any of the specified roles
 * @param roleId - User's role ID
 * @param roleNames - Array of role names to check
 * @param roles - Array of roles (from useRoles hook)
 * @returns true if user has any of the roles, false otherwise
 */
export function hasAnyRole(
  roleId: number | string | null | undefined,
  roleNames: string[],
  roles: Role[]
): boolean {
  return roleNames.some((roleName) => hasRole(roleId, roleName, roles))
}

/**
 * Check if user has all of the specified roles
 * @param roleId - User's role ID
 * @param roleNames - Array of role names to check
 * @param roles - Array of roles (from useRoles hook)
 * @returns true if user has all of the roles, false otherwise
 */
export function hasAllRoles(
  roleId: number | string | null | undefined,
  roleNames: string[],
  roles: Role[]
): boolean {
  return roleNames.every((roleName) => hasRole(roleId, roleName, roles))
}

/**
 * Get user's role ID from auth context
 * @param user - User object from useAuth hook
 * @returns Role ID or null
 */
export function getUserRoleId(user: any): number | null {
  if (!user) {
    return null
  }

  const userData = user?.data || user

  // Try multiple possible paths for roleId
  const roleId =
    userData?.userRoles?.[0]?.roleId ||
    userData?.roleId ||
    userData?.role_id ||
    userData?.userRole ||
    null

  return roleId ? Number(roleId) : null
}

/**
 * Get user's role name from auth context
 * @param user - User object from useAuth hook
 * @param roles - Array of roles (from useRoles hook)
 * @returns Role name or null
 */
export function getUserRoleName(user: any, roles: Role[]): string | null {
  const roleId = getUserRoleId(user)
  return getRoleName(roleId, roles)
}
