import { useEffect, useState, useMemo, useCallback } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNavigate } from "react-router-dom"
import { apiService } from "@/services/api"
import { alerts } from "@/lib/alerts"
import ProjectFilters, { type FilterState } from "@/components/ProjectFilters"
import { FundingCommitmentDialog } from "@/features/projects/components/FundingCommitmentDialog"
import { type Project, LIVE_PROJECTS_QUERY_KEY } from "@/features/projects/types"
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock,
  Star,
  Eye,
  Heart,
  IndianRupee,
  MessageCircle,
  X
} from "lucide-react"

import { useAuth } from "@/contexts/auth-context"

// Format currency with appropriate scale (Cr, L, K, or plain rupees)
const formatCurrency = (amount: number): string => {
  if (amount === 0) return "₹0"
  
  if (amount >= 10000000) {
    // Crores (1 Cr = 10,000,000)
    return `₹${(amount / 10000000).toFixed(2)}Cr`
  } else if (amount >= 100000) {
    // Lakhs (1 L = 100,000)
    return `₹${(amount / 100000).toFixed(2)}L`
  } else if (amount >= 1000) {
    // Thousands (1 K = 1,000)
    return `₹${(amount / 1000).toFixed(2)}K`
  } else {
    // Plain rupees
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }
}

