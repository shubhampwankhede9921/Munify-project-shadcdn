import './App.css'
import { NavLink, Route, Routes } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";


function App() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/"}>
                  <NavLink to="/">Dashboard</NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname.startsWith("/projects")}>
                  <NavLink to="/projects">Projects</NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname.startsWith("/settings")}>
                  <NavLink to="/settings">Settings</NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>

      <SidebarInset>
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="font-semibold">Munify App</span>
        </div>
        <div className="p-6">
          <Routes>
            <Route path="/" element={<div><h1 className="text-2xl font-semibold">Dashboard</h1><p className="text-muted-foreground mt-2">Overview of your app.</p></div>} />
            <Route path="/projects" element={<div><h1 className="text-2xl font-semibold">Projects</h1><p className="text-muted-foreground mt-2">List of projects.</p></div>} />
            <Route path="/settings" element={<div><h1 className="text-2xl font-semibold">Settings</h1><p className="text-muted-foreground mt-2">Manage your preferences.</p></div>} />
            <Route path="*" element={<div><h1 className="text-2xl font-semibold">Not Found</h1><p className="text-muted-foreground mt-2">The page you requested was not found.</p></div>} />
          </Routes>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App
