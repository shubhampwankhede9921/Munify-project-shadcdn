import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DataTable, type ColumnDef } from '@/components/data-table/data-table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import apiService from '@/services/api'
import { alerts } from '@/lib/alerts'

interface Role {
  id: number
  name: string
  accessLevel: number
}

export default function RolesManagement() {
  const queryClient = useQueryClient()
  
  // Query for roles
  const { data: roles = [], isLoading, error, isError } = useQuery({
    queryKey: ['roles'],
    queryFn: () => apiService.get('/user-roles/roles'),
  })
  
  // Mutation for creating role
  const createRoleMutation = useMutation({
    mutationFn: (data: { roleName: string }) => 
      apiService.post('/user-roles/roles', { ...data, roleAccessLevel: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      alerts.success("Success", "Role created successfully")
      setIsCreateDialogOpen(false)
      setFormData({ roleName: '' })
    },
    onError: () => {
      alerts.error("Error", "Failed to create role. Please try again.")
    },
  })
  
  // Mutation for updating role
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { roleName: string } }) => 
      apiService.put(`/user-roles/roles/${id}`, { ...data, roleAccessLevel: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      alerts.success("Success", "Role updated successfully")
      setIsEditDialogOpen(false)
      setEditingRole(null)
      setFormData({ roleName: '' })
    },
    onError: () => {
      alerts.error("Error", "Failed to update role. Please try again.")
    },
  })
  
  // Component state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    roleName: ''
  })

  const handleCreateRole = async () => {
    if (!formData.roleName.trim()) {
      alerts.error("Validation Error", "Role name is required")
      return
    }

    createRoleMutation.mutate(formData)
  }

  const handleEditRole = async () => {
    if (!editingRole) return

    if (!formData.roleName.trim()) {
      alerts.error("Validation Error", "Role name is required")
      return
    }

    updateRoleMutation.mutate({ 
      id: editingRole.id, 
      data: formData 
    })
  }

  const openEditDialog = (role: Role) => {
    setEditingRole(role)
    setFormData({
      roleName: role.name
    })
    setIsEditDialogOpen(true)
  }

  const columns: ColumnDef<Role, any>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
      enableSorting: true,
    },
    {
      accessorKey: 'name',
      header: 'Role Name',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      id: 'actions',
      header: 'Action',
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-start">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditDialog(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Create a new role
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roleName" className="text-right">
                Role Name
              </Label>
              <Input
                id="roleName"
                value={formData.roleName}
                onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                className="col-span-3"
                placeholder="Enter role name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRole}
              disabled={createRoleMutation.isPending}
            >
              {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>{error?.message || 'Failed to fetch roles. Please try again.'}</AlertDescription>
        </Alert>
      )}

      
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading roles...</div>
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No roles</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by creating a new role.
              </p>
            </div>
          ) : (
            <DataTable<Role, any>
              title="Roles"
              description="Manage system roles"
              columns={columns}
              data={roles}
              actions={
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => {
                    setEditingRole(null)
                    setFormData({ roleName: '' })
                    setIsEditDialogOpen(false)
                    setIsCreateDialogOpen(true)
                  }}>
                    <Plus className="mr-2 h-4 w-4" /> New Role
                  </Button>
                </div>
              }
              showToolbar={true}
              showFooter={true}
              enableExport={true}
            />
          )}
        
      

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update the role information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">ID</Label>
              <div className="col-span-3 text-sm text-muted-foreground">
                {editingRole?.id ?? '-'}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editRoleName" className="text-right">
                Role Name
              </Label>
              <Input
                id="editRoleName"
                value={formData.roleName}
                onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                className="col-span-3"
                placeholder="Enter role name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditRole}
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
