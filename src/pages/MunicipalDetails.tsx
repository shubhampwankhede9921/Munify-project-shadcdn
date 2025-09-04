import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  MapPin, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  Building2,
  Award,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react"

const mockMunicipalData = {
  name: "Mumbai Municipal Corporation",
  state: "Maharashtra",
  population: "12.4M",
  area: "603.4 sq km",
  creditRating: "AA+",
  riskLevel: "Low",
  financialHealth: 85,
  governanceScore: 78,
  infrastructureScore: 82,
  financials: {
    totalRevenue: 45000,
    totalExpenditure: 42000,
    debtToRevenue: 0.15,
    operatingSurplus: 3000,
    capitalExpenditure: 15000,
    revenueGrowth: 8.5,
    expenditureGrowth: 6.2
  },
  projects: {
    total: 45,
    completed: 32,
    ongoing: 8,
    planned: 5,
    totalValue: 2500000000
  },
  keyMetrics: [
    { label: "Revenue Growth", value: "8.5%", trend: "up", change: "+2.1%" },
    { label: "Debt Ratio", value: "15%", trend: "down", change: "-3.2%" },
    { label: "Operating Surplus", value: "₹3,000Cr", trend: "up", change: "+12.5%" },
    { label: "Project Completion", value: "71%", trend: "up", change: "+5.3%" }
  ],
  recentProjects: [
    { name: "Smart Water Management", status: "Completed", value: 50000000, year: 2023 },
    { name: "Solar Street Lighting", status: "Ongoing", value: 25000000, year: 2024 },
    { name: "Waste Management", status: "Completed", value: 75000000, year: 2023 },
    { name: "Road Infrastructure", status: "Planned", value: 100000000, year: 2024 }
  ],
  strengths: [
    "Strong revenue base with diversified income sources",
    "Excellent project execution track record",
    "Low debt-to-revenue ratio",
    "Proactive governance and transparency"
  ],
  challenges: [
    "High population density affecting service delivery",
    "Aging infrastructure requiring significant investment",
    "Climate change adaptation needs",
    "Regulatory compliance requirements"
  ]
}

export default function MunicipalDetails() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{mockMunicipalData.name}</h1>
          <p className="text-muted-foreground flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {mockMunicipalData.state} • Population: {mockMunicipalData.population} • Area: {mockMunicipalData.area}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Award className="h-3 w-3 mr-1" />
            {mockMunicipalData.creditRating}
          </Badge>
          <Badge variant="outline">
            {mockMunicipalData.riskLevel} Risk
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockMunicipalData.keyMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {metric.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="financials" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="financials" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue vs Expenditure */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenditure (₹Cr)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Revenue</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{mockMunicipalData.financials.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Expenditure</span>
                    <span className="text-2xl font-bold text-red-600">
                      ₹{mockMunicipalData.financials.totalExpenditure.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Operating Surplus</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{mockMunicipalData.financials.operatingSurplus.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Health Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Health Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Financial Health</span>
                    <span>{mockMunicipalData.financialHealth}%</span>
                  </div>
                  <Progress value={mockMunicipalData.financialHealth} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Debt-to-Revenue Ratio</span>
                    <span>{(mockMunicipalData.financials.debtToRevenue * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={mockMunicipalData.financials.debtToRevenue * 100} className="h-3" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {mockMunicipalData.financials.revenueGrowth}%
                    </div>
                    <div className="text-sm text-muted-foreground">Revenue Growth</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {mockMunicipalData.financials.expenditureGrowth}%
                    </div>
                    <div className="text-sm text-muted-foreground">Expenditure Growth</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Project Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Project Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{mockMunicipalData.projects.total}</div>
                      <div className="text-sm text-muted-foreground">Total Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{mockMunicipalData.projects.completed}</div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">{mockMunicipalData.projects.ongoing}</div>
                      <div className="text-sm text-muted-foreground">Ongoing</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{mockMunicipalData.projects.planned}</div>
                      <div className="text-sm text-muted-foreground">Planned</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      ₹{(mockMunicipalData.projects.totalValue / 100000000).toFixed(1)}Cr
                    </div>
                    <div className="text-sm text-muted-foreground">Total Project Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockMunicipalData.recentProjects.map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ₹{(project.value / 10000000).toFixed(1)}Cr • {project.year}
                        </div>
                      </div>
                      <Badge 
                        variant={project.status === "Completed" ? "default" : 
                                project.status === "Ongoing" ? "secondary" : "outline"}
                      >
                        {project.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="governance" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Governance Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Governance Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Governance</span>
                    <span>{mockMunicipalData.governanceScore}%</span>
                  </div>
                  <Progress value={mockMunicipalData.governanceScore} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Infrastructure Management</span>
                    <span>{mockMunicipalData.infrastructureScore}%</span>
                  </div>
                  <Progress value={mockMunicipalData.infrastructureScore} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Financial Management</span>
                    <span>{mockMunicipalData.financialHealth}%</span>
                  </div>
                  <Progress value={mockMunicipalData.financialHealth} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Strengths and Challenges */}
            <Card>
              <CardHeader>
                <CardTitle>Strengths & Challenges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-600 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Strengths
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {mockMunicipalData.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium text-orange-600 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Challenges
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {mockMunicipalData.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-orange-600 mr-2">•</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Credit Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 border rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">AA+</div>
                    <div className="text-sm text-muted-foreground">Credit Rating</div>
                    <div className="text-xs text-green-600 mt-1">Excellent</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">Low</div>
                    <div className="text-sm text-muted-foreground">Risk Level</div>
                    <div className="text-xs text-blue-600 mt-1">Stable</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
                    <div className="text-sm text-muted-foreground">Financial Health</div>
                    <div className="text-xs text-purple-600 mt-1">Strong</div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Investment Recommendation</h4>
                  <p className="text-sm text-muted-foreground">
                    Mumbai Municipal Corporation demonstrates strong financial management with consistent revenue growth, 
                    low debt levels, and excellent project execution capabilities. The AA+ credit rating reflects 
                    the corporation's ability to meet financial obligations and manage municipal services effectively.
                  </p>
                  <div className="flex space-x-2">
                    <Button>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Detailed Analysis
                    </Button>
                    <Button variant="outline">
                      <PieChart className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
