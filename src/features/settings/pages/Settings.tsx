import { useState, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LoadingOverlay, Spinner } from "@/components/ui/spinner"
import { alerts } from "@/lib/alerts"
import { apiService } from "@/services/api"
import { 
  User, 
  Mail, 
  Phone, 
  KeyRound, 
  Edit, 
  Save, 
  X, 
  ShieldCheck, 
  MailCheck,
  UserCircle
} from "lucide-react"

interface UserProfile {
  id?: number
  fullName?: string
  userId?: string
  email?: string
  mobileNumber?: string
}

interface GenerateOtpRequest {
  userId: string
}

interface ChangePasswordRequest {
  userId: string
  otp: string
  newPassword: string
  confirmPassword: string
}

export default function Settings() {
  const queryClient = useQueryClient()
  const { userId: routeUserId } = useParams<{ userId: string }>()
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [otpRequestedFor, setOtpRequestedFor] = useState<string>("")

  // Fetch profile from FastAPI using userId from the route
  const {
    data: profile,
    isLoading: loadingProfile,
    isError: profileError,
  } = useQuery({
    queryKey: ["user-profile", routeUserId],
    enabled: !!routeUserId,
    queryFn: async () => {
      const response = await apiService.get(`/users/perdix/${routeUserId}`)
      const payload: any = response?.data?.data ?? response?.data ?? response
      const mapped: UserProfile = {
        id: payload?.id ?? payload?.user_id,
        fullName: payload?.userName,
        userId: payload?.userId ?? payload?.username ?? payload?.user_id ?? routeUserId ?? "",
        email: payload?.email ?? "",
        mobileNumber: payload?.mobileNumber ?? payload?.mobile_number ?? payload?.phone ?? "",
      }
      return mapped
    },
  })

  // Profile form state
  const [profileForm, setProfileForm] = useState<UserProfile>({
    fullName: "",
    userId: "",
    email: "",
    mobileNumber: "",
  })

  // Initialize form with fetched profile data
  useEffect(() => {
    if (!profile) return
    setProfileForm({
      fullName: profile.fullName || "",
      userId: profile.userId || "",
      email: profile.email || "",
      mobileNumber: profile.mobileNumber || "",
    })
    // Pre-fill password form userId
    if (profile.userId) {
      setPasswordForm(prev => ({ ...prev, userId: profile.userId || "" }))
    }
  }, [profile])

  // Password change form state
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    userId: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})

  // Handle profile form changes
  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }))
    if (profileErrors[field]) {
      setProfileErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  // Handle password form changes
  const handlePasswordChange = (field: keyof ChangePasswordRequest, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }))
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  // Validate profile form
  const validateProfile = () => {
    const errs: Record<string, string> = {}
    if (!profileForm.fullName?.trim()) errs.fullName = "Full name is required"
    if (!profileForm.email?.trim()) errs.email = "Email is required"
    if (profileForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      errs.email = "Invalid email format"
    }
    if (!profileForm.mobileNumber?.trim()) errs.mobileNumber = "Mobile number is required"
    if (profileForm.mobileNumber && !/^\d{10}$/.test(profileForm.mobileNumber)) {
      errs.mobileNumber = "Mobile number must be 10 digits"
    }
    setProfileErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Validate password form
  const validatePassword = () => {
    const errs: Record<string, string> = {}
    if (!passwordForm.userId?.trim()) errs.userId = "User ID is required"
    if (!passwordForm.otp?.trim()) errs.otp = "OTP is required"
    if (!passwordForm.newPassword?.trim()) errs.newPassword = "New password is required"
    if (!passwordForm.confirmPassword?.trim()) errs.confirmPassword = "Please confirm your new password"
    if (
      passwordForm.newPassword &&
      passwordForm.confirmPassword &&
      passwordForm.newPassword !== passwordForm.confirmPassword
    ) {
      errs.confirmPassword = "Passwords do not match"
    }
    if (passwordForm.newPassword && passwordForm.newPassword.length < 6) {
      errs.newPassword = "Password must be at least 6 characters"
    }
    setPasswordErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UserProfile) => {
      // Assuming update endpoint accepts userId in path in the same resource
      // Adjust if your API differs
      return await apiService.put<UserProfile>(`/users/perdix/${data.userId}`, data)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", routeUserId] })
      // Update form with returned data
      setProfileForm({
        fullName: data?.fullName || "",
        userId: data?.userId || routeUserId || "",
        email: data?.email || "",
        mobileNumber: data?.mobileNumber || "",
      })
      alerts.success("Profile Updated", "Your profile has been updated successfully")
      setIsEditing(false)
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || "Failed to update profile"
      alerts.error("Error", message)
    },
  })

  // Generate OTP mutation for password change
  const generateOtpMutation = useMutation({
    mutationFn: async (payload: GenerateOtpRequest) => {
      return await apiService.post("/auth/forgot-password/otp", payload)
    },
    onSuccess: (data: any, variables) => {
      const text: string | undefined = data?.data?.text || data?.message
      const smsStatus: string | undefined = data?.data?.smsStatus
      const emailStatus: string | undefined = data?.data?.emailStatus
      const details = [text?.trim(), (smsStatus || emailStatus) ? `SMS: ${smsStatus || "N/A"}, Email: ${emailStatus || "N/A"}` : undefined]
        .filter(Boolean)
        .join(" – ")
      alerts.success("OTP Sent", details || "Please check your registered contact for the OTP.")
      setOtpRequestedFor(variables.userId)
      setPasswordForm(prev => ({ ...prev, userId: variables.userId }))
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message?.error || error?.response?.data?.message || "Failed to send OTP"
      alerts.error("OTP Error", message)
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (payload: ChangePasswordRequest) => {
      return await apiService.post("/auth/change-password/otp", payload)
    },
    onSuccess: (response: any) => {
      const message = response?.data?.text || response?.message || "Password changed successfully"
      alerts.success("Password Changed", message)
      setPasswordForm({ userId: "", otp: "", newPassword: "", confirmPassword: "" })
      setOtpRequestedFor("")
      queryClient.invalidateQueries({ queryKey: ["auth", "password"] })
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message?.error || error?.response?.data?.message || "Failed to change password"
      alerts.error("Error", message)
    },
  })

  // Handle profile submit
  const handleProfileSubmit = () => {
    if (!validateProfile()) {
      alerts.error("Validation Error", "Please correct the highlighted fields")
      return
    }
    updateProfileMutation.mutate(profileForm)
  }

  // Handle OTP request
  const handleRequestOtp = () => {
    if (!profileForm.userId?.trim()) {
      alerts.error("Validation Error", "User ID is required")
      return
    }
    generateOtpMutation.mutate({ userId: profileForm.userId.trim() })
  }

  // Handle password change submit
  const handlePasswordSubmit = () => {
    if (!validatePassword()) {
      alerts.error("Validation Error", "Please correct the highlighted fields")
      return
    }
    changePasswordMutation.mutate({
      userId: passwordForm.userId.trim(),
      otp: passwordForm.otp.trim(),
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword,
    })
  }

  const isLoading = loadingProfile || updateProfileMutation.isPending
  const isRequestingOtp = generateOtpMutation.isPending
  const isChangingPassword = changePasswordMutation.isPending

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner size={16} /> Loading profile...
        </span>
      </div>
    )
  }

  if (profileError) {
    return (
      <Card className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load profile. Please refresh the page.</AlertDescription>
        </Alert>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your profile and account preferences.</p>
      </div>

      <LoadingOverlay show={isLoading || isChangingPassword || isRequestingOtp} />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "profile" | "password")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Change Password
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>View and update your personal information</CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => {
                      setIsEditing(false)
                      if (profile) {
                        setProfileForm({
                          fullName: profile.fullName || "",
                          userId: profile.userId || "",
                          email: profile.email || "",
                          mobileNumber: profile.mobileNumber || "",
                        })
                      }
                      setProfileErrors({})
                    }}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleProfileSubmit} disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? (
                        <span className="inline-flex items-center gap-2">
                          <Spinner size={14} /> Saving...
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </span>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter full name"
                      className="pl-10"
                      value={profileForm.fullName || ""}
                      onChange={(e) => handleProfileChange("fullName", e.target.value)}
                      disabled={!isEditing || updateProfileMutation.isPending}
                    />
                  </div>
                  {profileErrors.fullName && (
                    <p className="text-xs text-red-600 mt-1">{profileErrors.fullName}</p>
                  )}
                </div>

                {/* User ID */}
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="userId"
                      type="text"
                      placeholder="User ID"
                      className="pl-10 bg-muted"
                      value={profileForm.userId || ""}
                      disabled
                      readOnly
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">User ID cannot be changed</p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email"
                      className="pl-10"
                      value={profileForm.email || ""}
                      onChange={(e) => handleProfileChange("email", e.target.value)}
                      disabled={!isEditing || updateProfileMutation.isPending}
                    />
                  </div>
                  {profileErrors.email && (
                    <p className="text-xs text-red-600 mt-1">{profileErrors.email}</p>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="mobileNumber"
                      type="tel"
                      placeholder="9876543210"
                      className="pl-10"
                      value={profileForm.mobileNumber || ""}
                      onChange={(e) => handleProfileChange("mobileNumber", e.target.value)}
                      maxLength={10}
                      disabled={!isEditing || updateProfileMutation.isPending}
                    />
                  </div>
                  {profileErrors.mobileNumber && (
                    <p className="text-xs text-red-600 mt-1">{profileErrors.mobileNumber}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Security Notice</AlertTitle>
                <AlertDescription>
                  You'll need to request an OTP to change your password. The OTP will be sent to your registered email and mobile number.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordUserId">User ID *</Label>
                  <div className="relative">
                    <Input
                      id="passwordUserId"
                      type="text"
                      placeholder="Enter your user ID"
                      value={passwordForm.userId}
                      onChange={(e) => handlePasswordChange("userId", e.target.value)}
                      disabled={isChangingPassword || isRequestingOtp || !!otpRequestedFor || !!profile?.userId}
                      className={profile?.userId ? "bg-muted" : ""}
                    />
                  </div>
                  {passwordErrors.userId && (
                    <p className="text-xs text-red-600 mt-1">{passwordErrors.userId}</p>
                  )}
                  {profile?.userId && (
                    <p className="text-xs text-muted-foreground">User ID is pre-filled from your profile</p>
                  )}
                </div>

                {!otpRequestedFor ? (
                  <Button 
                    onClick={handleRequestOtp} 
                    disabled={isRequestingOtp || !passwordForm.userId?.trim()}
                    className="w-full"
                  >
                    {isRequestingOtp ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner size={16} /> Sending OTP...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <MailCheck className="h-4 w-4" /> Request OTP
                      </span>
                    )}
                  </Button>
                ) : (
                  <Alert>
                    <AlertTitle>OTP Requested</AlertTitle>
                    <AlertDescription>
                      An OTP has been sent for user ID: <span className="font-medium">{otpRequestedFor}</span>.
                      Please enter the OTP below to proceed with password change.
                    </AlertDescription>
                  </Alert>
                )}

                {otpRequestedFor && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="otp">OTP *</Label>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter the OTP"
                          value={passwordForm.otp}
                          onChange={(e) => handlePasswordChange("otp", e.target.value)}
                          disabled={isChangingPassword}
                        />
                        {passwordErrors.otp && (
                          <p className="text-xs text-red-600 mt-1">{passwordErrors.otp}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password *</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter new password (min 6 characters)"
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                        disabled={isChangingPassword}
                      />
                      {passwordErrors.newPassword && (
                        <p className="text-xs text-red-600 mt-1">{passwordErrors.newPassword}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter new password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                        disabled={isChangingPassword}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-xs text-red-600 mt-1">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>

                    <Button 
                      onClick={handlePasswordSubmit} 
                      disabled={isChangingPassword}
                      className="w-full"
                    >
                      {isChangingPassword ? (
                        <span className="inline-flex items-center gap-2">
                          <Spinner size={16} /> Changing Password...
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <KeyRound className="h-4 w-4" /> Change Password
                        </span>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
