import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search, 
  Filter, 
  Plus,
  Send,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Bell,
  Users,
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"

const mockNotifications = [
  {
    id: 1,
    title: "New Project Funding Alert",
    message: "Smart Water Management System has received a new funding commitment of ₹5Cr from Green Energy Fund",
    type: "funding",
    priority: "High",
    status: "Sent",
    recipients: 150,
    sentDate: "2024-03-15T10:30:00Z",
    createdBy: "Admin User"
  },
  {
    id: 2,
    title: "Project Deadline Reminder",
    message: "Solar Street Lighting Project deadline is approaching in 15 days. Consider sending reminder to potential investors",
    type: "reminder",
    priority: "Medium",
    status: "Draft",
    recipients: 0,
    sentDate: null,
    createdBy: "System"
  },
  {
    id: 3,
    title: "Municipal Credit Rating Update",
    message: "Mumbai Municipal Corporation credit rating has been updated to AA+. Notify all interested parties",
    type: "update",
    priority: "High",
    status: "Sent",
    recipients: 200,
    sentDate: "2024-03-14T14:20:00Z",
    createdBy: "Credit Team"
  },
  {
    id: 4,
    title: "Platform Maintenance Notice",
    message: "Scheduled maintenance will occur on March 20th from 2:00 AM to 4:00 AM IST. All users will be notified",
    type: "maintenance",
    priority: "Low",
    status: "Scheduled",
    recipients: 500,
    sentDate: "2024-03-20T02:00:00Z",
    createdBy: "Tech Team"
  },
  {
    id: 5,
    title: "New Municipal Corporation Added",
    message: "Pune Municipal Corporation has been added to the platform. Welcome them and notify relevant stakeholders",
    type: "welcome",
    priority: "Medium",
    status: "Draft",
    recipients: 0,
    sentDate: null,
    createdBy: "Admin User"
  }
]

const mockTemplates = [
  {
    id: 1,
    name: "Project Funding Alert",
    type: "funding",
    subject: "New Funding Opportunity: {project_name}",
    content: "A new funding opportunity is available for {project_name} in {municipality}. Total funding required: {amount}. Deadline: {deadline}.",
    lastUsed: "2024-03-15"
  },
  {
    id: 2,
    name: "Deadline Reminder",
    type: "reminder",
    subject: "Project Deadline Approaching: {project_name}",
    content: "The project {project_name} deadline is approaching in {days_left} days. Consider your investment opportunity.",
    lastUsed: "2024-03-10"
  },
  {
    id: 3,
    name: "Credit Rating Update",
    type: "update",
    subject: "Municipal Credit Rating Update: {municipality}",
    content: "The credit rating for {municipality} has been updated to {rating}. This may affect your investment decisions.",
    lastUsed: "2024-03-14"
  }
]

export default function AdminNotifications() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification Management</h1>
          <p className="text-muted-foreground">
            Send and manage notifications to platform users
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
              <Send className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Draft</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Edit className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-bold">78%</p>
              </div>
              <Bell className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">All Notifications</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="compose">Compose New</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Search notifications..." 
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="funding">Funding</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage all platform notifications and their delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {notification.message}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{notification.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            notification.priority === "High" ? "destructive" :
                            notification.priority === "Medium" ? "secondary" : "outline"
                          }
                        >
                          {notification.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            notification.status === "Sent" ? "default" :
                            notification.status === "Draft" ? "secondary" : "outline"
                          }
                        >
                          {notification.status === "Sent" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {notification.status === "Scheduled" && <Clock className="h-3 w-3 mr-1" />}
                          {notification.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{notification.recipients}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {notification.sentDate ? 
                          new Date(notification.sentDate).toLocaleDateString() : 
                          "-"
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>
                Manage reusable notification templates for common scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTemplates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{template.name}</h3>
                          <Badge variant="outline">{template.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Subject:</strong> {template.subject}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Content:</strong> {template.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last used: {template.lastUsed}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Use
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="compose" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compose New Notification</CardTitle>
              <CardDescription>
                Create and send a new notification to platform users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notification Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="funding">Funding Alert</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="welcome">Welcome</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input placeholder="Enter notification title" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  placeholder="Enter notification message" 
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Recipients</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="lenders">Lenders Only</SelectItem>
                    <SelectItem value="municipal">Municipal Commissioners</SelectItem>
                    <SelectItem value="custom">Custom List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-4">
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Send Now
                </Button>
                <Button variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
