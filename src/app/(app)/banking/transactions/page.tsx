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
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Building,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface BankTransaction {
  id: string;
  transactionDate: string;
  description: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  category: string;
  account: {
    id: string;
    name: string;
    accountNumber: string;
  };
  reference: string;
  status: 'PENDING' | 'CLEARED' | 'RECONCILED' | 'VOID';
  balance: number;
  createdAt: string;
  updatedAt: string;
}

const BankingTransactionsPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Summary data
  const [summary, setSummary] = useState({
    totalTransactions: 0,
    pendingTransactions: 0,
    totalDebits: 0,
    totalCredits: 0,
    netAmount: 0
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get<BankTransaction[]>("/v1/banking/transactions");
      
      if (response.success) {
        const list = (response.data as BankTransaction[]) || [];
        setTransactions(list);
        calculateSummary(list);
      } else {
        toast.error("Failed to load transactions");
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (transactionsData: BankTransaction[]) => {
    const totalTransactions = transactionsData.length;
    const pendingTransactions = transactionsData.filter(t => t.status === 'PENDING').length;
    const totalDebits = transactionsData
      .filter(t => t.type === 'DEBIT')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalCredits = transactionsData
      .filter(t => t.type === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0);
    const netAmount = totalCredits - totalDebits;

    setSummary({
      totalTransactions,
      pendingTransactions,
      totalDebits,
      totalCredits,
      netAmount
    });
  };

  const getTypeIcon = (type: string) => {
    return type === 'CREDIT' ? ArrowDownLeft : ArrowUpRight;
  };

  const getTypeColor = (type: string) => {
    return type === 'CREDIT' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, label: "Pending" },
      CLEARED: { variant: "default" as const, label: "Cleared" },
      RECONCILED: { variant: "default" as const, label: "Reconciled" },
      VOID: { variant: "destructive" as const, label: "Void" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.account.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      accessorKey: "transactionDate",
      header: "Date",
      cell: ({ row }: any) => {
        const transaction = row.original;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(transaction.transactionDate)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }: any) => {
        const transaction = row.original;
        return (
          <div>
            <div className="font-medium">{transaction.description}</div>
            <div className="text-sm text-muted-foreground">
              {transaction.category} • {transaction.account.name}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }: any) => {
        const transaction = row.original;
        const Icon = getTypeIcon(transaction.type);
        return (
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${getTypeColor(transaction.type)}`} />
            <span className={`font-medium ${getTypeColor(transaction.type)}`}>
              {transaction.type}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }: any) => {
        const transaction = row.original;
        return (
          <div className={`text-right font-medium ${getTypeColor(transaction.type)}`}>
            {transaction.type === 'CREDIT' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </div>
        );
      },
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }: any) => {
        const transaction = row.original;
        return (
          <div className="text-right">
            <div className="font-medium">{formatCurrency(transaction.balance)}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const transaction = row.original;
        return getStatusBadge(transaction.status);
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const transaction = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/banking/transactions/${transaction.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/banking/transactions/${transaction.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(transaction.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleDelete = async (transactionId: string) => {
    if (confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) {
      try {
        const response = await api.delete(`/v1/banking/transactions/${transactionId}`);
        
        if (response.success) {
          toast.success("Transaction deleted successfully");
          loadTransactions();
        } else {
          toast.error("Failed to delete transaction");
        }
      } catch (error) {
        console.error("Error deleting transaction:", error);
        toast.error("Failed to delete transaction");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Transactions</h1>
          <p className="text-muted-foreground">
            View and manage your bank transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/banking/transactions/import")}>
            <Download className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => router.push("/banking/transactions/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              All transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting clearance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalCredits)}</div>
            <p className="text-xs text-muted-foreground">
              Money in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalDebits)}</div>
            <p className="text-xs text-muted-foreground">
              Money out
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.netAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Net position
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
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
              <div className="text-muted-foreground">Loading transactions...</div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredTransactions}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BankingTransactionsPage;
