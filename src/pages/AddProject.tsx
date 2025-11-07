import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Save,
  Calendar,
  AlertCircle,
  FileText,
  ChevronsUpDown,
  Check,
} from "lucide-react"
import { alerts } from "@/lib/alerts"
import { LoadingOverlay, Spinner } from "@/components/ui/spinner"
import { apiService } from "@/services/api"

const categories = ["Water", "Sanitation", "Roads", "Energy", "Other"] as const
const stages = ["planning", "initiated", "in_progress"] as const
const statuses = ["draft", "pending_validation", "active", "closed", "rejected"] as const
type MunicipalityOption = { id: string; label: string }
const municipalities: MunicipalityOption[] = [
  { id: "BMC", label: "Brihanmumbai Municipal Corporation" },
  { id: "PMC", label: "Pune Municipal Corporation" },
  { id: "NMC", label: "Nashik Municipal Corporation" },
  { id: "GHMC", label: "Greater Hyderabad Municipal Corporation" },
  { id: "BBMP", label: "Bruhat Bengaluru Mahanagara Palike" },
  { id: "CC", label: "Chennai Corporation" },
  { id: "KMC", label: "Kolkata Municipal Corporation" },
  { id: "NDMC", label: "New Delhi Municipal Council" },
  { id: "OTHER", label: "Other" },
] as const

type ProjectCategory = typeof categories[number]
type ProjectStage = typeof stages[number]
type ProjectStatus = typeof statuses[number]
// No union type for options; we store the id in form

