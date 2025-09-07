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
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface BankReconciliation {
  id: string;
  reconciliationDate: string;
  account: {
    id: string;
    name: string;
    accountNumber: string;
  };
  statementBalance: number;
  bookBalance: number;
  difference: number;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'DISCREPANCY';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const BankingReconciliationsPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [reconciliations, setReconciliations] = useState<BankReconciliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Summary data
  const [summary, setSummary] = useState({
    totalReconciliations: 0,
    completedReconciliations: 0,
    inProgressReconciliations: 0,
    totalDiscrepancies: 0
  });

  useEffect(() => {
    loadReconciliations();
  }, []);

  const loadReconciliations = async () => {
    try {
      setLoading(true);
      const response = await api.get<BankReconciliation[]>("/v1/banking/reconciliations");
      
      if (response.success) {
        const list = (response.data as BankReconciliation[]) || [];
        setReconciliations(list);
        calculateSummary(list);
      } else {
        toast.error("Failed to load reconciliations");
      }
    } catch (error) {
      console.error("Error loading reconciliations:", error);
      toast.error("Failed to load reconciliations");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (reconciliationsData: BankReconciliation[]) => {
    const totalReconciliations = reconciliationsData.length;
    const completedReconciliations = reconciliationsData.filter(r => r.status === 'COMPLETED').length;
    const inProgressReconciliations = reconciliationsData.filter(r => r.status === 'IN_PROGRESS').length;
    const totalDiscrepancies = reconciliationsData.filter(r => r.status === 'DISCREPANCY').length;

    setSummary({
      totalReconciliations,
      completedReconciliations,
      inProgressReconciliations,
      totalDiscrepancies
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { variant: "secondary" as const, label: "Draft", icon: Clock },
      IN_PROGRESS: { variant: "default" as const, label: "In Progress", icon: Clock },
      COMPLETED: { variant: "default" as const, label: "Completed", icon: CheckCircle },
      DISCREPANCY: { variant: "destructive" as const, label: "Discrepancy", icon: AlertCircle }
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

  const filteredReconciliations = reconciliations.filter(reconciliation =>
    reconciliation.account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reconciliation.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reconciliation.account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      accessorKey: "reconciliationDate",
      header: "Date",
      cell: ({ row }: any) => {
        const reconciliation = row.original;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(reconciliation.reconciliationDate)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "account",
      header: "Account",
      cell: ({ row }: any) => {
        const reconciliation = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">{reconciliation.account.name}</div>
              <div className="text-sm text-muted-foreground">
                ****{reconciliation.account.accountNumber.slice(-4)}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "statementBalance",
      header: "Statement Balance",
      cell: ({ row }: any) => {
        const reconciliation = row.original;
        return (
          <div className="text-right">
            <div className="font-medium">{formatCurrency(reconciliation.statementBalance)}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "bookBalance",
      header: "Book Balance",
      cell: ({ row }: any) => {
        const reconciliation = row.original;
        return (
          <div className="text-right">
            <div className="font-medium">{formatCurrency(reconciliation.bookBalance)}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "difference",
      header: "Difference",
      cell: ({ row }: any) => {
        const reconciliation = row.original;
        return (
          <div className={`text-right font-medium ${reconciliation.difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
            {reconciliation.difference === 0 ? 'Balanced' : formatCurrency(reconciliation.difference)}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const reconciliation = row.original;
        return getStatusBadge(reconciliation.status);
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const reconciliation = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/banking/reconciliations/${reconciliation.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/banking/reconciliations/${reconciliation.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(reconciliation.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleDelete = async (reconciliationId: string) => {
    if (confirm("Are you sure you want to delete this reconciliation? This action cannot be undone.")) {
      try {
        const response = await api.delete(`/v1/banking/reconciliations/${reconciliationId}`);
        
        if (response.success) {
          toast.success("Reconciliation deleted successfully");
          loadReconciliations();
        } else {
          toast.error("Failed to delete reconciliation");
        }
      } catch (error) {
        console.error("Error deleting reconciliation:", error);
        toast.error("Failed to delete reconciliation");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Reconciliations</h1>
          <p className="text-muted-foreground">
            Reconcile your bank accounts with your books
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/banking/reconciliations/import")}>
            <Download className="h-4 w-4 mr-2" />
            Import Statement
          </Button>
          <Button onClick={() => router.push("/banking/reconciliations/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Reconciliation
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reconciliations</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalReconciliations}</div>
            <p className="text-xs text-muted-foreground">
              All reconciliations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.completedReconciliations}</div>
            <p className="text-xs text-muted-foreground">
              Successfully reconciled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.inProgressReconciliations}</div>
            <p className="text-xs text-muted-foreground">
              Currently reconciling
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discrepancies</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.totalDiscrepancies}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reconciliations</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reconciliations..."
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
              <div className="text-muted-foreground">Loading reconciliations...</div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredReconciliations}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BankingReconciliationsPage;
