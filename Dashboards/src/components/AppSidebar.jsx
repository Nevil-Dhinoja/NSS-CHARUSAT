import React from "react";
import {
  Calendar,
  ChevronUp,
  FileText,
  Home,
  Settings,
  User,
  Users,
  CheckSquare,
  BarChart3,
  Building2,
  UserCheck,
  Clock,
} from "lucide-react";

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
  SidebarHeader,
} from "@/components/ui/sidebar";

export default function AppSidebar({ userRole, userName, userEmail }) {
  // Define menu items based on user role
  const getMenuItems = () => {
    const commonItems = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
      },
      {
        title: "Profile",
        url: "/profile",
        icon: User,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ];

    if (userRole === "pc") {
      return [
        ...commonItems.slice(0, 1), // Dashboard
        {
          title: "Student Leaders",
          url: "/student-leaders",
          icon: Users,
        },
        {
          title: "Program Officers",
          url: "/program-officers",
          icon: UserCheck,
        },
        {
          title: "Departments",
          url: "/departments",
          icon: Building2,
        },
        {
          title: "Volunteers",
          url: "/volunteers",
          icon: Users,
        },
        {
          title: "Events",
          url: "/events",
          icon: Calendar,
        },
        {
          title: "Approvals",
          url: "/approvals",
          icon: CheckSquare,
        },
        {
          title: "Reports",
          url: "/reports",
          icon: FileText,
        },
        ...commonItems.slice(1), // Profile, Settings
      ];
    } else if (userRole === "po") {
      return [
        ...commonItems.slice(0, 1), // Dashboard
        {
          title: "Student Leaders",
          url: "/student-leaders",
          icon: Users,
        },
        {
          title: "Volunteers",
          url: "/volunteers",
          icon: Users,
        },
        {
          title: "Events",
          url: "/events",
          icon: Calendar,
        },
        {
          title: "Approvals",
          url: "/approvals",
          icon: CheckSquare,
        },
        ...commonItems.slice(1), // Profile, Settings
      ];
    } else if (userRole === "sc") {
      return [
        ...commonItems.slice(0, 1), // Dashboard
        {
          title: "Volunteers",
          url: "/volunteers",
          icon: Users,
        },
        {
          title: "Events",
          url: "/events",
          icon: Calendar,
        },
        {
          title: "Working Hours",
          url: "/working-hours",
          icon: Clock,
        },
        {
          title: "Reports",
          url: "/reports",
          icon: FileText,
        },
        ...commonItems.slice(1), // Profile, Settings
      ];
    }

    return commonItems;
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">NSS Connect</h2>
            <p className="text-sm text-gray-500">National Service Scheme</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
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
    </Sidebar>
  );
}
