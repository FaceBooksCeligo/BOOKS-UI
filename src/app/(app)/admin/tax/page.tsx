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
  Receipt,
  Percent,
  Eye,
  Edit,
  Trash2,
  Calculator
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface TaxCode {
  id: string;
  code: string;
  name: string;
  description?: string;
  rate: number;
  type: 'SALES' | 'PURCHASE' | 'BOTH';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const TaxPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [taxCodes, setTaxCodes] = useState<TaxCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Summary data
  const [summary, setSummary] = useState({
    totalCodes: 0,
    activeCodes: 0,
    salesCodes: 0,
    purchaseCodes: 0
  });

  useEffect(() => {
    loadTaxCodes();
  }, []);

  const loadTaxCodes = async () => {
    try {
      setLoading(true);
      const response = await api.get<TaxCode[]>("/v1/taxes/codes");
      
      if (response.success) {
        const codes = (response.data as TaxCode[]) || [];
        setTaxCodes(codes);
        calculateSummary(codes);
      } else {
        toast.error("Failed to load tax codes");
      }
    } catch (error) {
      console.error("Error loading tax codes:", error);
      toast.error("Failed to load tax codes");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (codesData: TaxCode[]) => {
    const totalCodes = codesData.length;
    const activeCodes = codesData.filter(code => code.isActive).length;
    const salesCodes = codesData.filter(code => code.type === 'SALES' || code.type === 'BOTH').length;
    const purchaseCodes = codesData.filter(code => code.type === 'PURCHASE' || code.type === 'BOTH').length;

    setSummary({
      totalCodes,
      activeCodes,
      salesCodes,
      purchaseCodes
    });
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'SALES': { variant: "default" as const, label: "Sales" },
      'PURCHASE': { variant: "secondary" as const, label: "Purchase" },
      'BOTH': { variant: "outline" as const, label: "Both" }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.SALES;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  const filteredTaxCodes = taxCodes.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }: any) => {
        const code = row.original;
        return (
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{code.code}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: any) => {
        const code = row.original;
        return (
          <div>
            <div className="font-medium">{code.name}</div>
            {code.description && (
              <div className="text-sm text-muted-foreground">{code.description}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }: any) => {
        const code = row.original;
        return (
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatPercentage(code.rate)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }: any) => {
        const code = row.original;
        return getTypeBadge(code.type);
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }: any) => {
        const code = row.original;
        return getStatusBadge(code.isActive);
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const code = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/admin/tax/${code.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/admin/tax/${code.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(code.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleDelete = async (codeId: string) => {
    if (confirm("Are you sure you want to delete this tax code? This action cannot be undone.")) {
      try {
        const response = await api.delete(`/v1/taxes/codes/${codeId}`);
        
        if (response.success) {
          toast.success("Tax code deleted successfully");
          loadTaxCodes();
        } else {
          toast.error("Failed to delete tax code");
        }
      } catch (error) {
        console.error("Error deleting tax code:", error);
        toast.error("Failed to delete tax code");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Settings</h1>
          <p className="text-muted-foreground">
            Manage your tax codes and rates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/tax/import")}>
            <Download className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => router.push("/admin/tax/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Tax Code
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalCodes}</div>
            <p className="text-xs text-muted-foreground">
              All tax codes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeCodes}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Codes</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.salesCodes}</div>
            <p className="text-xs text-muted-foreground">
              For sales transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Codes</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.purchaseCodes}</div>
            <p className="text-xs text-muted-foreground">
              For purchase transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tax Codes</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tax codes..."
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
              <div className="text-muted-foreground">Loading tax codes...</div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredTaxCodes}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxPage;