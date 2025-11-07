import React from "react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DatePicker } from "@/components/ui/date-picker"

const CardShowcase: React.FC = () => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined)
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Card Designs Showcase</h1>
        <p className="text-muted-foreground">Try different layouts and styles to decide what looks best.</p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Date Picker</CardTitle>
          <CardDescription>Select a date using the shared UI component.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <DatePicker value={selectedDate} onChange={setSelectedDate} />
        </CardContent>
        {<div>{selectedDate?.toLocaleString()}  </div>}
      </Card>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Simple</CardTitle>
          <CardDescription>Clean, minimal content-first design.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            This is a basic card layout using the default components. Great for brief info blocks.
          </p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Action</Button>
        </CardFooter>
      </Card>

      <Card className="max-w-md overflow-hidden">
        <img src="/vite.svg" alt="cover" className="h-36 w-full object-cover" />
        <CardHeader className="pb-2">
          <CardTitle>Media Top</CardTitle>
          <CardDescription>Image cover with content below.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p>
            Use a visual to draw attention. Ideal for project or article highlights.
          </p>
        </CardContent>
        <CardFooter className="justify-between">
          <Badge variant="secondary">New</Badge>
          <Button size="sm" variant="outline">Details</Button>
        </CardFooter>
      </Card>

      <Card className="max-w-2xl">
        <div className="flex gap-4 p-6">
          <div className="w-40 h-28 rounded-md bg-muted flex items-center justify-center text-muted-foreground">16:9</div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">Horizontal</div>
                <div className="text-sm text-muted-foreground">Media left, content right.</div>
              </div>
              <Badge>Beta</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Compact layout for lists such as search results or feeds.</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm">Open</Button>
              <Button size="sm" variant="outline">Save</Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Divided</CardTitle>
          <CardDescription>Sections separated for scannability.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <ul className="text-sm list-disc pl-5 space-y-1">
            <li>Key point one</li>
            <li>Key point two</li>
            <li>Key point three</li>
          </ul>
        </CardContent>
        <Separator />
        <CardFooter className="justify-end gap-2">
          <Button size="sm" variant="ghost">Dismiss</Button>
          <Button size="sm">Confirm</Button>
        </CardFooter>
      </Card>

      <Card className="max-w-md border-primary/30 shadow-lg shadow-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            Accent
          </CardTitle>
          <CardDescription>Subtle brand accent and stronger elevation.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Use when you want a featured emphasis without being too loud.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default CardShowcase


