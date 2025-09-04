import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Link } from "react-router-dom"
import { Compass, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-2xl shadow-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Compass className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl">Page not found</CardTitle>
          <p className="text-sm text-muted-foreground">
            The page you’re looking for doesn’t exist or may have been moved.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2 rounded-lg border bg-muted/20 p-4 text-center">
              <div className="text-6xl font-bold tracking-tight">404</div>
              <p className="text-muted-foreground">We couldn’t find that page</p>
            </div>

            <Separator />

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild>
                <Link to="/main">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/main/projects/live">
                  <Compass className="mr-2 h-4 w-4" />
                  Explore Projects
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to={-1 as any}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


