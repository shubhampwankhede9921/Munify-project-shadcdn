import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Heart, Eye } from "lucide-react"

export default function Favorites() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Favorite Projects</h1>
          <p className="text-muted-foreground">Projects you've marked as favorites</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search favorites..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-600" />
            You have no favorites yet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Browse live projects and click the heart icon to add them here.</p>
          <Button>
            <Eye className="h-4 w-4 mr-2" />
            Explore Projects
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


