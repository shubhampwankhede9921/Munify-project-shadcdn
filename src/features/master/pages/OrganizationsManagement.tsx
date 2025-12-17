import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, Edit, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DataTable, type ColumnDef } from '@/components/data-table/data-table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Check, ChevronDown } from 'lucide-react'
import apiService from '@/services/api'
import { alerts } from '@/lib/alerts'
import { toast } from '@/hooks/use-toast'

interface Organization {
  id: number
  bankId: number
  version: number
  parentBranchId: number
  branchName: string
  branchMailId: string
  pinCode: number
  branchOpenDate: string
  cashLimit: number
  fingerPrintDeviceType: string
}

type OrganizationForm = {
  bankId: number
  parentBranchId: number
  branchName: string
  branchMailId: string
  pinCode: string
  branchOpenDate: string
  cashLimit: number
  fingerPrintDeviceType: string
}

export default function OrganizationsManagement() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null)
  const [formData, setFormData] = useState<OrganizationForm>({
    bankId: 1,
    parentBranchId: 1,
    branchName: '',
    branchMailId: '',
    pinCode: '',
    branchOpenDate: '',
    cashLimit: 0,
    fingerPrintDeviceType: 'SAGEM'
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedOrgType, setSelectedOrgType] = useState<string>('')
  const [orgTypeOpen, setOrgTypeOpen] = useState(false)

  // Fetch organizations on component mount
  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.get('/organizations/organizations')
      setOrganizations(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to fetch organizations. Please try again.')
      console.error('Error fetching organizations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCreateOrganization = async () => {
    try {
      if (submitting) return
      setSubmitting(true)
      
      // Validate all required fields
      if (!selectedOrgType) {
        toast({ title: 'Validation Error', description: 'Organization type is required', variant: 'destructive' })
        return
      }
      if (!formData.branchName.trim()) {
        toast({ title: 'Validation Error', description: 'Organization name is required', variant: 'destructive' })
        return
      }
      if (!formData.branchMailId.trim()) {
        toast({ title: 'Validation Error', description: 'Organization email is required', variant: 'destructive' })
        return
      }
      if (!formData.pinCode || formData.pinCode.length !== 6) {
        toast({ title: 'Validation Error', description: 'Valid pin code is required (6 digits)', variant: 'destructive' })
        return
      }
      if (!formData.branchOpenDate) {
        toast({ title: 'Validation Error', description: 'Organization open date is required', variant: 'destructive' })
        return
      }

      // Convert pinCode to number for API call
      const apiData = {
        ...formData,
        pinCode: parseInt(formData.pinCode)
      }
      await apiService.post('/organizations/organizations', apiData)
      alerts.success("Success", "Organization created successfully")
      setIsCreateDialogOpen(false)
      resetForm()
      fetchOrganizations()
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to create organization. Please try again."
      alerts.error("Error", message)
      setIsCreateDialogOpen(false)
      console.error('Error creating organization:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditOrganization = async () => {
    if (!editingOrganization) return

    try {
      if (submitting) return
      setSubmitting(true)
      
      // Validate all required fields
      if (!selectedOrgType) {
        toast({ title: 'Validation Error', description: 'Organization type is required', variant: 'destructive' })
        return
      }
      if (!formData.branchName.trim()) {
        toast({ title: 'Validation Error', description: 'Organization name is required', variant: 'destructive' })
        return
      }
      if (!formData.branchMailId.trim()) {
        toast({ title: 'Validation Error', description: 'Organization email is required', variant: 'destructive' })
        return
      }
      if (!formData.pinCode || formData.pinCode.length !== 6) {
        toast({ title: 'Validation Error', description: 'Valid pin code is required (6 digits)', variant: 'destructive' })
        return
      }
      if (!formData.branchOpenDate) {
        toast({ title: 'Validation Error', description: 'Organization open date is required', variant: 'destructive' })
        return
      }

      // Convert pinCode to number and include id and version for API call
      const apiData = {
        ...formData,
        id: editingOrganization.id,
        version: editingOrganization.version,
        pinCode: parseInt(formData.pinCode),
        bankId: 1
      }
      await apiService.put(`/organizations/organizations`, apiData)
      alerts.success("Success", "Organization updated successfully")
      setIsEditDialogOpen(false)
      setEditingOrganization(null)
      resetForm()
      fetchOrganizations()
    } catch (err) {
      alerts.error("Error", "Failed to update organization. Please try again.")
      setIsEditDialogOpen(false)
      console.error('Error updating organization:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      bankId: 1,
      parentBranchId: 1,
      branchName: '',
      branchMailId: '',
      pinCode: '',
      branchOpenDate: '',
      cashLimit: 0,
      fingerPrintDeviceType: 'SAGEM'
    })
    setSelectedOrgType('')
    setOrgTypeOpen(false)
  }

  const openEditDialog = (organization: Organization) => {
    setEditingOrganization(organization)
    setFormData({
      bankId: organization.bankId,
      parentBranchId: organization.parentBranchId,
      branchName: organization.branchName,
      branchMailId: organization.branchMailId,
      pinCode: organization.pinCode.toString(),
      branchOpenDate: organization.branchOpenDate,
      cashLimit: organization.cashLimit,
      fingerPrintDeviceType: organization.fingerPrintDeviceType
    })
    // Use parentBranchId from the response for validation in edit flow
    setSelectedOrgType(organization.parentBranchId ? String(organization.parentBranchId) : '')
    setIsEditDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const handleOrgTypeChange = (value: string) => {
    setSelectedOrgType(value)
    const orgId = parseInt(value.split('-')[0])
    setFormData({ ...formData, parentBranchId: orgId })
    setOrgTypeOpen(false)
  }

  const columns: ColumnDef<Organization, any>[] = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
      enableSorting: true,
    },
    {
      accessorKey: 'branchName',
      header: 'Branch Name',
      cell: ({ row }) => <span className="font-medium">{row.original.branchName}</span>,
    },
    {
      accessorKey: 'branchMailId',
      header: 'Email',
      cell: ({ row }) => <span className="text-sm">{row.original.branchMailId}</span>,
    },
    {
      accessorKey: 'pinCode',
      header: 'Pin Code',
      cell: ({ row }) => <span className="font-medium">{row.original.pinCode}</span>,
    },
    {
      accessorKey: 'branchOpenDate',
      header: 'Open Date',
      cell: ({ row }) => <span className="text-sm">{formatDate(row.original.branchOpenDate)}</span>,
    },
    {
      accessorKey: 'fingerPrintDeviceType',
      header: 'Device Type',
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.fingerPrintDeviceType}
        </Badge>
      ),
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
  ], [])

  return (
    <div className="space-y-6">
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Create New Organization</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Add a new organization to the system with all required details
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentBranchId" className="text-sm font-medium">
                  Organization Type *
                </Label>
                <Popover open={orgTypeOpen} onOpenChange={setOrgTypeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={orgTypeOpen}
                      className="w-full justify-between h-10"
                      disabled={submitting}
                    >
                      <div className="flex items-center text-gray-500 font-normal">
                        <Building2 className="mr-3 h-4 w-4 text-gray-400" />
                        {selectedOrgType
                          ? organizations.find((org) => `${org.id}-${org.branchName}` === selectedOrgType)?.branchName
                          : "Select organization type"}
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search organization types..." />
                      <CommandList>
                        <CommandEmpty>No organization type found.</CommandEmpty>
                        <CommandGroup>
                          {organizations.map((org) => (
                            <CommandItem
                              key={org.id}
                              value={org.branchName}
                              onSelect={() => handleOrgTypeChange(`${org.id}-${org.branchName}`)}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selectedOrgType === `${org.id}-${org.branchName}` ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{org.branchName}</span>
                                <span className="text-xs text-muted-foreground">ID: {org.id}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchName" className="text-sm font-medium">
                  Organization Name *
                </Label>
                <Input
                  id="branchName"
                  value={formData.branchName}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  className="h-10"
                  placeholder="Enter organization name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchMailId" className="text-sm font-medium">
                  Organization Email *
                </Label>
                <Input
                  id="branchMailId"
                  type="email"
                  value={formData.branchMailId}
                  onChange={(e) => setFormData({ ...formData, branchMailId: e.target.value })}
                  className="h-10"
                  placeholder="Enter organization email"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="pinCode" className="text-sm font-medium">
                  Pin Code *
                </Label>
                  <Input
                    id="pinCode"
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '') // Only allow digits
                      if (value.length <= 6) {
                        setFormData({ ...formData, pinCode: value })
                      }
                    }}
                    className="h-10"
                    placeholder="Enter 6-digit pin code"
                    maxLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branchOpenDate" className="text-sm font-medium">
                    Organization Open Date *
                  </Label>
                  <DatePicker
                    value={formData.branchOpenDate ? new Date(formData.branchOpenDate) : undefined}
                    onChange={(d) => {
                      const yyyyMmDd = d ? new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10) : ""
                      setFormData({ ...formData, branchOpenDate: yyyyMmDd })
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrganization} disabled={submitting}>
              Create Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading organizations...</div>
        </div>
      ) : organizations.length === 0 ? (
        <div className="text-center py-8">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No organizations</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by creating a new organization.
          </p>
        </div>
      ) : (
        <DataTable<Organization, any>
          title="Organizations"
          description="Manage organization branches and details"
          columns={columns}
          data={organizations}
          actions={
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Organization
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
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Organization</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Update the organization information and details
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Organization ID</Label>
                <div className="h-10 px-3 py-2 text-sm bg-muted rounded-md border flex items-center">
                  {editingOrganization?.id ?? '-'}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editParentBranchId" className="text-sm font-medium">
                  Organization Type *
                </Label>
                <div className="h-10 px-3 py-2 text-sm bg-muted rounded-md border flex items-center">
                  {editingOrganization?.parentBranchId ?? '-'}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editBranchName" className="text-sm font-medium">
                  Organization Name *
                </Label>
                <Input
                  id="editBranchName"
                  value={formData.branchName}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  className="h-10"
                  placeholder="Enter organization name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editBranchMailId" className="text-sm font-medium">
                  Organization Email *
                </Label>
                <Input
                  id="editBranchMailId"
                  type="email"
                  value={formData.branchMailId}
                  onChange={(e) => setFormData({ ...formData, branchMailId: e.target.value })}
                  className="h-10"
                  placeholder="Enter organization email"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editPinCode" className="text-sm font-medium">
                    Pin Code *
                  </Label>
                  <Input
                    id="editPinCode"
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '') // Only allow digits
                      if (value.length <= 6) {
                        setFormData({ ...formData, pinCode: value })
                      }
                    }}
                    className="h-10"
                    placeholder="Enter 6-digit pin code"
                    maxLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editBranchOpenDate" className="text-sm font-medium">
                    Organization Open Date *
                  </Label>
                  <DatePicker
                    value={formData.branchOpenDate ? new Date(formData.branchOpenDate) : undefined}
                    onChange={(d) => {
                      const yyyyMmDd = d ? new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10) : ""
                      setFormData({ ...formData, branchOpenDate: yyyyMmDd })
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleEditOrganization} disabled={submitting}>
              Update Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
