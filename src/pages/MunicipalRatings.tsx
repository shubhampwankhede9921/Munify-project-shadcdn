import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Award, Building2 } from "lucide-react"

const mockRatings = [
  { name: "Mumbai Municipal Corporation", state: "Maharashtra", rating: "AA+" },
  { name: "Delhi Municipal Corporation", state: "Delhi", rating: "AA" },
  { name: "Bangalore City Corporation", state: "Karnataka", rating: "AA" },
]

export default function MunicipalRatings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Municipal Credit Ratings</h1>
        <p className="text-muted-foreground">Latest ratings and grading for municipalities</p>
      </div>

      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search municipality..." className="pl-10" />
          </div>
          <Select>
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              <SelectItem value="maharashtra">Maharashtra</SelectItem>
              <SelectItem value="delhi">Delhi</SelectItem>
              <SelectItem value="karnataka">Karnataka</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {mockRatings.map((m) => (
          <Card key={m.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {m.name}
                </span>
                <Badge variant="secondary" className="text-green-700 bg-green-100">{m.state}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600 flex items-center gap-2">
                <Award className="h-7 w-7" />
                {m.rating}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


