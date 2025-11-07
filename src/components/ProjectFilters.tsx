import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  Filter, 
  X, 
  IndianRupee,
  TrendingUp,
  Clock
} from "lucide-react"

export interface FilterState {
  search: string
  categories: string[]
  states: string[]
  status: string[]
  fundingRange: [number, number]
  progressRange: [number, number]
  daysLeftRange: [number, number]
  interestRateRange: [number, number]
}

export interface AdvancedFilterState {
  fundingRange: [number, number]
  progressRange: [number, number]
  daysLeftRange: [number, number]
  interestRateRange: [number, number]
}

interface ProjectFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClearFilters: () => void
  activeFiltersCount: number
}


export default function ProjectFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  activeFiltersCount 
}: ProjectFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasActiveFilters = activeFiltersCount > 0

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {hasActiveFilters && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </SheetTitle>
          <SheetDescription>
            Fine-tune your search with advanced filtering options
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">

          {/* Funding Range */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Funding Required (in Crores)
            </Label>
            <div className="space-y-4">
              <Slider
                value={filters.fundingRange}
                onValueChange={(value) => updateFilter('fundingRange', value)}
                max={1000}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>₹{filters.fundingRange[0]}Cr</span>
                <span>₹{filters.fundingRange[1]}Cr</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Progress Range */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Funding Progress (%)
            </Label>
            <div className="space-y-4">
              <Slider
                value={filters.progressRange}
                onValueChange={(value) => updateFilter('progressRange', value)}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{filters.progressRange[0]}%</span>
                <span>{filters.progressRange[1]}%</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Days Left Range */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Days Left
            </Label>
            <div className="space-y-4">
              <Slider
                value={filters.daysLeftRange}
                onValueChange={(value) => updateFilter('daysLeftRange', value)}
                max={365}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{filters.daysLeftRange[0]} days</span>
                <span>{filters.daysLeftRange[1]} days</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Interest Rate Range */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Interest Rate (%)
            </Label>
            <div className="space-y-4">
              <Slider
                value={filters.interestRateRange}
                onValueChange={(value) => updateFilter('interestRateRange', value)}
                max={25}
                min={0}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{filters.interestRateRange[0]}%</span>
                <span>{filters.interestRateRange[1]}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-3 mt-8 pt-6 border-t">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClearFilters}
              className="flex-1"
              disabled={!hasActiveFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Apply Filters
            </Button>
          </div>
          {hasActiveFilters && (
            <div className="text-sm text-muted-foreground text-center">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
