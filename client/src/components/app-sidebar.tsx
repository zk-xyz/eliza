import { Calendar, Inbox, Menu } from "lucide-react";
import { useParams } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

// Menu items
const items = [
    {
        title: "Chat",
        url: "chat",
        icon: Inbox,
    },
    {
        title: "Character Overview",
        url: "character",
        icon: Calendar,
    },
];

function MobileMenuTrigger() {
    const { isMobile, openMobile, setOpenMobile } = useSidebar();
    
    if (!isMobile) return null;
    
    return (
        <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-40 h-8 w-8 rounded-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
            onClick={() => setOpenMobile(!openMobile)}
        >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
        </Button>
    );
}

export function AppSidebar() {
    const { agentId } = useParams();
    const { isMobile } = useSidebar();

    return (
        <>
            <MobileMenuTrigger />
            <Sidebar>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Application</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton 
                                            asChild
                                            tooltip={isMobile ? undefined : item.title}
                                        >
                                            <a href={`/${agentId}/${item.url}`}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <ThemeToggle />
                </SidebarFooter>
            </Sidebar>
        </>
    );
}