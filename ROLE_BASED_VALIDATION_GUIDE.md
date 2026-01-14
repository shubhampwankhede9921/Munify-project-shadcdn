# Role-Based Validation Implementation Guide

## Overview

This guide explains how to implement role-based validation in the frontend using role **names** instead of hardcoded role IDs. This approach ensures your application works across different environments where role IDs may differ.

## Architecture

### Key Components

1. **`src/services/roleService.ts`** - Centralized role service
   - Fetches roles from `/master/roles` API
   - Provides utility functions for role validation
   - Caches roles using React Query

2. **`src/hooks/useRoleValidation.ts`** - Custom React hook
   - Easy-to-use hook for role checking in components
   - Provides `RoleGuard` component for conditional rendering

## API Response Format

The `/master/roles` API returns roles in this format:

```json
[
  {
    "id": 145,
    "name": "Admin"
  },
  {
    "id": 146,
    "name": "Normal User"
  },
  {
    "id": 147,
    "name": "Super Admin"
  },
  {
    "id": 148,
    "name": "Government User"
  }
]
```

## Usage Examples

### 1. Basic Role Checking in Components

```tsx
import { useRoleValidation } from '@/hooks/useRoleValidation'

function MyComponent() {
  const { userRoleName, hasRole, isLoading } = useRoleValidation()

  if (isLoading) {
    return <div>Loading...</div>
  }

  // Check if user is Admin
  if (hasRole('Admin')) {
    return <div>Admin-only content</div>
  }

  // Or check multiple roles
  if (hasRole('Admin') || hasRole('Super Admin')) {
    return <div>Admin or Super Admin content</div>
  }

  return <div>Regular content</div>
}
```

### 2. Conditional Button Rendering

```tsx
import { useRoleValidation } from '@/hooks/useRoleValidation'
import { Button } from '@/components/ui/button'

function ProjectActions() {
  const { hasRole } = useRoleValidation()

  return (
    <div>
      <Button>View Project</Button>
      
      {/* Only show delete button for Admin */}
      {hasRole('Admin') && (
        <Button variant="destructive">Delete Project</Button>
      )}

      {/* Show edit button for Admin or Super Admin */}
      {(hasRole('Admin') || hasRole('Super Admin')) && (
        <Button>Edit Project</Button>
      )}
    </div>
  )
}
```

### 3. Using RoleGuard Component

```tsx
import { RoleGuard } from '@/hooks/useRoleValidation'

function AdminPanel() {
  return (
    <div>
      <h1>Admin Panel</h1>
      
      {/* Show content only for Admin */}
      <RoleGuard role="Admin">
        <AdminSettings />
      </RoleGuard>

      {/* Show content for multiple roles (any of them) */}
      <RoleGuard roles={['Admin', 'Super Admin']}>
        <AdvancedSettings />
      </RoleGuard>

      {/* Show content only if user has ALL roles */}
      <RoleGuard roles={['Admin', 'Super Admin']} requireAll>
        <SuperAdminOnly />
      </RoleGuard>

      {/* Show fallback if user doesn't have access */}
      <RoleGuard role="Admin" fallback={<div>Access Denied</div>}>
        <AdminContent />
      </RoleGuard>
    </div>
  )
}
```

### 4. Using hasAnyRole and hasAllRoles

```tsx
import { useRoleValidation } from '@/hooks/useRoleValidation'

function Dashboard() {
  const { hasAnyRole, hasAllRoles } = useRoleValidation()

  // Check if user has any of these roles
  const canViewReports = hasAnyRole(['Admin', 'Super Admin', 'Government User'])

  // Check if user has all of these roles (less common)
  const isSuperAdmin = hasAllRoles(['Admin', 'Super Admin'])

  return (
    <div>
      {canViewReports && <ReportsSection />}
      {isSuperAdmin && <SuperAdminSection />}
    </div>
  )
}
```

### 5. Direct Service Usage (Advanced)

```tsx
import { useRoles, getUserRoleId, hasRole } from '@/services/roleService'
import { useAuth } from '@/contexts/auth-context'

function CustomComponent() {
  const { user } = useAuth()
  const { data: roles = [] } = useRoles()
  
  const userRoleId = getUserRoleId(user)
  const canAccess = hasRole(userRoleId, 'Admin', roles)

  return canAccess ? <AdminContent /> : <RegularContent />
}
```

### 6. Route Protection Example

```tsx
import { useRoleValidation } from '@/hooks/useRoleValidation'
import { Navigate } from 'react-router-dom'

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { hasRole, isLoading } = useRoleValidation()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!hasRole('Admin')) {
    return <Navigate to="/main" replace />
  }

  return <>{children}</>
}
```

## Available Functions

### From `useRoleValidation` Hook

- **`userRoleId`** - Current user's role ID (number | null)
- **`userRoleName`** - Current user's role name (string | null)
- **`roles`** - Array of all available roles
- **`hasRole(roleName: string)`** - Check if user has specific role
- **`hasAnyRole(roleNames: string[])`** - Check if user has any of the roles
- **`hasAllRoles(roleNames: string[])`** - Check if user has all roles
- **`isLoading`** - Loading state
- **`error`** - Error state

### From `roleService.ts`

- **`useRoles()`** - React Query hook to fetch roles
- **`getRoleName(roleId, roles)`** - Get role name from role ID
- **`hasRole(roleId, roleName, roles)`** - Check role by ID and name
- **`hasAnyRole(roleId, roleNames, roles)`** - Check any role
- **`hasAllRoles(roleId, roleNames, roles)`** - Check all roles
- **`getUserRoleId(user)`** - Extract role ID from user object
- **`getUserRoleName(user, roles)`** - Get user's role name

## Role Name Matching

Role names are compared **case-insensitively** and trimmed. Examples:

- `hasRole('Admin')` matches: "Admin", "admin", "ADMIN", " Admin "
- `hasRole('Super Admin')` matches: "Super Admin", "super admin", "SUPER ADMIN"

## Caching

Roles are automatically cached using React Query:
- **Stale time**: 5 minutes
- **Cache time**: 10 minutes
- Roles are shared across all components using `useRoles()`

## Migration from Hardcoded Role IDs

### Before (Hardcoded Role ID)

```tsx
// ❌ Bad: Hardcoded role ID
const userRoleId = user?.data?.userRoles?.[0]?.roleId
if (userRoleId === 145) {
  // Show admin content
}
```

### After (Role Name Based)

```tsx
// ✅ Good: Role name based
const { hasRole } = useRoleValidation()
if (hasRole('Admin')) {
  // Show admin content
}
```

## Best Practices

1. **Always use role names** - Never hardcode role IDs
2. **Use the hook** - Prefer `useRoleValidation()` over direct service calls
3. **Handle loading states** - Always check `isLoading` before using role checks
4. **Use RoleGuard** - For conditional rendering, prefer `RoleGuard` component
5. **Case-insensitive** - Role names are compared case-insensitively
6. **Cache is automatic** - Don't manually fetch roles, use the hook

## Common Role Names

Based on your API response, common role names are:
- `"Admin"`
- `"Normal User"`
- `"Super Admin"`
- `"Government User"`

**Note**: Always check your actual API response to confirm role names.

## Troubleshooting

### Roles not loading?
- Check if user is authenticated
- Verify `/master/roles` API endpoint is accessible
- Check browser console for errors

### Role check always returns false?
- Verify role name matches exactly (case-insensitive)
- Check if `userRoleId` is being extracted correctly
- Ensure roles array is populated before checking

### Performance concerns?
- Roles are cached automatically
- Multiple components using `useRoleValidation` share the same cache
- No need to manually optimize
