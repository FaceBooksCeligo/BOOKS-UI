"use client";

import { useState, useEffect } from "react";
import { Search, Bell, Settings, User, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function Topbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(0);
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [loading, setLoading] = useState(false);
  const { clearAuth, user, setAuth, orgId, isAuthenticated, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    console.log("Topbar useEffect - User:", user);
    console.log("Topbar useEffect - Is authenticated:", user?.isAuthenticated);
    console.log("Topbar useEffect - Token:", user?.token);
    console.log("Topbar useEffect - OrgId:", user?.orgId);
    
    if (isAuthenticated && token && user) {
      loadOrganizations();
      loadNotifications();
    } else {
      console.log("User not authenticated in Topbar, not loading organizations");
    }
  }, [user]);

  const loadOrganizations = async () => {
    try {
      console.log("Loading organizations...");
      const response = await api.get("/v1/organizations");
      console.log("Organizations response:", response);
      
      if (response.success) {
        console.log("Organizations data:", response.data);
        // Transform the data to ensure consistent ID field
        const transformedOrgs = response.data.map((org: any) => ({
          ...org,
          id: org._id || org.id
        }));
        setOrganizations(transformedOrgs);
        const current = transformedOrgs.find(org => org.id === orgId);
        console.log("Current org found:", current);
        setCurrentOrg(current);
      }
    } catch (error) {
      console.error("Failed to load organizations:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await api.get("/v1/notifications");
      if (response.success) {
        setNotifications(response.data.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const handleOrgSwitch = async (orgId: string) => {
    setLoading(true);
    try {
      // For now, just update the local state since the API endpoint doesn't exist
      const newOrg = organizations.find(org => org.id === orgId);
      if (newOrg) {
        setCurrentOrg(newOrg);
        setAuth({ token: user?.token, user: user, orgId });
        toast.success("Organization switched successfully!");
        // Reload the page to update all data
        window.location.reload();
      } else {
        toast.error("Organization not found");
      }
    } catch (error: any) {
      console.error("Error switching organization:", error);
      toast.error("Failed to switch organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Global Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search customers, invoices, items... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-gray-300 bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-600 opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {notifications}
              </Badge>
            )}
          </Button>

          {/* Organization/Entity Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" disabled={loading}>
                <div className="h-2 w-2 rounded-full bg-green-500" />
                {currentOrg ? currentOrg.name : "Loading..."}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {organizations.map((org: any) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => handleOrgSwitch(org.id)}
                  className={cn(
                    "flex items-center gap-2",
                    org.id === orgId && "bg-accent"
                  )}
                >
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div className="flex flex-col">
                    <span className="font-medium">{org.name}</span>
                    <span className="text-xs text-muted-foreground">{org.code}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Period Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Jan 2025
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Select Period</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>January 2025</DropdownMenuItem>
              <DropdownMenuItem>December 2024</DropdownMenuItem>
              <DropdownMenuItem>November 2024</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="hidden sm:inline">{user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Account'}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => { clearAuth(); document.cookie = "books_ui_token=; Max-Age=0; path=/"; router.replace("/auth/login"); }}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
