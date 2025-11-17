import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DataTable, type ColumnDef } from '@/components/data-table/data-table'
import type { PaginationState } from '@tanstack/react-table'
import apiService from '@/services/api'
import { alerts } from '@/lib/alerts'

interface User {
  id: number
  version: number
  login: string
  password: string | null
  userName: string
  changePasswordOnLogin: boolean
  firstName: string | null
  lastName: string | null
  email: string
  langKey: string
  roleCode: string
  activated: boolean
  roles: string | null
  branchSetCode: string | null
  bankName: string
  branchName: string
  agentAmtLimit: number | null
  imeiNumber: string
  branchId: number
  branchCode: string | null
  userState: string
  activeBranch: string
  activeBranchId: number
  userType: string
  mobileNumber: string
  landlineNumber: string | null
  validUntil: string
  lastPasswordUpdatedOn: string
  accessType: string
  customerId: number | null
  villageName: string | null
  editCheckerAccess: boolean
  agentAllVillageAccess: boolean
  urnNo: string | null
  agentId: number | null
  employeeId: number | null
  mobileNumber2: string | null
  userRoles: any[]
  userBranches: any[]
  partnerCode: string | null
  otp: string | null
  otpPurpose: string | null
  allowedDevices: any | null
  userAccountLockStatus: string | null
  accountLockedAt: string | null
  accountLockReason: string | null
  imeiOverrideRequired: boolean
  mfaToken: string | null
  mfaTokenExpired: boolean | null
  mfaRequired: boolean
  photoImageId: number | null
  externalSystemCode: string | null
  apiUser: boolean
  hsmUserId: string | null
}

interface UsersApiResponse {
  status: string
  message: string
  data: User[]
}

export default function AdminUsers() {
  const [branchName] = useState('Head Office')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Query for users with server-side pagination
  const { data, isLoading, error, isError } = useQuery<UsersApiResponse>({
    queryKey: ['users', branchName, pagination.pageIndex + 1, pagination.pageSize],
    queryFn: async () => {
      try {
        return await apiService.get<UsersApiResponse>('/users/perdix', {
          branch_name: branchName,
          page: pagination.pageIndex + 1, // Server uses 1-indexed pages
          per_page: pagination.pageSize,
        })
      } catch (err: any) {
        // Extract error message
        let errorMessage = 'Failed to fetch users. Please try again.'
        const status = err?.response?.status
        const errorData = err?.response?.data
        
        if (status === 503) {
          // 503 Service Temporarily Unavailable
          errorMessage = 'Service temporarily unavailable. The server is down or overloaded. Please try again later.'
        } else if (status === 422) {
          // 422 Unprocessable Entity - validation error
          if (errorData?.message) {
            // Check if message contains HTML and extract text
            const message = errorData.message
            if (message.includes('<html>') || message.includes('<title>')) {
              // Extract title from HTML
              const titleMatch = message.match(/<title>(.*?)<\/title>/i)
              errorMessage = titleMatch ? titleMatch[1] : 'Validation error occurred'
            } else {
              errorMessage = message
            }
          } else if (errorData?.detail) {
            errorMessage = Array.isArray(errorData.detail) 
              ? errorData.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ')
              : String(errorData.detail)
          } else if (errorData?.error) {
            errorMessage = errorData.error
          } else {
            errorMessage = 'Validation error occurred'
          }
        } else if (errorData?.message) {
          // Check if message contains HTML
          const message = errorData.message
          if (message.includes('<html>') || message.includes('<title>')) {
            const titleMatch = message.match(/<title>(.*?)<\/title>/i)
            errorMessage = titleMatch ? titleMatch[1] : 'Server error occurred'
          } else {
            errorMessage = message
          }
        } else if (err?.message) {
          errorMessage = err.message
        }
        
        // Only show alert once, not on every retry attempt
        // TanStack Query will handle retries automatically
        alerts.error('Error', errorMessage)
        
        throw err
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 503 errors to avoid hammering a down server
      if (error?.response?.status === 503) {
        return false
      }
      // Retry up to 2 times for other errors
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  const users = (data as UsersApiResponse)?.data || []

  // Determine if there's a next page (if current page has full pageSize results, there might be more)
  const hasNextPage = users.length === pagination.pageSize
  const pageCount = hasNextPage ? pagination.pageIndex + 2 : pagination.pageIndex + 1

  const getUserStateBadgeVariant = (state: string) => {
    if (state === 'ACTIVE') return 'secondary'
    if (state === 'INACTIVE') return 'secondary'
    return 'outline'
  }

  const getRoleCodeBadgeVariant = (roleCode: string) => {
    if (roleCode === 'A') return 'default'
    if (roleCode === 'L') return 'secondary'
    return 'outline'
  }

  const columns: ColumnDef<User, any>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
      enableSorting: true,
    },
    {
      accessorKey: 'userName',
      header: 'Name',
      cell: ({ row }) => <span className="font-medium">{row.original.userName || '-'}</span>,
    },
    {
      accessorKey: 'login',
      header: 'Login',
      cell: ({ row }) => <span>{row.original.login}</span>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <span>{row.original.email || '-'}</span>,
    },
    {
      accessorKey: 'mobileNumber',
      header: 'Mobile',
      cell: ({ row }) => <span>{row.original.mobileNumber || '-'}</span>,
    },
    {
      accessorKey: 'roleCode',
      header: 'Role',
      cell: ({ row }) => (
        <Badge variant={getRoleCodeBadgeVariant(row.original.roleCode)}>
          {row.original.roleCode}
        </Badge>
      ),
    },
    {
      accessorKey: 'userState',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={getUserStateBadgeVariant(row.original.userState)}>
          {row.original.userState}
        </Badge>
      ),
    },
    {
      accessorKey: 'branchName',
      header: 'Organization',
      cell: ({ row }) => <span>{row.original.branchName || '-'}</span>,
    },
    {
      accessorKey: 'bankName',
      header: 'Bank',
      cell: ({ row }) => <span>{row.original.bankName || '-'}</span>,
    },
    {
      accessorKey: 'activated',
      header: 'Activated',
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.activated ? 'Yes' : 'No'}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage platform users from Perdix</p>
        </div>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {(error as any)?.response?.status === 503 
              ? 'Service temporarily unavailable. The server is down or overloaded. Please try again later.'
              : error?.message || 'Failed to fetch users. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading users...</div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            No users available for the selected branch.
          </p>
        </div>
      ) : (
        <DataTable<User, any>
          title="All Users"
          description={`Users from ${branchName} organization`}
          columns={columns}
          data={users}
          showToolbar={true}
          showFooter={true}
          enableExport={true}
          exportFilename="users.csv"
          globalFilterPlaceholder="Search users..."
          manualPagination={true}
          pageCount={pageCount}
          state={{
            pagination,
          }}
          onStateChange={{
            onPaginationChange: (updater) => {
              const newPagination = typeof updater === 'function' ? updater(pagination) : updater
              // Reset to first page when page size changes
              if (newPagination.pageSize !== pagination.pageSize) {
                setPagination({ pageIndex: 0, pageSize: newPagination.pageSize })
              } else {
                setPagination(newPagination)
              }
            },
          }}
        />
      )}
    </div>
  )
}


