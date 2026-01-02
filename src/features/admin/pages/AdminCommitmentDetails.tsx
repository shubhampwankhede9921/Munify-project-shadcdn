import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DataTable, type ColumnDef } from "@/components/data-table/data-table"
import {
  ArrowLeft,
  Eye,
  CheckCircle2,
  X,
  Clock,
  AlertTriangle,
  Award,
  MoreHorizontal,
  ArrowUpDown,
  File,
  Download,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import apiService, { api } from "@/services/api"
import { alerts } from "@/lib/alerts"
import { useAuth } from "@/contexts/auth-context"

type Commitment = any

export default function AdminCommitmentDetails() {
  const { projectReferenceId } = useParams<{ projectReferenceId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [remarks, setRemarks] = useState('')

  const { user } = useAuth();
  
  // TODO: replace with real authenticated admin user
  const currentAdminId = user?.data?.login

  // Query for commitments by project using summary API:
  // GET /commitments/commitment-details/by-projectt?project_reference_id={id}&skip=0
  const skip = 0
  const { data: apiResponse, isLoading, error, isError } = useQuery({
    queryKey: ["commitments", "project", projectReferenceId, { skip }],
    queryFn: async () =>
      apiService.get("/commitments/commitment-details/by-project", {
        project_reference_id: projectReferenceId,
        include_documents: true,
        skip,
      }),
    enabled: !!projectReferenceId,
  })

  // Extract commitments array from API response: { status, message, data: [...], total }
  const commitments: any[] = useMemo(() => {
    const items = (apiResponse as any)?.data ?? []
    return Array.isArray(items) ? items : []
  }, [apiResponse])

  // Find best deal (lowest interest rate, or highest amount if rates are equal)
  const bestDeal = useMemo(() => {
    if (commitments.length === 0) return null
    const sortedByRate = [...commitments].sort((a, b) => {
      const rateA = typeof a.interest_rate === 'string' ? parseFloat(a.interest_rate) : a.interest_rate || 999
      const rateB = typeof b.interest_rate === 'string' ? parseFloat(b.interest_rate) : b.interest_rate || 999
      if (rateA !== rateB) return rateA - rateB
      // If rates are equal, prefer higher amount
      const amountA = typeof a.amount === 'string' ? parseFloat(a.amount) : a.amount || 0
      const amountB = typeof b.amount === 'string' ? parseFloat(b.amount) : b.amount || 0
      return amountB - amountA
    })
    return sortedByRate[0]
  }, [commitments])

  const projectTitle = commitments[0]?.project_title || commitments[0]?.project_reference_id || projectReferenceId

  // Mutation for approving commitment
  const approveCommitmentMutation = useMutation({
    mutationFn: ({ commitmentId, remarks }: { commitmentId: number; remarks?: string }) => {
      // POST /commitments/{commitment_id}/approve
      return apiService.post(`/commitments/${commitmentId}/approve`, {
        approved_by: currentAdminId,
        approval_notes: remarks || undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commitments'] })
      queryClient.invalidateQueries({ queryKey: ['commitments', 'project', projectReferenceId] })
      alerts.success('Commitment Approved', 'The commitment has been approved successfully.')
      setIsApproveDialogOpen(false)
      setSelectedCommitment(null)
      setRemarks('')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Failed to approve commitment.'
      alerts.error('Error', errorMessage)
    },
  })

  // Mutation for rejecting commitment
  const rejectCommitmentMutation = useMutation({
    mutationFn: ({ commitmentId, remarks }: { commitmentId: number; remarks: string }) => {
      // POST /commitments/{commitment_id}/reject
      return apiService.post(`/commitments/${commitmentId}/reject`, {
        approved_by: currentAdminId,
        rejection_reason: remarks,
        rejection_notes: remarks,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commitments'] })
      queryClient.invalidateQueries({ queryKey: ['commitments', 'project', projectReferenceId] })
      alerts.success('Commitment Rejected', 'The commitment has been rejected.')
      setIsRejectDialogOpen(false)
      setSelectedCommitment(null)
      setRemarks('')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Failed to reject commitment.'
      alerts.error('Error', errorMessage)
    },
  })

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(num)) return '₹0'
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)}Cr`
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)}L`
    } else if (num >= 1000) {
      return `₹${(num / 1000).toFixed(2)}K`
    }
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Handle file download
  const handleDownloadFile = async (fileId: number, filename: string) => {
    try {
      const response = await api.get(`/files/${fileId}/download`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      alerts.success('Success', 'File downloaded successfully')
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to download file. Please try again.'
      alerts.error('Error', errorMessage)
      console.error('Error downloading file:', err)
    }
  }

  // Handle file view (open in new tab)
  const handleViewFile = async (fileId: number, mimeType: string) => {
    try {
      const response = await api.get(`/files/${fileId}/download`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }))
      window.open(url, '_blank')
      // Clean up URL after a delay to allow the browser to load it
      setTimeout(() => window.URL.revokeObjectURL(url), 100)
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to view file. Please try again.'
      alerts.error('Error', errorMessage)
      console.error('Error viewing file:', err)
    }
  }

  // Get document type display name
  const getDocumentTypeName = (documentType: string): string => {
    const typeMap: Record<string, string> = {
      'sanction_letter': 'Sanction Letter',
      'term_sheet': 'Term Sheet',
      'commitment_letter': 'Commitment Letter',
      'other': 'Other Document',
    }
    return typeMap[documentType] || documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || ''
    if (statusLower === 'under_review') {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 inline-flex items-center gap-1">
          <Clock className="h-3 w-3" /> Under Review
        </Badge>
      )
    }
    if (statusLower === 'approved') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 inline-flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Approved
        </Badge>
      )
    }
    if (statusLower === 'rejected') {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 inline-flex items-center gap-1">
          <X className="h-3 w-3" /> Rejected
        </Badge>
      )
    }
    if (statusLower === 'withdrawn') {
      return (
        <Badge variant="outline" className="inline-flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Withdrawn
        </Badge>
      )
    }
    return <Badge variant="outline">{status}</Badge>
  }

  const handleViewDetails = (commitment: Commitment) => {
    setSelectedCommitment(commitment)
    setIsReviewDialogOpen(true)
  }

  const handleApprove = () => {
    if (!selectedCommitment) return
    setIsReviewDialogOpen(false)
    setIsApproveDialogOpen(true)
  }

  const handleReject = () => {
    if (!selectedCommitment) return
    setIsReviewDialogOpen(false)
    setIsRejectDialogOpen(true)
  }

  const confirmApprove = () => {
    if (!selectedCommitment) return
    approveCommitmentMutation.mutate({
      commitmentId: selectedCommitment.id,
      remarks: remarks.trim() || undefined,
    })
  }

  const confirmReject = () => {
    if (!selectedCommitment || !remarks.trim()) {
      alerts.error('Validation Error', 'Rejection notes are required when rejecting a commitment.')
      return
    }
    rejectCommitmentMutation.mutate({
      commitmentId: selectedCommitment.id,
      remarks: remarks.trim(),
    })
  }

  const isBestDeal = (commitment: Commitment) => {
    return bestDeal?.id === commitment.id
  }

  // Simple status counts for header chips
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      under_review: 0,
      approved: 0,
      rejected: 0,
      withdrawn: 0,
    }

    commitments.forEach((c) => {
      const s = (c.status || "").toLowerCase()
      if (s in counts) {
        counts[s] += 1
      }
    })

    return counts
  }, [commitments])

  // Table columns for commitments list
  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: "organization_id",
        header: ({ column }) => (
          <button
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Lender
            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
          </button>
        ),
        cell: ({ row }) => {
          const c = row.original as any
          return (
            <div className="min-w-[180px]">
              <div className="font-medium text-foreground">{c.organization_id}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{c.committed_by}</div>
            </div>
          )
        },
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <button
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
          </button>
        ),
        cell: ({ row }) => {
          const c = row.original as any
          const amount = typeof c.amount === "string" ? parseFloat(c.amount) : c.amount || 0
          return (
            <div className="min-w-[120px]">
              <div className="font-medium text-foreground">{formatCurrency(amount)}</div>
            </div>
          )
        },
      },
      {
        accessorKey: "interest_rate",
        header: ({ column }) => (
          <button
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Rate / Tenure
            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
          </button>
        ),
        cell: ({ row }) => {
          const c = row.original as any
          const rate = typeof c.interest_rate === "string" ? parseFloat(c.interest_rate) : c.interest_rate || 0
          return (
            <div className="min-w-[140px] text-sm">
              <div className="font-medium">{rate}% p.a.</div>
              <div className="text-xs text-muted-foreground">{c.tenure_months} months</div>
            </div>
          )
        },
      },
      {
        accessorKey: "funding_mode",
        header: ({ column }) => (
          <button
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Mode
            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
          </button>
        ),
        cell: ({ row }) => {
          const c = row.original as any
          return (
            <div className="min-w-[100px] capitalize text-sm font-medium">
              {c.funding_mode}
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: () => (
          <span className="text-xs sm:text-sm font-semibold text-foreground">Status</span>
        ),
        cell: ({ row }) => {
          const c = row.original as any
          const isBest = isBestDeal(c)
          return (
            <div className="flex items-center gap-2 min-w-[160px]">
              {getStatusBadge(c.status)}
              {isBest && c.status?.toLowerCase() === "under_review" && (
                <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 text-xs inline-flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  Best Deal
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <button
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground hover:text-foreground transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Submitted At
            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
          </button>
        ),
        cell: ({ row }) => {
          const c = row.original as any
          return (
            <div className="min-w-[160px] text-sm text-muted-foreground">
              {formatDate(c.created_at)}
            </div>
          )
        },
      },
      {
        id: "actions",
        header: () => (
          <span className="text-xs sm:text-sm font-semibold text-foreground">Actions</span>
        ),
        enableHiding: false,
        cell: ({ row }) => {
          const c = row.original as any
          const canApprove = c.status?.toLowerCase() === "under_review"

          return (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDetails(c)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Details
              </Button>
              {canApprove && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedCommitment(c)
                        handleApprove()
                      }}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedCommitment(c)
                        handleReject()
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )
        },
      },
    ],
    [handleApprove, handleReject, handleViewDetails]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border bg-gradient-to-r from-sky-50 via-indigo-50 to-emerald-50 dark:from-sky-950/40 dark:via-indigo-950/40 dark:to-emerald-950/40 px-6 py-4 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/main/admin/commitments")}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Project Commitments</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {projectTitle} • {commitments.length} commitment{commitments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <Badge variant="outline" className="bg-white/70 dark:bg-black/40 text-xs px-3 py-1 rounded-full">
            Total: <span className="ml-1 font-semibold">{commitments.length}</span>
          </Badge>
          {statusCounts.under_review > 0 && (
            <Badge className="bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900 dark:text-amber-100 text-xs px-3 py-1 rounded-full">
              Under review: <span className="ml-1 font-semibold">{statusCounts.under_review}</span>
            </Badge>
          )}
          {statusCounts.approved > 0 && (
            <Badge className="bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-100 text-xs px-3 py-1 rounded-full">
              Approved: <span className="ml-1 font-semibold">{statusCounts.approved}</span>
            </Badge>
          )}
          {statusCounts.rejected > 0 && (
            <Badge className="bg-red-100 text-red-900 border-red-200 dark:bg-red-900 dark:text-red-100 text-xs px-3 py-1 rounded-full">
              Rejected: <span className="ml-1 font-semibold">{statusCounts.rejected}</span>
            </Badge>
          )}
          {statusCounts.withdrawn > 0 && (
            <Badge variant="outline" className="bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-100 text-xs px-3 py-1 rounded-full">
              Withdrawn: <span className="ml-1 font-semibold">{statusCounts.withdrawn}</span>
            </Badge>
          )}
          {bestDeal && (
            <Badge className="bg-green-100 text-green-900 border-green-200 dark:bg-green-900 dark:text-green-100 text-xs px-3 py-1 rounded-full inline-flex items-center gap-1">
              <Award className="h-3 w-3" />
              Best deal @{" "}
              <span className="font-semibold">
                {typeof bestDeal.interest_rate === "string"
                  ? parseFloat(bestDeal.interest_rate)
                  : bestDeal.interest_rate}
                %
              </span>
            </Badge>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {isError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Failed to load commitments. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading commitments...</div>
        </div>
      )}

      {/* Commitments List */}
      {!isLoading && commitments.length > 0 && (
      
          <DataTable<any, any>
            title="Commitments"
            description="Review and manage all commitments for this project"
            columns={columns}
            data={commitments}
            showToolbar={true}
            showFooter={true}
            enableExport={true}
          />
      
      )}

      {/* Empty State */}
      {!isLoading && commitments.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No commitments found</h3>
              <p className="text-sm text-muted-foreground">
                No commitments have been submitted for this project yet.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Details Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Commitment Details</DialogTitle>
            <DialogDescription>
              Review the commitment details before approving or rejecting
            </DialogDescription>
          </DialogHeader>
          {selectedCommitment && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Project Reference ID</Label>
                  <p className="font-medium">{selectedCommitment.project_reference_id || selectedCommitment.project_id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedCommitment.status)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Lender Organization</Label>
                  <p className="font-medium">{selectedCommitment.organization_id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Committed By</Label>
                  <p className="font-medium">{selectedCommitment.committed_by}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Amount</Label>
                  <p className="font-medium">
                    {formatCurrency(
                      typeof selectedCommitment.amount === 'string'
                        ? parseFloat(selectedCommitment.amount)
                        : selectedCommitment.amount || 0
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Currency</Label>
                  <p className="font-medium">{selectedCommitment.currency || 'INR'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Funding Mode</Label>
                  <p className="font-medium capitalize">{selectedCommitment.funding_mode || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Interest Rate</Label>
                  <p className="font-medium">{selectedCommitment.interest_rate}% p.a.</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tenure</Label>
                  <p className="font-medium">{selectedCommitment.tenure_months} months</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Created At</Label>
                  <p className="font-medium">{formatDate(selectedCommitment.created_at)}</p>
                </div>
                {selectedCommitment.approved_at && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Approved At</Label>
                    <p className="font-medium">{formatDate(selectedCommitment.approved_at)}</p>
                  </div>
                )}
                {selectedCommitment.approved_by && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Approved By</Label>
                    <p className="font-medium">{selectedCommitment.approved_by}</p>
                  </div>
                )}
                {selectedCommitment.rejection_notes && (
                  <div className="md:col-span-2">
                    <Label className="text-xs text-muted-foreground">Rejection Notes</Label>
                    <p className="font-medium text-red-600">{selectedCommitment.rejection_notes}</p>
                  </div>
                )}
              </div>
              {selectedCommitment.terms_conditions_text && (
                <div>
                  <Label className="text-xs text-muted-foreground">Terms & Conditions</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedCommitment.terms_conditions_text}</p>
                </div>
              )}
              {selectedCommitment.documents && selectedCommitment.documents.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Documents</Label>
                  <div className="space-y-2">
                    {selectedCommitment.documents.map((doc: any) => (
                      <Card key={doc.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{doc.file?.original_filename || doc.file?.filename || 'Document'}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <span>{getDocumentTypeName(doc.document_type)}</span>
                                {doc.file?.file_size && (
                                  <>
                                    <span>•</span>
                                    <span>{formatFileSize(doc.file.file_size)}</span>
                                  </>
                                )}
                                {doc.is_required && (
                                  <>
                                    <span>•</span>
                                    <Badge variant="outline" className="text-xs">Required</Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {doc.file && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewFile(doc.file.id, doc.file.mime_type)}
                                  title="View document"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadFile(doc.file.id, doc.file.original_filename || doc.file.filename)}
                                  title="Download document"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Close
            </Button>
            {selectedCommitment?.status?.toLowerCase() === 'under_review' && (
              <>
                <Button variant="destructive" onClick={() => handleReject()}>
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button onClick={() => handleApprove()}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Commitment</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this commitment? You can add optional remarks below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approve-remarks">Remarks (Optional)</Label>
              <Textarea
                id="approve-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any remarks or notes about this approval..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmApprove}
              disabled={approveCommitmentMutation.isPending}
            >
              {approveCommitmentMutation.isPending ? 'Approving...' : 'Approve Commitment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Commitment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this commitment. This is required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-remarks">Rejection Notes *</Label>
              <Textarea
                id="reject-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter the reason for rejecting this commitment..."
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={rejectCommitmentMutation.isPending || !remarks.trim()}
            >
              {rejectCommitmentMutation.isPending ? 'Rejecting...' : 'Reject Commitment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

