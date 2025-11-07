import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Check, 
  ChevronDown,
  Send,
  Users,
  AlertCircle
} from "lucide-react"
import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
 
import { apiService } from "@/services/api"
import { alerts } from "@/lib/alerts"
import { cn } from "@/lib/utils"
import { Spinner, LoadingOverlay } from "@/components/ui/spinner"



export default function AdminInvitation() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("organization")
  const [error, setError] = useState<string | null>(null)
  const {
    data: roles = [],
    isLoading: loadingRoles,
    isError: rolesError,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => await apiService.get<Array<{id: number, name: string, accessLevel: number}>>("/master/roles"),
  })
  const [open, setOpen] = useState(false)
  const [orgNameOpen, setOrgNameOpen] = useState(false)
  const [orgTypeOpen, setOrgTypeOpen] = useState(false)
  const {
    data: organizations = [],
    isLoading: loadingOrganizations,
    isError: orgsError,
  } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => await apiService.get<Array<{id: number, branchName: string, version: number}>>("/organizations/organizations"),
  })
  

  // Organization form state
  const [orgForm, setOrgForm] = useState({
    organizationId: "",
    organizationTypeId: ""
  })
  const [selectedOrgType, setSelectedOrgType] = useState("")

  // User form state
  const [userForm, setUserForm] = useState({
    fullName: "",
    userId: "",
    email: "",
    mobileNumber: "",
    roleId: ""
  })

  const handleOrgChange = (field: keyof typeof orgForm, value: string) => {
    setOrgForm(prev => ({ ...prev, [field]: value }))
  }

  const handleOrgNameChange = (value: string) => {
    setSelectedOrgType(value)
    const orgId = value.split('-')[0]
    handleOrgChange("organizationId", orgId)
    setOrgNameOpen(false)
  }

  const handleUserChange = (field: keyof typeof userForm, value: string) => {
    setUserForm(prev => ({ ...prev, [field]: value }))
  }

  // Surface fetch errors once
  if (rolesError) {
    console.error("Failed to fetch roles")
  }
  if (orgsError) {
    console.error("Failed to fetch organizations")
  }

  const validateOrganization = () => {
    if (!orgForm.organizationId) return "Organization is required"
    if (!orgForm.organizationTypeId) return "Organization type is required"
    return null
  }

  const validateUser = () => {
    if (!userForm.fullName.trim()) return "Full name is required"
    if (!userForm.userId.trim()) return "User ID is required"
    if (!userForm.email.trim()) return "Email is required"
    if (!userForm.mobileNumber.trim()) return "Mobile number is required"
    if (!userForm.roleId) return "User role is required"
    if (userForm.mobileNumber && isNaN(Number(userForm.mobileNumber))) return "Mobile number must be a valid number"
    if (userForm.mobileNumber && userForm.mobileNumber.length !== 10) return "Mobile number must be 10 digits"
    return null
  }


  const { mutateAsync: submitInvitation, isPending: submitting } = useMutation({
    mutationFn: async (payload: any) => await apiService.post("/invitations/invite", payload),
  })

  const handleSubmit = async () => {
    const orgValidation = validateOrganization()
    if (orgValidation) {
      setError(orgValidation)
      alerts.error("Validation Error", orgValidation)
      setActiveTab("organization")
      return
    }

    const userValidation = validateUser()
    if (userValidation) {
      setError(userValidation)
      alerts.error("Validation Error", userValidation)
      setActiveTab("user")
      return
    }

    setError(null)

    try {
      const selectedRole = roles.find((r) => r.id.toString() === userForm.roleId)

      const payload = {
        organizationId: Number(orgForm.organizationId),
        organizationTypeId: Number(orgForm.organizationTypeId),
        fullName: userForm.fullName.trim(),
        userId: userForm.userId.trim(),
        email: userForm.email.trim(),
        mobileNumber: Number(userForm.mobileNumber),
        roleId: Number(userForm.roleId),
        roleName: selectedRole?.name || "",
      }

      const response = await submitInvitation(payload)
      alerts.success("Invitation Sent", (response as any)?.message || "Invitation link has been generated and sent to the user.")
      navigate("/main/admin/invitations")
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Failed to send invitation. Please try again."
      setError(message)
      alerts.error("Error", message)
    }
  }

  const getOrganizationTypeDescription = () => {
    const selectedOrg = organizations.find(org => org.id.toString() === orgForm.organizationTypeId)
    return selectedOrg?.branchName || ""
  }

  return (
    <div className="flex items-center justify-center">
      <LoadingOverlay show={submitting} />
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
           
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Send User Invitations</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <Link to="/main/admin/invitations" className="text-blue-600 hover:underline">← Back to Invitations Management</Link>
          </div>
        </div>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send User Invitation
            </CardTitle>
            <CardDescription className="text-sm">
              Create organization and user details to generate invitation link
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="organization" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Organization Details
                </TabsTrigger>
                <TabsTrigger value="user" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  User Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="organization" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Organization Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="organizationName">Organization Name *</Label>
                    <Popover open={orgNameOpen} onOpenChange={setOrgNameOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={orgNameOpen}
                          className="w-full justify-between h-10"
                          disabled={submitting || loadingOrganizations}
                        >
                          <div className="flex items-center text-gray-500 font-normal">
                            <Building2 className="mr-3 h-4 w-4 text-gray-400" />
                            {loadingOrganizations ? (
                              <span className="flex items-center gap-2"><Spinner size={16} /> Loading organizations...</span>
                            ) : selectedOrgType
                              ? organizations.find((org) => `${org.id}-${org.branchName}` === selectedOrgType)?.branchName
                              : "Select organization"}
                          </div>
                          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        {loadingOrganizations ? (
                          <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground"><Spinner size={16} /> Loading organizations...</div>
                        ) : (
                          <Command>
                            <CommandInput placeholder="Search organizations..." />
                            <CommandList>
                              <CommandEmpty>No organization found.</CommandEmpty>
                              <CommandGroup>
                                {organizations.map((org) => (
                                  <CommandItem
                                    key={org.id}
                                    value={org.branchName}
                                    onSelect={() => handleOrgNameChange(`${org.id}-${org.branchName}`)}
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
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Organization Type */}
                  <div className="space-y-1.5">
                    <Label htmlFor="organizationType">Organization Type *</Label>
                    <Popover open={orgTypeOpen} onOpenChange={setOrgTypeOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={orgTypeOpen}
                          className="w-full justify-between h-10"
                          disabled={submitting || loadingOrganizations}
                        >
                          <div className="flex items-center text-gray-500 font-normal">
                            <Building2 className="mr-3 h-4 w-4 text-gray-400" />
                            {loadingOrganizations ? (
                              <span className="flex items-center gap-2"><Spinner size={16} /> Loading organizations...</span>
                            ) : orgForm.organizationTypeId ? (
                              organizations.find(org => org.id.toString() === orgForm.organizationTypeId)?.branchName
                            ) : (
                              "Select organization type"
                            )}
                          </div>
                          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        {loadingOrganizations ? (
                          <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground"><Spinner size={16} /> Loading organizations...</div>
                        ) : (
                          <Command>
                            <CommandInput placeholder="Search organization types..." />
                            <CommandList>
                              <CommandEmpty>No organization type found.</CommandEmpty>
                              <CommandGroup>
                                {organizations.map((org) => (
                                  <CommandItem
                                    key={org.id}
                                    value={org.branchName}
                                    onSelect={() => {
                                      handleOrgChange("organizationTypeId", org.id.toString())
                                      setOrgTypeOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        orgForm.organizationTypeId === org.id.toString() ? "opacity-100" : "opacity-0"
                                      )}
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
                        )}
                      </PopoverContent>
                    </Popover>
                    {orgForm.organizationTypeId && (
                      <p className="text-xs text-muted-foreground">{getOrganizationTypeDescription()}</p>
                    )}
                  </div>
                </div>

                

                

              </TabsContent>

              <TabsContent value="user" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter full name"
                        className="pl-10"
                        value={userForm.fullName}
                        onChange={(e) => handleUserChange("fullName", e.target.value)}
                        disabled={submitting}
                        required
                      />
                    </div>
                  </div>

                  {/* User ID */}
                  <div className="space-y-1.5">
                    <Label htmlFor="userId">User ID *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="userId"
                        type="text"
                        placeholder="Enter user ID"
                        className="pl-10"
                        value={userForm.userId}
                        onChange={(e) => handleUserChange("userId", e.target.value)}
                        disabled={submitting}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email"
                        className="pl-10"
                        value={userForm.email}
                        onChange={(e) => handleUserChange("email", e.target.value)}
                        disabled={submitting}
                        required
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <Label htmlFor="mobileNumber">Mobile Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="mobileNumber"
                        type="tel"
                        placeholder="9876543210"
                        className="pl-10"
                        value={userForm.mobileNumber}
                        onChange={(e) => handleUserChange("mobileNumber", e.target.value)}
                        maxLength={10}
                        disabled={submitting}
                        required
                      />
                    </div>
                  </div>

                  {/* User Role */}
                  <div className="space-y-1.5">
                    <Label htmlFor="roleId">User Role *</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between pl-3"
                          disabled={submitting || loadingRoles}
                        >
                          <div className="flex items-center text-gray-500 font-normal">
                            <Shield className="mr-3 h-4 w-4 text-gray-400" />
                            {loadingRoles ? (
                              <span className="flex items-center gap-2"><Spinner size={16} /> Loading roles...</span>
                            ) : userForm.roleId ? (
                              roles.find((role) => role.id.toString() === userForm.roleId)?.name
                            ) : (
                              "Select user role"
                            )}
                          </div>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        {loadingRoles ? (
                          <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground"><Spinner size={16} /> Loading roles...</div>
                        ) : (
                          <Command>
                            <CommandInput placeholder="Search roles..." />
                            <CommandList>
                              <CommandEmpty>No role found.</CommandEmpty>
                              <CommandGroup>
                                {roles.map((role) => (
                                  <CommandItem
                                    key={role.id}
                                    value={role.name}
                                    onSelect={() => {
                                      handleUserChange("roleId", role.id.toString())
                                      setOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        userForm.roleId === role.id.toString() ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {role.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button 
                onClick={handleSubmit}
                size="lg"
                disabled={submitting}
                className="min-w-[200px]"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size={16} /> 
                    Sending Invitation...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Invitation
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-4 text-xs text-muted-foreground">
          Invitation links will be sent via email and SMS to the specified user.
        </div>
        
      </div>
    </div>
  )
}
