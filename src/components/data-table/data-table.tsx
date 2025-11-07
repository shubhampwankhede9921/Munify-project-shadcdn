import * as React from "react"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import type {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    Table as TanTable,
    RowSelectionState,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download } from "lucide-react"
import { Card } from "../ui/card"

export type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    title?: string
    description?: string
    actions?: React.ReactNode
    state?: Partial<{
        sorting: SortingState
        columnFilters: ColumnFiltersState
        columnVisibility: VisibilityState
        rowSelection: RowSelectionState
        globalFilter: string
    }>
    onStateChange?: Partial<{
        onSortingChange: (updater: SortingState) => void
        onColumnFiltersChange: (updater: ColumnFiltersState) => void
        onColumnVisibilityChange: (updater: VisibilityState) => void
        onRowSelectionChange: (updater: RowSelectionState) => void
        onGlobalFilterChange: (value: string) => void
    }>
    pageSize?: number
    showToolbar?: boolean
    showFooter?: boolean
    globalFilterPlaceholder?: string
    onTableReady?: (table: TanTable<TData>) => void
    enableExport?: boolean
    exportFilename?: string
}

export function DataTable<TData, TValue>({
    columns,
    data,
    title,
    description,
    actions,
    state,
    onStateChange,
    pageSize = 10,
    showToolbar = true,
    showFooter = true,
    globalFilterPlaceholder = "Search...",
    onTableReady,
    enableExport = false,
    exportFilename = "export.csv",
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>(state?.sorting ?? [])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(state?.columnFilters ?? [])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(state?.columnVisibility ?? {})
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(state?.rowSelection ?? {})
    const [globalFilter, setGlobalFilter] = React.useState<string>(state?.globalFilter ?? "")

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: (updater) => {
            const next = updater as SortingState
            setSorting(next)
            onStateChange?.onSortingChange?.(next)
        },
        onColumnFiltersChange: (updater) => {
            const next = updater as ColumnFiltersState
            setColumnFilters(next)
            onStateChange?.onColumnFiltersChange?.(next)
        },
        onColumnVisibilityChange: (updater) => {
            const next = updater as VisibilityState
            setColumnVisibility(next)
            onStateChange?.onColumnVisibilityChange?.(next)
        },
        onRowSelectionChange: (updater) => {
            const next = updater as RowSelectionState
            setRowSelection(next)
            onStateChange?.onRowSelectionChange?.(next)
        },
        onGlobalFilterChange: (val) => {
            const next = String(val ?? "")
            setGlobalFilter(next)
            onStateChange?.onGlobalFilterChange?.(next)
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        initialState: {
            pagination: { pageSize },
        },
    })

    React.useEffect(() => {
        onTableReady?.(table as unknown as TanTable<TData>)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function exportToCsv() {
        const visibleCols = table
            .getAllLeafColumns()
            .filter((c) => c.getIsVisible() && c.id !== "select" && c.id !== "actions")
            .map((c) => c.id)

        const selected = table.getFilteredSelectedRowModel().rows
        const sourceRows = selected.length > 0 ? selected : table.getFilteredRowModel().rows
        const rows = sourceRows.map((r) => r.original as Record<string, unknown>)

        const headers = visibleCols.length > 0 ? visibleCols : Object.keys(rows[0] ?? {})

        const escape = (val: unknown) => {
            const s = val == null ? "" : String(val)
            // wrap and escape quotes
            return JSON.stringify(s)
        }

        const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape((r as any)[h])).join(","))].join("\n")
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = exportFilename
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <Card className="overflow-x-hidden">
            <div className="w-full min-w-0">
                {(title || description || actions) && (
                    <div className="p-4 mb-3 flex items-start justify-between gap-4 border-b pb-3">
                        <div>
                            {title && <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>}
                            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                            {actions}
                            {enableExport && (
                                <Button variant="outline" size="sm" onClick={exportToCsv}>
                                    <Download className="mr-2 h-4 w-4" /> Export CSV
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                <div className="p-4 min-w-0">
                    {showToolbar && (
                        <div className="flex items-center gap-2 justify-between pb-3">
                            <Input
                                placeholder={globalFilterPlaceholder}
                                value={globalFilter}
                                onChange={(e) => table.setGlobalFilter(e.target.value)}
                                className="max-w-sm cursor-pointer"
                            />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="ml-auto cursor-pointer hidden h-8 lg:flex">
                                        <Settings2 className="mr-2 h-4 w-4 cursor-pointer" /> View
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[180px]">
                                    <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {table
                                        .getAllLeafColumns()
                                        .filter((column) => column.getCanHide())
                                        .map((column) => (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                            >
                                                {column.id}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}

                    <div className="max-w-full overflow-x-hidden">
                        <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        </div>
                    </div>

                    {showFooter && (
                        <div className="flex items-center justify-between mt-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span>Rows per page</span>
                                <select
                                    className="border rounded px-2 py-1"
                                    value={table.getState().pagination.pageSize}
                                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <span>
                                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" className="hidden size-8 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                                        <span className="sr-only">First</span>
                                        <ChevronsLeft />
                                    </Button>
                                    <Button variant="outline" size="icon" className="size-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                                        <span className="sr-only">Prev</span>
                                        <ChevronLeft />
                                    </Button>
                                    <Button variant="outline" size="icon" className="size-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                        <span className="sr-only">Next</span>
                                        <ChevronRight />
                                    </Button>
                                    <Button variant="outline" size="icon" className="hidden size-8 lg:flex" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                                        <span className="sr-only">Last</span>
                                        <ChevronsRight />
                                    </Button>
                                </div>
                            </div>
                            <div>{table.getFilteredRowModel().rows.length} results</div>
                        </div>
                    )}
                </div>


            </div>
        </Card>
    )
}

export type { ColumnDef } from "@tanstack/react-table"