export default function AddProject() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [municipalityOpen, setMunicipalityOpen] = useState(false)

  const [form, setForm] = useState({
    project_title: "",
    project_category: "" as "" | ProjectCategory,
    project_stage: "" as "" | ProjectStage,
    description: "",
    location: "",
    municipality_id: "",
    start_date: "",
    end_date: "",
    total_project_cost: "",
    funding_required: "",
    funds_secured: "0",
    funding_gap: "0",
    media: "",
    disclosures_summary: "",
    admin_validation_checklist: "",
    status: "draft" as ProjectStatus,
    notes: "",
  })

  const fundingGap = useMemo(() => {
    const req = parseFloat(form.funding_required || "0")
    const sec = parseFloat(form.funds_secured || "0")
    const gap = Math.max(req - sec, 0)
    return isFinite(gap) ? gap : 0
  }, [form.funding_required, form.funds_secured])

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.project_title.trim()) newErrors.project_title = "Project title is required"
    if (!form.project_category) newErrors.project_category = "Category is required"
    if (!form.project_stage) newErrors.project_stage = "Stage is required"
    if (!form.description.trim()) newErrors.description = "Description is required"
    if (!form.location.trim()) newErrors.location = "Location is required"
    if (!form.municipality_id.trim()) newErrors.municipality_id = "Municipality is required"
    if (!form.start_date.trim()) newErrors.start_date = "Start date is required"
    if (!form.end_date.trim()) newErrors.end_date = "End date is required"
    if (!form.status) newErrors.status = "Status is required"
    if (!form.notes.trim()) newErrors.notes = "Notes are required"
    const tpc = parseFloat(form.total_project_cost)
    const fr = parseFloat(form.funding_required)
    const fs = parseFloat(form.funds_secured || "0")
    if (isNaN(tpc) || tpc <= 0) newErrors.total_project_cost = "Enter a valid total cost"
    if (isNaN(fr) || fr <= 0) newErrors.funding_required = "Enter a valid funding required"
    if (!isNaN(fr) && !isNaN(tpc) && fr > tpc) newErrors.funding_required = "Funding required cannot exceed total cost"
    if (!isNaN(fs) && !isNaN(fr) && fs > fr) newErrors.funds_secured = "Funds secured cannot exceed funding required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!validate()) {
      alerts.error("Validation error", "Please fix the highlighted fields and try again.")
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        user_id:4,
        project_title: form.project_title.trim(),
        project_category: form.project_category,
        project_stage: form.project_stage,
        description: form.description.trim(),
        location: form.location.trim(),
        municipality_id: form.municipality_id,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        total_project_cost: parseFloat(form.total_project_cost),
        funding_required: parseFloat(form.funding_required),
        funds_secured: parseFloat(form.funds_secured || "0"),
        funding_gap: fundingGap,
        media: form.media || null,
        disclosures_summary: form.disclosures_summary || null,
        admin_validation_checklist: form.admin_validation_checklist || null,
        status: form.status,
        notes: form.notes || null,
      }
      await apiService.post("/projects/", payload)
      alerts.success("Project created", `${form.project_title} has been created.`)
      navigate("/main/admin/projects")
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to create project. Please try again."
      alerts.error("Error", message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <LoadingOverlay show={submitting} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/main/admin/projects")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Add New Project</h1>
            <p className="text-muted-foreground">
              Create a new municipal project for funding
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => handleSubmit()} disabled={submitting}>
            {submitting ? <Spinner className="mr-2" size={16} /> : <Save className="h-4 w-4 mr-2" />}
            Save as Draft
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Spinner className="mr-2" size={16} /> : <Save className="h-4 w-4 mr-2" />}
            {submitting ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
            <CardDescription>
              Essential details about the project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project_title">Project Title *</Label>
                <Input
                  id="project_title"
                  value={form.project_title}
                  onChange={(e) => handleChange("project_title", e.target.value)}
                  placeholder="Enter project title"
                  className={errors.project_title ? "border-red-500" : ""}
                />
                {errors.project_title && <p className="text-sm text-red-500">{errors.project_title}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_category">Category *</Label>
                <Select value={form.project_category} onValueChange={(v) => handleChange("project_category", v)}>
                  <SelectTrigger className={errors.project_category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.project_category && <p className="text-sm text-red-500">{errors.project_category}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_stage">Stage *</Label>
                <Select value={form.project_stage} onValueChange={(v) => handleChange("project_stage", v)}>
                  <SelectTrigger className={errors.project_stage ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((s) => (
                      <SelectItem key={s} value={s}>{s.replaceAll("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.project_stage && <p className="text-sm text-red-500">{errors.project_stage}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Location (State, City, Ward) *</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="e.g., Maharashtra, Mumbai, Ward 21"
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="municipality">Municipality *</Label>
                <Popover open={municipalityOpen} onOpenChange={setMunicipalityOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={municipalityOpen}
                      className={"w-full justify-between " + (errors.municipality_id ? "border-red-500" : "")}
                    >
                      {form.municipality_id ? (municipalities.find(x => x.id === form.municipality_id)?.label ?? "") : "Select municipality"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search municipality..." />
                      <CommandEmpty>No municipality found.</CommandEmpty>
                      <CommandGroup>
                        {municipalities.map((m) => (
                          <CommandItem
                            key={m.id}
                            value={m.label}
                            onSelect={() => {
                              handleChange("municipality_id", m.id)
                              setMunicipalityOpen(false)
                            }}
                          >
                            <Check className={"mr-2 h-4 w-4 " + (form.municipality_id === m.id ? "opacity-100" : "opacity-0")} />
                            {m.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.municipality_id && <p className="text-sm text-red-500">{errors.municipality_id}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe the project objectives, scope, and expected impact"
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Timeline</span>
            </CardTitle>
            <CardDescription>Project timeline dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                  className={errors.start_date ? "border-red-500" : ""}
                />
                {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                  className={errors.end_date ? "border-red-500" : ""}
                />
                {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Financials</span>
            </CardTitle>
            <CardDescription>Provide complete funding details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_project_cost">Total Project Cost (₹) *</Label>
                <Input
                  id="total_project_cost"
                  type="number"
                  value={form.total_project_cost}
                  onChange={(e) => handleChange("total_project_cost", e.target.value)}
                  className={errors.total_project_cost ? "border-red-500" : ""}
                  placeholder="100000000"
                />
                {errors.total_project_cost && <p className="text-sm text-red-500">{errors.total_project_cost}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="funding_required">Funding Required (₹) *</Label>
                <Input
                  id="funding_required"
                  type="number"
                  value={form.funding_required}
                  onChange={(e) => handleChange("funding_required", e.target.value)}
                  className={errors.funding_required ? "border-red-500" : ""}
                  placeholder="50000000"
                />
                {errors.funding_required && <p className="text-sm text-red-500">{errors.funding_required}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="funds_secured">Funds Secured (₹)</Label>
                <Input
                  id="funds_secured"
                  type="number"
                  value={form.funds_secured}
                  onChange={(e) => handleChange("funds_secured", e.target.value)}
                  className={errors.funds_secured ? "border-red-500" : ""}
                  placeholder="10000000"
                />
                {errors.funds_secured && <p className="text-sm text-red-500">{errors.funds_secured}</p>}
              </div>
            </div>
            <div>
              <Label>Funding Gap (auto)</Label>
              <div className="mt-1 text-sm">
                <Badge variant="secondary">₹{fundingGap.toLocaleString("en-IN")}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media & Disclosures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Media & Disclosures</span>
            </CardTitle>
            <CardDescription>Provide media JSON and summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="media">Media (JSON)</Label>
              <Textarea
                id="media"
                value={form.media}
                onChange={(e) => handleChange("media", e.target.value)}
                placeholder='{"banner_image":"...","photos":[],"videos":[]}'
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disclosures_summary">Disclosures Summary</Label>
              <Textarea
                id="disclosures_summary"
                value={form.disclosures_summary}
                onChange={(e) => handleChange("disclosures_summary", e.target.value)}
                placeholder="Key disclosures and notes"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_validation_checklist">Admin Validation Checklist (JSON)</Label>
              <Textarea
                id="admin_validation_checklist"
                value={form.admin_validation_checklist}
                onChange={(e) => handleChange("admin_validation_checklist", e.target.value)}
                placeholder='{"pass":true,"comments":"..."}'
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Status & Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Status & Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                  <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => (
                      <SelectItem key={s} value={s}>{s.replaceAll("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="notes">Notes *</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Additional notes"
                  rows={3}
                  className={errors.notes ? "border-red-500" : ""}
                />
                {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/main/admin/projects")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Spinner className="mr-2" size={16} /> : <Save className="h-4 w-4 mr-2" />}
            {submitting ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  )
}
