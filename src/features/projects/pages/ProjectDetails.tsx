import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import apiService from "@/services/api"
import { Spinner } from "@/components/ui/spinner"
import { alerts } from "@/lib/alerts"
import { 
  MapPin, 
  Calendar, 
  Clock,
  Heart,
  MessageCircle,
  FileText,
  Image,
  AlertCircle,
  IndianRupee,
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  Info,
  Download,
  Play,
  Video,
  Mic,
  CheckCircle,
  FilePlus,
} from "lucide-react"

interface ProjectApiResponse {
  status: string
  message: string
  data: {
    id: number
    organization_type: string
    organization_id: string
    project_reference_id: string
    title: string
    department: string
    contact_person: string
    contact_person_designation: string | null
    contact_person_email: string | null
    contact_person_phone: string | null
    category: string
    project_stage: string
    description: string
    start_date: string
    end_date: string
    state: string | null
    city: string | null
    ward: string | null
    total_project_cost: string
    funding_requirement: string
    already_secured_funds: string
    commitment_gap: string | null
    currency: string
    fundraising_start_date: string
    fundraising_end_date: string
    municipality_credit_rating: string
    municipality_credit_score: string
    status: string
    visibility: string
    funding_raised: string
    funding_percentage: number | null
    approved_at: string | null
    approved_by: string | null
    admin_notes: string | null
    created_at: string
    created_by: string
    updated_at: string
    updated_by: string | null
  }
}

