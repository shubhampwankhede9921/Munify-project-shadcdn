import { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ProjectFiltersAdvanced, { type ProjectFiltersState } from "@/components/ProjectFiltersAdvanced"
import apiService from "@/services/api"
import { Filter, Search } from "lucide-react"
import { type Project } from "@/features/projects/types"

// Default status options
const defaultStatusOptions = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "draft", label: "Draft" },
]

export default function ProjectFiltersShowcase() {
  // Query for value ranges (min/max for sliders)
  const { data: valueRangesResponse, isLoading: isLoadingValueRanges } = useQuery({
    queryKey: ["project-value-ranges"],
    queryFn: () => apiService.get("/projects/value-ranges"),
    retry: false,
  })

  // Extract range values from API and convert to crores if needed
  const valueRanges = useMemo(() => {
    if (!valueRangesResponse) {
      return {
        fund_requirement: { min: 0, max: 1000 },
        commitment_gap: { min: 0, max: 500 },
        project_cost: { min: 0, max: 2000 },
      }
    }
    const data = Array.isArray(valueRangesResponse)
      ? valueRangesResponse[0]
      : (valueRangesResponse as any)?.data || valueRangesResponse
    
    // Helper function to parse string/number and convert to crores (divide by 10,000,000)
    const toCrores = (value: string | number | undefined, defaultValue: number = 0): number => {
      if (value === undefined || value === null) return defaultValue
      const numValue = typeof value === 'string' ? parseFloat(value) : value
      if (isNaN(numValue)) return defaultValue
      // Convert from rupees to crores (1 crore = 10,000,000)
      return Math.round((numValue / 10000000) * 100) / 100 // Round to 2 decimal places
    }

    // API field names: min_funding_requirement, max_funding_requirement, min_commitment_gap, max_commitment_gap, min_total_project_cost, max_total_project_cost
    const fundReqMin = toCrores(
      data?.min_funding_requirement || data?.fund_requirement_min || data?.min_fund_requirement,
      0
    )
    const fundReqMax = toCrores(
      data?.max_funding_requirement || data?.fund_requirement_max || data?.max_fund_requirement,
      1000
    )
    const commitGapMin = toCrores(
      data?.min_commitment_gap || data?.commitment_gap_min || data?.min_commitment_gap,
      0
    )
    const commitGapMax = toCrores(
      data?.max_commitment_gap || data?.commitment_gap_max || data?.max_commitment_gap,
      500
    )
    const projCostMin = toCrores(
      data?.min_total_project_cost || data?.project_cost_min || data?.min_project_cost,
      0
    )
    const projCostMax = toCrores(
      data?.max_total_project_cost || data?.project_cost_max || data?.max_project_cost,
      2000
    )

    return {
      fund_requirement: {
        min: fundReqMin,
        max: fundReqMax,
      },
      commitment_gap: {
        min: commitGapMin,
        max: commitGapMax,
      },
      project_cost: {
        min: projCostMin,
        max: projCostMax,
      },
    }
  }, [valueRangesResponse])

  // Initialize filters with default ranges (will be updated when API loads)
  const [filters, setFilters] = useState<ProjectFiltersState>({
    project_referenceid: "",
    location: "",
    project_category: "",
    project_stage: "",
    status: "",
    credit_score: "",
    funding_type: "",
    mode_of_implementation: "",
    ownership: "",
    fund_requirement: [0, 1000],
    commitment_gap: [0, 500],
    project_cost: [0, 2000],
  })

  // Update filters when ranges are loaded from API
  useEffect(() => {
    if (valueRangesResponse && valueRanges) {
      // Ensure values are valid numbers
      const fundMin = isNaN(valueRanges.fund_requirement.min) ? 0 : valueRanges.fund_requirement.min
      const fundMax = isNaN(valueRanges.fund_requirement.max) ? 1000 : valueRanges.fund_requirement.max
      const commitMin = isNaN(valueRanges.commitment_gap.min) ? 0 : valueRanges.commitment_gap.min
      const commitMax = isNaN(valueRanges.commitment_gap.max) ? 500 : valueRanges.commitment_gap.max
      const costMin = isNaN(valueRanges.project_cost.min) ? 0 : valueRanges.project_cost.min
      const costMax = isNaN(valueRanges.project_cost.max) ? 2000 : valueRanges.project_cost.max
      
      setFilters((prev) => ({
        ...prev,
        fund_requirement: [Math.max(0, fundMin), Math.max(fundMin, fundMax)],
        commitment_gap: [Math.max(0, commitMin), Math.max(commitMin, commitMax)],
        project_cost: [Math.max(0, costMin), Math.max(costMin, costMax)],
      }))
    }
  }, [valueRanges, valueRangesResponse])

  // Query for states
  const { data: statesResponse, isLoading: isLoadingStates } = useQuery({
    queryKey: ["project-states"],
    queryFn: () => apiService.get("/projects/states"),
    retry: false,
  })

  // Query for credit ratings
  const { data: creditRatingsResponse, isLoading: isLoadingCreditRatings } = useQuery({
    queryKey: ["municipality-credit-ratings"],
    queryFn: () => apiService.get("/projects/municipality-credit-ratings"),
    retry: false,
  })

  // Query for project categories
  const { data: categoriesResponse, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["project-categories"],
    queryFn: () => apiService.get("/master/project-categories"),
    retry: false,
  })

  // Query for project stages
  const { data: stagesResponse, isLoading: isLoadingStages } = useQuery({
    queryKey: ["project-stages"],
    queryFn: () => apiService.get("/master/project-stages"),
    retry: false,
  })

  // Query for funding types
  const { data: fundingTypesResponse, isLoading: isLoadingFundingTypes } = useQuery({
    queryKey: ["funding-types"],
    queryFn: () => apiService.get("/master/funding-types"),
    retry: false,
  })

  // Query for modes of implementation
  const { data: modesResponse, isLoading: isLoadingModes } = useQuery({
    queryKey: ["modes-of-implementation"],
    queryFn: () => apiService.get("/master/mode-of-implementations"),
    retry: false,
  })

  // Query for ownership types
  const { data: ownershipResponse, isLoading: isLoadingOwnership } = useQuery({
    queryKey: ["ownership-types"],
    queryFn: () => apiService.get("/master/ownerships"),
    retry: false,
  })

  // Extract and format options from API responses
  const stateOptions = useMemo(() => {
    if (!statesResponse) return []
    const data = Array.isArray(statesResponse)
      ? statesResponse
      : (statesResponse as any)?.data || []
    return data.map((item: any) => ({
      value: item.value || item.state || item.name || item.toString(),
      label: item.label || item.state || item.name || item.toString(),
    }))
  }, [statesResponse])

  const creditScoreOptions = useMemo(() => {
    if (!creditRatingsResponse) return []
    const data = Array.isArray(creditRatingsResponse)
      ? creditRatingsResponse
      : (creditRatingsResponse as any)?.data || []
    return data.map((item: any) => ({
      value: item.value || item.rating || item.credit_rating || item.name || item.toString(),
      label: item.label || item.rating || item.credit_rating || item.name || item.toString(),
    }))
  }, [creditRatingsResponse])

  const categoryOptions = useMemo(() => {
    if (!categoriesResponse) return []
    const data = Array.isArray(categoriesResponse)
      ? categoriesResponse
      : (categoriesResponse as any)?.data || []
    return data.map((item: any) => ({
      value: item.value || item.id?.toString() || item.name || "",
      label: item.label || item.name || item.value || "",
    }))
  }, [categoriesResponse])

  const stageOptions = useMemo(() => {
    if (!stagesResponse) return []
    const data = Array.isArray(stagesResponse)
      ? stagesResponse
      : (stagesResponse as any)?.data || []
    return data.map((item: any) => ({
      value: item.value || item.id?.toString() || item.name || "",
      label: item.label || item.name || item.value || "",
    }))
  }, [stagesResponse])

  const fundingTypeOptions = useMemo(() => {
    if (!fundingTypesResponse) return []
    const data = Array.isArray(fundingTypesResponse)
      ? fundingTypesResponse
      : (fundingTypesResponse as any)?.data || []
    return data.map((item: any) => ({
      value: item.value || item.id?.toString() || item.name || "",
      label: item.label || item.name || item.value || "",
    }))
  }, [fundingTypesResponse])

  const modeOfImplementationOptions = useMemo(() => {
    if (!modesResponse) return []
    const data = Array.isArray(modesResponse)
      ? modesResponse
      : (modesResponse as any)?.data || []
    return data.map((item: any) => ({
      value: item.value || item.id?.toString() || item.name || "",
      label: item.label || item.name || item.value || "",
    }))
  }, [modesResponse])

  const ownershipOptions = useMemo(() => {
    if (!ownershipResponse) return []
    const data = Array.isArray(ownershipResponse)
      ? ownershipResponse
      : (ownershipResponse as any)?.data || []
    return data.map((item: any) => ({
      value: item.value || item.id?.toString() || item.name || "",
      label: item.label || item.name || item.value || "",
    }))
  }, [ownershipResponse])

  const isLoading =
    isLoadingValueRanges ||
    isLoadingStates ||
    isLoadingCreditRatings ||
    isLoadingCategories ||
    isLoadingStages ||
    isLoadingFundingTypes ||
    isLoadingModes ||
    isLoadingOwnership

  // Build query parameters from filters
  const buildProjectQueryParams = useMemo(() => {
    const queryParams: any = {
      skip: 0,
      limit: 100,
    }

    // Add project_referenceid as search parameter
    if (filters.project_referenceid) {
      queryParams.search = filters.project_referenceid
    }

    // Add location (state) filter
    if (filters.location) {
      queryParams.states = filters.location
    }

    // Add project category filter
    if (filters.project_category) {
      queryParams.categories = filters.project_category
    }

    // Add project stage filter
    if (filters.project_stage) {
      queryParams.project_stage = filters.project_stage
    }

    // Add status filter
    if (filters.status) {
      queryParams.status = filters.status.toLowerCase()
    }

    // Add credit score filter
    if (filters.credit_score) {
      queryParams.municipality_credit_rating = filters.credit_score
    }

    // Add funding type filter
    if (filters.funding_type) {
      queryParams.funding_type = filters.funding_type
    }

    // Add mode of implementation filter
    if (filters.mode_of_implementation) {
      queryParams.mode_of_implementation = filters.mode_of_implementation
    }

    // Add ownership filter
    if (filters.ownership) {
      queryParams.ownership = filters.ownership
    }

    // Add fund requirement range (convert crores to rupees: 1 crore = 10,000,000)
    if (
      filters.fund_requirement[0] > valueRanges.fund_requirement.min ||
      filters.fund_requirement[1] < valueRanges.fund_requirement.max
    ) {
      queryParams.min_funding_requirement = filters.fund_requirement[0] * 10000000
      queryParams.max_funding_requirement = filters.fund_requirement[1] * 10000000
    }

    // Add commitment gap range (convert crores to rupees)
    if (
      filters.commitment_gap[0] > valueRanges.commitment_gap.min ||
      filters.commitment_gap[1] < valueRanges.commitment_gap.max
    ) {
      queryParams.min_commitment_gap = filters.commitment_gap[0] * 10000000
      queryParams.max_commitment_gap = filters.commitment_gap[1] * 10000000
    }

    // Add project cost range (convert crores to rupees)
    if (
      filters.project_cost[0] > valueRanges.project_cost.min ||
      filters.project_cost[1] < valueRanges.project_cost.max
    ) {
      queryParams.min_total_project_cost = filters.project_cost[0] * 10000000
      queryParams.max_total_project_cost = filters.project_cost[1] * 10000000
    }

    return queryParams
  }, [filters, valueRanges])

  // Query to fetch filtered projects
  const {
    data: projectsResponse,
    isLoading: isLoadingProjects,
    isError: isProjectsError,
    error: projectsError,
  } = useQuery<any, any>({
    queryKey: ["projects", "filtered", filters],
    queryFn: async () => {
      // If project_referenceid is provided and looks like a specific reference ID (e.g., PROJ-2025-00037),
      // try using the specific endpoint first, otherwise use general search
      if (filters.project_referenceid && filters.project_referenceid.match(/^PROJ-\d{4}-\d{5}$/)) {
        try {
          const response = await apiService.get(`/projects/reference/${filters.project_referenceid}`)
          // Return as array format for consistency
          const project = response?.data || response
          return { data: project ? [project] : [] }
        } catch (err) {
          // If specific endpoint fails, fall back to general search
          return apiService.get("/projects", buildProjectQueryParams)
        }
      }
      return apiService.get("/projects", buildProjectQueryParams)
    },
    enabled: true, // Always enabled to show results
    retry: false,
  })

  // Extract projects from response
  const projects = useMemo<Project[]>(() => {
    if (!projectsResponse) return []
    if (Array.isArray(projectsResponse)) return projectsResponse
    if (projectsResponse?.data) {
      return Array.isArray(projectsResponse.data) ? projectsResponse.data : [projectsResponse.data]
    }
    return []
  }, [projectsResponse])

  const handleFiltersChange = (newFilters: ProjectFiltersState) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      project_referenceid: "",
      location: "",
      project_category: "",
      project_stage: "",
      status: "",
      credit_score: "",
      funding_type: "",
      mode_of_implementation: "",
      ownership: "",
      fund_requirement: [valueRanges.fund_requirement.min, valueRanges.fund_requirement.max],
      commitment_gap: [valueRanges.commitment_gap.min, valueRanges.commitment_gap.max],
      project_cost: [valueRanges.project_cost.min, valueRanges.project_cost.max],
    })
  }

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.project_referenceid) count++
    if (filters.location) count++
    if (filters.project_category) count++
    if (filters.project_stage) count++
    if (filters.status) count++
    if (filters.credit_score) count++
    if (filters.funding_type) count++
    if (filters.mode_of_implementation) count++
    if (filters.ownership) count++
    if (
      filters.fund_requirement[0] > valueRanges.fund_requirement.min ||
      filters.fund_requirement[1] < valueRanges.fund_requirement.max
    )
      count++
    if (
      filters.commitment_gap[0] > valueRanges.commitment_gap.min ||
      filters.commitment_gap[1] < valueRanges.commitment_gap.max
    )
      count++
    if (
      filters.project_cost[0] > valueRanges.project_cost.min ||
      filters.project_cost[1] < valueRanges.project_cost.max
    )
      count++
    return count
  }, [filters, valueRanges])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Filters Component</h1>
        <p className="text-muted-foreground mt-2">
          A reusable filter component for filtering projects by various criteria. This component can be integrated into any page that needs project filtering functionality.
        </p>
      </div>

      {isLoading && (
        <Alert>
          <AlertDescription>Loading filter options...</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Component */}
        <div className="lg:col-span-2 space-y-6">
          <ProjectFiltersAdvanced
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            locationOptions={stateOptions}
            categoryOptions={categoryOptions}
            stageOptions={stageOptions}
            statusOptions={defaultStatusOptions}
            creditScoreOptions={creditScoreOptions}
            fundingTypeOptions={fundingTypeOptions}
            modeOfImplementationOptions={modeOfImplementationOptions}
            ownershipOptions={ownershipOptions}
            fundRequirementRange={valueRanges.fund_requirement}
            commitmentGapRange={valueRanges.commitment_gap}
            projectCostRange={valueRanges.project_cost}
          />

          {/* Filtered Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Filtered Results
              </CardTitle>
              <CardDescription>
                {isLoadingProjects
                  ? "Loading projects..."
                  : isProjectsError
                    ? "Error loading projects"
                    : `${projects.length} project${projects.length !== 1 ? "s" : ""} found`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProjects ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading projects...</p>
                  </div>
                </div>
              ) : isProjectsError ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    {projectsError?.message || "Failed to fetch projects. Please try again."}
                  </AlertDescription>
                </Alert>
              ) : projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No projects found matching the current filters.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your filters or clearing them to see all projects.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project: Project) => (
                    <Card key={project.id} className="hover:bg-muted/50 transition-colors">
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{project.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {project.project_reference_id}
                              </p>
                            </div>
                            <Badge variant={project.status === "active" ? "default" : "secondary"}>
                              {project.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {project.state && (
                              <Badge variant="outline">📍 {project.state}</Badge>
                            )}
                            {project.category && (
                              <Badge variant="outline">📁 {project.category}</Badge>
                            )}
                            {project.project_stage && (
                              <Badge variant="outline">📊 {project.project_stage}</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Filters Display */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Active Filters
              </CardTitle>
              <CardDescription>
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? "s" : ""} currently active
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeFiltersCount === 0 ? (
                <p className="text-sm text-muted-foreground">No filters applied</p>
              ) : (
                <div className="space-y-2">
                  {filters.project_referenceid && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Project Reference ID:</span>
                      <Badge variant="secondary">{filters.project_referenceid}</Badge>
                    </div>
                  )}
                  {filters.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Location:</span>
                      <Badge variant="secondary">{filters.location}</Badge>
                    </div>
                  )}
                  {filters.project_category && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Category:</span>
                      <Badge variant="secondary">
                        {categoryOptions.find((opt: { value: string; label: string }) => opt.value === filters.project_category)?.label || filters.project_category}
                      </Badge>
                    </div>
                  )}
                  {filters.project_stage && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Stage:</span>
                      <Badge variant="secondary">
                        {stageOptions.find((opt: { value: string; label: string }) => opt.value === filters.project_stage)?.label || filters.project_stage}
                      </Badge>
                    </div>
                  )}
                  {filters.status && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant="secondary">
                        {defaultStatusOptions.find((opt: { value: string; label: string }) => opt.value === filters.status)?.label || filters.status}
                      </Badge>
                    </div>
                  )}
                  {filters.credit_score && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Credit Score:</span>
                      <Badge variant="secondary">
                        {creditScoreOptions.find((opt: { value: string; label: string }) => opt.value === filters.credit_score)?.label || filters.credit_score}
                      </Badge>
                    </div>
                  )}
                  {filters.funding_type && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Funding Type:</span>
                      <Badge variant="secondary">
                        {fundingTypeOptions.find((opt: { value: string; label: string }) => opt.value === filters.funding_type)?.label || filters.funding_type}
                      </Badge>
                    </div>
                  )}
                  {filters.mode_of_implementation && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mode:</span>
                      <Badge variant="secondary">
                        {modeOfImplementationOptions.find((opt: { value: string; label: string }) => opt.value === filters.mode_of_implementation)?.label || filters.mode_of_implementation}
                      </Badge>
                    </div>
                  )}
                  {filters.ownership && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Ownership:</span>
                      <Badge variant="secondary">
                        {ownershipOptions.find((opt: { value: string; label: string }) => opt.value === filters.ownership)?.label || filters.ownership}
                      </Badge>
                    </div>
                  )}
                  {(filters.fund_requirement[0] > valueRanges.fund_requirement.min ||
                    filters.fund_requirement[1] < valueRanges.fund_requirement.max) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Fund Requirement:</span>
                      <Badge variant="secondary">
                        {valueRanges.fund_requirement.max < 1 ? (
                          <>₹{filters.fund_requirement[0] * 100}L - ₹{filters.fund_requirement[1] * 100}L</>
                        ) : (
                          <>₹{filters.fund_requirement[0]}Cr - ₹{filters.fund_requirement[1]}Cr</>
                        )}
                      </Badge>
                    </div>
                  )}
                  {(filters.commitment_gap[0] > valueRanges.commitment_gap.min ||
                    filters.commitment_gap[1] < valueRanges.commitment_gap.max) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Commitment Gap:</span>
                      <Badge variant="secondary">
                        {valueRanges.commitment_gap.max < 1 ? (
                          <>₹{filters.commitment_gap[0] * 100}L - ₹{filters.commitment_gap[1] * 100}L</>
                        ) : (
                          <>₹{filters.commitment_gap[0]}Cr - ₹{filters.commitment_gap[1]}Cr</>
                        )}
                      </Badge>
                    </div>
                  )}
                  {(filters.project_cost[0] > valueRanges.project_cost.min ||
                    filters.project_cost[1] < valueRanges.project_cost.max) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Project Cost:</span>
                      <Badge variant="secondary">
                        {valueRanges.project_cost.max < 1 ? (
                          <>₹{filters.project_cost[0] * 100}L - ₹{filters.project_cost[1] * 100}L</>
                        ) : (
                          <>₹{filters.project_cost[0]}Cr - ₹{filters.project_cost[1]}Cr</>
                        )}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Usage</CardTitle>
              <CardDescription>How to use this component in your pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Import the component:
                </p>
                <code className="block p-2 bg-muted rounded text-xs">
                  {`import ProjectFiltersAdvanced from "@/components/ProjectFiltersAdvanced"`}
                </code>
                <p className="pt-2">
                  Use the filters state to build your API query parameters and filter your data accordingly.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

