import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { FileText, Edit, Trash2, Calendar, Eye, CheckCircle2, Clock, IndianRupeeIcon, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable, type ColumnDef } from '@/components/data-table/data-table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { alerts } from '@/lib/alerts'
import apiService from '@/services/api'

interface ProjectDraft {
  id: number
  title: string
  organization_id: string
  category: string
  project_stage: string
  created_at: string
  updated_at: string
  total_project_cost?: number
  funding_requirement?: number
}

interface SubmittedProject {
  id: number
  project_reference_id?: string
  title: string
  organization_id: string
  category: string
  project_stage: string
  status: string
  created_at: string
  updated_at: string
  total_project_cost?: number
  funding_requirement?: number
}

export default function MyDrafts() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch all drafts
  const { data: drafts, isLoading: isLoadingDrafts, isError: isDraftsError, error: draftsError } = useQuery({
    queryKey: ['project-drafts'],
    queryFn: async () => {
      const response = await apiService.get('/project-drafts/')
      return response?.data || response || []
    },
  })

  // Fetch all submitted projects
  const { data: projects, isLoading: isLoadingProjects, isError: isProjectsError, error: projectsError } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await apiService.get('/projects/')
      return response?.data || response || []
    },
  })

  const isLoading = isLoadingDrafts || isLoadingProjects
  const isError = isDraftsError || isProjectsError
  const error = draftsError || projectsError

  // Delete draft mutation
  const deleteDraftMutation = useMutation({
    mutationFn: (draftId: number) => apiService.delete(`/project-drafts/${draftId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-drafts'] })
      alerts.success('Draft Deleted', 'The draft has been deleted successfully.')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Failed to delete draft.'
      alerts.error('Error', errorMessage)
    },
  })

  const handleEditDraft = (draftId: number) => {
    navigate(`/main/admin/projects/create/${draftId}`)
  }

  const handleDeleteDraft = (draftId: number) => {
    if (window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      deleteDraftMutation.mutate(draftId)
    }
  }

  const handleViewProject = (projectId: number) => {
    navigate(`/main/projects/${projectId}`)
  }

  const formatDate = (dateString: string) => {
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

  // Helper function to get category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Infrastructure': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Water Supply': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'Sanitation': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Waste Management': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Transportation': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Energy': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Healthcare': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Education': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    }
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }

  // Helper function to get stage color
  const getStageColor = (stage: string) => {
    const stageLower = stage.toLowerCase()
    if (stageLower.includes('planning')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    if (stageLower.includes('initiated')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
    if (stageLower.includes('progress')) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
    if (stageLower.includes('completed')) return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }

  // Columns for Drafts
  const draftColumns: ColumnDef<ProjectDraft, any>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/30">
            <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="font-medium">{row.original.title || 'Untitled Project'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.original.category || '—'
        return (
          <Badge className={getCategoryColor(category)}>
            {category}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'project_stage',
      header: 'Stage',
      cell: ({ row }) => {
        const stage = row.original.project_stage || '—'
        const formattedStage = stage.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
        return (
          <Badge className={getStageColor(stage)}>
            {formattedStage}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'funding_requirement',
      header: 'Funding Required',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <IndianRupeeIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-semibold text-green-700 dark:text-green-300">
            {formatCurrency(row.original.funding_requirement)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'updated_at',
      header: 'Last Updated',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
          <span className="text-muted-foreground">{formatDate(row.original.updated_at)}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleEditDraft(row.original.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Draft
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDeleteDraft(row.original.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('pending')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300'
    if (statusLower.includes('approved')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300'
    if (statusLower.includes('rejected')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300'
    if (statusLower.includes('active')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-300'
  }

  // Columns for Submitted Projects
  const projectColumns: ColumnDef<SubmittedProject, any>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <span className="font-medium">{row.original.title || 'Untitled Project'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'project_reference_id',
      header: 'Reference ID',
      cell: ({ row }) => (
        <div className="min-w-[120px]">
          <span className="font-mono text-sm text-muted-foreground">
            {row.original.project_reference_id || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.original.category || '—'
        return (
          <Badge className={getCategoryColor(category)}>
            {category}
          </Badge>
        )
      },
    },
    // {
    //   accessorKey: 'project_stage',
    //   header: 'Stage',
    //   cell: ({ row }) => {
    //     const stage = row.original.project_stage || '—'
    //     const formattedStage = stage.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
    //     return (
    //       <Badge className={getStageColor(stage)}>
    //         {formattedStage}
    //       </Badge>
    //     )
    //   },
    // },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status || '—'
        const formattedStatus = status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
        return (
          <Badge className={`${getStatusColor(status)} border`}>
            {formattedStatus}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'funding_requirement',
      header: 'Funding Required',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <IndianRupeeIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-semibold text-green-700 dark:text-green-300">
            {formatCurrency(row.original.funding_requirement)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Submitted On',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
          <span className="text-muted-foreground">{formatDate(row.original.created_at)}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleViewProject(row.original.id)}>
              <Eye className="mr-2 h-4 w-4" />
              View Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">
            {error instanceof Error ? error.message : 'Failed to load projects'}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['project-drafts'] })}>
              Retry Drafts
            </Button>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['projects'] })}>
              Retry Projects
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const draftsList = Array.isArray(drafts) ? drafts : []
  const projectsList = Array.isArray(projects) ? projects : []
  // Filter rejected projects (status contains 'rejected' or 'reject')
  const rejectedProjectsList = projectsList.filter((project: SubmittedProject) => {
    const status = project.status?.toLowerCase() || ''
    return status.includes('rejected') || status.includes('reject')
  })
  // Filter submitted projects (exclude rejected ones)
  const submittedProjectsList = projectsList.filter((project: SubmittedProject) => {
    const status = project.status?.toLowerCase() || ''
    return !status.includes('rejected') && !status.includes('reject')
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your project drafts and view submitted projects
          </p>
        </div>
        <Button onClick={() => navigate('/main/admin/projects/create')}>
          <FileText className="h-4 w-4 mr-2" />
          Create New Project
        </Button>
      </div>

      {/* Tabs for Drafts, Submitted, and Rejected Projects */}
      <Tabs defaultValue="drafts" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Drafts
            {draftsList.length > 0 && (
              <Badge className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                {draftsList.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="submitted" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            Submitted
            {submittedProjectsList.length > 0 && (
              <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {submittedProjectsList.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            Send Back
            {rejectedProjectsList.length > 0 && (
              <Badge className="ml-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                {rejectedProjectsList.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Drafts Tab */}
        <TabsContent value="drafts" className="space-y-4">
          {draftsList.length === 0 ? (
            <Card className="border-2 border-dashed border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
                  <FileText className="h-12 w-12 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="mb-2 text-amber-900 dark:text-amber-100">No Drafts Found</CardTitle>
                <CardDescription className="mb-4 text-center text-amber-700 dark:text-amber-300">
                  You haven't created any project drafts yet. Start by creating a new project draft.
                </CardDescription>
                <Button 
                  onClick={() => navigate('/main/admin/projects/create')}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Create Your First Draft
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DataTable<ProjectDraft, any>
              title="Project Drafts"
              description={`You have ${draftsList.length} saved draft${draftsList.length !== 1 ? 's' : ''}. Continue editing or submit them for validation.`}
              columns={draftColumns}
              data={draftsList}
              enableExport={true}
              exportFilename="project-drafts.csv"
            />
          )}
        </TabsContent>

        {/* Submitted Projects Tab */}
        <TabsContent value="submitted" className="space-y-4">
          {submittedProjectsList.length === 0 ? (
            <Card className="border-2 border-dashed border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="mb-2 text-green-900 dark:text-green-100">No Submitted Projects</CardTitle>
                <CardDescription className="mb-4 text-center text-green-700 dark:text-green-300">
                  You haven't submitted any projects yet. Submit a draft to see it here.
                </CardDescription>
                <Button 
                  onClick={() => navigate('/main/admin/projects/create')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Create New Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DataTable<SubmittedProject, any>
              title="Submitted Projects"
              description={`You have ${submittedProjectsList.length} submitted project${submittedProjectsList.length !== 1 ? 's' : ''}. These projects are in the validation or approval process.`}
              columns={projectColumns}
              data={submittedProjectsList}
              enableExport={true}
              exportFilename="submitted-projects.csv"
            />
          )}
        </TabsContent>

        {/* Sent Back Projects Tab */}
        <TabsContent value="rejected" className="space-y-4">
          {rejectedProjectsList.length === 0 ? (
            <Card className="border-2 border-dashed border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                  <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="mb-2 text-red-900 dark:text-red-100">No Sent Back Projects</CardTitle>
                <CardDescription className="mb-4 text-center text-red-700 dark:text-red-300">
                  You don't have any projects sent back for revision. Projects that are sent back will appear here.
                </CardDescription>
                <Button 
                  onClick={() => navigate('/main/admin/projects/create')}
                  className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Create New Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DataTable<SubmittedProject, any>
              title="Sent Back Projects"
              description={`You have ${rejectedProjectsList.length} project${rejectedProjectsList.length !== 1 ? 's' : ''} sent back for revision. Review the feedback and resubmit after making necessary changes.`}
              columns={projectColumns}
              data={rejectedProjectsList}
              enableExport={true}
              exportFilename="sent-back-projects.csv"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

