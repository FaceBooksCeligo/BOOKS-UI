"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  FolderOpen,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Project {
  _id: string;
  projectNumber: string;
  name: string;
  status: string;
  type: string;
  customerId: any;
  projectManagerId: any;
  startDate: string;
  endDate: string;
  progress?: {
    percentComplete: number;
  };
  budget?: {
    totalBudget?: any;
  };
  actuals?: {
    totalCost?: any;
  };
  billingMethod?: string;
  priority?: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Summary metrics
  const [metrics, setMetrics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBudget: 0,
    totalSpent: 0
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get<Project[]>("/v1/projects");
      
      if (response.success && response.data) {
        const projectsData = response.data as Project[];
        setProjects(projectsData);
        calculateMetrics(projectsData);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (projectsData: Project[]) => {
    const active = projectsData.filter(p => p.status === 'IN_PROGRESS').length;
    const completed = projectsData.filter(p => p.status === 'COMPLETED').length;
    
    const totalBudget = projectsData.reduce((sum, p) => {
      return sum + (p.budget?.totalBudget?.base || 0);
    }, 0);
    
    const totalSpent = projectsData.reduce((sum, p) => {
      return sum + (p.actuals?.totalCost?.base || 0);
    }, 0);

    setMetrics({
      totalProjects: projectsData.length,
      activeProjects: active,
      completedProjects: completed,
      totalBudget,
      totalSpent
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      NOT_STARTED: { variant: "secondary" as const, label: "Not Started", icon: Clock },
      IN_PROGRESS: { variant: "default" as const, label: "In Progress", icon: TrendingUp },
      ON_HOLD: { variant: "secondary" as const, label: "On Hold", icon: AlertCircle },
      COMPLETED: { variant: "default" as const, label: "Completed", icon: CheckCircle },
      CANCELLED: { variant: "destructive" as const, label: "Cancelled", icon: AlertCircle },
      CLOSED: { variant: "secondary" as const, label: "Closed", icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.NOT_STARTED;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      LOW: { variant: "secondary" as const, className: "" },
      MEDIUM: { variant: "default" as const, className: "" },
      HIGH: { variant: "default" as const, className: "bg-orange-500" },
      CRITICAL: { variant: "destructive" as const, className: "" }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {priority}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await api.delete(`/v1/projects/${projectId}`);
        toast.success("Project deleted successfully");
        loadProjects();
      } catch (error) {
        toast.error("Failed to delete project");
      }
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.projectNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      accessorKey: "projectNumber",
      header: "Project #",
      cell: ({ row }: any) => {
        const project = row.original || row;
        return (
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{project.projectNumber}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: any) => {
        const project = row.original || row;
        return (
          <div>
            <div className="font-medium">{project.name}</div>
            <div className="text-sm text-muted-foreground">
              {project.customerId?.name}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const project = row.original || row;
        return getStatusBadge(project.status);
      },
    },
    {
      accessorKey: "projectManagerId",
      header: "Manager",
      cell: ({ row }: any) => {
        const project = row.original || row;
        const manager = project.projectManagerId;
        return manager ? `${manager.firstName} ${manager.lastName}` : '-';
      },
    },
    {
      accessorKey: "startDate",
      header: "Timeline",
      cell: ({ row }: any) => {
        const project = row.original || row;
        return (
          <div className="text-sm">
            <div>{formatDate(project.startDate)} - {formatDate(project.endDate)}</div>
            <div className="text-muted-foreground">
              {project.progress?.percentComplete || 0}% Complete
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "budget",
      header: "Budget",
      cell: ({ row }: any) => {
        const project = row.original || row;
        const budget = project.budget?.totalBudget?.base || 0;
        const spent = project.actuals?.totalCost?.base || 0;
        const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;
        
        return (
          <div className="text-sm">
            <div className="font-medium">{formatCurrency(budget)}</div>
            <div className={`text-xs ${percentUsed > 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {percentUsed.toFixed(0)}% Used
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }: any) => {
        const project = row.original || row;
        return project.priority ? getPriorityBadge(project.priority) : '-';
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const project = row.original || row;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/projects/${project._id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/projects/${project._id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/projects/${project._id}/tasks`)}>
                <Users className="mr-2 h-4 w-4" />
                Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/projects/${project._id}/financials`)}>
                <DollarSign className="mr-2 h-4 w-4" />
                Financials
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeleteProject(project._id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage projects, resources, and track progress
          </p>
        </div>
        <Button onClick={() => router.push("/projects/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.activeProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.completedProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalBudget)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalSpent)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Projects</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading projects...</div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredProjects}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
