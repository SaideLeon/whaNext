import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppDashboard } from "@/components/app-dashboard";
import { WhatsAppLogo } from "@/components/icons/whatsapp-logo";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function HomePage() {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar className="border-r" collapsible="icon">
        <SidebarHeader className="p-2 flex items-center justify-between">
           <div className="flex items-center gap-2 p-2">
             <WhatsAppLogo className="w-7 h-7 text-primary" />
             <h1 className="font-headline text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
               WA Autoreply
             </h1>
           </div>
          <SidebarTrigger className="group-data-[collapsible=icon]:hidden mr-1" />
        </SidebarHeader>
        <SidebarContent className="p-2">
          {/* Future navigation items can go here */}
          {/* Example:
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive tooltip="Dashboard">
                <Home />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          */}
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6 justify-between md:justify-end">
          {/* Mobile sidebar trigger */}
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <h1 className="font-headline text-lg font-semibold md:hidden">
            WhatsApp Autoreply
          </h1>
          {/* User/settings dropdown can go here */}
        </header>
        <main className="flex-1">
          <AppDashboard />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
