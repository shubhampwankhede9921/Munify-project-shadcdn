import { useEffect, useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { apiService } from "@/services/api"
import { alerts } from "@/lib/alerts"
import { LoadingOverlay, Spinner } from "@/components/ui/spinner"
import ProjectFilters, { type FilterState } from "@/components/ProjectFilters"
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock,
  TrendingUp,
  Star,
  Eye,
  Heart,
  IndianRupee,
  MessageCircle,
  X
} from "lucide-react"

export default function ProjectsLive() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [fundingDialog, setFundingDialog] = useState<{ open: boolean; projectId: number | null }>({ open: false, projectId: null })
  const [fundingAmount, setFundingAmount] = useState("")
  const [selectedPartyId, setSelectedPartyId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  
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

  // Mock parties data - replace with API call if needed
  const parties = [
    { id: 1, name: "Municipal Corporation A" },
    { id: 2, name: "Bank of India" },
    { id: 3, name: "HDFC Bank" },
    { id: 4, name: "State Bank of India" },
  ]

  const fetchProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiService.get("/projects/", { params: { skip: 0, limit: 100 } })
      const list = res?.data
      setProjects(list)
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  // Count active filters for UI display (only advanced filters)
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.fundingRange[0] > 0 || filters.fundingRange[1] < 1000) count++
    if (filters.progressRange[0] > 0 || filters.progressRange[1] < 100) count++
    if (filters.daysLeftRange[0] > 0 || filters.daysLeftRange[1] < 365) count++
    if (filters.interestRateRange[0] > 0 || filters.interestRateRange[1] < 25) count++
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
    if (filters.interestRateRange[0] > 0 || filters.interestRateRange[1] < 25) count++
    return count
  }, [filters])

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    // Trigger API call with new filters
    fetchProjectsWithFilters(newFilters)
  }

  const debouncedSearch = useCallback((searchValue: string) => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      const newFilters = { ...filters, search: searchValue }
      setFilters(newFilters)
      fetchProjectsWithFilters(newFilters)
    }, 500) // 500ms delay

    setSearchTimeout(timeout)
  }, [filters, searchTimeout])

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {
      search: "",
      categories: [],
      states: [],
      status: [],
      fundingRange: [0, 1000] as [number, number],
      progressRange: [0, 100] as [number, number],
      daysLeftRange: [0, 365] as [number, number],
      interestRateRange: [0, 25] as [number, number]
    }
    setFilters(clearedFilters)
    // Trigger API call with cleared filters
    fetchProjectsWithFilters(clearedFilters)
  }

  const fetchProjectsWithFilters = async (currentFilters: FilterState) => {
    setLoading(true)
    setError(null)
    try {
      // Prepare query parameters for backend
      const queryParams: any = {
        skip: 0,
        limit: 100
      }

      // Add search parameter
      if (currentFilters.search) {
        queryParams.search = currentFilters.search
      }

      // Add category filters
      if (currentFilters.categories.length > 0) {
        queryParams.categories = currentFilters.categories.join(',')
      }

      // Add state filters
      if (currentFilters.states.length > 0) {
        queryParams.states = currentFilters.states.join(',')
      }

      // Add status filters
      if (currentFilters.status.length > 0) {
        queryParams.status = currentFilters.status.join(',')
      }

      // Add funding range
      if (currentFilters.fundingRange[0] > 0 || currentFilters.fundingRange[1] < 1000) {
        queryParams.min_funding = currentFilters.fundingRange[0] * 10000000 // Convert to actual amount
        queryParams.max_funding = currentFilters.fundingRange[1] * 10000000
      }

      // Add progress range
      if (currentFilters.progressRange[0] > 0 || currentFilters.progressRange[1] < 100) {
        queryParams.min_progress = currentFilters.progressRange[0]
        queryParams.max_progress = currentFilters.progressRange[1]
      }

      // Add days left range
      if (currentFilters.daysLeftRange[0] > 0 || currentFilters.daysLeftRange[1] < 365) {
        queryParams.min_days_left = currentFilters.daysLeftRange[0]
        queryParams.max_days_left = currentFilters.daysLeftRange[1]
      }

      // Add interest rate range
      if (currentFilters.interestRateRange[0] > 0 || currentFilters.interestRateRange[1] < 25) {
        queryParams.min_interest_rate = currentFilters.interestRateRange[0]
        queryParams.max_interest_rate = currentFilters.interestRateRange[1]
      }

      const res = await apiService.get("/projects/", { params: queryParams })
      const list = res?.data
      setProjects(list)
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

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

  const handleFundProject = (projectId: number) => {
    setFundingDialog({ open: true, projectId })
    setFundingAmount("")
    setSelectedPartyId("")
  }

  const handleFundingSubmit = async () => {
    if (!fundingAmount || !selectedPartyId || !fundingDialog.projectId) {
      alerts.error("Validation Error", "Please fill in all required fields")
      return
    }

    const amount = parseFloat(fundingAmount)
    if (isNaN(amount) || amount <= 0) {
      alerts.error("Validation Error", "Please enter a valid amount")
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        amount: amount,
        status: "ACTIVE",
        project_id: fundingDialog.projectId,
        party_id: parseInt(selectedPartyId),
        user_id: 5 // This should come from auth context
      }

      await apiService.post("/commitments/", payload)
      alerts.success("Funding Committed", `Successfully committed ₹${amount.toLocaleString()} to the project`)
      
      // Close dialog and refresh projects
      setFundingDialog({ open: false, projectId: null })
      setFundingAmount("")
      setSelectedPartyId("")
      await fetchProjects()
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to commit funding. Please try again."
      alerts.error("Error", message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <LoadingOverlay show={submitting} />
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
                        fetchProjectsWithFilters({ ...filters, search: "" })
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
                  fetchProjectsWithFilters(newFilters)
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
                  fetchProjectsWithFilters(newFilters)
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
                  fetchProjectsWithFilters(newFilters)
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
      {loading && (
        <div className="text-center text-sm text-muted-foreground">Loading projects...</div>
      )}
      {error && (
        <div className="text-center text-sm text-red-500">{error}</div>
      )}
      {!loading && !error && projects.length === 0 && (
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
          const name = p.project_title
          const municipality = p.municipality_id || "—"
          const state = p.location
          const category = p.project_category
          const description = p.description
          const currentFunding = Number(p.funds_secured || 0)
          const fundRequired = Number(p.funding_required || 0)
          const progress = fundRequired > 0 ? Math.min(100, Math.round((currentFunding / fundRequired) * 100)) : 0
          const end = p.end_date ? new Date(p.end_date) : null
          const today = new Date()
          const msLeft = end ? end.getTime() - today.getTime() : 0
          const daysLeft = end ? Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24))) : 0
          const status = p.status
          const id = p.id
          const interestRate = Number(12)

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
                    <span className="text-sm">0</span>
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
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Funding Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-secondary" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground gap-2">
                    <span className="whitespace-nowrap">₹{(currentFunding / 10000000).toFixed(1)}Cr raised</span>
                    <span className="whitespace-nowrap">₹{(fundRequired / 10000000).toFixed(1)}Cr target</span>
                  </div>
                </div>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="font-medium">{interestRate}% interest</span>
                  </div>
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
                  onClick={() => handleFundProject(id)}
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
                <Button variant="outline" size="icon" title="Add to Favorites">
                  <Heart className="h-4 w-4" />
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

      {/* Funding Dialog */}
      <Dialog open={fundingDialog.open} onOpenChange={(open) => setFundingDialog({ open, projectId: fundingDialog.projectId })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Commit Funding</DialogTitle>
            <DialogDescription>
              Enter the amount you want to commit to this project and select your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                value={fundingAmount}
                onChange={(e) => setFundingAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="party">Organization *</Label>
              <Select value={selectedPartyId} onValueChange={setSelectedPartyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {parties.map((party) => (
                    <SelectItem key={party.id} value={party.id.toString()}>
                      {party.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setFundingDialog({ open: false, projectId: null })}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleFundingSubmit} disabled={submitting}>
              {submitting ? <Spinner className="mr-2" size={16} /> : <IndianRupee className="h-4 w-4 mr-2" />}
              {submitting ? "Committing..." : "Commit Funding"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
