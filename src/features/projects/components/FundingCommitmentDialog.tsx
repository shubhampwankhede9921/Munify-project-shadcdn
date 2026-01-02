import { useState, useMemo, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { IndianRupee, Download, X, FileText, CheckCircle2 } from "lucide-react"
import { alerts } from "@/lib/alerts"
import apiService, { api } from "@/services/api"
import { type Project, LIVE_PROJECTS_QUERY_KEY } from "@/features/projects/types"
import { useAuth } from "@/contexts/auth-context"

interface FundingCommitmentDialogProps {
  open: boolean
  project_reference_id: string | null
  onClose: () => void
}

const isCommitmentWindowOpen = (project?: Project) => {
  if (!project) return false

  const now = new Date()

  const start = project.fundraising_start_date ? new Date(project.fundraising_start_date) : null
  const end = project.fundraising_end_date ? new Date(project.fundraising_end_date) : null

  // If no window is configured, treat as always open
  if (!start && !end) return true

  if (start && now < start) return false
  if (end && now > end) return false

  return true
}

const formatDate = (value?: string) => {
  if (!value) return ""
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return value
  return dt.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const formatCurrency = (amount: string | number | null | undefined) => {
  if (!amount) return "₹0"
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (Number.isNaN(num)) return "₹0"
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)}Cr`
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)}L`
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(2)}K`
  }
  return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
}

export function FundingCommitmentDialog({
  open,
  project_reference_id,
  onClose,
}: FundingCommitmentDialogProps) {
  const queryClient = useQueryClient()

  const [amount, setAmount] = useState("")
  const [interestRate, setInterestRate] = useState("")
  const [tenure, setTenure] = useState("")
  const [fundingMode, setFundingMode] = useState("")
  const [terms, setTerms] = useState("")
  const [supportingDocuments, setSupportingDocuments] = useState<File[]>([])
  const [commitmentId, setCommitmentId] = useState<number | null>(null)
  const [amountError, setAmountError] = useState("")
  const [documentError, setDocumentError] = useState("")
  
  // State for existing commitment documents
  interface CommitmentDocument {
    id: number
    commitment_id: number
    file_id: number
    document_type: string
    is_required: boolean
    uploaded_by: string
    file: {
      id: number
      filename: string
      original_filename: string
      mime_type: string
      file_size: number
      [key: string]: any
    }
  }
  const [existingDocuments, setExistingDocuments] = useState<CommitmentDocument[]>([])
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null)

  // TODO: replace with real authenticated user from auth context
  const { user } = useAuth()
  const currentUserId = user?.data?.login

  // Fetch project details by project_reference_id
  const {
    data: projectResponse,
    isLoading: isLoadingProject,
    isError: isProjectError,
  } = useQuery<any, any>({
    queryKey: ["project", "by-reference", project_reference_id],
    queryFn: async () => {
      if (!project_reference_id) return null
      // Fetch project by reference ID using the dedicated endpoint
      const response = await apiService.get(`/projects/reference/${project_reference_id}`, {
        committed_by: currentUserId,
      })
      // Handle different response structures
      return response?.data || response
    },
    enabled: open && !!project_reference_id,
  })

  const project = projectResponse as Project | undefined

  const isWindowOpen = useMemo(() => isCommitmentWindowOpen(project), [project])

  // Derive current user's commitment and its status (if any)
  const currentCommitment = (project as any)?.commitment as
    | {
        id: number
        amount?: string | number
        interest_rate?: string | number
        tenure_months?: number
        terms_conditions_text?: string
        funding_mode?: string
        status?: string
      }
    | undefined

  const commitmentStatus = currentCommitment?.status
  const isCommitmentUnderReview =
    !commitmentId || commitmentStatus?.toLowerCase() === "under_review"

  // Fetch commitment documents if commitmentId exists
  const {
    data: commitmentDocumentsResponse,
  } = useQuery<any, any>({
    queryKey: ["commitment-documents", commitmentId],
    queryFn: async () => {
      if (!commitmentId) return null
      // GET /api/v1/commitments/{commitment_id}?include_documents=true
      const response = await apiService.get(`/commitments/${commitmentId}`, {
        include_documents: true
      })
      // Response structure: { status: "success", message: "...", data: { commitment_id: 123, documents: [...] } }
      return response
    },
    enabled: open && !!commitmentId,
  })

  // Update existing documents when fetched
  useEffect(() => {
    if (!commitmentDocumentsResponse) {
      setExistingDocuments([])
      return
    }
    
    // Response structure: { status: "success", message: "...", data: { commitment_id: 123, documents: [...] } }
    let docs: CommitmentDocument[] = []
    
    // Check data.documents first (expected structure)
    if (commitmentDocumentsResponse?.data?.documents && Array.isArray(commitmentDocumentsResponse.data.documents)) {
      docs = commitmentDocumentsResponse.data.documents
    } 
    // Fallback to direct documents property
    else if (commitmentDocumentsResponse?.documents && Array.isArray(commitmentDocumentsResponse.documents)) {
      docs = commitmentDocumentsResponse.documents
    }
    
    setExistingDocuments(docs)
    
    // Debug logging
    if (commitmentId) {
      console.log('Commitment documents fetched:', {
        commitmentId,
        response: commitmentDocumentsResponse,
        documentsCount: docs.length,
        documents: docs
      })
    }
  }, [commitmentDocumentsResponse, commitmentId])

  // When project (with optional commitment) is loaded, prefill form if commitment exists
  useEffect(() => {
    if (!project) {
      setCommitmentId(null)
      return
    }

    const commitment = (project as any).commitment as
      | (typeof currentCommitment)
      | undefined

    if (!commitment) {
      // No existing commitment for this user
      setCommitmentId(null)
      return
    }

    setCommitmentId(commitment.id)

    // Prefill fields only if they are empty, so we don't overwrite user edits
    if (!amount) {
      const value = commitment.amount
      setAmount(
        typeof value === "number"
          ? value.toString()
          : value
          ? value.toString()
          : ""
      )
    }

    if (!interestRate) {
      const value = commitment.interest_rate
      setInterestRate(
        typeof value === "number"
          ? value.toString()
          : value
          ? value.toString()
          : ""
      )
    }

    if (!tenure) {
      setTenure(
        commitment.tenure_months != null
          ? String(commitment.tenure_months)
          : ""
      )
    }

    if (!fundingMode && commitment.funding_mode) {
      // Normalize to our select values (uppercased)
      setFundingMode(commitment.funding_mode.toUpperCase())
    }

    if (!terms && commitment.terms_conditions_text) {
      setTerms(commitment.terms_conditions_text)
    }
  }, [project])

  const resetForm = () => {
    setAmount("")
    setInterestRate("")
    setTenure("")
    setFundingMode("")
    setTerms("")
    setSupportingDocuments([])
    setCommitmentId(null)
    setAmountError("")
    setDocumentError("")
    setExistingDocuments([])
    setDeletingFileId(null)
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
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

  // Handle file delete
  const handleDeleteDocument = async (fileId: number) => {
    if (!commitmentId) return
    
    // Prevent double delete calls
    if (deletingFileId === fileId) {
      return
    }
    
    try {
      setDeletingFileId(fileId)
      
      // Use query params in URL - DELETE /api/v1/commitments/files/{file_id}?commitment_id=123
      await apiService.delete(`/commitments/files/${fileId}?commitment_id=${commitmentId}`)
      
      // Remove from local state
      setExistingDocuments(prev => {
        const updated = prev.filter(doc => doc.file_id !== fileId)
        // If no documents remain, set error
        if (updated.length === 0) {
          setDocumentError("Supporting document is required")
        }
        return updated
      })
      
      alerts.success('Success', 'Document deleted successfully')
      
      // Refresh documents
      queryClient.invalidateQueries({ queryKey: ["commitment-documents", commitmentId] })
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete document. Please try again.'
      alerts.error('Error', errorMessage)
      console.error('Error deleting document:', err)
    } finally {
      setDeletingFileId(null)
    }
  }

  // Handle file upload for existing commitment
  const uploadDocumentMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!commitmentId) {
        throw new Error("Commitment ID is required")
      }
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('document_type', 'sanction_letter')
      
      // organization_id is optional, can be fetched from commitment
      if (user?.data?.userBranches?.[1]?.branchId) {
        formData.append('organization_id', String(user.data.userBranches[1].branchId))
      }
      
      return apiService.post(`/commitments/${commitmentId}/files/upload`, formData)
    },
    onSuccess: () => {
      alerts.success('Success', 'Document uploaded successfully')
      // Clear error when document is uploaded
      if (documentError) {
        setDocumentError("")
      }
      // Refresh documents
      queryClient.invalidateQueries({ queryKey: ["commitment-documents", commitmentId] })
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to upload document. Please try again.'
      alerts.error('Error', errorMessage)
    },
  })

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    if (!commitmentId) {
      alerts.error('Error', 'Commitment ID is required')
      return
    }
    
    // Clear error when files are selected
    if (documentError) {
      setDocumentError("")
    }
    
    const fileArray = Array.from(files)
    for (const file of fileArray) {
      await uploadDocumentMutation.mutateAsync(file)
    }
    
    // Clear the input
    const input = document.getElementById('supportingDocumentsEdit') as HTMLInputElement
    if (input) {
      input.value = ''
    }
  }

  // Validate amount against minimum commitment amount
  const validateAmount = (value: string) => {
    if (!value.trim()) {
      setAmountError("")
      return true
    }

    const parsedAmount = parseFloat(value)
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError("Please enter a valid commitment amount")
      return false
    }

    const minAmount = project?.minimum_commitment_amount
    if (minAmount) {
      const minAmountNum = typeof minAmount === "string" ? parseFloat(minAmount) : minAmount
      if (!Number.isNaN(minAmountNum) && parsedAmount < minAmountNum) {
        setAmountError(`Amount must be at least ${formatCurrency(minAmount)}`)
        return false
      }
    }

    setAmountError("")
    return true
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)
    validateAmount(value)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const commitFundingMutation = useMutation({
    mutationFn: async () => {
      if (!project || !amount || !interestRate || !tenure || !fundingMode) {
        throw new Error("Please fill in all required fields")
      }

      if (!isWindowOpen) {
        throw new Error(
          "Commitments can be submitted, modified, or withdrawn only while the commitment window is open for this project."
        )
      }

      // Validate documents are uploaded
      const hasExistingCommitment = Boolean(commitmentId)
      if (hasExistingCommitment) {
        // For existing commitment, check if documents exist
        if (existingDocuments.length === 0) {
          setDocumentError("Supporting document is required")
          throw new Error("Supporting document is required")
        }
      } else {
        // For new commitment, check if files are selected
        if (supportingDocuments.length === 0) {
          setDocumentError("Supporting document is required")
          throw new Error("Supporting document is required")
        }
      }

      const parsedAmount = parseFloat(amount)
      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Please enter a valid commitment amount")
      }

      // Validate against minimum commitment amount
      const minAmount = project.minimum_commitment_amount
      if (minAmount) {
        const minAmountNum = typeof minAmount === "string" ? parseFloat(minAmount) : minAmount
        if (!Number.isNaN(minAmountNum) && parsedAmount < minAmountNum) {
          throw new Error(`Commitment amount must be at least ${formatCurrency(minAmount)}`)
        }
      }

      const rate = parseFloat(interestRate)
      if (Number.isNaN(rate) || rate <= 0 || rate > 100) {
        throw new Error("Please enter a valid interest rate between 0 and 100")
      }

      const tenureValue = parseInt(tenure, 10)
      if (Number.isNaN(tenureValue) || tenureValue <= 0) {
        throw new Error("Please enter a valid tenure (in months)")
      }

      const normalizedFundingMode = fundingMode.toLowerCase() as "loan" | "grant" | "csr"

      if (hasExistingCommitment && commitmentId) {
        if (!isCommitmentUnderReview) {
          throw new Error("You can update your commitment only while it is UNDER_REVIEW.")
        }
        // Update existing commitment (without documents for now, as update endpoint may not support documents)
        const updatePayload = {
          amount: parsedAmount,
          interest_rate: rate,
          tenure_months: tenureValue,
          terms_conditions_text: terms?.trim() || "",
          updated_by: currentUserId,
        }

        return apiService.put(`/commitments/${commitmentId}`, updatePayload)
      }

      // Create new commitment with documents using FormData
      const formData = new FormData()
      
      // Commitment fields
      formData.append('project_reference_id', project.project_reference_id)
      formData.append('organization_type', user?.data?.org_type || '')
      formData.append('organization_id', String(user?.data?.userBranches?.[1]?.branchId || ''))
      formData.append('committed_by', currentUserId || '')
      formData.append('amount', parsedAmount.toString())
      formData.append('currency', 'INR')
      formData.append('funding_mode', normalizedFundingMode)
      formData.append('interest_rate', rate.toString())
      formData.append('tenure_months', tenureValue.toString())
      formData.append('terms_conditions_text', terms?.trim() || '')
      formData.append('access_level', 'private')
      formData.append('is_required', 'true')
      
      // Document fields (if files are provided)
      if (supportingDocuments.length > 0) {
        supportingDocuments.forEach((file) => {
          formData.append('files', file)
          formData.append('document_types', 'sanction_letter')
        })
      }

      return apiService.post("/commitments/with-documents", formData)
    },
    onSuccess: (_data, _variables, _context) => {
      alerts.success("Funding Committed", "Successfully saved your commitment for this project")
      const newCommitmentId = _data?.data?.id || _data?.id || commitmentId
      resetForm()
      onClose()
      queryClient.invalidateQueries({ queryKey: LIVE_PROJECTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ["project", "by-reference", project_reference_id] })
      if (newCommitmentId) {
        queryClient.invalidateQueries({ queryKey: ["commitment-documents", newCommitmentId] })
      }
    },
    onError: (error: any) => {
      const message =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to commit funding. Please review your inputs and try again."
      // Close the main dialog first, then show error alert
      handleClose()
      // Use setTimeout to ensure dialog closes before showing error alert
      setTimeout(() => {
        alerts.error("Error", message)
      }, 100)
    },
  })

  const withdrawCommitmentMutation = useMutation({
    mutationFn: async () => {
      if (!commitmentId) {
        throw new Error("No commitment found to withdraw")
      }

      if (!isCommitmentUnderReview) {
        throw new Error("You can withdraw your commitment only while it is UNDER_REVIEW.")
      }

      return apiService.post(`/commitments/${commitmentId}/withdraw`,{updated_by: currentUserId})
    },
    onSuccess: () => {
      alerts.success("Commitment Withdrawn", "Your commitment has been withdrawn successfully.")
      const withdrawnCommitmentId = commitmentId
      resetForm()
      onClose()
      // Refresh lists and project details
      queryClient.invalidateQueries({ queryKey: LIVE_PROJECTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ["project", "by-reference", project_reference_id] })
      if (withdrawnCommitmentId) {
        queryClient.invalidateQueries({ queryKey: ["commitment-documents", withdrawnCommitmentId] })
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to withdraw commitment. Please try again."
      // Close the main dialog first, then show error alert
      handleClose()
      // Use setTimeout to ensure dialog closes before showing error alert
      setTimeout(() => {
        alerts.error("Error", message)
      }, 100)
    },
  })

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <DialogContent className="w-[95vw] max-w-[850px] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
          <DialogTitle className="text-xl font-semibold">Commit Funding</DialogTitle>
          <DialogDescription className="text-sm mt-1">
            Enter the details of your funding commitment for this project.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 px-6 py-4 overflow-y-auto">
          {isLoadingProject ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size={24} />
              <span className="ml-2 text-sm text-muted-foreground">Loading project details...</span>
            </div>
          ) : isProjectError || !project ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-sm text-destructive mb-4">
                Failed to load project details. Please try again.
              </p>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          ) : (
          <div className="flex flex-col gap-4">
            {project && (
              <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs border">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Commitment Window</span>
                  <Badge
                    variant={isWindowOpen ? "secondary" : "outline"}
                    className={
                      isWindowOpen
                        ? "bg-green-600 text-white hover:bg-green-700 text-xs px-2 py-0.5"
                        : "border-red-300 text-red-600 bg-red-50 text-xs px-2 py-0.5"
                    }
                  >
                    {isWindowOpen ? "Open" : "Closed"}
                  </Badge>
                </div>
                {(project.fundraising_start_date || project.fundraising_end_date) && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {project.fundraising_start_date && (
                      <span>From {formatDate(project.fundraising_start_date)} </span>
                    )}
                    {project.fundraising_end_date && (
                      <span>to {formatDate(project.fundraising_end_date)}</span>
                    )}
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="amount" className="text-sm font-medium">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Enter amount"
                  min="1"
                  className={`h-9 text-sm ${amountError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {amountError && (
                  <p className="text-xs text-destructive mt-1">{amountError}</p>
                )}
                {project?.minimum_commitment_amount && !amountError && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum: {formatCurrency(project.minimum_commitment_amount)}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="interestRate" className="text-sm font-medium">Rate (p.a. %) *</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="Enter rate"
                  min="0"
                  max="100"
                  step="0.01"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tenure" className="text-sm font-medium">Tenure (months) *</Label>
                <Input
                  id="tenure"
                  type="number"
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                  placeholder="Enter tenure"
                  min="1"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-3">
                <Label htmlFor="fundingMode" className="text-sm font-medium">Mode of Funding *</Label>
                <Select value={fundingMode} onValueChange={setFundingMode}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select mode of funding" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOAN">Loan</SelectItem>
                    <SelectItem value="GRANT">Grant</SelectItem>
                    <SelectItem value="CSR">CSR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-3">
                <Label htmlFor="terms" className="text-sm font-medium">Terms &amp; Conditions</Label>
                <Textarea
                  id="terms"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Specify any terms or conditions related to this commitment (optional)"
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>
            </div>

            {/* Existing Documents (when editing) */}
            {commitmentId && (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-3">
                  <Label className="text-sm font-medium">Supporting Documents *</Label>
                  
                  {/* File Upload for existing commitment - only show if no documents exist */}
                  {existingDocuments.length === 0 && (
                    <>
                      <Input
                        id="supportingDocumentsEdit"
                        type="file"
                        multiple
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="h-9 text-sm cursor-pointer mb-3"
                        disabled={uploadDocumentMutation.isPending}
                      />
                      {uploadDocumentMutation.isPending && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                          <Spinner size={16} />
                          <span>Uploading document...</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Existing Documents List */}
                  {existingDocuments.length > 0 ? (
                    <div className="space-y-2">
                      {existingDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200"
                        >
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{doc.file?.original_filename || doc.file?.filename || 'Unknown file'}</div>
                              <div className="text-xs text-muted-foreground">
                                {doc.file?.file_size ? formatFileSize(doc.file.file_size) : 'Unknown size'} • {doc.document_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Document'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            {doc.file?.id && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadFile(doc.file.id, doc.file.original_filename || doc.file.filename)}
                                title="Download file"
                                className="flex-shrink-0"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc.file_id)}
                              disabled={deletingFileId === doc.file_id || uploadDocumentMutation.isPending}
                              title="Delete file"
                              className="flex-shrink-0"
                            >
                              {deletingFileId === doc.file_id ? (
                                <Spinner size={16} />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !uploadDocumentMutation.isPending && (
                      <p className="text-sm text-muted-foreground">No documents uploaded yet. Use the file input above to upload documents.</p>
                    )
                  )}
                  {documentError && (
                    <p className="text-xs text-destructive mt-1">{documentError}</p>
                  )}
                </div>
              </div>
            )}

            {/* File Upload (when creating new commitment) */}
            {!commitmentId && (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-3">
                  <Label htmlFor="supportingDocuments" className="text-sm font-medium">Supporting Documents *</Label>
                  <Input
                    id="supportingDocuments"
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      setSupportingDocuments(files)
                      // Clear error when files are selected
                      if (files.length > 0 && documentError) {
                        setDocumentError("")
                      }
                    }}
                    className={`h-9 text-sm cursor-pointer ${documentError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {documentError && (
                    <p className="text-xs text-destructive mt-1">{documentError}</p>
                  )}
                  {supportingDocuments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {supportingDocuments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-muted">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <FileText className="h-4 w-4 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{file.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSupportingDocuments(prev => prev.filter((_, i) => i !== index))
                            }}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload sanction letters, approval notes, or other supporting documents (required)
                  </p>
                </div>
              </div>
            )}
          </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t flex-shrink-0 bg-muted/30 gap-2 sm:justify-between">
          <div className="flex items-center gap-2">
            {commitmentId && isCommitmentUnderReview && (
              <Button
                variant="destructive"
                type="button"
                onClick={() => withdrawCommitmentMutation.mutate()}
                disabled={
                  withdrawCommitmentMutation.isPending ||
                  commitFundingMutation.isPending ||
                  isLoadingProject
                }
                className="h-9 px-4"
              >
                {withdrawCommitmentMutation.isPending ? "Withdrawing..." : "Withdraw Commitment"}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={commitFundingMutation.isPending || withdrawCommitmentMutation.isPending}
              className="h-9 px-6"
              type="button"
            >
              Cancel
            </Button>
            {/* Show Commit button only when creating a new commitment */}
            {!commitmentId && (
              <Button
                type="button"
                onClick={() => commitFundingMutation.mutate()}
                disabled={
                  commitFundingMutation.isPending ||
                  withdrawCommitmentMutation.isPending ||
                  !isWindowOpen ||
                  isLoadingProject ||
                  !project ||
                  !!amountError
                }
                className="h-9 px-6"
              >
                {commitFundingMutation.isPending ? (
                  <Spinner className="mr-2" size={16} />
                ) : (
                  <IndianRupee className="h-4 w-4 mr-2" />
                )}
                {commitFundingMutation.isPending ? "Saving..." : "Commit Funding"}
              </Button>
            )}
            {/* Show Update button only when commitment is UNDER_REVIEW */}
            {commitmentId && isCommitmentUnderReview && (
              <Button
                type="button"
                onClick={() => commitFundingMutation.mutate()}
                disabled={
                  commitFundingMutation.isPending ||
                  withdrawCommitmentMutation.isPending ||
                  !isWindowOpen ||
                  isLoadingProject ||
                  !project ||
                  !!amountError ||
                  existingDocuments.length === 0
                }
                className="h-9 px-6"
              >
                {commitFundingMutation.isPending ? (
                  <Spinner className="mr-2" size={16} />
                ) : (
                  <IndianRupee className="h-4 w-4 mr-2" />
                )}
                {commitFundingMutation.isPending ? "Saving..." : "Update Commitment"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


