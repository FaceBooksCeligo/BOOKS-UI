"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  DollarSign,
  Building2,
  TrendingUp,
  TrendingDown,
  CreditCard
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  category: string;
  parentId?: string;
  isActive: boolean;
  balance: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const accountTypes = [
  { value: "ASSET", label: "Asset", color: "bg-blue-100 text-blue-800" },
  { value: "LIABILITY", label: "Liability", color: "bg-red-100 text-red-800" },
  { value: "EQUITY", label: "Equity", color: "bg-green-100 text-green-800" },
  { value: "REVENUE", label: "Revenue", color: "bg-purple-100 text-purple-800" },
  { value: "EXPENSE", label: "Expense", color: "bg-orange-100 text-orange-800" },
];

export default function ChartOfAccountsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await api.get("/v1/accounts");
      if (response.success) {
        setAccounts(response.data as Account[]);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    router.push("/admin/chart-of-accounts/new");
  };

  const handleImport = () => {
    toast("Import functionality coming soon");
  };

  const handleExport = () => {
    toast("Export functionality coming soon");
  };

  const handleFilter = () => {
    toast("Filter functionality coming soon");
  };

  const handleView = (id: string) => {
    router.push(`/admin/chart-of-accounts/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/chart-of-accounts/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this account?")) {
      toast(`Delete account ${id} - coming soon`);
    }
  };

  const getAccountTypeInfo = (type: string) => {
    return accountTypes.find(t => t.value === type) || { label: type, color: "bg-gray-100 text-gray-800" };
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "ASSET": return <Building2 className="h-4 w-4" />;
      case "LIABILITY": return <CreditCard className="h-4 w-4" />;
      case "EQUITY": return <TrendingUp className="h-4 w-4" />;
      case "REVENUE": return <DollarSign className="h-4 w-4" />;
      case "EXPENSE": return <TrendingDown className="h-4 w-4" />;
      default: return <Building2 className="h-4 w-4" />;
    }
  };

  const columns = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }: any) => (
        <div className="font-mono text-sm">{row.getValue("code")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "Account Name",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {getAccountIcon(row.original.type)}
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }: any) => {
        const typeInfo = getAccountTypeInfo(row.getValue("type"));
        return (
          <Badge className={typeInfo.color}>
            {typeInfo.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: any) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("category")}
        </span>
      ),
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }: any) => (
        <div className="text-right font-mono">
          ${row.getValue("balance").toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
          {row.getValue("isActive") ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleView(row.original.id)}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row.original.id)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600" 
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const accountSummary = {
    total: accounts.length,
    active: accounts.filter(a => a.isActive).length,
    assets: accounts.filter(a => a.type === "ASSET").length,
    liabilities: accounts.filter(a => a.type === "LIABILITY").length,
    equity: accounts.filter(a => a.type === "EQUITY").length,
    revenue: accounts.filter(a => a.type === "REVENUE").length,
    expenses: accounts.filter(a => a.type === "EXPENSE").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
          <p className="text-muted-foreground">
            Manage your chart of accounts and account structure
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Plus className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Plus className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Account
          </Button>
        </div>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountSummary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{accountSummary.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{accountSummary.assets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{accountSummary.liabilities}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{accountSummary.revenue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{accountSummary.expenses}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Accounts</CardTitle>
              <CardDescription>
                {filteredAccounts.length} of {accounts.length} accounts
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleFilter}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredAccounts}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
