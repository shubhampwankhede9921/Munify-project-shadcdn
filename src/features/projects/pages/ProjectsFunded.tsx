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

// Helper function to normalize API response
const normalizeProjects = (data: any): any[] => {
  return data?.data || []
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

// Helper function to format dates
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}


export default function ProjectsFunded() {
  const navigate = useNavigate()

  // Fetch fully funded projects from API
  const { data, isLoading, error, isError } = useQuery<any>({
    queryKey: ['projects', 'funded', 'fully-funded'],
    queryFn: async () => {
      try {
        const response = await apiService.get<any>('/projects/fully-funded', {
          skip: 0,
          limit: 100
        })

        return response
      } catch (err: any) {
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
    return normalizeProjects(data)
  }, [data])

  // Calculate stats
  const stats = useMemo(() => {
    const totalValue = fundedProjects.reduce((sum, p) => sum + formatCurrency(p.funding_requirement), 0)
    
    const totalInvestors = fundedProjects.reduce((sum, p) => {
      return sum + (p.number_of_investors || 0)
    }, 0)

    // Calculate average ROI from projects that have average_interest_rate
    const interestRates = fundedProjects
      .map((project) => project.average_interest_rate)
      .filter((roi): roi is number => roi !== null && roi !== undefined && typeof roi === 'number')

    const avgROI = interestRates.length > 0
      ? Math.round((interestRates.reduce((sum, rate) => sum + rate, 0) / interestRates.length) * 10) / 10
      : 0

    return {
      totalProjects: fundedProjects.length,
      totalValue,
      totalInvestors,
      avgROI
    }
  }, [fundedProjects])

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
                  <p className="text-2xl font-bold">{stats.avgROI > 0 ? `${stats.avgROI}%` : 'N/A'}</p>
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
                const fundRaised = formatCurrency(project.funding_raised || project.funding_requirement)
                const progress = getProgress(project.funding_percentage)
                const investorCount = project.number_of_investors || 0
                const roi = project.average_interest_rate
                const displayROI = roi !== null && roi !== undefined ? Math.round(roi * 10) / 10 : null
                const cityDisplay = project.city || 'N/A'
                const stateDisplay = project.state || 'N/A'
                const projectImage = project.image || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=200&fit=crop&crop=center'
                const projectStage = project.project_stage
                  ? project.project_stage.split('_').map((word: string) =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')
                  : 'N/A'
                const statusDisplay = project.status
                  ? project.status.split('_').map((word: string) =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')
                  : 'Completed'

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
                          {statusDisplay}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{cityDisplay}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4" />
                            <span className="text-sm">{investorCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg">{project.title || 'Untitled Project'}</CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            <MapPin className="h-3 w-3" />
                            <span>{stateDisplay}</span>
                          </CardDescription>
                          {project.project_reference_id && (
                            <CardDescription className="text-xs text-muted-foreground">
                              ID: {project.project_reference_id}
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant="outline" className="ml-2">{project.category || 'N/A'}</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description || 'No description available'}
                      </p>

                      {/* Project Info */}
                      {(project.department || project.project_stage) && (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {project.department && (
                            <Badge variant="secondary" className="text-xs">
                              {project.department}
                            </Badge>
                          )}
                          {project.project_stage && (
                            <Badge variant="secondary" className="text-xs">
                              {projectStage}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Funding Details */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Funding</span>
                          <span className="font-medium">₹{(fundRequired / 10000000).toFixed(1)}Cr</span>
                        </div>
                        {project.funding_raised && (
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Funded</span>
                            <span>₹{(fundRaised / 10000000).toFixed(1)}Cr</span>
                          </div>
                        )}
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-green-600 font-medium">
                          ✓ Fully funded and completed
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {displayROI !== null ? (
                          <div className="text-center p-2 bg-green-50 rounded-lg">
                            <div className="font-bold text-green-600">
                              {displayROI}%
                            </div>
                            <div className="text-xs text-muted-foreground">Avg ROI</div>
                          </div>
                        ) : null}
                        <div className={`text-center p-2 bg-blue-50 rounded-lg ${displayROI === null ? 'col-span-2' : ''}`}>
                          <div className="font-bold text-blue-600">
                            {investorCount}
                          </div>
                          <div className="text-xs text-muted-foreground">Investors</div>
                        </div>
                      </div>

                      {/* Municipality Credit Info */}
                      {(project.municipality_credit_rating || project.municipality_credit_score) && (
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <div className="text-xs font-medium text-purple-700 mb-1">Municipality Credit</div>
                          <div className="flex items-center justify-between text-xs text-purple-600">
                            {project.municipality_credit_rating && (
                              <span>Rating: {project.municipality_credit_rating}</span>
                            )}
                            {project.municipality_credit_score && (
                              <span>Score: {project.municipality_credit_score}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Project Details */}
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {project.start_date && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Started: {formatDate(project.start_date)}</span>
                          </div>
                        )}
                        {project.end_date && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Completed: {formatDate(project.end_date)}</span>
                          </div>
                        )}
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
