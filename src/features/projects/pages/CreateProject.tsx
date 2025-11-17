import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, FileText, DollarSign, Image as ImageIcon, MapPin, User, Building2, X, Video, File, CheckCircle2, Circle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { alerts } from '@/lib/alerts'
import apiService from '@/services/api'

// Project Categories
const projectCategories = [
  'Infrastructure',
  'Sanitation',
  'Water Supply',
  'Transportation',
  'Renewable Energy',
  'Waste Management',
  'Urban Development',
  'Healthcare',
  'Education',
  'Other'
] as const

// Project Stages
const projectStages = [
  'Planning',
  'Initiated',
  'In Progress'
] as const

// Sample Municipalities (will be replaced with API data later)
const municipalities = [
  { id: 'BMC', name: 'Brihanmumbai Municipal Corporation', code: 'BMC' },
  { id: 'PMC', name: 'Pune Municipal Corporation', code: 'PMC' },
  { id: 'NMC', name: 'Nashik Municipal Corporation', code: 'NMC' },
  { id: 'GHMC', name: 'Greater Hyderabad Municipal Corporation', code: 'GHMC' },
  { id: 'BBMP', name: 'Bruhat Bengaluru Mahanagara Palike', code: 'BBMP' },
  { id: 'CC', name: 'Chennai Corporation', code: 'CC' },
  { id: 'KMC', name: 'Kolkata Municipal Corporation', code: 'KMC' },
  { id: 'NDMC', name: 'New Delhi Municipal Council', code: 'NDMC' },
] as const

type ProjectCategory = typeof projectCategories[number]
type ProjectStage = typeof projectStages[number]

interface FormData {
  // Project Identification
  projectTitle: string
  projectReferenceId: string // System-generated, display only
  municipalityId: string
  municipalityCode: string
  department: string
  contactPersonName: string
  contactPersonDesignation: string
  contactPersonEmail: string
  contactPersonPhone: string
  
  // Project Overview
  category: ProjectCategory | ''
  stage: ProjectStage | ''
  description: string
  startDate: string
  endDate: string
  
  // Financial Information
  totalProjectCost: string
  fundingRequirement: string
  alreadySecuredFunds: string
  
  // Location
  state: string
  city: string
  ward: string
  
  // Documentation (File objects)
  dprFile: File | null
  feasibilityStudyFile: File | null
  complianceCertificatesFile: File | null
  budgetApprovalsFile: File | null
  tenderRfpFile: File | null
  
  // Media
  projectImage: File | null
  optionalMedia: File[] // Array for multiple files
}

