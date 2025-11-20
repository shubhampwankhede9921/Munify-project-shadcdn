import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, type ColumnDef } from "@/components/data-table/data-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Filter, 
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  IndianRupee,
  Search
} from "lucide-react"
import apiService from "@/services/api"

// Project interface based on API response
interface AdminProject {
  id: number
  title?: string
  name?: string
  project_title?: string
  municipality?: string
  municipality_id?: string
  organization_id?: string
  state?: string
  location?: string
  category?: string
  project_category?: string
  status: string
  fundRequired?: number
  funding_requirement?: number
  currentFunding?: number
  funds_secured?: number
  progress?: number
  investors?: number
  createdDate?: string
  created_at?: string
  deadline?: string
  end_date?: string
  priority?: string
}

// API response might be an array or an object with data property
type ProjectsApiResponse = AdminProject[] | { data: AdminProject[] } | { results: AdminProject[] }

export default function AdminProjects() {
  const navigate = useNavigate()

  // Query for projects
  const { data: apiResponse, isLoading, error, isError } = useQuery<ProjectsApiResponse>({
    queryKey: ['projects'],
    queryFn: () => apiService.get<ProjectsApiResponse>('/projects/'),
  })

  // Safely extract projects array from API response
  const projects: AdminProject[] = useMemo(() => {
    if (!apiResponse) return []
    if (Array.isArray(apiResponse)) return apiResponse
    if ('data' in apiResponse && Array.isArray(apiResponse.data)) return apiResponse.data
    if ('results' in apiResponse && Array.isArray(apiResponse.results)) return apiResponse.results
    return []
  }, [apiResponse])

  // Calculate stats from fetched data
  const stats = useMemo(() => {
    if (!Array.isArray(projects)) {
      return {
        totalProjects: 0,
        liveProjects: 0,
        totalFunding: 0,
        activeInvestors: 0
      }
    }
    
    return {
      totalProjects: projects.length,
      liveProjects: projects.filter(p => 
        p.status?.toLowerCase() === 'live' || 
        p.status?.toLowerCase() === 'active' ||
        p.status?.toLowerCase() === 'published'
      ).length,
      totalFunding: projects.reduce((sum, p) => {
        const funding = p.currentFunding || p.funds_secured || 0
        return sum + funding
      }, 0),
      activeInvestors: projects.reduce((sum, p) => sum + (p.investors || 0), 0)
    }
  }, [projects])

  // Helper function to get project name
  const getProjectName = (project: AdminProject) => {
    return project.title || project.name || project.project_title || 'Untitled Project'
  }

  // Helper function to get municipality
  const getMunicipality = (project: AdminProject) => {
    return project.municipality || project.municipality_id || project.organization_id || 'N/A'
  }

  // Helper function to get state
  const getState = (project: AdminProject) => {
    return project.state || project.location || 'N/A'
  }

  // Helper function to get category
  const getCategory = (project: AdminProject) => {
    return project.category || project.project_category || 'Uncategorized'
  }

  // Helper function to get funding required
  const getFundRequired = (project: AdminProject) => {
    return project.fundRequired || project.funding_requirement || 0
  }

  // Helper function to get current funding
  const getCurrentFunding = (project: AdminProject) => {
    return project.currentFunding || project.funds_secured || 0
  }

  // Helper function to calculate progress
  const getProgress = (project: AdminProject) => {
    if (project.progress !== undefined) return project.progress
    const fundRequired = getFundRequired(project)
    const currentFunding = getCurrentFunding(project)
    if (fundRequired > 0) {
      return Math.min(100, Math.round((currentFunding / fundRequired) * 100))
    }
    return 0
  }

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    }
    return `₹${amount.toLocaleString()}`
  }

  // Helper function to get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    const statusLower = status?.toLowerCase() || ''
    if (statusLower === 'live' || statusLower === 'active' || statusLower === 'published') {
      return 'default'
    }
    if (statusLower === 'under review' || statusLower === 'pending' || statusLower === 'pending_validation') {
      return 'secondary'
    }
    if (statusLower === 'completed' || statusLower === 'finished') {
      return 'outline'
    }
    return 'destructive'
  }

  // Helper function to get priority badge variant
  const getPriorityBadgeVariant = (priority?: string) => {
    if (!priority) return 'outline'
    const priorityLower = priority.toLowerCase()
    if (priorityLower === 'high') return 'destructive'
    if (priorityLower === 'medium') return 'secondary'
    return 'outline'
  }

  // Define columns for DataTable
  const columns: ColumnDef<AdminProject, any>[] = [
    {
      accessorKey: 'title',
      header: 'Project',
      cell: ({ row }) => {
        const project = row.original
        return (
          <div>
            <div className="font-medium">{getProjectName(project)}</div>
            <div className="text-sm text-muted-foreground">{getCategory(project)}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'municipality',
      header: 'Municipality',
      cell: ({ row }) => {
        const project = row.original
        return (
          <div>
            <div className="font-medium">{getMunicipality(project)}</div>
            <div className="text-sm text-muted-foreground">{getState(project)}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const project = row.original
        const status = project.status || 'Unknown'
        return (
          <Badge variant={getStatusBadgeVariant(status)}>
            {status === 'Live' || status?.toLowerCase() === 'active' || status?.toLowerCase() === 'published' ? (
              <AlertCircle className="h-3 w-3 mr-1" />
            ) : status === 'Completed' || status?.toLowerCase() === 'finished' ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : null}
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'funding',
      header: 'Funding',
      cell: ({ row }) => {
        const project = row.original
        const fundRequired = getFundRequired(project)
        const currentFunding = getCurrentFunding(project)
        return (
          <div>
            <div className="font-medium">{formatCurrency(currentFunding)}</div>
            <div className="text-sm text-muted-foreground">
              of {formatCurrency(fundRequired)}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }) => {
        const project = row.original
        const progress = getProgress(project)
        return (
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-sm">{progress}%</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'investors',
      header: 'Investors',
      cell: ({ row }) => {
        const project = row.original
        return (
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{project.investors || 0}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const project = row.original
        const priority = project.priority || 'Low'
        return (
          <Badge variant={getPriorityBadgeVariant(priority)}>
            {priority}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      enableHiding: false,
      cell: ({ row }) => {
        const project = row.original
        const isDraft = project.status?.toLowerCase() === 'draft'
        return (
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/main/admin/projects/${project.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              disabled={!isDraft}
              onClick={() => {
                if (isDraft) {
                  navigate(`/main/admin/projects/${project.id}/edit`)
                }
              }}
              className={!isDraft ? "opacity-50 cursor-not-allowed" : ""}
            >
              <Edit className={`h-4 w-4 ${!isDraft ? "text-gray-400" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all municipal projects on the platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => navigate("/main/admin/projects/add")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{stats.totalProjects}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Live Projects</p>
                <p className="text-2xl font-bold">{stats.liveProjects}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Funding</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalFunding)}</p>
              </div>
              <IndianRupee className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Investors</p>
                <p className="text-2xl font-bold">{stats.activeInvestors}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search projects, municipalities..." 
                  className="pl-10"
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="renewable">Renewable Energy</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Failed to fetch projects. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Projects DataTable */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading projects...</div>
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No projects</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by creating a new project.
              </p>
              <Button 
                className="mt-4"
                onClick={() => navigate("/main/admin/projects/add")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Project
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
          exportFilename="projects.csv"
          globalFilterPlaceholder="Search projects, municipalities..."
        />
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">Smart Water Management System</span> received new funding commitment of ₹5Cr
                </p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">Waste Management Modernization</span> project submitted for review
                </p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">Digital Governance Platform</span> project completed successfully
                </p>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
