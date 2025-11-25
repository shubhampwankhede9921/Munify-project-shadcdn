import { useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  CheckCircle2, 
  X, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  FileText,
} from "lucide-react"
import apiService from '@/services/api'
import { alerts } from '@/lib/alerts'

interface Project {
  id: number
  title: string
  organization_id: string
  category: string
  project_stage: string
  status: string
  description?: string
  state?: string
  city?: string
  ward?: string
  funding_requirement?: number
  total_project_cost?: number
  already_secured_funds?: number
  municipality_credit_rating?: string
  municipality_credit_score?: number
  start_date?: string
  end_date?: string
  fundraising_start_date?: string
  fundraising_end_date?: string
  contact_person?: string
  contact_person_designation?: string
  contact_person_email?: string
  contact_person_phone?: string
  department?: string
  created_at: string
  updated_at: string
}

export default function AdminProjectReview() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [remarks, setRemarks] = useState("")
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)

  // Fetch project details
  const { data: project, isLoading, error, isError } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await apiService.get(`/projects/${id}`)
      return (response?.data || response) as Project
    },
    enabled: !!id,
  })

  // Mutation for approving project
  const approveProjectMutation = useMutation({
    mutationFn: ({ projectId, admin_notes }: { projectId: number; admin_notes?: string }) => {
      return apiService.post(`/projects/${projectId}/approve`, { 
        approved_by: "shubhamw20",
        admin_notes: admin_notes || '' 
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      alerts.success('Project Approved', 'The project has been approved successfully.')
      navigate("/main/admin/projects/validate")
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Failed to approve project.'
      alerts.error('Error', errorMessage)
    },
  })

  // Mutation for rejecting project
  const rejectProjectMutation = useMutation({
    mutationFn: ({ projectId, reject_note }: { projectId: number; reject_note: string }) => {
      return apiService.post(`/projects/${projectId}/reject`, { 
        reject_note: reject_note,
        approved_by: "shubhamw20"
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      alerts.success('Project Rejected', 'The project has been rejected and sent back to the municipality.')
      navigate("/main/admin/projects/validate")
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Failed to reject project.'
      alerts.error('Error', errorMessage)
    },
  })

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return '—'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || ''
    if (statusLower.includes('pending')) {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 inline-flex items-center gap-1">
          <Clock className="h-3 w-3" /> Pending Validation
        </Badge>
      )
    }
    if (statusLower.includes('approved')) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 inline-flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Approved
        </Badge>
      )
    }
    if (statusLower.includes('rejected')) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 inline-flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Rejected
        </Badge>
      )
    }
    return (
      <Badge variant="outline">{status}</Badge>
    )
  }

  const handleApprove = () => {
    setShowApproveConfirm(true)
  }

  const handleReject = () => {
    if (!remarks.trim()) {
      alerts.error('Validation Error', 'Remarks are required when rejecting a project.')
      return
    }
    setShowRejectConfirm(true)
  }

  const confirmApprove = () => {
    if (!project) return
    approveProjectMutation.mutate({ 
      projectId: project.id, 
      admin_notes: remarks.trim() || undefined 
    })
  }

  const confirmReject = () => {
    if (!project || !remarks.trim()) {
      alerts.error('Validation Error', 'Remarks are required when rejecting a project.')
      return
    }
    rejectProjectMutation.mutate({ 
      projectId: project.id, 
      reject_note: remarks.trim() 
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Project Review</h1>
          <Link to="/main/admin/projects/validate">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Project not found</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'The project you are looking for does not exist or has been removed.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/main/admin/projects/validate">
              <Button>Go to Project Validation</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Review</h1>
          <p className="text-muted-foreground mt-1">
            Review project details and approve or reject the submission
          </p>
        </div>
        <Link to="/main/admin/projects/validate">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Validation
          </Button>
        </Link>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Project Title</Label>
                <p className="font-semibold text-lg mt-1">{project.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="font-medium mt-1">{project.category || '—'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Project Stage</Label>
                  <p className="font-medium mt-1">
                    {project.project_stage?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(project.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Department</Label>
                  <p className="font-medium mt-1">{project.department || '—'}</p>
                </div>
              </div>
              {project.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1 text-muted-foreground whitespace-pre-wrap">{project.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">State</Label>
                  <p className="font-medium mt-1">{project.state || '—'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">City</Label>
                  <p className="font-medium mt-1">{project.city || '—'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ward</Label>
                  <p className="font-medium mt-1">{project.ward || '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Total Project Cost</Label>
                  <p className="font-semibold text-lg mt-1">{formatCurrency(project.total_project_cost)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Funding Required</Label>
                  <p className="font-semibold text-lg mt-1 text-green-600">{formatCurrency(project.funding_requirement)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Already Secured</Label>
                  <p className="font-semibold text-lg mt-1">{formatCurrency(project.already_secured_funds)}</p>
                </div>
              </div>
              {project.municipality_credit_rating && (
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <Label className="text-muted-foreground">Credit Rating</Label>
                    <p className="font-medium mt-1">{project.municipality_credit_rating}</p>
                  </div>
                  {project.municipality_credit_score && (
                    <div>
                      <Label className="text-muted-foreground">Credit Score</Label>
                      <p className="font-medium mt-1">{project.municipality_credit_score}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Project Start Date</Label>
                  <p className="font-medium mt-1">{formatDate(project.start_date)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Project End Date</Label>
                  <p className="font-medium mt-1">{formatDate(project.end_date)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fundraising Start</Label>
                  <p className="font-medium mt-1">{formatDate(project.fundraising_start_date)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fundraising End</Label>
                  <p className="font-medium mt-1">{formatDate(project.fundraising_end_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          {project.contact_person && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Contact Person
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium mt-1">{project.contact_person}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Designation</Label>
                    <p className="font-medium mt-1">{project.contact_person_designation || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium mt-1">{project.contact_person_email || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium mt-1">{project.contact_person_phone || '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Actions</CardTitle>
              <CardDescription>
                Approve or reject this project submission
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  placeholder="Add remarks or feedback for the municipality..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Remarks are required when rejecting a project. Optional for approval.
                </p>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleApprove}
                  disabled={approveProjectMutation.isPending || rejectProjectMutation.isPending}
                  className="w-full"
                >
                  {approveProjectMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve Project
                    </>
                  )}
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleReject}
                  disabled={approveProjectMutation.isPending || rejectProjectMutation.isPending || !remarks.trim()}
                  className="w-full"
                >
                  {rejectProjectMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Reject Project
                    </>
                  )}
                </Button>
              </div>

              {!remarks.trim() && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Remarks are required to reject a project. Please provide feedback explaining the rejection.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Project Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted On</span>
                <span className="font-medium">{formatDate(project.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">{formatDate(project.updated_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Organization ID</span>
                <span className="font-medium">{project.organization_id || '—'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Confirmation Dialog */}
      {showApproveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirm Approval</CardTitle>
              <CardDescription>
                Are you sure you want to approve this project?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {remarks.trim() && (
                <div>
                  <Label>Remarks</Label>
                  <p className="text-sm text-muted-foreground mt-1">{remarks}</p>
                </div>
              )}
            </CardContent>
            <CardContent className="flex justify-end gap-2 pt-0">
              <Button 
                variant="outline" 
                onClick={() => setShowApproveConfirm(false)}
                disabled={approveProjectMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmApprove}
                disabled={approveProjectMutation.isPending}
              >
                {approveProjectMutation.isPending ? 'Approving...' : 'Confirm Approval'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reject Confirmation Dialog */}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirm Rejection</CardTitle>
              <CardDescription>
                Are you sure you want to reject this project? The municipality will receive your remarks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Remarks</Label>
                <p className="text-sm text-muted-foreground mt-1">{remarks}</p>
              </div>
            </CardContent>
            <CardContent className="flex justify-end gap-2 pt-0">
              <Button 
                variant="outline" 
                onClick={() => setShowRejectConfirm(false)}
                disabled={rejectProjectMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmReject}
                disabled={rejectProjectMutation.isPending}
              >
                {rejectProjectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
