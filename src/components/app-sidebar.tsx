import * as React from "react"
import { LayoutDashboard, FolderKanban, Building2, Settings, Wrench, GalleryVerticalEnd, Map, PieChart } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { SearchForm } from "./search-form"

// This is sample data.
const data = {
  user: {
    name: "Shubham Wankhede",
    email: "shubhamwan10@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Munify",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    // {
    //   name: "Acme Corp.",
    //   logo: AudioWaveform,
    //   plan: "Startup",
    // },
    // {
    //   name: "Evil Corp.",
    //   logo: Command,
    //   plan: "Free",
    // },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/main",
      icon: LayoutDashboard,
      items: [
        { title: "Overview", url: "/main" },
      ],
    },
    {
      title: "Projects",
      url: "/main/projects",
      icon: FolderKanban,
      items: [
        { title: "Live Projects", url: "/main/projects/live" },
        { title: "Funded Projects", url: "/main/projects/funded" },
        { title: "My Projects", url: "/main/projects/my" },
        { title: "Favorites", url: "/main/projects/favorites" },
      ],
    },
    {
      title: "Municipal",
      url: "/main/municipal",
      icon: Building2,
      items: [
        { title: "All Municipalities", url: "/main/municipal" },
        { title: "Credit Ratings", url: "/main/municipal/ratings" },
        { title: "Financial Analysis", url: "/main/municipal/analysis" },
      ],
    },
    {
      title: "Admin",
      url: "/main/admin",
      icon: Settings,
      items: [
        { title: "Project Management", url: "/main/admin/projects" },
        { title: "User Management", url: "/main/admin/users" },
        { title: "Notifications", url: "/main/admin/notifications" },
        { title: "Reports", url: "/main/admin/reports" },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "/main/projects",
      icon: Wrench,
    },
    {
      name: "Sales & Marketing",
      url: "/main/projects/active",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "/main/projects/archived",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()
  const filteredNavMain = data.navMain.map((section) => ({
    ...section,
    items: section.items?.filter((i) => i.title.toLowerCase().includes(q)),
  }))
  const filteredProjects = data.projects.filter((p) => p.name.toLowerCase().includes(q))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        <div className="group-data-[collapsible=icon]:hidden">
          <SearchForm value={query} onChange={setQuery} />
        </div>
       
      
       
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavProjects projects={filteredProjects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