export default function CreateProject() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState('identification')
  
  // Generate a mock reference ID (in real app, this would come from backend)
  const projectReferenceId = useMemo(() => {
    return `PRJ-${Date.now().toString().slice(-8)}`
  }, [])

  const [formData, setFormData] = useState<FormData>({
    projectTitle: '',
    projectReferenceId: projectReferenceId,
    municipalityId: '',
    municipalityCode: '',
    department: '',
    contactPersonName: '',
    contactPersonDesignation: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
    category: '',
    stage: '',
    description: '',
    startDate: '',
    endDate: '',
    totalProjectCost: '',
    fundingRequirement: '',
    alreadySecuredFunds: '0',
    state: '',
    city: '',
    ward: '',
    dprFile: null,
    feasibilityStudyFile: null,
    complianceCertificatesFile: null,
    budgetApprovalsFile: null,
    tenderRfpFile: null,
    projectImage: null,
    optionalMedia: [],
  })

  // Calculate commitment gap
  const commitmentGap = useMemo(() => {
    const requirement = parseFloat(formData.fundingRequirement || '0')
    const secured = parseFloat(formData.alreadySecuredFunds || '0')
    const gap = Math.max(requirement - secured, 0)
    return isFinite(gap) ? gap : 0
  }, [formData.fundingRequirement, formData.alreadySecuredFunds])

  // Helper function to map form data to API payload
  const mapFormDataToApiPayload = (status: 'draft' | 'pending_validation'): any => {
    // Convert project stage to lowercase for API
    const projectStage = formData.stage ? formData.stage.toLowerCase() as 'planning' | 'initiated' | 'in progress' : 'planning'
    
    // Format dates for API
    const startDate = formData.startDate || ''
    const endDate = formData.endDate || ''
    
    // Format fundraising dates (using project dates for now, can be adjusted later)
    const fundraisingStartDate = startDate ? `${startDate}T00:00:00Z` : undefined
    const fundraisingEndDate = endDate ? `${endDate}T23:59:59Z` : undefined

    // Get current user email (fallback to contact person email for MVP)
    const createdBy = formData.contactPersonEmail || 'admin@example.com'

    return {
      organization_type: 'municipality',
      organization_id: formData.municipalityId || formData.municipalityCode || 'ORG-001',
      title: formData.projectTitle,
      department: formData.department || '',
      contact_person: formData.contactPersonName,
      category: formData.category,
      project_stage: projectStage,
      description: formData.description,
      start_date: startDate,
      end_date: endDate,
      total_project_cost: formData.totalProjectCost || '0.00',
      funding_requirement: formData.fundingRequirement || '0.00',
      already_secured_funds: formData.alreadySecuredFunds || '0.00',
      currency: 'INR',
      fundraising_start_date: fundraisingStartDate,
      fundraising_end_date: fundraisingEndDate,
      municipality_credit_rating: 'AA', // Default value, can be made configurable later
      municipality_credit_score: '85.50', // Default value, can be made configurable later
      status: status,
      visibility: 'private', // Default to private for MVP
      approved_by: null, // Will be set by backend on approval
      admin_notes: '', // Empty for new projects
      created_by: createdBy,
    }
  }

  // Mutation for creating project (only called on Submit for Validation)
  const createProjectMutation = useMutation({
    mutationFn: (payload: any) => apiService.post('/projects/', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      alerts.success('Project Submitted', 'Your project has been submitted for validation. It will be reviewed by an admin.')
      navigate('/main/admin/projects')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Failed to submit project. Please try again.'
      alerts.error('Error', errorMessage)
    },
  })

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleMunicipalityChange = (municipalityId: string) => {
    const municipality = municipalities.find(m => m.id === municipalityId)
    setFormData(prev => ({
      ...prev,
      municipalityId: municipalityId,
      municipalityCode: municipality?.code || '',
    }))
    if (errors.municipalityId) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.municipalityId
        return newErrors
      })
    }
  }

  // File handling functions
  const handleFileChange = (field: 'projectImage' | 'dprFile' | 'feasibilityStudyFile' | 'complianceCertificatesFile' | 'budgetApprovalsFile' | 'tenderRfpFile', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleMultipleFilesChange = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files)
    setFormData(prev => ({
      ...prev,
      optionalMedia: [...prev.optionalMedia, ...newFiles]
    }))
    if (errors.optionalMedia) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.optionalMedia
        return newErrors
      })
    }
  }

  const removeOptionalMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      optionalMedia: prev.optionalMedia.filter((_, i) => i !== index)
    }))
  }

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Helper function to get file type icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return ImageIcon
    if (file.type.startsWith('video/')) return Video
    return File
  }

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup project image URL
      if (formData.projectImage && formData.projectImage.type.startsWith('image/')) {
        const url = URL.createObjectURL(formData.projectImage)
        URL.revokeObjectURL(url)
      }
      // Cleanup optional media URLs
      formData.optionalMedia.forEach(file => {
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file)
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [formData.projectImage, formData.optionalMedia])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Project Identification
    if (!formData.projectTitle.trim()) {
      newErrors.projectTitle = 'Project title is required'
    }
    if (!formData.municipalityId) {
      newErrors.municipalityId = 'Municipality is required'
    }
    if (!formData.contactPersonName.trim()) {
      newErrors.contactPersonName = 'Contact person name is required'
    }
    if (!formData.contactPersonDesignation.trim()) {
      newErrors.contactPersonDesignation = 'Contact person designation is required'
    }
    if (!formData.contactPersonEmail.trim()) {
      newErrors.contactPersonEmail = 'Contact person email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactPersonEmail)) {
      newErrors.contactPersonEmail = 'Please enter a valid email address'
    }
    if (!formData.contactPersonPhone.trim()) {
      newErrors.contactPersonPhone = 'Contact person phone is required'
    } else if (!/^[0-9]{10}$/.test(formData.contactPersonPhone.replace(/\D/g, ''))) {
      newErrors.contactPersonPhone = 'Please enter a valid 10-digit phone number'
    }

    // Project Overview
    if (!formData.category) {
      newErrors.category = 'Project category is required'
    }
    if (!formData.stage) {
      newErrors.stage = 'Project stage is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required'
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date'
    }

    // Financial Information
    const totalCost = parseFloat(formData.totalProjectCost)
    if (isNaN(totalCost) || totalCost <= 0) {
      newErrors.totalProjectCost = 'Total project cost must be greater than 0'
    }
    const fundingReq = parseFloat(formData.fundingRequirement)
    if (isNaN(fundingReq) || fundingReq <= 0) {
      newErrors.fundingRequirement = 'Funding requirement must be greater than 0'
    }
    if (!isNaN(fundingReq) && !isNaN(totalCost) && fundingReq > totalCost) {
      newErrors.fundingRequirement = 'Funding requirement cannot exceed total project cost'
    }
    const secured = parseFloat(formData.alreadySecuredFunds || '0')
    if (!isNaN(secured) && !isNaN(fundingReq) && secured > fundingReq) {
      newErrors.alreadySecuredFunds = 'Secured funds cannot exceed funding requirement'
    }

    // Location
    if (!formData.state.trim()) {
      newErrors.state = 'State is required'
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }
    if (!formData.ward.trim()) {
      newErrors.ward = 'Ward is required'
    }

    // Documentation and Media - Skipped for MVP phase
    // Will be added in next phase

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Check if a tab section is complete
  const isTabComplete = (tab: string): boolean => {
    switch (tab) {
      case 'identification':
        return !!(
          formData.projectTitle.trim() &&
          formData.municipalityId &&
          formData.contactPersonName.trim() &&
          formData.contactPersonDesignation.trim() &&
          formData.contactPersonEmail.trim() &&
          formData.contactPersonPhone.trim()
        )
      case 'overview':
        return !!(
          formData.category &&
          formData.stage &&
          formData.description.trim() &&
          formData.startDate &&
          formData.endDate
        )
      case 'financial':
        return !!(
          formData.totalProjectCost &&
          formData.fundingRequirement &&
          formData.state.trim() &&
          formData.city.trim() &&
          formData.ward.trim()
        )
      case 'documentation':
        // Documentation optional for MVP
        return true
      case 'media':
        // Media optional for MVP
        return true
      default:
        return false
    }
  }

  const handleSaveDraft = () => {
    // For MVP: Just show a message that data is saved locally in form state
    // No API call - data persists in component state until form is submitted
    alerts.success('Draft Saved', 'Your changes are saved locally. Click "Submit for Validation" when ready to submit.')
  }

  // Handle tab change - just switch tabs, no API call
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Tab navigation
  const tabs = ['identification', 'overview', 'financial', 'documentation', 'media']
  const currentTabIndex = tabs.indexOf(activeTab)
  const canGoNext = currentTabIndex < tabs.length - 1
  const canGoPrevious = currentTabIndex > 0

  const goToNextTab = () => {
    if (canGoNext) {
      handleTabChange(tabs[currentTabIndex + 1])
    }
  }

  const goToPreviousTab = () => {
    if (canGoPrevious) {
      handleTabChange(tabs[currentTabIndex - 1])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      alerts.error('Validation Error', 'Please fix all highlighted fields before submitting.')
      return
    }

    // Only API call happens here - on Submit for Validation button click
    const payload = mapFormDataToApiPayload('pending_validation')
    createProjectMutation.mutate(payload)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/main/admin/projects')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Project</h1>
            <p className="text-muted-foreground">
              Fill in all required information to publish your project
            </p>
          </div>
        </div>
      
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="identification" className="flex items-center gap-2">
              {isTabComplete('identification') ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              Identification
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              {isTabComplete('overview') ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              Overview
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              {isTabComplete('financial') ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              Financial & Location
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex items-center gap-2">
              {isTabComplete('documentation') ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              Documentation
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              {isTabComplete('media') ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              Media
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Project Identification */}
          <TabsContent value="identification" className="space-y-6">
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Project Identification</span>
            </CardTitle>
            <CardDescription>
              Basic project identification and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="projectTitle">Project Title *</Label>
                <Input
                  id="projectTitle"
                  value={formData.projectTitle}
                  onChange={(e) => handleChange('projectTitle', e.target.value)}
                  placeholder="Enter project title"
                  className={errors.projectTitle ? 'border-red-500' : ''}
                />
                {errors.projectTitle && (
                  <p className="text-sm text-red-500">{errors.projectTitle}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectReferenceId">Project Reference ID</Label>
                <Input
                  id="projectReferenceId"
                  value={formData.projectReferenceId}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">System-generated reference ID</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="municipalityId">Municipality *</Label>
                <Select
                  value={formData.municipalityId}
                  onValueChange={handleMunicipalityChange}
                >
                  <SelectTrigger className={errors.municipalityId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select municipality" />
                  </SelectTrigger>
                  <SelectContent>
                    {municipalities.map((municipality) => (
                      <SelectItem key={municipality.id} value={municipality.id}>
                        {municipality.name} ({municipality.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.municipalityId && (
                  <p className="text-sm text-red-500">{errors.municipalityId}</p>
                )}
                {formData.municipalityCode && (
                  <p className="text-xs text-muted-foreground">
                    Municipality Code: {formData.municipalityCode}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department/Division</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  placeholder="e.g., Public Works Department"
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-semibold mb-4 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Contact Person Information *
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPersonName">Name *</Label>
                  <Input
                    id="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={(e) => handleChange('contactPersonName', e.target.value)}
                    placeholder="Full name"
                    className={errors.contactPersonName ? 'border-red-500' : ''}
                  />
                  {errors.contactPersonName && (
                    <p className="text-sm text-red-500">{errors.contactPersonName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPersonDesignation">Designation *</Label>
                  <Input
                    id="contactPersonDesignation"
                    value={formData.contactPersonDesignation}
                    onChange={(e) => handleChange('contactPersonDesignation', e.target.value)}
                    placeholder="e.g., Project Manager"
                    className={errors.contactPersonDesignation ? 'border-red-500' : ''}
                  />
                  {errors.contactPersonDesignation && (
                    <p className="text-sm text-red-500">{errors.contactPersonDesignation}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPersonEmail">Email *</Label>
                  <Input
                    id="contactPersonEmail"
                    type="email"
                    value={formData.contactPersonEmail}
                    onChange={(e) => handleChange('contactPersonEmail', e.target.value)}
                    placeholder="email@example.com"
                    className={errors.contactPersonEmail ? 'border-red-500' : ''}
                  />
                  {errors.contactPersonEmail && (
                    <p className="text-sm text-red-500">{errors.contactPersonEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPersonPhone">Phone *</Label>
                  <Input
                    id="contactPersonPhone"
                    type="tel"
                    value={formData.contactPersonPhone}
                    onChange={(e) => handleChange('contactPersonPhone', e.target.value)}
                    placeholder="10-digit phone number"
                    className={errors.contactPersonPhone ? 'border-red-500' : ''}
                  />
                  {errors.contactPersonPhone && (
                    <p className="text-sm text-red-500">{errors.contactPersonPhone}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
            {/* Tab Navigation */}
            <div className="flex justify-between pt-4">
              <div></div>
              <Button
                type="button"
                variant="outline"
                onClick={goToNextTab}
                disabled={!canGoNext}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          {/* Tab 2: Project Overview */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Project Overview</span>
            </CardTitle>
            <CardDescription>
              Project category, stage, description, and timeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Project Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Project Stage *</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(value) => handleChange('stage', value)}
                >
                  <SelectTrigger className={errors.stage ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.stage && (
                  <p className="text-sm text-red-500">{errors.stage}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Provide a brief narrative about the project objectives, scope, and expected impact"
                rows={5}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  min={formData.startDate || undefined}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
            {/* Tab Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousTab}
                disabled={!canGoPrevious}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={goToNextTab}
                disabled={!canGoNext}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          {/* Tab 3: Financial & Location */}
          <TabsContent value="financial" className="space-y-6">
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Financial Information</span>
            </CardTitle>
            <CardDescription>
              Project costs and funding requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalProjectCost">Total Project Cost (₹) *</Label>
                <Input
                  id="totalProjectCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalProjectCost}
                  onChange={(e) => handleChange('totalProjectCost', e.target.value)}
                  placeholder="100000000"
                  className={errors.totalProjectCost ? 'border-red-500' : ''}
                />
                {errors.totalProjectCost && (
                  <p className="text-sm text-red-500">{errors.totalProjectCost}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fundingRequirement">Funding Requirement (₹) *</Label>
                <Input
                  id="fundingRequirement"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.fundingRequirement}
                  onChange={(e) => handleChange('fundingRequirement', e.target.value)}
                  placeholder="50000000"
                  className={errors.fundingRequirement ? 'border-red-500' : ''}
                />
                {errors.fundingRequirement && (
                  <p className="text-sm text-red-500">{errors.fundingRequirement}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="alreadySecuredFunds">Already Secured Funds (₹)</Label>
                <Input
                  id="alreadySecuredFunds"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.alreadySecuredFunds}
                  onChange={(e) => handleChange('alreadySecuredFunds', e.target.value)}
                  placeholder="10000000"
                  className={errors.alreadySecuredFunds ? 'border-red-500' : ''}
                />
                {errors.alreadySecuredFunds && (
                  <p className="text-sm text-red-500">{errors.alreadySecuredFunds}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Commitment Gap (Auto-calculated)</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  ₹{commitmentGap.toLocaleString('en-IN')}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  = Funding Requirement - Already Secured Funds
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

            {/* Location Details */}
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Location Details</span>
            </CardTitle>
            <CardDescription>
              Project location information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="e.g., Maharashtra"
                  className={errors.state ? 'border-red-500' : ''}
                />
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="e.g., Mumbai"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ward">Ward *</Label>
                <Input
                  id="ward"
                  value={formData.ward}
                  onChange={(e) => handleChange('ward', e.target.value)}
                  placeholder="e.g., Ward 21"
                  className={errors.ward ? 'border-red-500' : ''}
                />
                {errors.ward && (
                  <p className="text-sm text-red-500">{errors.ward}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
            {/* Tab Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousTab}
                disabled={!canGoPrevious}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={goToNextTab}
                disabled={!canGoNext}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          {/* Tab 4: Documentation */}
          <TabsContent value="documentation" className="space-y-6">
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Documentation</span>
            </CardTitle>
            <CardDescription>
              Upload required project documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dprFile">Detailed Project Report (DPR) *</Label>
                <Input
                  id="dprFile"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    handleFileChange('dprFile', file)
                  }}
                  className={errors.dprFile ? 'border-red-500' : ''}
                />
                {formData.dprFile && (
                  <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div className="flex items-center space-x-2">
                      <File className="h-4 w-4" />
                      <span className="text-sm">{formData.dprFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({formatFileSize(formData.dprFile.size)})
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileChange('dprFile', null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {errors.dprFile && (
                  <p className="text-sm text-red-500">{errors.dprFile}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload DPR document (PDF, DOC, DOCX)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feasibilityStudyFile">Feasibility Study Report</Label>
                <Input
                  id="feasibilityStudyFile"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    handleFileChange('feasibilityStudyFile', file)
                  }}
                />
                {formData.feasibilityStudyFile && (
                  <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div className="flex items-center space-x-2">
                      <File className="h-4 w-4" />
                      <span className="text-sm">{formData.feasibilityStudyFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({formatFileSize(formData.feasibilityStudyFile.size)})
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileChange('feasibilityStudyFile', null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload feasibility study if available (PDF, DOC, DOCX)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complianceCertificatesFile">Compliance Certificates</Label>
                <Input
                  id="complianceCertificatesFile"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    handleFileChange('complianceCertificatesFile', file)
                  }}
                />
                {formData.complianceCertificatesFile && (
                  <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div className="flex items-center space-x-2">
                      <File className="h-4 w-4" />
                      <span className="text-sm">{formData.complianceCertificatesFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({formatFileSize(formData.complianceCertificatesFile.size)})
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileChange('complianceCertificatesFile', null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Statutory clearances, environment, safety certificates (PDF, DOC, DOCX)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetApprovalsFile">Budget Approvals</Label>
                <Input
                  id="budgetApprovalsFile"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    handleFileChange('budgetApprovalsFile', file)
                  }}
                />
                {formData.budgetApprovalsFile && (
                  <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div className="flex items-center space-x-2">
                      <File className="h-4 w-4" />
                      <span className="text-sm">{formData.budgetApprovalsFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({formatFileSize(formData.budgetApprovalsFile.size)})
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileChange('budgetApprovalsFile', null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Municipal council / state approvals (PDF, DOC, DOCX)
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="tenderRfpFile">Tender / RFP Documents</Label>
                <Input
                  id="tenderRfpFile"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    handleFileChange('tenderRfpFile', file)
                  }}
                />
                {formData.tenderRfpFile && (
                  <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div className="flex items-center space-x-2">
                      <File className="h-4 w-4" />
                      <span className="text-sm">{formData.tenderRfpFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({formatFileSize(formData.tenderRfpFile.size)})
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileChange('tenderRfpFile', null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload tender or RFP documents if applicable (PDF, DOC, DOCX)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
            {/* Tab Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousTab}
                disabled={!canGoPrevious}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={goToNextTab}
                disabled={!canGoNext}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          {/* Tab 5: Media & Transparency */}
          <TabsContent value="media" className="space-y-6">
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5" />
              <span>Media & Transparency</span>
            </CardTitle>
            <CardDescription>
              Project images and optional media files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectImage">Project Image *</Label>
              <Input
                id="projectImage"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  handleFileChange('projectImage', file)
                }}
                className={errors.projectImage ? 'border-red-500' : ''}
              />
              {formData.projectImage && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="h-4 w-4" />
                      <span className="text-sm">{formData.projectImage.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({formatFileSize(formData.projectImage.size)})
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileChange('projectImage', null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.projectImage.type.startsWith('image/') && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(formData.projectImage)}
                        alt="Project preview"
                        className="max-w-full h-48 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>
              )}
              {errors.projectImage && (
                <p className="text-sm text-red-500">{errors.projectImage}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Upload a main project image (JPG, PNG, etc.)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="optionalMedia">Optional Media (Videos, Photos, Infographics)</Label>
              <Input
                id="optionalMedia"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => {
                  handleMultipleFilesChange(e.target.files)
                  // Reset input to allow selecting the same file again
                  e.target.value = ''
                }}
              />
              <p className="text-xs text-muted-foreground">
                You can upload multiple files (images and videos). Click "Choose File" again to add more.
              </p>
              
              {/* File List */}
              {formData.optionalMedia.length > 0 && (
                <div className="space-y-2 mt-4">
                  <div className="text-sm font-medium">
                    Selected Files ({formData.optionalMedia.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formData.optionalMedia.map((file, index) => {
                      const FileIcon = getFileIcon(file)
                      const isImage = file.type.startsWith('image/')
                      const previewUrl = isImage ? URL.createObjectURL(file) : null
                      
                      return (
                        <div
                          key={`${file.name}-${index}`}
                          className="border rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-2 flex-1 min-w-0">
                              <FileIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOptionalMedia(index)}
                              className="flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {previewUrl && (
                            <div className="mt-2">
                              <img
                                src={previewUrl}
                                alt={file.name}
                                className="w-full h-32 object-cover rounded-md border"
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
            {/* Tab Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousTab}
                disabled={!canGoPrevious}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <div></div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pb-6 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/main/admin/projects')}
            disabled={createProjectMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={createProjectMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            type="submit"
            disabled={createProjectMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {createProjectMutation.isPending ? 'Submitting...' : 'Submit for Validation'}
          </Button>
        </div>
      </form>
    </div>
  )
}