interface ProjectNote {
  id: number
  project_reference_id: string
  organization_id: string
  title: string
  content: string
  tags: string[]
  created_by: string
  created_at: string
}

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")

  const queryClient = useQueryClient()

  // Fetch project data
  const { data, isLoading, error, isError } = useQuery<ProjectApiResponse>({
    queryKey: ['project', id],
    queryFn: async () => {
      return await apiService.get<ProjectApiResponse>(`/projects/${id}`)
    },
    enabled: !!id,
  })

  const project = data?.data

  // Handle URL hash to switch to Q&A tab
  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#qa') {
      setActiveTab('qa')
    }
  }, [])

  // Format currency
  const formatCurrency = (amount: string | null | undefined) => {
    if (!amount) return "₹0"
    const num = parseFloat(amount)
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)}Cr`
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)}L`
    } else if (num >= 1000) {
      return `₹${(num / 1000).toFixed(2)}K`
    }
    return `₹${num.toFixed(2)}`
  }

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Calculate days left
  const getDaysLeft = (endDate: string | null | undefined) => {
    if (!endDate) return null
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'secondary'
      case 'approved':
      case 'live':
        return 'default'
      case 'completed':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  // Notes list
  const {
    data: notesResponse,
    isLoading: isNotesLoading,
    isError: isNotesError,
    error: notesError,
  } = useQuery<any, any>({
    queryKey: ['project-notes', project?.organization_id, project?.project_reference_id],
    queryFn: async () => {
      if (!project?.organization_id || !project?.project_reference_id) {
        return []
      }
      const response = await apiService.get('/project-notes/', {
        organization_id: project.organization_id,
        project_reference_id: project.project_reference_id,
      })
      return response?.data || response
    },
    enabled: !!project?.organization_id && !!project?.project_reference_id,
  })

  const notes: ProjectNote[] = Array.isArray(notesResponse)
    ? notesResponse
    : notesResponse?.results || notesResponse?.data || []

  const resetNoteForm = () => {
    setNoteTitle("")
    setNoteContent("")
  }

  const handleCloseNoteDialog = () => {
    resetNoteForm()
    setIsNoteDialogOpen(false)
  }

  const createNoteMutation = useMutation({
    mutationFn: async () => {
      if (!noteTitle.trim() || !noteContent.trim()) {
        throw new Error("Title and content are required")
      }

      if (!project) {
        throw new Error("Project details are not available")
      }

      const payload = {
        project_reference_id: project.project_reference_id,
        organization_id: project.organization_id,
        title: noteTitle.trim(),
        content: noteContent.trim(),
        tags: [] as string[],
        created_by: "shubhamw20",
        user_id: "shubhamw20",
      }

      return apiService.post("/project-notes/", payload)
    },
    onSuccess: () => {
      alerts.success("Note Added", "Your note has been added successfully.")
      resetNoteForm()
      setIsNoteDialogOpen(false)
      queryClient.invalidateQueries({
        queryKey: ['project-notes', project?.organization_id, project?.project_reference_id],
      })
    },
    onError: (err: any) => {
      const message =
        err?.message ||
        err?.response?.data?.message ||
        "Failed to add note. Please try again."
      alerts.error("Error", message)
    },
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/main/projects/live')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Spinner size={24} />
              <span className="text-muted-foreground">Loading project details...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (isError || !project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/main/projects/live')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error?.message || "The project you're looking for doesn't exist or has been removed."}
            </p>
            {isError && (
              <Alert variant="destructive" className="max-w-md mx-auto">
                <AlertDescription>
                  {error?.message || "Failed to load project details. Please try again."}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const daysLeft = getDaysLeft(project.fundraising_end_date)
  const fundingProgress = project.funding_percentage || 
    (parseFloat(project.funding_raised || '0') / parseFloat(project.funding_requirement || '1')) * 100

  // Project image - fallback image for now
  // TODO: When API provides image field, update: const projectImage = project.image_url || fallbackImage
  const projectImage = "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1600&h=900&fit=crop&q=80"

  // Dummy data for Documents, Media, and Q&A (to be replaced with API data later)
  const dummyDocuments = [
    { id: 1, name: "Project Proposal Document", type: "PDF", size: "2.3 MB", uploadedDate: "2025-01-15" },
    { id: 2, name: "Financial Projections & Budget", type: "Excel", size: "1.1 MB", uploadedDate: "2025-01-15" },
    { id: 3, name: "Technical Specifications", type: "PDF", size: "4.2 MB", uploadedDate: "2025-01-16" },
    { id: 4, name: "Environmental Impact Assessment", type: "PDF", size: "3.1 MB", uploadedDate: "2025-01-17" },
    { id: 5, name: "Feasibility Study Report", type: "PDF", size: "5.8 MB", uploadedDate: "2025-01-18" },
    { id: 6, name: "Municipal Approval Letter", type: "PDF", size: "0.8 MB", uploadedDate: "2025-01-20" }
  ]

  const dummyMedia = [
    { id: 1, type: "video", title: "Project Overview Video", duration: "5:30", thumbnail: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=200&fit=crop" },
    { id: 2, type: "image", title: "Site Survey Photos", count: 12, thumbnail: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=200&fit=crop" },
    { id: 3, type: "video", title: "Municipal Commissioner Interview", duration: "8:45", thumbnail: "https://images.unsplash.com/photo-1581578731548-c6a0c3f2f4c1?w=400&h=200&fit=crop" },
    { id: 4, type: "audio", title: "Stakeholder Meeting Recording", duration: "12:15", thumbnail: null },
    { id: 5, type: "image", title: "Progress Photos", count: 8, thumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop" }
  ]

  const dummyQA = [
    {
      id: 1,
      question: "What is the expected ROI for this project?",
      answer: "The project is expected to generate 15-20% annual returns through improved water efficiency and reduced operational costs. The financial projections show positive cash flow starting from year 2.",
      askedBy: "Investment Fund Manager",
      askedByEmail: "investor@example.com",
      answeredBy: project.contact_person || "Project Manager",
      answeredByEmail: project.contact_person_email || "manager@example.com",
      date: "2 days ago",
      answeredDate: "1 day ago"
    },
    {
      id: 2,
      question: "What are the environmental benefits of this project?",
      answer: "The system will reduce water wastage by 30% and improve monitoring of water quality in real-time. It will also help in early detection of leaks and reduce overall water consumption by 25%.",
      askedBy: "Environmental Consultant",
      askedByEmail: "env.consultant@example.com",
      answeredBy: project.contact_person || "Project Director",
      answeredByEmail: project.contact_person_email || "director@example.com",
      date: "1 week ago",
      answeredDate: "6 days ago"
    },
    {
      id: 3,
      question: "What is the timeline for project completion?",
      answer: "The project is scheduled to be completed within 12 months from the start date. Phase 1 (planning and design) will take 3 months, Phase 2 (implementation) will take 7 months, and Phase 3 (testing and commissioning) will take 2 months.",
      askedBy: "City Planner",
      askedByEmail: "planner@example.com",
      answeredBy: project.contact_person || "Project Manager",
      answeredByEmail: project.contact_person_email || "manager@example.com",
      date: "3 days ago",
      answeredDate: "2 days ago"
    },
    {
      id: 4,
      question: "How will this project impact local employment?",
      answer: "The project will create 200+ direct jobs during the construction phase and 50+ permanent positions for operations and maintenance. Additionally, it will generate 500+ indirect employment opportunities in related sectors.",
      askedBy: "Local Business Owner",
      askedByEmail: "business@example.com",
      answeredBy: project.contact_person || "Mayor",
      answeredByEmail: project.contact_person_email || "mayor@example.com",
      date: "1 week ago",
      answeredDate: "5 days ago"
    }
  ]

  return (
    <div className="space-y-6">
      <Dialog open={isNoteDialogOpen} onOpenChange={(open) => !open ? handleCloseNoteDialog() : setIsNoteDialogOpen(true)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a private note for this project. Only you and authorized users will be able to see it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label htmlFor="noteTitle" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="noteTitle"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Enter note title"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="noteContent" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="noteContent"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note here"
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseNoteDialog}
              disabled={createNoteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => createNoteMutation.mutate()}
              disabled={createNoteMutation.isPending}
            >
              {createNoteMutation.isPending && <Spinner size={16} className="mr-2" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/main/projects/live')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(project.status)}>
            {project.status}
          </Badge>
          {/* <Badge variant="outline">
            {project.visibility}
          </Badge> */}
        </div>
      </div>

      {/* Project Header with Hero Image */}
      <Card className="overflow-hidden">
        <div className="relative h-64 md:h-80 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700">
          {/* Project Image with Fallback */}
          <img 
            src={projectImage}
            alt={project.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // If image fails to load, hide it and show gradient background
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
              {project.status}
            </Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs">
                {project.project_reference_id}
              </Badge>
              <Badge variant="outline" className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs">
                {project.category}
              </Badge>
              <Badge variant="outline" className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs">
                {project.project_stage}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3 drop-shadow-lg line-clamp-2">{project.title}</h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm">
              {project.state && (
                <div className="flex items-center space-x-1.5 bg-white/20 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full">
                  <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="truncate max-w-[150px] md:max-w-none">{project.city ? `${project.city}, ${project.state}` : project.state}</span>
                </div>
              )}
              <div className="flex items-center space-x-1.5 bg-white/20 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full">
                <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
                <span className="md:hidden">{formatDate(project.start_date)}</span>
              </div>
              {daysLeft !== null && daysLeft > 0 && (
                <div className="flex items-center space-x-1.5 bg-white/20 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full">
                  <Clock className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{daysLeft} days left</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs for Details */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="qa">Q&A</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {project.description || "No description available."}
                    </p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Department</div>
                      <div className="font-medium">{project.department || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Organization</div>
                      <div className="font-medium">{project.organization_id || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Project Stage</div>
                      <div className="font-medium capitalize">{project.project_stage || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Category</div>
                      <div className="font-medium">{project.category || "N/A"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="financials" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Total Project Cost</div>
                      <div className="text-2xl font-bold">{formatCurrency(project.total_project_cost)}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Funding Requirement</div>
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(project.funding_requirement)}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Already Secured</div>
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(project.already_secured_funds)}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Funding Raised</div>
                      <div className="text-2xl font-bold text-purple-600">{formatCurrency(project.funding_raised)}</div>
                    </div>
                  </div>
                  
                  {project.commitment_gap && (
                    <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                      <div className="text-sm text-muted-foreground mb-1">Commitment Gap</div>
                      <div className="text-xl font-bold text-orange-600">{formatCurrency(project.commitment_gap)}</div>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Funding Progress</span>
                      <span>{fundingProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={fundingProgress} className="h-3" />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Credit Rating</div>
                      <div className="text-xl font-bold text-green-600">{project.municipality_credit_rating || "N/A"}</div>
                      {project.municipality_credit_score && (
                        <div className="text-xs text-muted-foreground">Score: {project.municipality_credit_score}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Currency</div>
                      <div className="text-xl font-bold">{project.currency || "INR"}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Fundraising Start</div>
                      <div className="font-medium">{formatDate(project.fundraising_start_date)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Fundraising End</div>
                      <div className="font-medium">{formatDate(project.fundraising_end_date)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Organization Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Organization Type</div>
                        <div className="font-medium capitalize">{project.organization_type || "N/A"}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Organization ID</div>
                        <div className="font-medium">{project.organization_id || "N/A"}</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Contact Person</div>
                        <div className="font-medium">{project.contact_person || "N/A"}</div>
                        {project.contact_person_designation && (
                          <div className="text-xs text-muted-foreground">{project.contact_person_designation}</div>
                        )}
                      </div>
                      {project.contact_person_email && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            Email
                          </div>
                          <div className="font-medium">{project.contact_person_email}</div>
                        </div>
                      )}
                      {project.contact_person_phone && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            Phone
                          </div>
                          <div className="font-medium">{project.contact_person_phone}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location Details
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {project.state && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">State</div>
                          <div className="font-medium">{project.state}</div>
                        </div>
                      )}
                      {project.city && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">City</div>
                          <div className="font-medium">{project.city}</div>
                        </div>
                      )}
                      {project.ward && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Ward</div>
                          <div className="font-medium">{project.ward}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Timeline
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Start Date</div>
                        <div className="font-medium">{formatDate(project.start_date)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">End Date</div>
                        <div className="font-medium">{formatDate(project.end_date)}</div>
                      </div>
                    </div>
                  </div>

                  {project.admin_notes && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Info className="h-5 w-5" />
                          Admin Notes
                        </h3>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm">{project.admin_notes}</p>
                        </div>
                      </div>
                    </>
                  )}
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
                    {dummyDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{doc.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {doc.type} • {doc.size} • {formatDate(doc.uploadedDate)}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="ml-4">
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
                    {dummyMedia.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="relative">
                            {item.thumbnail ? (
                              <img 
                                src={item.thumbnail} 
                                alt={item.title}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                                {item.type === "video" && <Video className="h-6 w-6 text-red-600" />}
                                {item.type === "image" && <Image className="h-6 w-6 text-green-600" />}
                                {item.type === "audio" && <Mic className="h-6 w-6 text-purple-600" />}
                              </div>
                            )}
                            {item.type === "video" && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                                <Play className="h-5 w-5 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {item.type === "video" && <Video className="h-4 w-4 text-red-600" />}
                              {item.type === "image" && <Image className="h-4 w-4 text-green-600" />}
                              {item.type === "audio" && <Mic className="h-4 w-4 text-purple-600" />}
                              <div className="font-medium truncate">{item.title}</div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.duration || `${item.count} items`}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="ml-4">
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
                    {dummyQA.map((qa) => (
                      <div key={qa.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start space-x-3">
                          <Avatar>
                            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                              {qa.askedBy.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium mb-2">{qa.question}</div>
                            <div className="text-sm text-muted-foreground mb-3">
                              Asked by <span className="font-medium">{qa.askedBy}</span> • {qa.date}
                            </div>
                            <div className="bg-muted p-4 rounded-lg border-l-4 border-l-green-500">
                              <div className="flex items-start space-x-3">
                                <Avatar>
                                  <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                                    {qa.answeredBy.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <div className="font-medium text-sm">Answered by {qa.answeredBy}</div>
                                    <span className="text-xs text-muted-foreground">• {qa.answeredDate}</span>
                                  </div>
                                  <div className="text-sm leading-relaxed">{qa.answer}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <Button className="w-full" variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Ask a Question
                      </Button>
                    </div>
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
                <IndianRupee className="h-4 w-4 mr-2" />
                Fund This Project
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Favorite
                </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsNoteDialogOpen(true)}
              >
                <FilePlus className="h-4 w-4 mr-2" />
                Add Note
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

          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Project Reference ID</div>
                <div className="font-medium">{project.project_reference_id}</div>
              </div>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground mb-1">Created</div>
                <div className="font-medium text-sm">{formatDate(project.created_at)}</div>
                <div className="text-xs text-muted-foreground">by {project.created_by}</div>
              </div>
              {project.updated_at && project.updated_at !== project.created_at && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Last Updated</div>
                    <div className="font-medium text-sm">{formatDate(project.updated_at)}</div>
                    {project.updated_by && (
                      <div className="text-xs text-muted-foreground">by {project.updated_by}</div>
                    )}
                  </div>
                </>
              )}
              {project.approved_at && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Approved</div>
                    <div className="font-medium text-sm">{formatDate(project.approved_at)}</div>
                    {project.approved_by && (
                      <div className="text-xs text-muted-foreground">by {project.approved_by}</div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Credit Rating */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {project.municipality_credit_rating || "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground">Credit Rating</div>
                  {project.municipality_credit_score && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Score: {project.municipality_credit_score}
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full">
                  View Municipal Details
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Project Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Project Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isNotesError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {notesError?.message || "Failed to load notes. Please try again."}
                  </AlertDescription>
                </Alert>
              )}
              {isNotesLoading ? (
                <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                  <Spinner size={20} className="mr-2" />
                  Loading notes...
                </div>
              ) : !isNotesError && notes.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No notes have been added for this project yet.
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {notes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-3 bg-muted/40">
                      <div className="text-sm font-semibold mb-1 line-clamp-2">
                        {note.title}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-3">
                        {note.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

