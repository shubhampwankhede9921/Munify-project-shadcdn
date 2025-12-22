import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, Trash2, Download, FileSpreadsheet, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type ColumnDef } from '@/components/data-table/data-table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import apiService from '@/services/api'
import { alerts } from '@/lib/alerts'
import { api } from '@/services/api'

// Master table names
const MASTER_TABLES = [
  { value: 'funding_type_master', label: 'Funding Type Master' },
  { value: 'mode_of_implementation_master', label: 'Mode of Implementation Master' },
  { value: 'ownership_master', label: 'Ownership Master' },
  { value: 'project_category_master', label: 'Project Category Master' },
  { value: 'project_stage_master', label: 'Project Stage Master' },
]

// Excel file mapping for download (files in public folder)
const EXCEL_FILE_MAP: Record<string, string> = {
  funding_type_master: '/funding_type.xlsx',
  mode_of_implementation_master: '/mode_of_implementation.xlsx',
  ownership_master: '/ownership.xlsx',
  project_category_master: '/project_category.xlsx',
  project_stage_master: '/project_stage.xlsx',
}

// Helper function to format table name for display
const formatTableName = (tableName: string): string => {
  return tableName
    .replace(/_master$/, '')
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function CommonMasterExcel() {
  const queryClient = useQueryClient()
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Query for fetching table data
  const { data: tableDataResponse, isLoading, error, isError } = useQuery({
    queryKey: ['common-master', selectedTable],
    queryFn: () => {
      if (!selectedTable) return Promise.resolve([])
      return apiService.get('/master/common/', { table_name: selectedTable })
    },
    enabled: !!selectedTable,
  })

  // Extract table data from response (handle both array and wrapped responses)
  const tableData = Array.isArray(tableDataResponse) 
    ? tableDataResponse 
    : (tableDataResponse as any)?.data || []

  // Mutation for uploading Excel file
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      
      // Use axios directly for multipart/form-data
      const response = await api.post(
        `/master/common/upload?table_name=${selectedTable}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['common-master', selectedTable] })
      alerts.success('Success', 'Excel file uploaded successfully')
      setSelectedFile(null)
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Failed to upload Excel file. Please try again.'
      alerts.error('Error', errorMessage)
    },
  })

  // Mutation for deleting table data
  const deleteMutation = useMutation({
    mutationFn: () => {
      return apiService.delete(`/master/common/?table_name=${selectedTable}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['common-master', selectedTable] })
      alerts.success('Success', 'Table data deleted successfully')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Failed to delete table data. Please try again.'
      alerts.error('Error', errorMessage)
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ]
      if (!validTypes.includes(file.type)) {
        alerts.error('Invalid File', 'Please upload a valid Excel file (.xlsx or .xls)')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = () => {
    if (!selectedTable) {
      alerts.error('Validation Error', 'Please select a master table')
      return
    }
    if (!selectedFile) {
      alerts.error('Validation Error', 'Please select an Excel file to upload')
      return
    }
    uploadMutation.mutate(selectedFile)
  }

  const handleDelete = () => {
    if (!selectedTable) {
      alerts.error('Validation Error', 'Please select a master table')
      return
    }
    if (window.confirm(`Are you sure you want to delete all data from ${formatTableName(selectedTable)}? This action cannot be undone.`)) {
      deleteMutation.mutate()
    }
  }

  const handleDownloadStructure = () => {
    if (!selectedTable) {
      alerts.error('Validation Error', 'Please select a master table')
      return
    }
    const filePath = EXCEL_FILE_MAP[selectedTable]
    if (!filePath) {
      alerts.error('Error', 'Excel file not found for this table')
      return
    }
    
    // Create a temporary anchor element to trigger download from public folder
    const link = document.createElement('a')
    link.href = filePath
    link.download = `${selectedTable}_structure.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Generate columns dynamically based on table data
  const generateColumns = (): ColumnDef<any, any>[] => {
    if (!tableData || tableData.length === 0) return []

    // Get all keys from the first row
    const keys = Object.keys(tableData[0] || {})
    
    return keys.map((key) => ({
      accessorKey: key,
      header: key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      cell: ({ row }) => {
        const value = row.original[key]
        return <span className="font-medium">{value ?? '-'}</span>
      },
      enableSorting: true,
    }))
  }

  const columns = generateColumns()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Common Master Excel Management</h1>
        <p className="text-muted-foreground mt-2">
          Upload, view, and manage master table data using Excel files
        </p>
      </div>

      {/* Controls Card */}
      <Card>
        <CardHeader>
          <CardTitle>Table Operations</CardTitle>
          <CardDescription>
            Select a master table and perform upload, delete, or download operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="table-select">Master Table</Label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger id="table-select">
                  <SelectValue placeholder="Select a master table" />
                </SelectTrigger>
                <SelectContent>
                  {MASTER_TABLES.map((table) => (
                    <SelectItem key={table.value} value={table.value}>
                      {table.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">Excel File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileChange}
                disabled={!selectedTable || uploadMutation.isPending}
              />
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                  <span className="text-xs">
                    ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleUpload}
              disabled={!selectedTable || !selectedFile || uploadMutation.isPending}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploadMutation.isPending ? 'Uploading...' : 'Upload Excel'}
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!selectedTable || deleteMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Table Data'}
            </Button>

            <Button
              variant="outline"
              onClick={handleDownloadStructure}
              disabled={!selectedTable}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Table Structure
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Failed to fetch table data. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Data Table */}
      {selectedTable && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading table data...</div>
            </div>
          ) : !tableData || tableData.length === 0 ? (
            <div className="text-center py-8">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No data</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                This table is empty. Upload an Excel file to add data.
              </p>
            </div>
          ) : (
            <DataTable<any, any>
              title={`${formatTableName(selectedTable)} Records`}
              description={`Total ${tableData.length} record(s)`}
              columns={columns}
              data={tableData}
              showToolbar={true}
              showFooter={true}
              enableExport={true}
            />
          )}
        </>
      )}

      {!selectedTable && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Select a Master Table</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a master table from the dropdown above to view and manage its data.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

