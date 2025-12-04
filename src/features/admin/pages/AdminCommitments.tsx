import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DataTable, type ColumnDef } from "@/components/data-table/data-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Eye,
  Clock,
  AlertTriangle,
  IndianRupee,
  ArrowUpDown,
  FileText,
  CheckCircle2,
  X,
  ArrowRight,
} from "lucide-react"
import apiService from "@/services/api"

export default function AdminCommitments() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"all" | "under_review" | "approved" | "rejected" | "withdrawn">("all")

  const skip = 0
  const limit = 50

  // Fetch projects commitments summary (no explicit TS interface for response)
  const { data: apiResponse, isLoading, error, isError } = useQuery({
    queryKey: ["commitments", "projects-summary", { skip, limit }],
    queryFn: () =>
      apiService.get("/commitments/summary/projects-summary", {
        skip,
        limit,
      }),
  })

  // Extract projects array from API response: { status, message, data: [...] }
  const projects: any[] = useMemo(() => {
    const items = (apiResponse as any)?.data ?? []
    return Array.isArray(items) ? items : []
  }, [apiResponse])

  // Filter projects based on active tab using status counts
  const filteredProjects: any[] = useMemo(() => {
    if (activeTab === "all") return projects
    return projects.filter((p) => {
      if (activeTab === "under_review") return Number(p.status_under_review || 0) > 0
      if (activeTab === "approved") return Number(p.status_approved || 0) > 0
      if (activeTab === "rejected") return Number(p.status_rejected || 0) > 0
      if (activeTab === "withdrawn") return Number(p.status_withdrawn || 0) > 0
      return true
    })
  }, [projects, activeTab])

  // Calculate top-level stats from summary rows
  const stats = useMemo(() => {
    const totals = {
      totalProjects: projects.length,
      totalCommitments: 0,
      underReview: 0,
      approved: 0,
      rejected: 0,
      withdrawn: 0,
      totalAmount: 0,
    }

    projects.forEach((p) => {
      totals.totalCommitments += Number(p.total_commitments_count || 0)
      totals.underReview += Number(p.status_under_review || 0)
      totals.approved += Number(p.status_approved || 0)
      totals.rejected += Number(p.status_rejected || 0)
      totals.withdrawn += Number(p.status_withdrawn || 0)

      const amount = parseFloat(p.best_deal_amount || "0") || 0
      totals.totalAmount += amount
    })

    return totals
  }, [projects])

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
    })
  }

  const handleViewCommitments = (projectReferenceId: string) => {
    navigate(`/main/admin/commitments/${projectReferenceId}`)
  }

  // Define columns for DataTable
  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
    {
      accessorKey: 'project_reference_id',
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project Reference ID
          <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
        </button>
      ),
      cell: ({ row }) => {
        const project = row.original as any
        return (
          <div className="min-w-[180px]">
            <span className="font-mono text-sm font-medium text-foreground">
              {project.project_reference_id}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'project_title',
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project Title
          <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
        </button>
      ),
      cell: ({ row }) => {
        const project = row.original as any
        return (
          <div className="min-w-[250px]">
            <div className="font-medium text-foreground">
              {project.project_title || 'N/A'}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'totalCommitments',
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Commitments
          <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
        </button>
      ),
      cell: ({ row }) => {
        const project = row.original as any
        return (
          <div className="min-w-[120px]">
            <Badge variant="outline" className="font-semibold">
              {project.total_commitments_count}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'status_breakdown',
      header: () => (
        <span className="text-sm font-semibold text-foreground">Status Breakdown</span>
      ),
      cell: ({ row }) => {
        const project = row.original as any
        return (
          <div className="flex items-center gap-2 min-w-[200px]">
            {Number(project.status_under_review || 0) > 0 && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {project.status_under_review}
              </Badge>
            )}
            {Number(project.status_approved || 0) > 0 && (
              <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {project.status_approved}
              </Badge>
            )}
            {Number(project.status_rejected || 0) > 0 && (
              <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 text-xs">
                <X className="h-3 w-3 mr-1" />
                {project.status_rejected}
              </Badge>
            )}
            {Number(project.status_withdrawn || 0) > 0 && (
              <Badge variant="outline" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {project.status_withdrawn}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Amount
          <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
        </button>
      ),
      cell: ({ row }) => {
        const project = row.original as any
        return (
          <div className="min-w-[120px]">
            <div className="font-medium text-foreground">
              {formatCurrency(parseFloat(project.best_deal_amount || "0") || 0)}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'bestDeal',
      header: () => (
        <span className="text-sm font-semibold text-foreground">Best Deal</span>
      ),
      cell: ({ row }) => {
        const project = row.original as any
        return (
          <div className="min-w-[150px]">
            <div className="text-sm font-medium text-foreground">
              {formatCurrency(parseFloat(project.best_deal_amount || "0") || 0)}
            </div>
            <div className="text-xs text-muted-foreground">
              @ {parseFloat(project.best_deal_interest_rate || "0")}% p.a.
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'latestCommitmentDate',
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Latest Commitment
          <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
        </button>
      ),
      cell: ({ row }) => {
        const project = row.original as any
        return (
          <div className="min-w-[140px] text-sm text-muted-foreground">
            {formatDate(project.latest_commitment_date)}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      enableHiding: false,
      cell: ({ row }) => {
        const project = row.original as any
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewCommitments(project.project_reference_id)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Commitments
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
  ],
    []
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border bg-gradient-to-r from-sky-50 via-indigo-50 to-emerald-50 dark:from-sky-950/40 dark:via-indigo-950/40 dark:to-emerald-950/40 px-6 py-5 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Commitment Management</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Review and manage funding commitments grouped by project
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <Badge variant="outline" className="bg-white/70 dark:bg-black/40 text-xs px-3 py-1 rounded-full">
            Projects: <span className="ml-1 font-semibold">{stats.totalProjects}</span>
          </Badge>
          <Badge variant="outline" className="bg-white/70 dark:bg-black/40 text-xs px-3 py-1 rounded-full">
            Commitments: <span className="ml-1 font-semibold">{stats.totalCommitments}</span>
          </Badge>
          {stats.underReview > 0 && (
            <Badge className="bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900 dark:text-amber-100 text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="font-semibold">{stats.underReview}</span>
              <span className="hidden sm:inline">Under review</span>
            </Badge>
          )}
          {stats.approved > 0 && (
            <Badge className="bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-100 text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span className="font-semibold">{stats.approved}</span>
              <span className="hidden sm:inline">Approved</span>
            </Badge>
          )}
          {stats.rejected > 0 && (
            <Badge className="bg-red-100 text-red-900 border-red-200 dark:bg-red-900 dark:text-red-100 text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <X className="h-3 w-3" />
              <span className="font-semibold">{stats.rejected}</span>
              <span className="hidden sm:inline">Rejected</span>
            </Badge>
          )}
          {stats.withdrawn > 0 && (
            <Badge variant="outline" className="bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-100 text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              <span className="font-semibold">{stats.withdrawn}</span>
              <span className="hidden sm:inline">Withdrawn</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Total Projects</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.totalProjects}</p>
              </div>
              <FileText className="h-4 w-4 text-slate-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700 dark:text-blue-200">Total Commitments</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-50">{stats.totalCommitments}</p>
              </div>
              <FileText className="h-4 w-4 text-blue-700 dark:text-blue-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-200">Under Review</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-50">{stats.underReview}</p>
              </div>
              <Clock className="h-4 w-4 text-amber-700 dark:text-amber-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-200">Approved</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-50">{stats.approved}</p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950 dark:to-rose-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-700 dark:text-red-200">Rejected</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-50">{stats.rejected}</p>
              </div>
              <X className="h-4 w-4 text-red-700 dark:text-red-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-950 dark:to-purple-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-violet-700 dark:text-violet-200">Total Best Deal Amount</p>
                <p className="text-2xl font-bold text-violet-900 dark:text-violet-50">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
              <IndianRupee className="h-4 w-4 text-violet-700 dark:text-violet-300" />
            </div>
          </CardContent>
        </Card>
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

      {/* Projects Table */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Projects ({projects.length})</TabsTrigger>
              <TabsTrigger value="under_review">
                Under Review ({projects.filter((p) => Number(p.status_under_review || 0) > 0).length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({projects.filter((p) => Number(p.status_approved || 0) > 0).length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({projects.filter((p) => Number(p.status_rejected || 0) > 0).length})
              </TabsTrigger>
              <TabsTrigger value="withdrawn">
                Withdrawn ({projects.filter((p) => Number(p.status_withdrawn || 0) > 0).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading projects...</div>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No projects found</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'all'
                      ? 'No projects with commitments found.'
                      : `No projects with "${activeTab}" commitments found.`}
                  </p>
                </div>
              ) : (
                <DataTable<any, any>
                  title="Projects with Commitments"
                  description="Click on a project to view and manage its commitments"
                  columns={columns}
                  data={filteredProjects}
                  showToolbar={true}
                  showFooter={true}
                  enableExport={true}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
