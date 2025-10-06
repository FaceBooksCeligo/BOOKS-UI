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
  CreditCard,
  Building,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountType: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'LOAN' | 'INVESTMENT' | 'OTHER';
  currency: string;
  currentBalance: number;
  availableBalance: number;
  status: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const BankingAccountsPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Summary data
  const [summary, setSummary] = useState({
    totalAccounts: 0,
    activeAccounts: 0,
    totalBalance: 0,
    totalAvailable: 0
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get<BankAccount[]>("/v1/banking/accounts");
      
      if (response.success) {
        const raw = (response.data as any[]) || [];
        // Normalize API shape -> UI shape
        const list: BankAccount[] = raw.map((a: any) => ({
          id: a.id || a._id,
          accountName: a.accountName || a.name || "",
          accountNumber: String(a.accountNumber || ""),
          bankName: a.bankName || "",
          accountType: a.accountType || 'CHECKING',
          currency: a.currency || 'USD',
          currentBalance: typeof a.currentBalance === 'number' ? a.currentBalance : 0,
          availableBalance: typeof a.availableBalance === 'number' ? a.availableBalance : 0,
          status: a.status || 'ACTIVE',
          description: a.description,
          createdAt: a.createdAt || new Date().toISOString(),
          updatedAt: a.updatedAt || new Date().toISOString(),
        }));
        setAccounts(list);
        calculateSummary(list);
      } else {
        toast.error("Failed to load bank accounts");
      }
    } catch (error) {
      console.error("Error loading bank accounts:", error);
      toast.error("Failed to load bank accounts");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (accountsData: BankAccount[]) => {
    const totalAccounts = accountsData.length;
    const activeAccounts = accountsData.filter(account => account.status === 'ACTIVE').length;
    const totalBalance = accountsData.reduce((sum, account) => sum + account.currentBalance, 0);
    const totalAvailable = accountsData.reduce((sum, account) => sum + account.availableBalance, 0);

    setSummary({
      totalAccounts,
      activeAccounts,
      totalBalance,
      totalAvailable
    });
  };

  const getAccountTypeIcon = (type: string) => {
    const typeConfig = {
      CHECKING: CreditCard,
      SAVINGS: Building,
      CREDIT_CARD: CreditCard,
      LOAN: TrendingDown,
      INVESTMENT: TrendingUp,
      OTHER: Wallet
    };

    return typeConfig[type as keyof typeof typeConfig] || Wallet;
  };

  const getAccountTypeLabel = (type: string) => {
    const typeConfig = {
      CHECKING: "Checking",
      SAVINGS: "Savings",
      CREDIT_CARD: "Credit Card",
      LOAN: "Loan",
      INVESTMENT: "Investment",
      OTHER: "Other"
    };

    return typeConfig[type as keyof typeof typeConfig] || "Other";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: "default" as const, label: "Active" },
      INACTIVE: { variant: "secondary" as const, label: "Inactive" },
      CLOSED: { variant: "destructive" as const, label: "Closed" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const filteredAccounts = accounts.filter(account => {
    const name = (account.accountName || '').toLowerCase();
    const bank = (account.bankName || '').toLowerCase();
    const number = String(account.accountNumber || '').toLowerCase();
    const term = (searchTerm || '').toLowerCase();
    return name.includes(term) || bank.includes(term) || number.includes(term);
  });

  const columns = [
    {
      accessorKey: "accountName",
      header: "Account",
      cell: ({ row }: any) => {
        const account = row.original || row;
        const Icon = getAccountTypeIcon(account?.accountType || 'CHECKING');
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">{account?.accountName || ''}</div>
              <div className="text-sm text-muted-foreground">
                {getAccountTypeLabel(account?.accountType || 'CHECKING')} • {account?.bankName || ''}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "accountNumber",
      header: "Account Number",
      cell: ({ row }: any) => {
        const account = row.original || row;
        return (
          <div className="font-mono text-sm">
            ****{String(account?.accountNumber || '').slice(-4)}
          </div>
        );
      },
    },
    {
      accessorKey: "currentBalance",
      header: "Current Balance",
      cell: ({ row }: any) => {
        const account = row.original || row;
        return (
          <div className="text-right">
            <div className={`font-medium ${(account?.currentBalance ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(account?.currentBalance ?? 0, account?.currency || 'USD')}
            </div>
            <div className="text-sm text-muted-foreground">
              Available: {formatCurrency(account?.availableBalance ?? 0, account?.currency || 'USD')}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const account = row.original || row;
        return getStatusBadge(account?.status || 'ACTIVE');
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const account = row.original || row;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/banking/accounts/${account?.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/banking/accounts/${account?.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => account?.id && handleDelete(account.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleDelete = async (accountId: string) => {
    if (confirm("Are you sure you want to delete this bank account? This action cannot be undone.")) {
      try {
        const response = await api.delete(`/v1/banking/accounts/${accountId}`);
        
        if (response.success) {
          toast.success("Bank account deleted successfully");
          loadAccounts();
        } else {
          toast.error("Failed to delete bank account");
        }
      } catch (error) {
        console.error("Error deleting bank account:", error);
        toast.error("Failed to delete bank account");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Accounts</h1>
          <p className="text-muted-foreground">
            Manage your bank accounts and track balances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/banking/accounts/import")}>
            <Download className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => router.push("/banking/accounts/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Account
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAccounts}</div>
            <p className="text-xs text-muted-foreground">
              All bank accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeAccounts}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Current balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalAvailable)}</div>
            <p className="text-xs text-muted-foreground">
              Available to spend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bank Accounts</CardTitle>
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
              <div className="text-muted-foreground">Loading bank accounts...</div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredAccounts}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BankingAccountsPage;