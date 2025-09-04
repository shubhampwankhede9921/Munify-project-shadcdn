import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  Star,
  Heart,
  Download,
  Play,
  MessageCircle,
  FileText,
  BarChart3,
  Image,
  Video,
  Mic,
  CheckCircle,
  AlertCircle
} from "lucide-react"

const mockProject = {
  id: 1,
  name: "Smart Water Management System",
  municipality: "Mumbai Municipal Corporation",
  state: "Maharashtra",
  image: "/api/placeholder/800/400",
  fundRequired: 50000000,
  currentFunding: 35000000,
  timeline: "6 months",
  category: "Infrastructure",
  status: "Live",
  description: "Implementation of IoT-based water monitoring and management system across the city to improve water distribution efficiency and reduce wastage.",
  progress: 70,
  investors: 15,
  daysLeft: 45,
  creditRating: "AA+",
  riskLevel: "Low",
  documents: [
    { name: "Project Proposal", type: "PDF", size: "2.3 MB" },
    { name: "Financial Projections", type: "Excel", size: "1.1 MB" },
    { name: "Technical Specifications", type: "PDF", size: "4.2 MB" },
    { name: "Environmental Impact Assessment", type: "PDF", size: "3.1 MB" }
  ],
  media: [
    { type: "video", title: "Project Overview", duration: "5:30" },
    { type: "image", title: "Site Photos", count: 12 },
    { type: "audio", title: "Municipal Commissioner Interview", duration: "8:45" }
  ],
  qa: [
    {
      id: 1,
      question: "What is the expected ROI for this project?",
      answer: "The project is expected to generate 15-20% annual returns through improved water efficiency and reduced operational costs.",
      askedBy: "Investment Fund Manager",
      answeredBy: "Municipal Commissioner",
      date: "2 days ago"
    },
    {
      id: 2,
      question: "What are the environmental benefits?",
      answer: "The system will reduce water wastage by 30% and improve monitoring of water quality in real-time.",
      askedBy: "Environmental Consultant",
      answeredBy: "Project Director",
      date: "1 week ago"
    }
  ],
  updates: [
    {
      id: 1,
      title: "Site Survey Completed",
      description: "Initial site survey and feasibility study completed successfully.",
      date: "1 week ago",
      type: "progress"
    },
    {
      id: 2,
      title: "New Funding Commitment",
      description: "Green Energy Fund committed ₹5Cr to the project.",
      date: "3 days ago",
      type: "funding"
    }
  ]
}

export default function ProjectDetails() {
  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card>
        <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 relative">
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-white/90">
              {mockProject.status}
            </Badge>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="text-3xl font-bold mb-2">{mockProject.name}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{mockProject.municipality}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{mockProject.timeline}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{mockProject.daysLeft} days left</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Description */}
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {mockProject.description}
              </p>
            </CardContent>
          </Card>

          {/* Tabs for Details */}
          <Tabs defaultValue="financials" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="qa">Q&A</TabsTrigger>
            </TabsList>
            
            <TabsContent value="financials" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Funding Required</div>
                      <div className="text-2xl font-bold">₹{(mockProject.fundRequired / 10000000).toFixed(1)}Cr</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Current Funding</div>
                      <div className="text-2xl font-bold text-green-600">₹{(mockProject.currentFunding / 10000000).toFixed(1)}Cr</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Funding Progress</span>
                      <span>{mockProject.progress}%</span>
                    </div>
                    <Progress value={mockProject.progress} className="h-3" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{mockProject.investors}</div>
                      <div className="text-sm text-muted-foreground">Investors</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{mockProject.creditRating}</div>
                      <div className="text-sm text-muted-foreground">Credit Rating</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{mockProject.riskLevel}</div>
                      <div className="text-sm text-muted-foreground">Risk Level</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockProject.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium">{doc.name}</div>
                            <div className="text-sm text-muted-foreground">{doc.type} • {doc.size}</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="media" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Media</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {mockProject.media.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {item.type === "video" && <Video className="h-5 w-5 text-red-600" />}
                          {item.type === "image" && <Image className="h-5 w-5 text-green-600" />}
                          {item.type === "audio" && <Mic className="h-5 w-5 text-purple-600" />}
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.duration || `${item.count} items`}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="qa" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Questions & Answers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockProject.qa.map((qa) => (
                      <div key={qa.id} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Avatar>
                            <AvatarFallback>Q</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium mb-2">{qa.question}</div>
                            <div className="text-sm text-muted-foreground mb-3">
                              Asked by {qa.askedBy} • {qa.date}
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <Avatar>
                                  <AvatarFallback>A</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium mb-1">Answer from {qa.answeredBy}</div>
                                  <div className="text-sm">{qa.answer}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button className="w-full" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Ask a Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Funding Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Funding Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" size="lg">
                <DollarSign className="h-4 w-4 mr-2" />
                Fund This Project
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Favorite
                </Button>
                <Button variant="outline" className="flex-1">
                  <Star className="h-4 w-4 mr-2" />
                  Shortlist
                </Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Request Documents
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Project Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProject.updates.map((update) => (
                  <div key={update.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {update.type === "progress" && <CheckCircle className="h-5 w-5 text-green-600" />}
                      {update.type === "funding" && <DollarSign className="h-5 w-5 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{update.title}</div>
                      <div className="text-xs text-muted-foreground">{update.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">{update.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Municipal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Municipal Corporation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="font-medium">{mockProject.municipality}</div>
                  <div className="text-sm text-muted-foreground">{mockProject.state}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">AA+</div>
                    <div className="text-xs text-muted-foreground">Credit Rating</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">Low</div>
                    <div className="text-xs text-muted-foreground">Risk Level</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View Municipal Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
