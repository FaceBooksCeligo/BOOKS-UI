"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  Search,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Mail,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { DataTable } from "@/components/DataTable";

interface User {
  id: string;
  email: string;
  name: {
    first: string;
    last: string;
  };
  roles: string[];
  status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

const STATUS_COLORS = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  SUSPENDED: "bg-red-100 text-red-800"
};

const ROLE_COLORS = {
  ADMIN: "bg-purple-100 text-purple-800",
  MANAGER: "bg-blue-100 text-blue-800",
  ACCOUNTANT: "bg-green-100 text-green-800",
  USER: "bg-gray-100 text-gray-800",
  VIEWER: "bg-yellow-100 text-yellow-800"
};

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/v1/users");
      
      if (response.success) {
        setUsers(response.data || []);
      } else {
        toast.error("Failed to load users");
      }
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
    const email = user.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return fullName.includes(search) || email.includes(search);
  });

  const handleCreateUser = () => {
    router.push("/admin/users/new");
  };

  const handleEditUser = (userId: string) => {
    router.push(`/admin/users/${userId}/edit`);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      // TODO: Implement delete user API
      toast.error("Delete user functionality not implemented yet");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <div className="font-medium">{user.name.first} {user.name.last}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: "roles",
      header: "Role",
      render: (user: User) => (
        <div className="flex gap-1">
          {user.roles.map((role) => (
            <Badge
              key={role}
              className={ROLE_COLORS[role as keyof typeof ROLE_COLORS] || "bg-gray-100 text-gray-800"}
            >
              {role}
            </Badge>
          ))}
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (user: User) => (
        <Badge className={STATUS_COLORS[user.status as keyof typeof STATUS_COLORS]}>
          {user.status}
        </Badge>
      )
    },
    {
      key: "emailVerified",
      header: "Verified",
      render: (user: User) => (
        <Badge variant={user.emailVerified ? "default" : "secondary"}>
          {user.emailVerified ? "Yes" : "No"}
        </Badge>
      )
    },
    {
      key: "createdAt",
      header: "Created",
      render: (user: User) => (
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: "actions",
      header: "Actions",
      render: (user: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDeleteUser(user.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    inactive: users.filter(u => u.status === 'INACTIVE').length,
    suspended: users.filter(u => u.status === 'SUSPENDED').length,
    verified: users.filter(u => u.emailVerified).length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage users and their permissions</p>
        </div>
        <Button onClick={handleCreateUser} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <div className="text-2xl font-bold">{stats.active}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <div>
                <div className="text-2xl font-bold">{stats.inactive}</div>
                <div className="text-sm text-muted-foreground">Inactive</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div>
                <div className="text-2xl font-bold">{stats.suspended}</div>
                <div className="text-sm text-muted-foreground">Suspended</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{stats.verified}</div>
                <div className="text-sm text-muted-foreground">Verified</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <DataTable
            data={filteredUsers}
            columns={columns}
            loading={loading}
            emptyMessage="No users found"
          />
        </CardContent>
      </Card>
    </div>
  );
}