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
  CheckCircle,
  Star,
  Eye,
  Download,
  TrendingUp
} from "lucide-react"

const mockFundedProjects = [
  {
    id: 1,
    name: "Smart Traffic Management System",
    municipality: "Delhi Municipal Corporation",
    state: "Delhi",
    image: "/api/placeholder/400/200",
    totalFunding: 75000000,
    fundedAmount: 75000000,
    completionDate: "2024-01-15",
    category: "Infrastructure",
    status: "Completed",
    description: "AI-powered traffic management system with real-time monitoring and optimization.",
    progress: 100,
    investors: 25,
    roi: 18.5,
    impact: "Reduced traffic congestion by 35%"
  },
  {
    id: 2,
    name: "Green Energy Initiative",
    municipality: "Bangalore City Corporation",
    state: "Karnataka",
    image: "/api/placeholder/400/200",
    totalFunding: 50000000,
    fundedAmount: 50000000,
    completionDate: "2023-11-20",
    category: "Renewable Energy",
    status: "Completed",
    description: "Solar panel installation across municipal buildings and street lighting.",
    progress: 100,
    investors: 18,
    roi: 22.3,
    impact: "Generated 2.5MW clean energy"
  },
  {
    id: 3,
    name: "Digital Governance Platform",
    municipality: "Mumbai Municipal Corporation",
    state: "Maharashtra",
    image: "/api/placeholder/400/200",
    totalFunding: 30000000,
    fundedAmount: 30000000,
    completionDate: "2024-02-10",
    category: "Technology",
    status: "Completed",
    description: "Digital platform for citizen services and municipal operations.",
    progress: 100,
    investors: 12,
    roi: 15.8,
    impact: "Improved service delivery by 40%"
  },
  {
    id: 4,
    name: "Water Treatment Plant",
    municipality: "Chennai Corporation",
    state: "Tamil Nadu",
    image: "/api/placeholder/400/200",
    totalFunding: 120000000,
    fundedAmount: 120000000,
    completionDate: "2023-09-30",
    category: "Water Management",
    status: "Completed",
    description: "Advanced water treatment facility with capacity for 50MLD.",
    progress: 100,
    investors: 35,
    roi: 12.7,
    impact: "Provided clean water to 200,000 residents"
  }
]

export default function ProjectsFunded() {
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{mockFundedProjects.length}</p>
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
                <p className="text-2xl font-bold">₹275Cr</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg ROI</p>
                <p className="text-2xl font-bold">17.3%</p>
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
                <p className="text-2xl font-bold">90</p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockFundedProjects.map((project) => (
          <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gradient-to-r from-green-500 to-blue-600 relative">
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {project.status}
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{project.municipality}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4" />
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
              
              {/* Funding Details */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Funding</span>
                  <span className="font-medium">₹{(project.totalFunding / 10000000).toFixed(1)}Cr</span>
                </div>
                <Progress value={project.progress} className="h-2" />
                <div className="text-xs text-green-600 font-medium">
                  ✓ Fully funded and completed
                </div>
              </div>
              
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <div className="font-bold text-green-600">{project.roi}%</div>
                  <div className="text-xs text-muted-foreground">ROI</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className="font-bold text-blue-600">{project.investors}</div>
                  <div className="text-xs text-muted-foreground">Investors</div>
                </div>
              </div>
              
              {/* Impact */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Impact</div>
                <div className="text-sm text-gray-600">{project.impact}</div>
              </div>
              
              {/* Project Details */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Completed: {new Date(project.completionDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4">
                <Button className="flex-1">
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
