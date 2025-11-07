import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
 
import { Mail, Lock, Eye, EyeOff, User, UserCircle, Phone, Shield, Check, ChevronDown } from "lucide-react"
import MunifyLogo from "@/assets/MunifyLOGO.png"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Copyright from "@/components/Copyright"
import { apiService } from "@/services/api"
import { alerts } from "@/lib/alerts"
import { cn } from "@/lib/utils"
import { Spinner, LoadingOverlay } from "@/components/ui/spinner"

export default function Register() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const [form, setForm] = useState({
    userName: "",
    login: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    roleId: "",
  })

  const [orgFields, setOrgFields] = useState({
    organizationId: "",
    organizationTypeId: "",
    organizationName: "",
    organizationType: "",
    // Lender-specific
    designation: "",
    regulatoryRegistrationNo: "",
    // Municipality-specific
    municipalityStateDistrict: "",
    gstnOrUlbCode: "",
    annualBudgetSize: "",
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roles, setRoles] = useState<Array<{id: number, name: string, accessLevel: number}>>([])
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [open, setOpen] = useState(false)
  const [organizations, setOrganizations] = useState<Array<{id: number, branchName: string, version?: number}>>([])
  const [loadingOrganizations, setLoadingOrganizations] = useState(false)
  const [orgNameOpen, setOrgNameOpen] = useState(false)
  const [orgTypeOpen, setOrgTypeOpen] = useState(false)

  // Infer a coarse organization type label from a branch/type name
  const inferOrgType = (label: string): string => {
    const text = (label || "").toLowerCase()
    if (/(bank|nbfc|multilateral|philanthropy|finance|lender)/.test(text)) return "Lender"
    if (/(municipal|municipality|ulb|nagar|nigam|parishad)/.test(text)) return "Municipality"
    if (/(govt|government|niua)/.test(text)) return "Govt/NIUA"
    if (/munify/.test(text)) return "Munify"
    return ""
  }

  // Returns branch name for a given organization id, or empty string
  const getOrgBranchName = (id?: string) => {
    if (!id) return ""
    const match = organizations.find(o => o.id.toString() === id)
    return match?.branchName || ""
  }

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true)
      try {
        const rolesData = await apiService.get("/master/roles")
        setRoles(rolesData)
      } catch (err) {
        console.error("Failed to fetch roles:", err)
        alerts.error("Error", "Failed to load user roles. Please refresh the page.")
      } finally {
        setLoadingRoles(false)
      }
    }

    fetchRoles()
  }, [])

  // Fetch organizations for dropdowns
  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoadingOrganizations(true)
      try {
        const data = await apiService.get('/organizations/organizations')
        setOrganizations(data)
      } catch (err) {
        console.error("Failed to fetch organizations:", err)
        alerts.error("Error", "Failed to load organizations. Please refresh the page.")
      } finally {
        setLoadingOrganizations(false)
      }
    }

    fetchOrganizations()
  }, [])

  // Ensure conditional fields reflect org type when IDs are prefilled
  useEffect(() => {
    // If invitation gave explicit type text, keep it; otherwise infer
    if (!orgFields.organizationType) {
      const label = getOrgBranchName(orgFields.organizationTypeId) || getOrgBranchName(orgFields.organizationId)
      if (label) setOrgFields(prev => ({ ...prev, organizationType: inferOrgType(label) }))
    }
  }, [organizations, orgFields.organizationType, orgFields.organizationTypeId, orgFields.organizationId])

  // Prefill via invitation token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")
    if (!token) return

    const prefillFromInvitation = async () => {
      try {
        const data = await apiService.get(`/invitations/validate/${token}`)
        setForm(prev => ({
          ...prev,
          userName: (data?.full_name || "").toString(),
          login: (data?.user_id || "").toString(),
          email: (data?.email || "").toString(),
          mobileNumber: (data?.mobile_number || "").toString(),
          roleId: data?.role_id ? String(data.role_id) : prev.roleId,
        }))
        setOrgFields(prev => ({
          ...prev,
          // IDs for controlled dropdown selection
          organizationId: data?.organization_id ? String(data.organization_id) : prev?.organizationId,
          organizationTypeId: data?.organization_type_id ? String(data.organization_type_id) : prev?.organizationTypeId,
          // Keep names for display/backward compatibility if needed
          organizationName: (data?.organization_name || "").toString(),
          organizationType: (data?.organization_type || "").toString(),
        }))
        // If backend didn't send readable type, the effect above will infer once organizations load
      } catch (err: any) {
        const message = err?.response?.data?.error || err?.message || "Invalid or expired invitation link."
        alerts.error("Invitation Error", message)
      }
    }

    prefillFromInvitation()
  }, [])

  const validate = () => {
    if (!form.userName.trim()) return "Full name is required"
    if (!form.login.trim()) return "User ID is required"
    if (!form.email.trim()) return "Email is required"
    if (!form.mobileNumber.trim()) return "Mobile number is required"
    if (!form.roleId) return "User role is required"
    if (!form.password) return "Password is required"
    if (form.password !== form.confirmPassword) return "Passwords do not match"
    if (form.mobileNumber && isNaN(Number(form.mobileNumber))) return "Mobile number must be a valid number"
    if (form.mobileNumber && form.mobileNumber.length !== 10) return "Mobile number must be 10 digits"
    // Password policy: 8-15 chars, at least 1 uppercase, 1 digit, 1 special
    const pwd = form.password
    if (pwd.length < 8 || pwd.length > 15) return "Password must be 8-15 characters"
    if (!/[A-Z]/.test(pwd)) return "Password must include at least 1 uppercase letter"
    if (!/[0-9]/.test(pwd)) return "Password must include at least 1 number"
    if (!/[!@#$%^&*(),.?":{}|<>_\-\[\]\\/+=~`;'']/.test(pwd)) return "Password must include at least 1 special character"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      alerts.error("Validation error", validationError)
      return
    }
    setError(null)
    setSubmitting(true)

    try {
      const selectedRole = roles.find((r) => r.id.toString() === form.roleId)
      const payload = {
        fullName: form.userName.trim(),
        login: form.login.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        email: form.email.trim(),
        mobileNumber: Number(form.mobileNumber),
        organizationId: orgFields.organizationId ? Number(orgFields.organizationId) : undefined,
        organizationTypeId: orgFields.organizationTypeId ? Number(orgFields.organizationTypeId) : undefined,
        designation: orgFields.designation.trim() || undefined,
        regulatoryRegistrationNo: orgFields.regulatoryRegistrationNo.trim() || undefined,
        municipalityStateDistrict: orgFields.municipalityStateDistrict.trim() || undefined,
        gstnOrUlbCode: orgFields.gstnOrUlbCode.trim() || undefined,
        annualBudgetSize: orgFields.annualBudgetSize.trim() || undefined,
        userRoles: [
          {
            userId: form.login.trim(),
            userName: form.userName.trim(),
            roleId: Number(form.roleId),
            roleName: selectedRole?.name || "",
            userRoleId: null,
            id: null,
          },
        ],
      }

      const response = await apiService.post("/users/register", payload)
      alerts.success("Application Submitted",response?.user?.login+" "+response.message+" successfully.")
      navigate("/login")
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Failed to register. Please try again."
      setError(message)
      alerts.error("Error", message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <LoadingOverlay show={submitting} />
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <img src={MunifyLogo} alt="Munify" className="h-11" />
            
          </div>
          <div className="text-sm text-muted-foreground">
            Already have an account? {""}
            <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
          </div>
        </div>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-xl">Create Account</CardTitle>
            <CardDescription className="text-sm">
              Fill the details to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {error && (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Grid layout to reduce scrolling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Organization Name (ID-backed dropdown) */}
                <div className="space-y-1.5">
                  <Label htmlFor="organizationId">Organization</Label>
                  <Popover open={orgNameOpen} onOpenChange={setOrgNameOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={orgNameOpen}
                        className="w-full justify-between h-9"
                        disabled={submitting || loadingOrganizations}
                      >
                        <div className="flex items-center text-gray-500 font-normal">
                          <UserCircle className="mr-3 h-4 w-4 text-gray-400" />
                          {loadingOrganizations ? (
                            <span className="flex items-center gap-2"><Spinner size={16} /> Loading organizations...</span>
                          ) : orgFields.organizationId ? (
                            organizations.find(o => o.id.toString() === orgFields.organizationId)?.branchName || "Select organization"
                          ) : (
                            "Select organization"
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
                          <CommandInput placeholder="Search organizations..." />
                          <CommandList>
                            <CommandEmpty>No organization found.</CommandEmpty>
                            <CommandGroup>
                              {organizations.map((org) => (
                                <CommandItem
                                  key={org.id}
                                  value={org.branchName}
                                  onSelect={() => {
                                    setOrgFields(prev => ({ ...prev, organizationId: org.id.toString() }))
                                    setOrgNameOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      orgFields.organizationId === org.id.toString() ? "opacity-100" : "opacity-0"
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
                </div>

                {/* Organization Type (ID-backed dropdown) */}
                <div className="space-y-1.5">
                  <Label htmlFor="organizationTypeId">Organization Type</Label>
                  <Popover open={orgTypeOpen} onOpenChange={setOrgTypeOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={orgTypeOpen}
                        className="w-full justify-between h-9"
                        disabled={submitting || loadingOrganizations}
                      >
                        <div className="flex items-center text-gray-500 font-normal">
                          <UserCircle className="mr-3 h-4 w-4 text-gray-400" />
                          {loadingOrganizations ? (
                            <span className="flex items-center gap-2"><Spinner size={16} /> Loading organizations...</span>
                          ) : orgFields.organizationTypeId ? (
                            organizations.find(o => o.id.toString() === orgFields.organizationTypeId)?.branchName || "Select organization type"
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
                                    setOrgFields(prev => ({ 
                                      ...prev, 
                                      organizationTypeId: org.id.toString(),
                                      // also set a human-readable type for conditional UI
                                      organizationType: inferOrgType(org.branchName)
                                    }))
                                    setOrgTypeOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      orgFields.organizationTypeId === org.id.toString() ? "opacity-100" : "opacity-0"
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
                </div>
                

                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="userName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="userName"
                      type="text"
                      placeholder="Enter Full Name"
                      className="pl-10"
                      value={form.userName}
                      onChange={(e) => handleChange("userName", e.target.value)}
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>

                {/* User ID */}
                <div className="space-y-1.5">
                  <Label htmlFor="login">User ID</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="login"
                      type="text"
                      placeholder="Enter User ID"
                      className="pl-10"
                      value={form.login}
                      onChange={(e) => handleChange("login", e.target.value)}
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      className="pl-10"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="mobileNumber"
                      type="tel"
                      placeholder="9876543210"
                      className="pl-10"
                      value={form.mobileNumber}
                      onChange={(e) => handleChange("mobileNumber", e.target.value)}
                      maxLength={10}
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>

                {/* User Role */}
                <div className="space-y-1.5">
                  <Label htmlFor="roleId">User Role</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between pl-3"
                      >
                        <div className="flex items-center text-gray-500 font-normal">
                          <Shield className="mr-3 h-4 w-4 text-gray-400" />
                          {loadingRoles ? (
                            <span className="flex items-center gap-2"><Spinner size={16} /> Loading roles...</span>
                          ) : form.roleId ? (
                            roles.find((role) => role.id.toString() === form.roleId)?.name
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
                                    handleChange("roleId", role.id.toString())
                                    setOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      form.roleId === role.id.toString() ? "opacity-100" : "opacity-0"
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

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className="pl-10 pr-10"
                      value={form.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      disabled={submitting}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      className="pl-10 pr-10"
                      value={form.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      disabled={submitting}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Organization-type based additional fields (optional legacy display) */}
              {(() => {
                const orgType = (orgFields.organizationType || "").toLowerCase()
                if (orgType === "lender") {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="designation">Designation</Label>
                        <Input
                          id="designation"
                          type="text"
                          placeholder="Enter designation"
                          value={orgFields.designation}
                          onChange={(e) => setOrgFields(prev => ({ ...prev, designation: e.target.value }))}
                          disabled={submitting}
                        />
                      </div>
                      
                      <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="regNo">Regulatory Registration No.</Label>
                        <Input
                          id="regNo"
                          type="text"
                          placeholder="RBI code / CIN / PAN"
                          value={orgFields.regulatoryRegistrationNo}
                          onChange={(e) => setOrgFields(prev => ({ ...prev, regulatoryRegistrationNo: e.target.value }))}
                          disabled={submitting}
                        />
                      </div>
                      {/* KYC Upload placeholder (UI only for now) */}
                      <div className="space-y-1.5 md:col-span-2">
                        <Label>KYC Document Upload</Label>
                        <div className="text-xs text-muted-foreground">PAN, GST, Certificate of Incorporation (upload coming soon)</div>
                      </div>
                    </div>
                  )
                }
                if (orgType === "municipality") {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="municipalityName">Municipality Name</Label>
                        <Input
                          id="municipalityName"
                          type="text"
                          placeholder="Enter Municipality / ULB Name"
                          value={orgFields.organizationName}
                          onChange={(e) => setOrgFields(prev => ({ ...prev, organizationName: e.target.value }))}
                          disabled={submitting}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="stateDistrict">State / District</Label>
                        <Input
                          id="stateDistrict"
                          type="text"
                          placeholder="State / District"
                          value={orgFields.municipalityStateDistrict}
                          onChange={(e) => setOrgFields(prev => ({ ...prev, municipalityStateDistrict: e.target.value }))}
                          disabled={submitting}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="gstnUlb">GSTN / ULB Code</Label>
                        <Input
                          id="gstnUlb"
                          type="text"
                          placeholder="Optional"
                          value={orgFields.gstnOrUlbCode}
                          onChange={(e) => setOrgFields(prev => ({ ...prev, gstnOrUlbCode: e.target.value }))}
                          disabled={submitting}
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="annualBudget">Annual Budget Size</Label>
                        <Input
                          id="annualBudget"
                          type="text"
                          placeholder="e.g., ₹500 Cr"
                          value={orgFields.annualBudgetSize}
                          onChange={(e) => setOrgFields(prev => ({ ...prev, annualBudgetSize: e.target.value }))}
                          disabled={submitting}
                        />
                      </div>
                      {/* KYC Upload placeholder (UI only for now) */}
                      <div className="space-y-1.5 md:col-span-2">
                        <Label>KYC Document Upload</Label>
                        <div className="text-xs text-muted-foreground">Govt ID of Commissioner, Municipal Registration Certificate (upload coming soon)</div>
                      </div>
                    </div>
                  )
                }
                return null
              })()}

              {/* Terms and Submit */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-1">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked === "indeterminate" ? false : checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I agree to the {""}
                    <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>{" "}
                    and {""}
                    <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  size="lg"
                  className="md:w-auto w-full"
                  disabled={!agreeToTerms || submitting}
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2"><Spinner size={16} /> Creating...</span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-4 text-xs text-muted-foreground">
          By creating an account, you agree to our platform's terms and conditions.
        </div>
        <div className="text-center mt-2">
          <Copyright variant="minimal" />
        </div>
      </div>
    </div>
  )
}
