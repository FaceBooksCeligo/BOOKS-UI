"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface InventoryAdjustment {
  id: string;
  adjustmentNumber: string;
  adjustmentDate: string;
  reason: string;
  type: 'INCREASE' | 'DECREASE' | 'TRANSFER' | 'COUNT';
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  totalValue: number;
  itemCount: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const InventoryAdjustmentsPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Summary data
  const [summary, setSummary] = useState({
    totalAdjustments: 0,
    pendingAdjustments: 0,
    approvedAdjustments: 0,
    totalValue: 0
  });

  useEffect(() => {
    loadAdjustments();
  }, []);

  const loadAdjustments = async () => {
    try {
      setLoading(true);
      const response = await api.get<InventoryAdjustment[]>("/v1/inventory/adjustments");
      
      if (response.success) {
        const list = (response.data as InventoryAdjustment[]) || [];
        setAdjustments(list);
        calculateSummary(list);
      } else {
        toast.error("Failed to load adjustments");
      }
    } catch (error) {
      console.error("Error loading adjustments:", error);
      toast.error("Failed to load adjustments");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (adjustmentsData: InventoryAdjustment[]) => {
    const totalAdjustments = adjustmentsData.length;
    const pendingAdjustments = adjustmentsData.filter(adj => adj.status === 'PENDING').length;
    const approvedAdjustments = adjustmentsData.filter(adj => adj.status === 'APPROVED').length;
    const totalValue = adjustmentsData.reduce((sum, adj) => sum + adj.totalValue, 0);

    setSummary({
      totalAdjustments,
      pendingAdjustments,
      approvedAdjustments,
      totalValue
    });
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = {
      INCREASE: TrendingUp,
      DECREASE: TrendingDown,
      TRANSFER: Package,
      COUNT: Package
    };

    return typeConfig[type as keyof typeof typeConfig] || Package;
  };

  const getTypeColor = (type: string) => {
    const typeConfig = {
      INCREASE: 'text-green-600',
      DECREASE: 'text-red-600',
      TRANSFER: 'text-blue-600',
      COUNT: 'text-purple-600'
    };

    return typeConfig[type as keyof typeof typeConfig] || 'text-gray-600';
  };

  const getTypeLabel = (type: string) => {
    const typeConfig = {
      INCREASE: 'Increase',
      DECREASE: 'Decrease',
      TRANSFER: 'Transfer',
      COUNT: 'Count'
    };

    return typeConfig[type as keyof typeof typeConfig] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { variant: "secondary" as const, label: "Draft", icon: Package },
      PENDING: { variant: "default" as const, label: "Pending", icon: AlertCircle },
      APPROVED: { variant: "default" as const, label: "Approved", icon: CheckCircle },
      REJECTED: { variant: "destructive" as const, label: "Rejected", icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredAdjustments = adjustments.filter(adjustment =>
    adjustment.adjustmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adjustment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adjustment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      accessorKey: "adjustmentNumber",
      header: "Adjustment #",
      cell: ({ row }: any) => {
        const adjustment = row?.original || row;
        return (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{adjustment.adjustmentNumber}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "adjustmentDate",
      header: "Date",
      cell: ({ row }: any) => {
        const adjustment = row?.original || row;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(adjustment.adjustmentDate)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }: any) => {
        const adjustment = row?.original || row;
        const Icon = getTypeIcon(adjustment.type);
        return (
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${getTypeColor(adjustment.type)}`} />
            <span className={`font-medium ${getTypeColor(adjustment.type)}`}>
              {getTypeLabel(adjustment.type)}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }: any) => {
        const adjustment = row?.original || row;
        return (
          <div>
            <div className="font-medium">{adjustment.reason}</div>
            {adjustment.description && (
              <div className="text-sm text-muted-foreground">{adjustment.description}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "totalValue",
      header: "Total Value",
      cell: ({ row }: any) => {
        const adjustment = row?.original || row;
        return (
          <div className="text-right">
            <div className="font-medium">{formatCurrency(adjustment.totalValue)}</div>
            <div className="text-sm text-muted-foreground">
              {adjustment.itemCount} items
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const adjustment = row?.original || row;
        return getStatusBadge(adjustment.status);
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const adjustment = row?.original || row;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/inventory/adjustments/${adjustment.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/inventory/adjustments/${adjustment.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(adjustment.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleDelete = async (adjustmentId: string) => {
    if (confirm("Are you sure you want to delete this adjustment? This action cannot be undone.")) {
      try {
        const response = await api.delete(`/v1/inventory/adjustments/${adjustmentId}`);
        
        if (response.success) {
          toast.success("Adjustment deleted successfully");
          loadAdjustments();
        } else {
          toast.error("Failed to delete adjustment");
        }
      } catch (error) {
        console.error("Error deleting adjustment:", error);
        toast.error("Failed to delete adjustment");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Adjustments</h1>
          <p className="text-muted-foreground">
            Track inventory adjustments and stock movements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/inventory/adjustments/import")}>
            <Download className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => router.push("/inventory/adjustments/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Adjustment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Adjustments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAdjustments}</div>
            <p className="text-xs text-muted-foreground">
              All adjustments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pendingAdjustments}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.approvedAdjustments}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Total adjustment value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Adjustments</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search adjustments..."
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
              <div className="text-muted-foreground">Loading adjustments...</div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredAdjustments}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryAdjustmentsPage;
