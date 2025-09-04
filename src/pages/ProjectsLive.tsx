import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock,
  Star,
  Eye,
  Heart
} from "lucide-react"

const mockProjects = [
  {
    id: 1,
    name: "Smart Water Management System",
    municipality: "Mumbai Municipal Corporation",
    state: "Maharashtra",
    image: "/api/placeholder/400/200",
    fundRequired: 50000000,
    currentFunding: 35000000,
    timeline: "6 months",
    category: "Infrastructure",
    status: "Live",
    description: "Implementation of IoT-based water monitoring and management system across the city.",
    progress: 70,
    investors: 15,
    daysLeft: 45
  },
  {
    id: 2,
    name: "Solar Street Lighting Project",
    municipality: "Delhi Municipal Corporation",
    state: "Delhi",
    image: "/api/placeholder/400/200",
    fundRequired: 25000000,
    currentFunding: 18000000,
    timeline: "4 months",
    category: "Renewable Energy",
    status: "Live",
    description: "Installation of solar-powered street lights in residential areas.",
    progress: 72,
    investors: 8,
    daysLeft: 30
  },
  {
    id: 3,
    name: "Waste Management Modernization",
    municipality: "Bangalore City Corporation",
    state: "Karnataka",
    image: "/api/placeholder/400/200",
    fundRequired: 75000000,
    currentFunding: 45000000,
    timeline: "8 months",
    category: "Environment",
    status: "Live",
    description: "Modern waste collection and processing facilities with recycling units.",
    progress: 60,
    investors: 22,
    daysLeft: 60
  }
]

export default function ProjectsLive() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Current Projects Live</h1>
          <p className="text-muted-foreground">
            Explore ongoing municipal projects seeking funding
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Star className="h-4 w-4 mr-2" />
            My Favorites
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
                  placeholder="Search projects, municipalities, or categories..." 
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
                <SelectItem value="environment">Environment</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="maharashtra">Maharashtra</SelectItem>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="karnataka">Karnataka</SelectItem>
                <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockProjects.map((project) => (
          <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 relative">
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-white/90">
                  {project.status}
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{project.municipality}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">{project.investors}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <MapPin className="h-3 w-3" />
                    <span>{project.state}</span>
                  </CardDescription>
                </div>
                <Badge variant="outline">{project.category}</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
              
              {/* Funding Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Funding Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₹{(project.currentFunding / 10000000).toFixed(1)}Cr raised</span>
                  <span>₹{(project.fundRequired / 10000000).toFixed(1)}Cr target</span>
                </div>
              </div>
              
              {/* Project Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{project.timeline}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{project.daysLeft} days left</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4">
                <Button className="flex-1">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Fund Project
                </Button>
                <Button variant="outline" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More Projects
        </Button>
      </div>
    </div>
  )
}
