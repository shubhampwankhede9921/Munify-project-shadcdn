import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  Heart,
  Eye,
  MapPin,
  Clock,
  MessageCircle,
  IndianRupee,
} from "lucide-react"
import { apiService } from "@/services/api"
import { alerts } from "@/lib/alerts"
import { Spinner } from "@/components/ui/spinner"

interface FavoriteProject {
  id: number
  // Title / name fields
  title?: string
  project_title?: string
  projectTitle?: string
  name?: string

  // Identifiers
  project_reference_id: string

  // Descriptions & categorization
  description?: string
  category?: string
  project_category?: string

  // Location fields
  location?: string
  state?: string
  state_name?: string
  city?: string
  municipality_id?: string

  // Funding fields
  already_secured_funds?: number
  funding_raised?: number
  funding_requirement?: number
  funds_secured?: number
  funding_required?: number
  // Funding period fields
  funding_end_date?: string
  funding_close_date?: string
  fundraising_end_date?: string
  end_date?: string
  status?: string

  // Favorites metadata
  favorite_count?: number
  is_favorite?: boolean
}

// API may return either a raw array or an object with a `data` array
type FavoriteProjectsApiResponse =
  | FavoriteProject[]
  | {
      data?: FavoriteProject[]
    }

export default function Favorites() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const userId = "shubhamw20" // TODO: Replace with auth user id

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<FavoriteProjectsApiResponse>({
    queryKey: ["favorite-projects", userId],
    queryFn: async () => {
      try {
        // Fetch full project details for all favorites in a single GET call
        // curl -X GET "http://127.0.0.1:8000/api/v1/project-favorites/project-details?user_id=shubhamw20&skip=0&limit=100"
        return await apiService.get<FavoriteProjectsApiResponse>("/project-favorites/project-details", {
          user_id: userId,
          skip: 0,
          limit: 100,
        })
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          "Failed to load favorite projects"
        alerts.error("Error", message)
        throw err
      }
    },
  })

  // Normalize API response to a plain array of favorites
  const favorites: FavoriteProject[] = useMemo(() => {
    if (!data) return []
    if (Array.isArray(data)) return data
    return (data.data ?? []) as FavoriteProject[]
  }, [data])

  const filteredFavorites = useMemo(() => {
    if (!search.trim()) return favorites
    const term = search.toLowerCase()

    return favorites.filter((p) => {
      const title = p.project_title?.toLowerCase() || ""
      const location = p.location?.toLowerCase() || ""
      const municipality = p.municipality_id?.toLowerCase() || ""
      const category = p.project_category?.toLowerCase() || ""
      return (
        title.includes(term) ||
        location.includes(term) ||
        municipality.includes(term) ||
        category.includes(term)
      )
    })
  }, [favorites, search])

  const handleViewDetails = (projectId: number) => {
    navigate(`/main/projects/${projectId}`)
  }

  const handleViewQA = (projectId: number) => {
    navigate(`/main/projects/${projectId}#qa`)
  }

  const handleFundProject = (projectId: number) => {
    // Navigate to project details where funding flow can be initiated
    navigate(`/main/projects/${projectId}`)
  }

  // Remove project from favorites (align with ProjectsLive implementation)
  const deleteFavoriteMutation = useMutation({
    mutationFn: async ({ project_reference_id, user_id }: { project_reference_id: string; user_id: string }) => {
      const params = new URLSearchParams({
        project_reference_id,
        user_id,
      })
      return await apiService.delete(`/project-favorites/?${params.toString()}`)
    },
    onSuccess: () => {
      alerts.success("Removed from Favorites", "Project has been removed from your favorites.")
      queryClient.invalidateQueries({ queryKey: ["favorite-projects", userId] })
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to remove project from favorites"
      alerts.error("Error", message)
    },
  })

  const handleUnfavorite = (projectReferenceId: string) => {
    if (!projectReferenceId || deleteFavoriteMutation.isPending) return
    deleteFavoriteMutation.mutate({
      project_reference_id: projectReferenceId.toString(),
      user_id: userId,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Favorite Projects</h1>
          <p className="text-muted-foreground">
            Projects you've marked as favorites
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search favorites by project, municipality, state, or category..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {(error as Error)?.message || "Failed to load favorite projects. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Spinner size={20} />
            <span>Loading favorite projects...</span>
          </div>
        </div>
      )}

      {!isLoading && !isError && favorites.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-600" />
              You have no favorites yet
            </CardTitle>
            <CardDescription>
              Browse live projects and click the heart icon to add them to your favorites.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/main/projects/live")}>
              <Eye className="h-4 w-4 mr-2" />
              Explore Projects
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && filteredFavorites.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFavorites.map((p) => {
            const image =
              "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop"
            // Match ProjectsLive card data mapping as closely as possible
            const name =
              p.title ||
              p.project_title ||
              p.projectTitle ||
              p.name ||
              p.project_reference_id
            const municipality = p.city || p.municipality_id || p.state || "—"
            const state = p.state || p.location || p.state_name || ""
            const category = p.category || p.project_category
            const description = p.description
            const currentFunding = Number(
              p.already_secured_funds ??
                p.funding_raised ??
                p.funds_secured ??
                0,
            )
            const fundRequired = Number(
              p.funding_requirement ??
                p.funding_required ??
                0,
            )
            const progress =
              fundRequired > 0 ? Math.min(100, Math.round((currentFunding / fundRequired) * 100)) : 0
            // Use funding end date fields to calculate days left; fall back to generic end_date only if needed
            const fundingEndRaw =
              p.funding_end_date ||
              p.funding_close_date ||
              p.fundraising_end_date ||
              p.end_date ||
              null
            const end = fundingEndRaw ? new Date(fundingEndRaw) : null
            const today = new Date()
            const msLeft = end ? end.getTime() - today.getTime() : 0
            const daysLeft = end ? Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24))) : 0
            const status = p.status
            const id = p.id

            return (
              <Card key={id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <img src={image} alt={name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                  {status && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-green-600 text-white">
                        {status}
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{municipality}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnfavorite(p.project_reference_id)}
                        disabled={deleteFavoriteMutation.isPending}
                        className="flex items-center space-x-2 disabled:opacity-60"
                      >
                        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                        <span className="text-sm">Favorite</span>
                      </button>
                    </div>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg line-clamp-1">{name}</CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3" />
                        <span>{state || "Location not available"}</span>
                      </CardDescription>
                    </div>
                    {category && <Badge variant="outline">{category}</Badge>}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex flex-col">
                  <div className="space-y-4 flex-1">
                    {description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
                    )}

                    {/* Funding Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Funding Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-secondary" />
                      <div className="flex items-center justify-between text-sm text-muted-foreground gap-2">
                        <span className="whitespace-nowrap">
                          ₹{(currentFunding / 10000000).toFixed(1)}Cr raised
                        </span>
                        <span className="whitespace-nowrap">
                          ₹{(fundRequired / 10000000).toFixed(1)}Cr target
                        </span>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{end ? `${daysLeft} days left` : "Closing date not set"}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-4">
                    <Button
                      className="flex-1"
                      onClick={() => handleFundProject(id)}
                      title="Fund Project"
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
                      title="Remove from Favorites"
                      onClick={() => handleUnfavorite(p.project_reference_id)}
                      disabled={deleteFavoriteMutation.isPending}
                      className="bg-red-50 hover:bg-red-100"
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
