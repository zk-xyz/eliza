import React from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="px-4 py-6 md:px-8 lg:px-12">
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    );
}