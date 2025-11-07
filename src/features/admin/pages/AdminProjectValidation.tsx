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
import {
	Eye,
	CheckCircle,
	AlertTriangle,
	Clock,
	MoreHorizontal,
	ArrowUpDown,
} from "lucide-react"
import { DataTable, type ColumnDef } from "@/components/data-table/data-table"


type ProjectSummary = {
	id: string
	name: string
	municipality: string
	state: string
	category: string
	budgetCr: number
	submittedAt: string
	status: "Pending Validation" | "Action Required" | "Active"
}

const categories = ["Water", "Waste", "Energy", "Transport", "Health"]
const cities = [
	{ municipality: "Mumbai", state: "Maharashtra" },
	{ municipality: "Delhi", state: "Delhi" },
	{ municipality: "Pune", state: "Maharashtra" },
	{ municipality: "Bengaluru", state: "Karnataka" },
	{ municipality: "Ahmedabad", state: "Gujarat" },
]
const statuses: ProjectSummary["status"][] = ["Pending Validation", "Action Required", "Active"]

function generateProjects(count = 60): ProjectSummary[] {
	return Array.from({ length: count }, (_, i) => {
		const city = cities[i % cities.length]
		const category = categories[i % categories.length]
		const status = statuses[i % statuses.length]
		const budgetCr = Math.round((40 + (i * 7) % 160) * 10) / 10
		const id = `PRJ-${100 + i}`
		const submittedAt = new Date(Date.now() - i * 86400000)
			.toISOString()
			.replace("T", " ")
			.slice(0, 16)
		return {
			id,
			name: `${category} Initiative #${i + 1}`,
			municipality: city.municipality,
			state: city.state,
			category,
			budgetCr,
			submittedAt,
			status,
		}
	})
}

const allData = generateProjects(60)

const columns: ColumnDef<ProjectSummary, any>[] = [
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
			<button className="-ml-3 inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
				Project <ArrowUpDown className="h-4 w-4" />
			</button>
		),
		cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
	},
	{
		accessorKey: "municipality",
		header: "Municipality",
	},
	{
		accessorKey: "state",
		header: "State",
	},
	{
		accessorKey: "category",
		header: ({ column }) => (
			<button className="-ml-3 inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
				Category <ArrowUpDown className="h-4 w-4" />
			</button>
		),
	},
	{
		accessorKey: "budgetCr",
		header: ({ column }) => (
			<button className="-ml-3 inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
				Budget (₹ Cr) <ArrowUpDown className="h-4 w-4" />
			</button>
		),
		cell: ({ row }) => <div className="text-right tabular-nums">{row.original.budgetCr.toFixed(1)}</div>,
	},
	{
		accessorKey: "submittedAt",
		header: ({ column }) => (
			<button className="-ml-3 inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
				Submitted <ArrowUpDown className="h-4 w-4" />
			</button>
		),
		cell: ({ row }) => (
			<span className="whitespace-nowrap text-xs text-muted-foreground">{row.original.submittedAt}</span>
		),
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
			if (s === "Pending Validation") {
				return (
					<Badge className="bg-amber-100 text-amber-800 border-amber-200 inline-flex items-center gap-1">
						<Clock className="h-3 w-3" /> Pending
					</Badge>
				)
			}
			return (
				<Badge className="bg-red-100 text-red-800 border-red-200 inline-flex items-center gap-1">
					<AlertTriangle className="h-3 w-3" /> Action Required
				</Badge>
			)
		},
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
						Copy Project ID
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => { window.location.href = `/main/admin/projects/validate/${row.original.id}` }}>
						<Eye className="h-4 w-4 mr-2" /> Review
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		),
	},
]

export default function AdminProjectValidation() {
	return (
		<div className="space-y-4">
			<DataTable<ProjectSummary, any>
				title="Project Validation"
				description="Review and validate projects submitted by municipalities."
				columns={columns}
				data={allData}
        showToolbar={true}
        showFooter={true}
        enableExport={true}
			/>
		</div>
	)
}


