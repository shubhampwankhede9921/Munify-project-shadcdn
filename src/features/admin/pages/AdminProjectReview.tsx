import { useMemo, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

type ProjectSummary = {
  id: number
  name: string
  municipality: string
  state: string
  category: string
  budgetCr: number
  submittedAt: string
  status: "Pending Validation" | "Action Required" | "Active"
}

const mockProjects: ProjectSummary[] = [
  { id: 101, name: "Smart Water Management", municipality: "Mumbai", state: "Maharashtra", category: "Water", budgetCr: 120, submittedAt: "2025-09-20 10:12", status: "Pending Validation" },
  { id: 102, name: "Waste Processing Plant", municipality: "Delhi", state: "Delhi", category: "Waste", budgetCr: 85, submittedAt: "2025-09-21 14:35", status: "Pending Validation" },
  { id: 103, name: "Solar Rooftop Program", municipality: "Pune", state: "Maharashtra", category: "Energy", budgetCr: 60, submittedAt: "2025-09-22 09:02", status: "Action Required" },
]

export default function AdminProjectReview() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [remarks, setRemarks] = useState("")
  const project = useMemo(() => mockProjects.find(p => String(p.id) === String(id)), [id])

  const handleApprove = async () => {
    // TODO: call backend approve API
    // Simulate
    await new Promise(r => setTimeout(r, 400))
    navigate("/main/admin/projects/validate")
  }

  const handleSendBack = async () => {
    if (!remarks.trim()) return
    // TODO: call backend send-back API with remarks
    await new Promise(r => setTimeout(r, 400))
    navigate("/main/admin/projects/validate")
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Project Review</h1>
          <Link to="/main/admin/projects/validate"><Button variant="outline">Back</Button></Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Project not found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Project Review</h1>
        <Link to="/main/admin/projects/validate"><Button variant="outline">Back</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>Municipality: <b>{project.municipality}</b></div>
            <div>State: <b>{project.state}</b></div>
            <div>Category: <b>{project.category}</b></div>
            <div>Budget: <b>₹{project.budgetCr} Cr</b></div>
            <div>Submitted: <b className="text-muted-foreground">{project.submittedAt}</b></div>
            <div>Status: <Badge variant={project.status === "Pending Validation" ? "secondary" : project.status === "Active" ? "default" : "outline"}>{project.status}</Badge></div>
          </div>

          <Separator />

          <div className="space-y-1">
            <label htmlFor="remarks" className="text-sm">Remarks (required for Send Back)</label>
            <Input id="remarks" placeholder="Add remarks for municipality" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleSendBack} disabled={!remarks.trim()}>Send Back</Button>
            <Button onClick={handleApprove}>Approve</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


