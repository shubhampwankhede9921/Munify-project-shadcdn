import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useNavigate } from "react-router-dom"
import { Spinner } from "@/components/ui/spinner"
import apiService from "@/services/api"
import { alerts } from "@/lib/alerts"
import type { Project } from "@/features/projects/types"
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  CheckCircle,
  Star,
  Eye,
  Download,
  TrendingUp,
  IndianRupee,
  AlertCircle
} from "lucide-react"

// API Response type - handle various response structures
type FundedProjectsApiResponse = 
  | Project[] 
  | { data: Project[] }
  | { results: Project[] }
  | { status: string; message?: string; data: Project[]; average_interest_rate?: number | string }
  | { status: string; message?: string; results: Project[]; average_interest_rate?: number | string }
  | { data: Project[]; average_interest_rate?: number | string }
  | { results: Project[]; average_interest_rate?: number | string }

// Helper function to normalize API response
const normalizeProjects = (data: FundedProjectsApiResponse | undefined): Project[] => {
  if (!data) {
    if (process.env.NODE_ENV === 'development') {
      console.log('ProjectsFunded: No data received from API')
    }
    return []
  }
  
  // Direct array
  if (Array.isArray(data)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('ProjectsFunded: Received array of projects:', data.length)
    }
    return data
  }
  
  // Object with data property
  if ('data' in data && Array.isArray(data.data)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('ProjectsFunded: Received data property with projects:', data.data.length)
    }
    return data.data
  }
  
  // Object with results property
  if ('results' in data && Array.isArray(data.results)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('ProjectsFunded: Received results property with projects:', data.results.length)
    }
    return data.results
  }
  
  // Log unexpected structure
  if (process.env.NODE_ENV === 'development') {
    console.warn('ProjectsFunded: Unexpected API response structure:', data)
  }
  
  return []
}

// Helper function to format currency
const formatCurrency = (amount: string | number): number => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return isNaN(numAmount) ? 0 : numAmount
}

// Helper function to get progress percentage
const getProgress = (fundingPercentage: string | null | number): number => {
  if (fundingPercentage === null || fundingPercentage === undefined) return 100
  const percentage = typeof fundingPercentage === 'string' ? parseFloat(fundingPercentage) : fundingPercentage
  return isNaN(percentage) ? 100 : Math.min(100, Math.max(0, percentage))
}

// Helper function to get investor count from project
const getInvestorCount = (project: Project): number => {
  // Check multiple possible field names for investor count
  const investors = 
    (project as any).investors ||
    (project as any).investor_count ||
    (project as any).total_investors ||
    (project as any).investors_count ||
    project.favorite_count ||
    0
  
  return typeof investors === 'number' ? investors : parseInt(String(investors)) || 0
}

// Helper function to get ROI from project
const getROI = (project: Project): number | null => {
  // Check multiple possible field names for ROI
  const roi = 
    (project as any).average_interest_rate ||
    (project as any).roi ||
    (project as any).rate_of_interest ||
    (project as any).expected_roi ||
    (project as any).average_roi ||
    (project as any).roi_percentage ||
    (project as any).expected_roi_percentage ||
    null
  
  if (roi === null || roi === undefined) return null
  
  const roiValue = typeof roi === 'string' ? parseFloat(roi) : roi
  return isNaN(roiValue) ? null : roiValue
}

