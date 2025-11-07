import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  MapPin, 
  Award,
  Building2,
  ArrowRight
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

// Mock data for municipalities
const mockMunicipalities = [
  {
    id: 1,
    name: "Mumbai Municipal Corporation",
    state: "Maharashtra",
    population: "12.4M",
    area: "603.4 sq km",
    creditRating: "AA+",
    riskLevel: "Low",
    financialHealth: 85,
    revenue: 45000,
    projects: 45,
    completedProjects: 32,
    image: "/api/placeholder/300/200"
  },
  {
    id: 2,
    name: "Delhi Municipal Corporation",
    state: "Delhi",
    population: "16.8M",
    area: "1,484 sq km",
    creditRating: "AA",
    riskLevel: "Low",
    financialHealth: 82,
    revenue: 52000,
    projects: 38,
    completedProjects: 28,
    image: "/api/placeholder/300/200"
  },
  {
    id: 3,
    name: "Bangalore Municipal Corporation",
    state: "Karnataka",
    population: "8.4M",
    area: "741 sq km",
    creditRating: "A+",
    riskLevel: "Medium",
    financialHealth: 78,
    revenue: 32000,
    projects: 42,
    completedProjects: 30,
    image: "/api/placeholder/300/200"
  },
  {
    id: 4,
    name: "Chennai Municipal Corporation",
    state: "Tamil Nadu",
    population: "7.1M",
    area: "426 sq km",
    creditRating: "A",
    riskLevel: "Medium",
    financialHealth: 75,
    revenue: 28000,
    projects: 35,
    completedProjects: 25,
    image: "/api/placeholder/300/200"
  },
  {
    id: 5,
    name: "Kolkata Municipal Corporation",
    state: "West Bengal",
    population: "4.5M",
    area: "185 sq km",
    creditRating: "BBB+",
    riskLevel: "Medium",
    financialHealth: 72,
    revenue: 22000,
    projects: 28,
    completedProjects: 20,
    image: "/api/placeholder/300/200"
  },
  {
    id: 6,
    name: "Hyderabad Municipal Corporation",
    state: "Telangana",
    population: "6.8M",
    area: "650 sq km",
    creditRating: "A-",
    riskLevel: "Medium",
    financialHealth: 76,
    revenue: 31000,
    projects: 40,
    completedProjects: 28,
    image: "/api/placeholder/300/200"
  }
]

export default function Municipalities() {
  const [searchTerm, setSearchTerm] = useState("")
  const [stateFilter, setStateFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")

  const states = Array.from(new Set(mockMunicipalities.map(m => m.state)))
  const ratings = Array.from(new Set(mockMunicipalities.map(m => m.creditRating)))

  const filteredMunicipalities = mockMunicipalities.filter(municipality => {
    const matchesSearch = municipality.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         municipality.state.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesState = stateFilter === "all" || municipality.state === stateFilter
    const matchesRating = ratingFilter === "all" || municipality.creditRating === ratingFilter
    
    return matchesSearch && matchesState && matchesRating
  })

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low": return "bg-green-100 text-green-800"
      case "Medium": return "bg-yellow-100 text-yellow-800"
      case "High": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getRatingColor = (rating: string) => {
    if (rating.startsWith("AA")) return "bg-green-100 text-green-800"
    if (rating.startsWith("A")) return "bg-blue-100 text-blue-800"
    if (rating.startsWith("BBB")) return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Municipalities</h1>
          <p className="text-muted-foreground">
            Explore and analyze municipal corporations across India
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <span className="text-sm text-muted-foreground">
            {filteredMunicipalities.length} Municipalities
          </span>
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
                  placeholder="Search municipalities by name or state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  {ratings.map(rating => (
                    <SelectItem key={rating} value={rating}>{rating}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Municipalities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMunicipalities.map((municipality) => (
          <Card key={municipality.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{municipality.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {municipality.state}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge className={getRatingColor(municipality.creditRating)}>
                    <Award className="h-3 w-3 mr-1" />
                    {municipality.creditRating}
                  </Badge>
                  <Badge variant="outline" className={getRiskColor(municipality.riskLevel)}>
                    {municipality.riskLevel} Risk
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{municipality.population}</div>
                  <div className="text-xs text-muted-foreground">Population</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{municipality.financialHealth}%</div>
                  <div className="text-xs text-muted-foreground">Financial Health</div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Area:</span>
                  <span className="font-medium">{municipality.area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="font-medium">₹{municipality.revenue.toLocaleString()}Cr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Projects:</span>
                  <span className="font-medium">{municipality.completedProjects}/{municipality.projects}</span>
                </div>
              </div>

              {/* Action Button */}
              <Link to={`/main/municipalities/${municipality.id}`}>
                <Button className="w-full" variant="outline">
                  View Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredMunicipalities.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No municipalities found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("")
                setStateFilter("all")
                setRatingFilter("all")
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
