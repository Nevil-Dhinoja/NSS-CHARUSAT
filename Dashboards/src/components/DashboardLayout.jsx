import React, { useState } from "react";
import {
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Settings, User } from "lucide-react";

const DashboardLayout = ({ children, userRole, userName, userEmail }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(2);

  const handleLogout = () => {
    // Clear user session
    localStorage.removeItem("nssUserToken");
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar userRole={userRole} userName={userName} userEmail={userEmail} />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <SidebarTrigger />
              <h1 className="text-xl font-medium text-nss-primary ml-4">NSS Connect Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-nss-secondary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {notifications}
                  </span>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-nss-primary text-white">
                        {userName.split(" ").map(name => name[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium hidden sm:inline-block">{userName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground">{userEmail}</p>
                      <p className="text-xs mt-1 bg-nss-accent text-nss-primary px-2 py-0.5 rounded inline-block">
                        {userRole === "pc"
                          ? "Program Coordinator"
                          : userRole === "po"
                            ? "Program Officer"
                            : "Student Coordinator"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/settings")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-red-500" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-6 bg-gray-50 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
