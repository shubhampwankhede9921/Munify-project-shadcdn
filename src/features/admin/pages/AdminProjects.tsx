import { useState, useMemo, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DataTable, type ColumnDef } from "@/components/data-table/data-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  TrendingUp,
  Users,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  IndianRupee,
  Clock,
  CheckCircle2,
  X,
  ArrowUpDown,
} from "lucide-react"
import apiService from "@/services/api"
import { alerts } from "@/lib/alerts"

// Unified Project interface
interface AdminProject {
  id: number
  project_reference_id?: string
  title?: string
  name?: string
  project_title?: string
  municipality?: string
  municipality_id?: string
  organization_id?: string
  state?: string
  city?: string
  location?: string
  category?: string
  project_category?: string
  project_stage?: string
  status: string
  fundRequired?: number
  funding_requirement?: number
  total_project_cost?: number
  currentFunding?: number
  funds_secured?: number
  already_secured_funds?: number
  progress?: number
  investors?: number
  createdDate?: string
  created_at?: string
  updated_at?: string
  deadline?: string
  end_date?: string
  priority?: string
}

// API response might be an array or an object with data property
type ProjectsApiResponse = AdminProject[] | { data: AdminProject[] } | { results: AdminProject[] }

export default function AdminProjects() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all')

  // Auto-switch to pending tab if coming from validation route
  useEffect(() => {
    if (location.pathname.includes('/validate')) {
      setActiveTab('pending')
    }
  }, [location.pathname])
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [remarks, setRemarks] = useState('')

  // Query for all projects
  const { data: apiResponse, isLoading, error, isError } = useQuery<ProjectsApiResponse>({
    queryKey: ['projects'],
    queryFn: () => apiService.get<ProjectsApiResponse>('/projects/'),
  })

  // Safely extract projects array from API response
  const allProjects: AdminProject[] = useMemo(() => {
    if (!apiResponse) return []
    if (Array.isArray(apiResponse)) return apiResponse
    if ('data' in apiResponse && Array.isArray(apiResponse.data)) return apiResponse.data
    if ('results' in apiResponse && Array.isArray(apiResponse.results)) return apiResponse.results
    return []
  }, [apiResponse])

  // Filter projects based on active tab
  const projects = useMemo(() => {
    if (activeTab === 'pending') {
      return allProjects.filter(p => {
        const status = p.status?.toLowerCase() || ''
        return status === 'pending_validation' || status === 'pending validation'
      })
    }
    return allProjects
  }, [allProjects, activeTab])

  // Calculate stats from all projects
  const stats = useMemo(() => {
    if (!Array.isArray(allProjects)) {
      return {
        totalProjects: 0,
        liveProjects: 0,
        pendingValidation: 0,
        totalFunding: 0,
        activeInvestors: 0
      }
    }
    
    return {
      totalProjects: allProjects.length,
      liveProjects: allProjects.filter(p => {
        const status = p.status?.toLowerCase() || ''
        return status === 'live' || status === 'active' || status === 'published'
      }).length,
      pendingValidation: allProjects.filter(p => {
        const status = p.status?.toLowerCase() || ''
        return status === 'pending_validation' || status === 'pending validation'
      }).length,
      totalFunding: allProjects.reduce((sum, p) => {
        const funding = p.currentFunding || p.funds_secured || 0
        return sum + funding
      }, 0),
      activeInvestors: allProjects.reduce((sum, p) => sum + (p.investors || 0), 0)
    }
  }, [allProjects])

  // Mutation for approving project
  const approveProjectMutation = useMutation({
    mutationFn: ({ projectId, remarks }: { projectId: number; remarks?: string }) => {
      return apiService.put(`/projects/${projectId}/approve`, { remarks: remarks || '' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      alerts.success('Project Approved', 'The project has been approved successfully.')
      setIsApproveDialogOpen(false)
      setSelectedProject(null)
      setRemarks('')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Failed to approve project.'
      alerts.error('Error', errorMessage)
    },
  })

  // Mutation for rejecting project
  const rejectProjectMutation = useMutation({
    mutationFn: ({ projectId, remarks }: { projectId: number; remarks: string }) => {
      return apiService.put(`/projects/${projectId}/reject`, { remarks })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      alerts.success('Project Rejected', 'The project has been rejected and sent back to the municipality.')
      setIsRejectDialogOpen(false)
      setSelectedProject(null)
      setRemarks('')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Failed to reject project.'
      alerts.error('Error', errorMessage)
    },
  })

  // Helper functions
  const getProjectName = (project: AdminProject) => {
    return project.title || project.name || project.project_title 
  }

  const getMunicipality = (project: AdminProject) => {
    return project.municipality || project.municipality_id || project.organization_id || 'N/A'
  }

  const getState = (project: AdminProject) => {
    return project.state || project.location || 'N/A'
  }

  const getCategory = (project: AdminProject) => {
    return project.category || project.project_category || 'Uncategorized'
  }

  const getFundRequired = (project: AdminProject) => {
    return project.fundRequired || project.funding_requirement || 0
  }

  const getCurrentFunding = (project: AdminProject) => {
    return project.currentFunding || project.funds_secured || project.already_secured_funds || 0
  }

  const getProgress = (project: AdminProject) => {
    if (project.progress !== undefined) return project.progress
    const fundRequired = getFundRequired(project)
    const currentFunding = getCurrentFunding(project)
    if (fundRequired > 0) {
      return Math.min(100, Math.round((currentFunding / fundRequired) * 100))
    }
    return 0
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    }
    return `₹${amount.toLocaleString()}`
  }

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

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || ''
    if (statusLower.includes('pending')) {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 inline-flex items-center gap-1">
          <Clock className="h-3 w-3" /> Pending Validation
        </Badge>
      )
    }
    if (statusLower.includes('approved') || statusLower === 'live' || statusLower === 'active' || statusLower === 'published') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 inline-flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> {status}
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
    if (statusLower.includes('completed') || statusLower.includes('finished')) {
      return (
        <Badge variant="outline" className="inline-flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> {status}
        </Badge>
      )
    }
    return <Badge variant="outline">{status}</Badge>
  }

  const isPendingValidation = (project: AdminProject) => {
    const status = project.status?.toLowerCase() || ''
    return status === 'pending_validation' || status === 'pending validation'
  }

  const handleViewDetails = (project: AdminProject) => {
    setSelectedProject(project)
    setIsReviewDialogOpen(true)
  }

  const handleApprove = () => {
    if (!selectedProject) return
    setIsReviewDialogOpen(false)
    setIsApproveDialogOpen(true)
  }

  const handleReject = () => {
    if (!selectedProject) return
    setIsReviewDialogOpen(false)
    setIsRejectDialogOpen(true)
  }

  const confirmApprove = () => {
    if (!selectedProject) return
    approveProjectMutation.mutate({ 
      projectId: selectedProject.id, 
      remarks: remarks.trim() || undefined 
    })
  }

  const confirmReject = () => {
    if (!selectedProject || !remarks.trim()) {
      alerts.error('Validation Error', 'Remarks are required when rejecting a project.')
      return
    }
    rejectProjectMutation.mutate({ 
      projectId: selectedProject.id, 
      remarks: remarks.trim() 
    })
  }

  // Define columns for DataTable
  const columns: ColumnDef<AdminProject, any>[] = useMemo(() => [
    // {
    //   accessorKey: 'id',
    //   header: ({ column }) => (
    //     <button 
    //       className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-foreground transition-colors" 
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //     >
    //       ID
    //       <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
    //     </button>
    //   ),
    //   cell: ({ row }) => {
    //     const project = row.original
    //     return (
    //       <div className="w-auto">
    //         <span className="font-mono text-sm font-medium text-muted-foreground">{project.id}</span>
    //       </div>
    //     )
    //   },
    // },
    {
      accessorKey: 'project_reference_id',
      header: () => (
        <span className="text-sm gap-2  font-semibold text-foreground">Reference ID</span>
      ),
      cell: ({ row }) => {
        const project = row.original
        return (
          <div className="min-w-[160px]">
            <span className="font-mono text-sm font-medium text-muted-foreground">{project.project_reference_id || 'N/A'}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <button 
          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-foreground transition-colors" 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project
          <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
        </button>
      ),
      cell: ({ row }) => {
        const project = row.original
        return (
          <div className="min-w-[200px]">
            <div className="font-medium text-foreground">{getProjectName(project)}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{getCategory(project)}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'municipality',
      header: () => (
        <span className="text-sm font-semibold text-foreground">Municipality</span>
      ),
      cell: ({ row }) => {
        const project = row.original
        return (
          <div className="min-w-[200px]">
            <div className="font-medium text-foreground">{getMunicipality(project)}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{getState(project)}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <button 
          className="flex items-center gap-4 text-sm font-semibold text-foreground hover:text-foreground transition-colors" 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
        </button>
      ),
      cell: ({ row }) => {
        const project = row.original
        return (
          <div className="flex items-center min-w-[160px]">
            {getStatusBadge(project.status || 'Unknown')}
          </div>
        )
      },
    },
    // {
    //   accessorKey: 'funding_requirement',
    //   header: ({ column }) => (
    //     <button 
    //       className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-foreground transition-colors text-right" 
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //     >
    //       <span className="ml-auto">Funding</span>
    //       <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
    //     </button>
    //   ),
    //   cell: ({ row }) => {
    //     const project = row.original
    //     const fundRequired = getFundRequired(project)
    //     const currentFunding = getCurrentFunding(project)
    //     return (
    //       <div className=" min-w-[120px]">
    //         <div className="font-medium text-foreground">{formatCurrency(currentFunding)}</div>
    //         <div className="text-sm text-muted-foreground mt-0.5">
    //           of {formatCurrency(fundRequired)}
    //         </div>
    //       </div>
    //     )
    //   },
    // },
    {
      accessorKey: 'progress',
      header: () => (
        <span className="text-sm font-semibold text-foreground">Progress</span>
      ),
      cell: ({ row }) => {
        const project = row.original
        const progress = getProgress(project)
        return (
          <div className="flex items-center space-x-3 min-w-[120px]">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-foreground w-12 text-right">{progress}%</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <button 
          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-foreground transition-colors" 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Submitted
          <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
        </button>
      ),
      cell: ({ row }) => {
        const project = row.original
        return (
          <div className="min-w-[160px]">
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {formatDate(project.created_at)}
            </span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      enableHiding: false,
      cell: ({ row }) => {
        const project = row.original
        const isPending = isPendingValidation(project)
        const isDraft = project.status?.toLowerCase() === 'draft'
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0 hover:bg-muted transition-colors"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-semibold">Actions</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => {
                  navigator.clipboard.writeText(String(project.id))
                  alerts.success('Copied', 'Project ID copied to clipboard')
                }}
                className="cursor-pointer"
              >
                Copy Project ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isPending && (
                <>
                  <DropdownMenuItem 
                    onClick={() => handleViewDetails(project)}
                    className="cursor-pointer font-medium"
                  >
                    <Eye className="h-4 w-4 mr-2" /> Review & Validate
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate(`/main/admin/projects/validate/${project.id}`)}
                    className="cursor-pointer"
                  >
                    <Eye className="h-4 w-4 mr-2" /> Full Review Page
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem 
                onClick={() => navigate(`/main/projects/${project.id}`)}
                className="cursor-pointer"
              >
                <Eye className="h-4 w-4 mr-2" /> View Details
              </DropdownMenuItem>
              {isDraft && (
                <DropdownMenuItem 
                  onClick={() => navigate(`/main/admin/projects/create/${project.id}`)}
                  className="cursor-pointer"
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit Project
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [navigate])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
          <p className="text-muted-foreground mt-1.5">
            Manage, monitor, and validate all municipal projects on the platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => navigate("/main/admin/projects/create")}
            className="shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Projects</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalProjects}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Live Projects</p>
                <p className="text-2xl font-bold text-foreground">{stats.liveProjects}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Pending Validation</p>
                <p className="text-2xl font-bold text-foreground">{stats.pendingValidation}</p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Funding</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalFunding)}</p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <IndianRupee className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Investors</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeInvestors}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for All Projects and Pending Validation */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'pending')} className="w-full">
        <div className="border-b border-border">
          <TabsList className="inline-flex h-11 items-center justify-start rounded-none bg-transparent p-0 w-auto gap-1">
            <TabsTrigger 
              value="all" 
              className="flex items-center gap-2 h-11 rounded-none border-b-2 border-transparent bg-transparent px-5 pb-3 pt-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-indigo-300 hover:text-foreground data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:font-semibold"
            >
              <span>All Projects</span>
              {allProjects.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:border-indigo-600">
                  {allProjects.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className="flex items-center gap-2 h-11 rounded-none border-b-2 border-transparent bg-transparent px-5 pb-3 pt-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-rose-300 hover:text-foreground data-[state=active]:border-rose-500 data-[state=active]:text-rose-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:font-semibold"
            >
              <span>Pending Validation</span>
              {stats.pendingValidation > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-700 animate-pulse data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:border-rose-500 data-[state=active]:animate-none">
                  {stats.pendingValidation}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* All Projects Tab */}
        <TabsContent value="all" className="space-y-4 mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground font-medium">Loading projects...</p>
                </div>
              </CardContent>
            </Card>
          ) : isError ? (
            <Alert variant="destructive" className="animate-in fade-in-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error?.message || 'Failed to fetch projects. Please try again.'}
              </AlertDescription>
            </Alert>
          ) : projects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">No projects found</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                    Get started by creating a new project to manage municipal initiatives.
                  </p>
                  <Button 
                    className="mt-6 shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={() => navigate("/main/admin/projects/create")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <DataTable<AdminProject, any>
              title="All Projects"
              description="Manage and monitor project status, funding, and performance"
              columns={columns}
              data={projects}
              showToolbar={true}
              showFooter={true}
              enableExport={true}
              exportFilename="all-projects.csv"
              globalFilterPlaceholder="Search projects, municipalities..."
            />
          )}
        </TabsContent>

        {/* Pending Validation Tab */}
        <TabsContent value="pending" className="space-y-4 mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground font-medium">Loading projects...</p>
                </div>
              </CardContent>
            </Card>
          ) : isError ? (
            <Alert variant="destructive" className="animate-in fade-in-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error?.message || 'Failed to fetch projects. Please try again.'}
              </AlertDescription>
            </Alert>
          ) : projects.length === 0 ? (
            <Card className="border-dashed border-amber-200 dark:border-amber-800">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">No pending projects</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                    All projects have been reviewed. New submissions from municipalities will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <DataTable<AdminProject, any>
              title="Pending Validation"
              description="Review and validate projects submitted by municipalities. Click 'Review & Validate' to approve or reject."
              columns={columns}
              data={projects}
              showToolbar={true}
              showFooter={true}
              enableExport={true}
              exportFilename="pending-projects-validation.csv"
              globalFilterPlaceholder="Search pending projects..."
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Review: {selectedProject ? getProjectName(selectedProject) : ''}</DialogTitle>
            <DialogDescription>
              Review project details before approving or rejecting
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Project Title</Label>
                  <p className="font-medium">{getProjectName(selectedProject)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="font-medium">{getCategory(selectedProject)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">State</Label>
                  <p className="font-medium">{getState(selectedProject)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">City</Label>
                  <p className="font-medium">{selectedProject.city || '—'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Project Stage</Label>
                  <p className="font-medium">
                    {selectedProject.project_stage?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedProject.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Project Cost</Label>
                  <p className="font-medium">{formatCurrency(selectedProject.total_project_cost || 0)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Funding Required</Label>
                  <p className="font-medium">{formatCurrency(getFundRequired(selectedProject))}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted On</Label>
                  <p className="font-medium">{formatDate(selectedProject.created_at)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <p className="font-medium">{formatDate(selectedProject.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsReviewDialogOpen(false)}
              className="transition-all duration-200"
            >
              Close
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={approveProjectMutation.isPending || rejectProjectMutation.isPending}
              className="transition-all duration-200 hover:shadow-md"
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={approveProjectMutation.isPending || rejectProjectMutation.isPending}
              className="transition-all duration-200 hover:shadow-md"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this project? You can add optional remarks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approve-remarks">Remarks (Optional)</Label>
              <Textarea
                id="approve-remarks"
                placeholder="Add any remarks or notes..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsApproveDialogOpen(false)
                setRemarks('')
              }}
              disabled={approveProjectMutation.isPending}
              className="transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmApprove}
              disabled={approveProjectMutation.isPending}
              className="transition-all duration-200 hover:shadow-md min-w-[140px]"
            >
              {approveProjectMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm Approval
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Project</DialogTitle>
            <DialogDescription>
              Please provide remarks explaining why this project is being rejected. The municipality will receive this feedback.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reject-remarks">Remarks *</Label>
              <Textarea
                id="reject-remarks"
                placeholder="Explain why this project is being rejected..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                className={!remarks.trim() ? 'border-red-500' : ''}
              />
              {!remarks.trim() && (
                <p className="text-sm text-red-500">Remarks are required when rejecting a project</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRejectDialogOpen(false)
                setRemarks('')
              }}
              disabled={rejectProjectMutation.isPending}
              className="transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmReject}
              disabled={rejectProjectMutation.isPending || !remarks.trim()}
              className="transition-all duration-200 hover:shadow-md min-w-[140px]"
            >
              {rejectProjectMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
