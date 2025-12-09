import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Building2, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { LoadingOverlay, Spinner } from "@/components/ui/spinner"
import { alerts } from "@/lib/alerts"
import { getToken, getUserAccount } from "@/services/auth"
import { useAuth } from "@/hooks/use-auth"
import { Link, useNavigate } from "react-router-dom"
import Copyright from "@/components/Copyright"
import type { LoginResponse } from "@/types/auth"

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: "", password: "" })
  const [errors, setErrors] = useState<{ [k: string]: string }>({})

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setForm(prev => ({ ...prev, [id]: value }))
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: "" }))
  }

  const validate = () => {
    const errs: { [k: string]: string } = {}
    if (!form.username.trim()) errs.username = "Please input your username!"
    else if (form.username.length < 3) errs.username = "Username must be at least 3 characters!"
    if (!form.password.trim()) errs.password = "Please input your password!"
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters!"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      alerts.error("Validation Error", "Please check your input fields.")
      return
    }
    setLoading(true)
    try {
      // Step 1: Login and get JWT token
      const res: LoginResponse = await getToken({ ...form, macaddress: null, imeiNumber: null })
      
      // Handle new response structure: { authData: { access_token, mfa } }
      if (!res?.authData?.access_token) {
        alerts.error("Login Error", "Invalid response from server. Please contact support.")
        return
      }

      const token = res.authData.access_token

      // Step 2: Fetch user account details using the JWT token
      // Pass token explicitly since it's not stored yet
      const userAccount = await getUserAccount(token)

      // Step 3: Store token and user data via auth context
      // This will also store in sessionStorage automatically
      login(token, userAccount)

      alerts.success("Login Successful", "Welcome back!")
      navigate("/main")
    } catch (err: any) {
      let msg = err?.response?.data?.message || err?.message || "Login failed"
      if (typeof msg === "string" && msg.startsWith("{")) {
        try { msg = JSON.parse(msg).message || msg } catch {}
      }
      alerts.error("Login Error", msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <LoadingOverlay show={loading} />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Munify</span>
          </div>
          <p className="text-muted-foreground">
            India's Premier Municipal Funding Platform
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your Munify account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Username</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    className="pl-10"
                    value={form.username}
                    onChange={onChange}
                    disabled={loading}
                    required
                  />
                  {errors.username && <span className="absolute right-0 -bottom-5 text-xs text-red-600">{errors.username}</span>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={form.password}
                    onChange={onChange}
                    disabled={loading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                  {errors.password && <span className="absolute right-0 -bottom-5 text-xs text-red-600">{errors.password}</span>}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === "indeterminate" ? false : !!checked)}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <span className="inline-flex items-center gap-2"><Spinner size={16} /> Signing in...</span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/register" className="text-blue-600 hover:underline">
                Sign up here
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 space-y-4">
          <p className="text-sm text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link to="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
          <Copyright variant="minimal" />
        </div>
      </div>
    </div>
  )
}