export default function ProjectsLive() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [fundingDialog, setFundingDialog] = useState<{ open: boolean; project_reference_id: string | null }>({ open: false, project_reference_id: null })
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    categories: [],
    states: [],
    status: [],
    fundingRange: [0, 1000],
    progressRange: [0, 100],
    daysLeftRange: [0, 365],
    interestRateRange: [0, 25]
  })

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  const buildProjectQueryParams = (currentFilters: FilterState) => {
    const queryParams: any = {
      skip: 0,
      limit: 10,
      // Backend expects lowercase status, default to active list
      status: "active",
      user_id: user?.data?.login,
    }

    // Add search parameter
    if (currentFilters.search) {
      queryParams.search = currentFilters.search
    }

    // Add category filters
    if (currentFilters.categories.length > 0) {
      queryParams.categories = currentFilters.categories.join(",")
    }

    // Add state filters
    if (currentFilters.states.length > 0) {
      queryParams.states = currentFilters.states.join(",")
    }

    // Add status filters (override default active if user selected)
    if (currentFilters.status.length > 0) {
      queryParams.status = currentFilters.status.map((s) => s.toLowerCase()).join(",")
    }

    // Advanced filters can be wired as backend supports them
    if (currentFilters.fundingRange[0] > 0 || currentFilters.fundingRange[1] < 1000) {
      queryParams.min_funding = currentFilters.fundingRange[0] * 10000000
      queryParams.max_funding = currentFilters.fundingRange[1] * 10000000
    }

    if (currentFilters.progressRange[0] > 0 || currentFilters.progressRange[1] < 100) {
      queryParams.min_progress = currentFilters.progressRange[0]
      queryParams.max_progress = currentFilters.progressRange[1]
    }

    if (currentFilters.daysLeftRange[0] > 0 || currentFilters.daysLeftRange[1] < 365) {
      queryParams.min_days_left = currentFilters.daysLeftRange[0]
      queryParams.max_days_left = currentFilters.daysLeftRange[1]
    }

    return queryParams
  }

  const {
    data: projectsResponse,
    isLoading,
    isError,
    error,
  } = useQuery<any, any>({
    queryKey: [...LIVE_PROJECTS_QUERY_KEY, { filters }],
    queryFn: () => apiService.get("/projects", buildProjectQueryParams(filters)),
  })

  const projects = useMemo<Project[]>(() => projectsResponse?.data ?? [], [projectsResponse])

  // Count active filters for UI display (only advanced filters)
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.fundingRange[0] > 0 || filters.fundingRange[1] < 1000) count++
    if (filters.progressRange[0] > 0 || filters.progressRange[1] < 100) count++
    if (filters.daysLeftRange[0] > 0 || filters.daysLeftRange[1] < 365) count++
    return count
  }, [filters])

  // Count all active filters (including basic ones)
  const totalActiveFiltersCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.categories.length > 0) count++
    if (filters.states.length > 0) count++
    if (filters.status.length > 0) count++
    if (filters.fundingRange[0] > 0 || filters.fundingRange[1] < 1000) count++
    if (filters.progressRange[0] > 0 || filters.progressRange[1] < 100) count++
    if (filters.daysLeftRange[0] > 0 || filters.daysLeftRange[1] < 365) count++
    return count
  }, [filters])

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const debouncedSearch = useCallback((searchValue: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchValue }))
    }, 500) // 500ms delay

    setSearchTimeout(timeout)
  }, [searchTimeout])

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {
      search: "",
      categories: [],
      states: [],
      status: [],
      fundingRange: [0, 1000] as [number, number],
      progressRange: [0, 100] as [number, number],
      daysLeftRange: [0, 365] as [number, number],
      interestRateRange: [0, 25] as [number, number],
    }
    setFilters(clearedFilters)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  const handleViewDetails = (projectId: number) => {
    navigate(`/main/projects/${projectId}`)
  }

  const handleViewQA = (projectId: number) => {
    navigate(`/main/projects/${projectId}#qa`)
  }

  const handleFundProject = (project: Project) => {
    if (!project.project_reference_id) {
      alerts.error("Validation Error", "Project reference ID not found")
      return
    }
    setFundingDialog({ open: true, project_reference_id: project.project_reference_id })
  }

  // Mutation for adding project to favorites
  const addToFavoritesMutation = useMutation({
    mutationFn: (data: { project_reference_id: string; organization_id: string; user_id: string; created_by: string }) =>
      apiService.post("/project-favorites/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIVE_PROJECTS_QUERY_KEY })
      alerts.success("Success", "Project added to favorites successfully")
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.response?.data?.detail || "Failed to add project to favorites. Please try again."
      alerts.error("Error", message)
    },
  })

  // Mutation for removing project from favorites
  const removeFromFavoritesMutation = useMutation({
    mutationFn: ({ project_reference_id, user_id }: { project_reference_id: string; user_id: string }) => {
      const params = new URLSearchParams({
        project_reference_id,
        user_id
      })
      return apiService.delete(`/project-favorites/?${params.toString()}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIVE_PROJECTS_QUERY_KEY })
      alerts.success("Success", "Project removed from favorites successfully")
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.response?.data?.detail || "Failed to remove project from favorites. Please try again."
      alerts.error("Error", message)
    },
  })

  const handleToggleFavorites = (project: Project) => {
    const projectReferenceId = project.project_reference_id

    if (!projectReferenceId) {
      alerts.error("Validation Error", "Project reference ID not found")
      return
    }

    const userId = user?.data?.login // TODO: Get from auth context
    const isFavorited = Boolean(project.is_favorite)

    if (isFavorited) {
      // Remove from favorites
      removeFromFavoritesMutation.mutate({
        project_reference_id: projectReferenceId.toString(),
        user_id: userId
      })
    } else {
      // Add to favorites
      addToFavoritesMutation.mutate({
        project_reference_id: projectReferenceId.toString(),
        organization_id: project.organization_id,
        user_id: userId,
        created_by: userId
      })
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Projects</h1>
          <p className="text-muted-foreground">
            Explore ongoing municipal projects seeking funding
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ProjectFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            activeFiltersCount={activeFiltersCount}
          />
          <Button>
            <Star className="h-4 w-4 mr-2" />
            My Favorites
          </Button>
        </div>
      </div>

      {/* Search and Quick Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search projects, municipalities, or categories..." 
                    className="pl-10"
                    value={filters.search}
                    onChange={(e) => {
                      const newSearch = e.target.value
                      setFilters(prev => ({ ...prev, search: newSearch }))
                      debouncedSearch(newSearch)
                    }}
                  />
                  {filters.search && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => {
                        setFilters(prev => ({ ...prev, search: "" }))
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              {totalActiveFiltersCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {projects.length} projects found
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-8"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Basic Filters - Single Line */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>
              
              <Select 
                value={filters.categories.length > 0 ? filters.categories[0] : "all"} 
                onValueChange={(value) => {
                  const newCategories = value === "all" ? [] : [value]
                  const newFilters = { ...filters, categories: newCategories }
                  setFilters(newFilters)
                }}
              >
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="infrastructure">🏗️ Infrastructure</SelectItem>
                  <SelectItem value="renewable">⚡ Renewable Energy</SelectItem>
                  <SelectItem value="environment">🌱 Environment</SelectItem>
                  <SelectItem value="transport">🚌 Transport</SelectItem>
                  <SelectItem value="healthcare">🏥 Healthcare</SelectItem>
                  <SelectItem value="education">🎓 Education</SelectItem>
                  <SelectItem value="water">💧 Water & Sanitation</SelectItem>
                  <SelectItem value="waste">♻️ Waste Management</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.states.length > 0 ? filters.states[0] : "all"} 
                onValueChange={(value) => {
                  const newStates = value === "all" ? [] : [value]
                  const newFilters = { ...filters, states: newStates }
                  setFilters(newFilters)
                }}
              >
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="delhi">Delhi</SelectItem>
                  <SelectItem value="karnataka">Karnataka</SelectItem>
                  <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                  <SelectItem value="gujarat">Gujarat</SelectItem>
                  <SelectItem value="rajasthan">Rajasthan</SelectItem>
                  <SelectItem value="west-bengal">West Bengal</SelectItem>
                  <SelectItem value="uttar-pradesh">Uttar Pradesh</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.status.length > 0 ? filters.status[0] : "all"} 
                onValueChange={(value) => {
                  const newStatus = value === "all" ? [] : [value]
                  const newFilters = { ...filters, status: newStatus }
                  setFilters(newFilters)
                }}
              >
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">🟢 Active</SelectItem>
                  <SelectItem value="FUNDING">🔵 Seeking Funding</SelectItem>
                  <SelectItem value="COMPLETED">⚫ Completed</SelectItem>
                  <SelectItem value="CANCELLED">🔴 Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Active Filter Indicators */}
              {(filters.categories.length > 0 || filters.states.length > 0 || filters.status.length > 0) && (
                <div className="flex items-center gap-1">
                  {filters.categories.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {filters.categories[0]}
                    </Badge>
                  )}
                  {filters.states.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {filters.states[0]}
                    </Badge>
                  )}
                  {filters.status.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {filters.status[0]}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {isLoading && (
        <div className="text-center text-sm text-muted-foreground">Loading projects...</div>
      )}
      {isError && (
        <div className="text-center text-sm text-red-500">
          {(error as any)?.response?.data?.message || (error as Error)?.message || "Failed to load projects"}
        </div>
      )}
      {!isLoading && !isError && projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-sm">
              {totalActiveFiltersCount > 0 
                ? "Try adjusting your filters to see more projects"
                : "No projects are currently available"
              }
            </p>
          </div>
          {totalActiveFiltersCount > 0 && (
            <Button variant="outline" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const image = "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop"
          const name = p.title
          const municipality = p.city || p.organization_id || "—"
          const state = p.state
          const category = p.category
          const description = p.description
          const totalCommittedAmount = Number((p as any).total_committed_amount || 0)
          const commitmentGap = p.commitment_gap != null ? Number(p.commitment_gap) : null
          // Calculate progress: commitment_gap is the total funding target, total_committed_amount is what's raised
          // Progress = (total_committed_amount / commitment_gap) * 100
          // Example: If commitment_gap = 100 Cr and total_committed_amount = 50 Cr, then 50% is raised
          const progress = commitmentGap !== null && !Number.isNaN(commitmentGap) && commitmentGap > 0
            ? Math.min(100, Math.max(0, Math.round((totalCommittedAmount / commitmentGap) * 100)))
            : 0
          const end = p.end_date ? new Date(p.end_date) : null
          const today = new Date()
          const msLeft = end ? end.getTime() - today.getTime() : 0
          const daysLeft = end ? Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24))) : 0
          const status = p.status
          const id = p.id

          return (
          <Card key={id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={image} 
                alt={name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-green-600 text-white">
                  {status}
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{municipality}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">{p.favorite_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg line-clamp-1">{name}</CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <MapPin className="h-3 w-3" />
                    <span>{state}</span>
                  </CardDescription>
                </div>
                <Badge variant="outline">{category}</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 flex flex-col">
              <div className="space-y-4 flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {description}
                </p>
                
                {/* Funding Progress */}
                <div className="space-y-3">
                  {/* Funding Target - Highlighted */}
                  {commitmentGap !== null && !Number.isNaN(commitmentGap) && commitmentGap > 0 && (
                    <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/50">
                            <IndianRupee className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-blue-900 dark:text-blue-100">Funding Target</p>
                            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                              {formatCurrency(commitmentGap)}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-semibold">
                          Goal
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  {/* Progress Section */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Funding Progress</span>
                      <span className="font-semibold text-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5 bg-secondary" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span>{formatCurrency(totalCommittedAmount)} raised</span>
                      </span>
                      {commitmentGap !== null && !Number.isNaN(commitmentGap) && (
                        <span className="text-muted-foreground/70">
                          {formatCurrency(Math.max(0, commitmentGap - totalCommittedAmount))} remaining
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{daysLeft} days left</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4">
                <Button 
                  className="flex-1" 
                  onClick={() => handleFundProject(p)}
                >
                  <IndianRupee className="h-4 w-4 mr-2" />
                  Fund Project
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleViewDetails(id)}
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleViewQA(id)}
                  title="View Q&A"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  title={p.is_favorite ? "Remove from Favorites" : "Add to Favorites"}
                  onClick={() => handleToggleFavorites(p)}
                  disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
                  className={p.is_favorite ? "bg-red-50 hover:bg-red-100" : ""}
                >
                  <Heart 
                    className={`h-4 w-4 ${p.is_favorite ? "fill-red-500 text-red-500" : ""}`} 
                  />
                </Button>
              </div>
            </CardContent>
          </Card>
        )})}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More Projects
        </Button>
      </div>

      <FundingCommitmentDialog
        open={fundingDialog.open}
        project_reference_id={fundingDialog.project_reference_id}
        onClose={() => setFundingDialog({ open: false, project_reference_id: null })}
      />
    </div>
  )
}