export default function ProjectsFunded() {
  const navigate = useNavigate()

  // Fetch fully funded projects from API
  const { data, isLoading, error, isError } = useQuery<FundedProjectsApiResponse>({
    queryKey: ['projects', 'funded', 'fully-funded'],
    queryFn: async () => {
      try {
        const response = await apiService.get<FundedProjectsApiResponse>('/projects/funded/fully-funded')
        
        // Log the raw response in development
        if (process.env.NODE_ENV === 'development') {
          console.log('ProjectsFunded: Raw API response:', response)
        }
        
        return response
      } catch (err: any) {
        // Log error details in development
        if (process.env.NODE_ENV === 'development') {
          console.error('ProjectsFunded: API error:', err)
        }
        
        // Show user-friendly error message via alerts
        const errorMessage = 
          err?.response?.data?.message || 
          err?.response?.data?.detail || 
          err?.message || 
          'Failed to fetch funded projects'
        
        alerts.error('Error', errorMessage)
        throw err
      }
    },
  })

  // Normalize API response to array
  const fundedProjects = useMemo(() => {
    const projects = normalizeProjects(data)
    
    // Log normalized projects in development
    if (process.env.NODE_ENV === 'development' && projects.length > 0) {
      console.log('ProjectsFunded: Normalized projects:', projects.length)
      console.log('ProjectsFunded: Sample project structure:', projects[0])
    }
    
    return projects
  }, [data])

  // Calculate stats using useMemo to ensure it recalculates when data changes
  const stats = useMemo(() => {
    // First, check if API response has average_interest_rate at root level
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const avgRate = (data as any).average_interest_rate
      if (avgRate !== null && avgRate !== undefined) {
        const apiAvgROI = typeof avgRate === 'string' ? parseFloat(avgRate) : avgRate
        if (!isNaN(apiAvgROI) && typeof apiAvgROI === 'number') {
          const calculatedAvgROI = Math.round(apiAvgROI * 10) / 10
          
          if (process.env.NODE_ENV === 'development') {
            console.log('ProjectsFunded: Using API average_interest_rate:', calculatedAvgROI)
          }
          
          return {
            totalProjects: fundedProjects.length,
            totalValue: fundedProjects.reduce((sum, p) => sum + formatCurrency(p.funding_requirement), 0),
            totalInvestors: fundedProjects.reduce((sum, p) => sum + getInvestorCount(p), 0),
            avgROI: calculatedAvgROI
          }
        }
      }
    }
    
    // If no root-level average_interest_rate, calculate from individual projects
    // Calculate average ROI: sum of interest rates / count of interest rates
    const interestRates = fundedProjects
      .map((project) => getROI(project))
      .filter((roi): roi is number => roi !== null)
    
    const totalRate = interestRates.reduce((sum, rate) => sum + rate, 0)
    const avgROI = interestRates.length > 0 
      ? totalRate / interestRates.length 
      : 0 // Fallback if no ROI data available

    const calculatedAvgROI = Math.round(avgROI * 10) / 10 // Round to 1 decimal place
    
    // Debug: Log the calculation (can be removed later)
    if (process.env.NODE_ENV === 'development') {
      console.log('ROI Calculation:', {
        totalProjects: fundedProjects.length,
        interestRatesFound: interestRates.length,
        interestRates,
        totalRate,
        avgROI: calculatedAvgROI,
        hasApiAvgROI: data && typeof data === 'object' && !Array.isArray(data) && (data as any).average_interest_rate !== undefined
      })
    }

    return {
      totalProjects: fundedProjects.length,
      totalValue: fundedProjects.reduce((sum, p) => sum + formatCurrency(p.funding_requirement), 0),
      totalInvestors: fundedProjects.reduce((sum, p) => sum + getInvestorCount(p), 0),
      avgROI: calculatedAvgROI
    }
  }, [fundedProjects, data])

  const handleViewDetails = (projectId: number) => {
    navigate(`/main/projects/${projectId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fully Funded Projects</h1>
          <p className="text-muted-foreground">
            Successfully completed municipal projects with proven impact
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search completed projects..." 
                  className="pl-10"
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="renewable">Renewable Energy</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="water">Water Management</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="karnataka">Karnataka</SelectItem>
                <SelectItem value="maharashtra">Maharashtra</SelectItem>
                <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="roi">Highest ROI</SelectItem>
                <SelectItem value="amount">Largest Amount</SelectItem>
                <SelectItem value="impact">Most Impact</SelectItem>
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
            {(error as any)?.response?.data?.message || 
             (error as any)?.response?.data?.detail || 
             (error as Error)?.message || 
             'Failed to fetch funded projects. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Spinner size={20} />
            <span>Loading funded projects...</span>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{stats.totalProjects}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">₹{(stats.totalValue / 10000000).toFixed(1)}Cr</p>
                </div>
                <IndianRupee className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg ROI</p>
                  <p className="text-2xl font-bold">{stats.avgROI}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Investors</p>
                  <p className="text-2xl font-bold">{stats.totalInvestors}</p>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Projects Grid */}
      {!isLoading && !isError && (
        <>
          {fundedProjects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12">
                <div className="text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">No funded projects</h3>
                  <p className="text-sm text-muted-foreground">
                    There are no fully funded projects available at this time.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {fundedProjects.map((project) => {
                const fundRequired = formatCurrency(project.funding_requirement)
                const progress = getProgress(project.funding_percentage)
                const investors = getInvestorCount(project)
                // Get individual project's average_interest_rate
                const projectROI = getROI(project)
                const displayROI = projectROI !== null ? Math.round(projectROI * 10) / 10 : 0
                const municipality = project.city || project.state || 'N/A'
                const projectImage = (project as any).image || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=200&fit=crop&crop=center'
                
                return (
                  <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video relative overflow-hidden bg-gray-200">
                      <img 
                        src={projectImage} 
                        alt={project.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=200&fit=crop&crop=center'
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {project.status || 'Completed'}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{municipality}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4" />
                            <span className="text-sm">{investors}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            <MapPin className="h-3 w-3" />
                            <span>{project.state || project.city || 'N/A'}</span>
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{project.category || 'N/A'}</Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description || 'No description available'}
                      </p>
                      
                      {/* Funding Details */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Funding</span>
                          <span className="font-medium">₹{(fundRequired / 10000000).toFixed(1)}Cr</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-green-600 font-medium">
                          ✓ Fully funded and completed
                        </div>
                      </div>
                      
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                          <div className="font-bold text-green-600">
                            {typeof displayROI === 'number' && !isNaN(displayROI) ? `${displayROI}%` : '0%'}
                          </div>
                          <div className="text-xs text-muted-foreground">Avg ROI</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <div className="font-bold text-blue-600">{investors}</div>
                          <div className="text-xs text-muted-foreground">Investors</div>
                        </div>
                      </div>
                      
                      {/* Impact */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-1">Impact</div>
                        <div className="text-sm text-gray-600">Successfully completed with positive community impact</div>
                      </div>
                      
                      {/* Project Details */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Completed: {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-4">
                        <Button 
                          className="flex-1"
                          onClick={() => handleViewDetails(project.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Star className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Load More - Only show if there are projects */}
      {!isLoading && !isError && fundedProjects.length > 0 && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Projects
          </Button>
        </div>
      )}
    </div>
  )
}
