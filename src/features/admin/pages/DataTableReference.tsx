import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  MoreHorizontal,
  ArrowUpDown,
  Plus,
} from "lucide-react"
import { DataTable, type ColumnDef } from "@/components/data-table/data-table"

// Reference data type
export type ExampleRow = {
  id: string
  name: string
  role: "Admin" | "Manager" | "Analyst"
  org: string
  email: string
  createdAt: string
  status: "Active" | "Pending" | "Disabled"
  phone: string
  department: string
  location: string
  lastLogin: string
  notes: string
  team: string
  country: string
  plan: "Free" | "Pro" | "Enterprise"
  projects: number
  tags: string
}

// Mock dataset builder
function generateRows(count = 50): ExampleRow[] {
  const roles: ExampleRow["role"][] = ["Admin", "Manager", "Analyst"]
  const statuses: ExampleRow["status"][] = ["Active", "Pending", "Disabled"]
  const orgs = ["Alpha Corp", "Beta Ltd", "Gamma Partners", "Delta Group"]
  const departments = ["Operations", "Finance", "Engineering", "Support"]
  const locations = ["New York", "London", "Berlin", "Singapore"]
  const teams = ["A-Team", "Bravo", "Charlie", "Delta"]
  const countries = ["USA", "UK", "Germany", "Singapore"]
  const plans: ExampleRow["plan"][] = ["Free", "Pro", "Enterprise"]

  return Array.from({ length: count }, (_, i) => {
    const role = roles[i % roles.length]
    const status = statuses[i % statuses.length]
    const org = orgs[i % orgs.length]
    const id = `USR-${1000 + i}`
    const createdAt = new Date(Date.now() - i * 36e5)
      .toISOString()
      .replace("T", " ")
      .slice(0, 16)
    const lastLogin = new Date(Date.now() - i * 18e5)
      .toISOString()
      .replace("T", " ")
      .slice(0, 16)
    const phone = `+1-555-${String(1000 + (i % 9000)).padStart(4, "0")}`
    const department = departments[i % departments.length]
    const location = locations[i % locations.length]
    const notes = i % 3 === 0 ? "VIP" : i % 3 === 1 ? "NDA" : "—"
    const team = teams[i % teams.length]
    const country = countries[i % countries.length]
    const plan = plans[i % plans.length]
    const projects = (i * 3) % 57
    const tags = i % 4 === 0 ? "priority,external" : i % 4 === 1 ? "internal" : i % 4 === 2 ? "beta" : "trial"

    return {
      id,
      name: `${role} User ${i + 1}`,
      role,
      org,
      email: `user${i + 1}@example.com`,
      createdAt,
      status,
      phone,
      department,
      location,
      lastLogin,
      notes,
      team,
      country,
      plan,
      projects,
      tags,
    }
  })
}

const data = generateRows(60)

// Column definitions covering most features
const columns: ColumnDef<ExampleRow, any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <button
        className="-ml-3 inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name <ArrowUpDown className="h-4 w-4" />
      </button>
    ),
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{row.original.phone}</span>,
  },
  {
    accessorKey: "org",
    header: ({ column }) => (
      <button
        className="-ml-3 inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Organization <ArrowUpDown className="h-4 w-4" />
      </button>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "team",
    header: "Team",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "plan",
    header: "Plan",
  },
  {
    accessorKey: "projects",
    header: "Projects",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.projects}</span>,
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.tags}</span>,
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <button
        className="-ml-3 inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created <ArrowUpDown className="h-4 w-4" />
      </button>
    ),
    cell: ({ row }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{row.original.createdAt}</span>,
  },
  {
    accessorKey: "lastLogin",
    header: ({ column }) => (
      <button
        className="-ml-3 inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Login <ArrowUpDown className="h-4 w-4" />
      </button>
    ),
    cell: ({ row }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{row.original.lastLogin}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status
      if (s === "Active") {
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 inline-flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Active
          </Badge>
        )
      }
      if (s === "Pending") {
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        )
      }
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 inline-flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Disabled
        </Badge>
      )
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
  },
  {
    id: "actions",
    enableHiding: false,
    header: "Action",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background p-0 text-foreground/80 hover:text-foreground">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>
            Copy User ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { window.alert(`Open details for ${row.original.id}`) }}>
            <Eye className="h-4 w-4 mr-2" /> View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export default function DataTableReference() {
  // In case you want to demonstrate pre-filtering, keep a memo pattern.
  const rows = useMemo(() => data, [])

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      <DataTable<ExampleRow, any>
        title="Users"
        description="Reference page: shows how to use the reusable DataTable with common features."
        columns={columns}
        data={rows}
        // Example of page-level actions in header
        actions={
          <div className="flex items-center gap-2">
           
            <Button size="sm" onClick={() => window.alert("Create new user")}> <Plus className="mr-2 h-4 w-4" /> New</Button>
          </div>
        }
        showToolbar={true}
        showFooter={true}

        enableExport={true}
      />
    </div>
  )
}
