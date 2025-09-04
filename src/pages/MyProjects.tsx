import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Star,
  Eye,
  Heart,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"

const mockMyProjects = {
  funded: [
    {
      id: 1,
      name: "Smart Water Management System",
      municipality: "Mumbai Municipal Corporation",
      state: "Maharashtra",
      image: "/api/placeholder/400/200",
      myInvestment: 5000000,
      totalFunding: 50000000,
      currentFunding: 35000000,
      progress: 70,
      status: "Live",
      category: "Infrastructure",
      investmentDate: "2024-01-15",
      expectedROI: 18.5,
      currentValue: 5925000
    },
    {
      id: 2,
      name: "Solar Street Lighting Project",
      municipality: "Delhi Municipal Corporation",
      state: "Delhi",
      image: "/api/placeholder/400/200",
      myInvestment: 2000000,
      totalFunding: 25000000,
      currentFunding: 18000000,
      progress: 72,
      status: "Live",
      category: "Renewable Energy",
      investmentDate: "2024-02-01",
      expectedROI: 22.3,
      currentValue: 2446000
    }
  ],
  shortlisted: [
    {
      id: 3,
      name: "Waste Management Modernization",
      municipality: "Bangalore City Corporation",
      state: "Karnataka",
      image: "/api/placeholder/400/200",
      fundRequired: 75000000,
      currentFunding: 45000000,
      progress: 60,
      status: "Live",
      category: "Environment",
      shortlistedDate: "2024-02-10",
      daysLeft: 60
    },
    {
      id: 4,
      name: "Digital Governance Platform",
      municipality: "Chennai Corporation",
      state: "Tamil Nadu",
      image: "/api/placeholder/400/200",
      fundRequired: 30000000,
      currentFunding: 30000000,
      progress: 100,
      status: "Completed",
      category: "Technology",
      shortlistedDate: "2023-11-01",
      daysLeft: 0
    }
  ],
  completed: [
    {
      id: 5,
      name: "Green Energy Initiative",
      municipality: "Pune Municipal Corporation",
      state: "Maharashtra",
      image: "/api/placeholder/400/200",
      myInvestment: 3000000,
      totalFunding: 50000000,
      finalROI: 25.8,
      category: "Renewable Energy",
      completionDate: "2023-12-15",
      finalValue: 3774000,
      profit: 774000
    }
  ]
}

export default function MyProjects() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground">
            Track your investments and shortlisted projects
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Star className="h-4 w-4 mr-2" />
            Shortlist Project
          </Button>
        </div>
      </div>

      {/* Investment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Investment</p>
                <p className="text-2xl font-bold">₹1Cr</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Value</p>
                <p className="text-2xl font-bold">₹1.18Cr</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
                <p className="text-2xl font-bold">₹18L</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shortlisted</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <Heart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="funded" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="funded">Funded Projects</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="funded" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Search your funded projects..." 
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Funded Projects */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockMyProjects.funded.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 relative">
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-white/90">
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
                        <span className="text-sm">My Investment</span>
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
                  {/* Investment Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>My Investment</span>
                      <span className="font-medium">₹{(project.myInvestment / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Current Value</span>
                      <span className="font-medium text-green-600">₹{(project.currentValue / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Expected ROI</span>
                      <span className="font-medium text-blue-600">{project.expectedROI}%</span>
                    </div>
                  </div>
                  
                  {/* Project Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Project Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  
                  {/* Investment Date */}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Invested: {new Date(project.investmentDate).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-4">
                    <Button className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="shortlisted" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockMyProjects.shortlisted.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-r from-purple-500 to-pink-600 relative">
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-purple-600">
                      <Heart className="h-3 w-3 mr-1" />
                      Shortlisted
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{project.municipality}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{project.daysLeft} days left</span>
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
                  {/* Funding Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Funding Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>₹{(project.currentFunding / 10000000).toFixed(1)}Cr raised</span>
                      <span>₹{(project.fundRequired / 10000000).toFixed(1)}Cr target</span>
                    </div>
                  </div>
                  
                  {/* Shortlisted Date */}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Shortlisted: {new Date(project.shortlistedDate).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-4">
                    <Button className="flex-1">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Fund Now
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
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockMyProjects.completed.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-r from-green-500 to-blue-600 relative">
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{project.municipality}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">{project.finalROI}% ROI</span>
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
                  {/* Investment Results */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Initial Investment</span>
                      <span className="font-medium">₹{(project.myInvestment / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Final Value</span>
                      <span className="font-medium text-green-600">₹{(project.finalValue / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Profit</span>
                      <span className="font-medium text-green-600">₹{(project.profit / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Final ROI</span>
                      <span className="font-medium text-green-600">{project.finalROI}%</span>
                    </div>
                  </div>
                  
                  {/* Completion Date */}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Completed: {new Date(project.completionDate).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-4">
                    <Button className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View Report
                    </Button>
                    <Button variant="outline" size="icon">
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
