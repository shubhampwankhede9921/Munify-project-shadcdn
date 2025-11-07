import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate, Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import Copyright from "@/components/Copyright";
import logoBig from "@/assets/logo-big.png";
import { Button } from "@/components/ui/button";

export default function AppLayout() {
  const navigate = useNavigate()
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <div className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <img src={logoBig} alt="Munify" className="h-8 w-auto" />
          </div>
          <div>
          <Button onClick={()=>navigate("/main/admin/invitation")} size={"sm"} className="mr-2">User Invitation</Button>
          <ThemeToggle />
          </div>
          
        </div>
        <div className="p-6 flex-1">
          <Outlet />
        </div>
        <footer className="border-t bg-muted/50 py-2 px-6 mt-auto">
          <Copyright />
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}


