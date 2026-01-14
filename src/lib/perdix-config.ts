/**
 * Perdix API Configuration
 * 
 * Centralized configuration for Perdix API queries.
 * All values can be overridden via environment variables.
 */

// Read environment variables with defaults
const env = import.meta.env as {
  VITE_PERDIX_ORG_TYPES_BRANCH_ID?: string
  VITE_PERDIX_MUNICIPALITIES_BRANCH_ID?: string
  VITE_PERDIX_CHILD_BRANCH_IDENTIFIER?: string
  VITE_PERDIX_SKIP_RELOGIN?: string
  VITE_PERDIX_DEFAULT_LIMIT?: string
  VITE_PERDIX_DEFAULT_OFFSET?: string
}

/**
 * Perdix API Configuration
 */
export const perdixConfig = {
  // Branch IDs
  orgTypesBranchId: Number(env.VITE_PERDIX_ORG_TYPES_BRANCH_ID) || 999,
  municipalitiesBranchId: Number(env.VITE_PERDIX_MUNICIPALITIES_BRANCH_ID) || 101,

  // Query Configuration
  childBranchIdentifier: env.VITE_PERDIX_CHILD_BRANCH_IDENTIFIER || "childBranch.list",
  skipRelogin: env.VITE_PERDIX_SKIP_RELOGIN || "yes",
  defaultLimit: Number(env.VITE_PERDIX_DEFAULT_LIMIT) || 0,
  defaultOffset: Number(env.VITE_PERDIX_DEFAULT_OFFSET) || 0,
} as const

/**
 * Helper function to create a Perdix query payload
 */
export function createPerdixQuery(params: {
  parentBranchId?: number
  identifier?: string
  limit?: number
  offset?: number
  skipRelogin?: string
}): {
  identifier: string
  limit: number
  offset: number
  parameters: { parent_branch_id: number }
  skip_relogin: string
} {
  return {
    identifier: params.identifier || perdixConfig.childBranchIdentifier,
    limit: params.limit ?? perdixConfig.defaultLimit,
    offset: params.offset ?? perdixConfig.defaultOffset,
    parameters: {
      parent_branch_id: params.parentBranchId!,
    },
    skip_relogin: params.skipRelogin || perdixConfig.skipRelogin,
  }
}

/**
 * Pre-configured query builders for common use cases
 */
export const perdixQueries = {
  /**
   * Query for organization types (uses orgTypesBranchId)
   */
  organizationTypes: () =>
    createPerdixQuery({
      parentBranchId: perdixConfig.orgTypesBranchId,
    }),

  /**
   * Query for municipalities (uses municipalitiesBranchId)
   */
  municipalities: () =>
    createPerdixQuery({
      parentBranchId: perdixConfig.municipalitiesBranchId,
    }),

  /**
   * Query for child branches by parent branch ID
   */
  childBranches: (parentBranchId: number) =>
    createPerdixQuery({
      parentBranchId,
    }),
}
