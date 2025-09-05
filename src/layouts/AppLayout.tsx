import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import Copyright from "@/components/Copyright";
import logoBig from "@/assets/logo-big.png";

export default function AppLayout() {

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <img src={logoBig} alt="Munify" className="h-8 w-auto" />
        </div>
        <div className="p-6">
          <Outlet />
        </div>
        <footer className="border-t bg-muted/50 py-4 px-6">
          <Copyright />
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}


