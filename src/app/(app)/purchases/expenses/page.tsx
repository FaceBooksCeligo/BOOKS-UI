"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Receipt,
  DollarSign,
  Calendar,
  User,
  CreditCard,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Expense {
  id: string;
  expenseNumber: string;
  vendorId?: string;
  vendorName?: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  paymentMethod: 'CASH' | 'CHECK' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'OTHER';
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  expenseDate: string;
  dueDate?: string;
  paidDate?: string;
  accountId: string;
  accountName?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ExpensesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/v1/expenses");
      setExpenses((response.data as Expense[]) || []);
    } catch (error: any) {
      console.error("Error loading expenses:", error);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: string) => {
    router.push(`/purchases/expenses/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/purchases/expenses/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    
    try {
      await api.delete(`/v1/expenses/${id}`);
      toast.success("Expense deleted successfully");
      loadExpenses();
    } catch (error: any) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/v1/expenses/${id}`, { status: 'APPROVED' });
      toast.success("Expense approved successfully");
      loadExpenses();
    } catch (error: any) {
      console.error("Error approving expense:", error);
      toast.error("Failed to approve expense");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.patch(`/v1/expenses/${id}`, { status: 'REJECTED' });
      toast.success("Expense rejected successfully");
      loadExpenses();
    } catch (error: any) {
      console.error("Error rejecting expense:", error);
      toast.error("Failed to reject expense");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH': return <DollarSign className="h-4 w-4" />;
      case 'CHECK': return <FileText className="h-4 w-4" />;
      case 'CREDIT_CARD': return <CreditCard className="h-4 w-4" />;
      case 'BANK_TRANSFER': return <Receipt className="h-4 w-4" />;
      default: return <Receipt className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const columns = [
    {
      accessorKey: "expenseNumber",
      header: "Expense #",
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original?.expenseNumber || '—'}</div>
      ),
    },
    {
      accessorKey: "vendorName",
      header: "Vendor",
      cell: ({ row }: any) => {
        const vendorName = row.original?.vendorName;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">{vendorName || '—'}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }: any) => (
        <div className="max-w-xs truncate">
          {row.original?.description || '—'}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: any) => (
        <Badge variant="outline">
          {row.original?.category || '—'}
        </Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }: any) => (
        <div className="font-medium">
          {row.original?.amount ? formatCurrency(row.original.amount, row.original.currency) : '—'}
        </div>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
      cell: ({ row }: any) => {
        const method = row.original?.paymentMethod;
        return (
          <div className="flex items-center gap-2">
            {getPaymentMethodIcon(method || 'OTHER')}
            <span className="text-sm">{method || '—'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original?.status || 'DRAFT';
        return (
          <Badge className={getStatusColor(status)}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "expenseDate",
      header: "Expense Date",
      cell: ({ row }: any) => (
        <div className="text-sm text-muted-foreground">
          {row.original?.expenseDate ? formatDate(row.original.expenseDate) : '—'}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const expense = row.original;
        if (!expense || !expense.id) {
          return (
            <Button variant="ghost" className="h-8 w-8 p-0" disabled>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          );
        }
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(expense.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(expense.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {expense.status === 'PENDING' && (
                <>
                  <DropdownMenuItem onClick={() => handleApprove(expense.id)}>
                    <Receipt className="h-4 w-4 mr-2" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleReject(expense.id)}>
                    <Receipt className="h-4 w-4 mr-2" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDelete(expense.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const filteredExpenses = expenses.filter(expense => {
    if (!expense) return false;
    
    const expenseNumber = expense.expenseNumber || '';
    const description = expense.description || '';
    const vendorName = expense.vendorName || '';
    const category = expense.category || '';
    
    return expenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
           description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const expenseSummary = {
    total: expenses.length,
    draft: expenses.filter(e => e && e.status === 'DRAFT').length,
    pending: expenses.filter(e => e && e.status === 'PENDING').length,
    approved: expenses.filter(e => e && e.status === 'APPROVED').length,
    paid: expenses.filter(e => e && e.status === 'PAID').length,
    totalAmount: expenses.reduce((sum, e) => sum + (e?.amount || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track and manage business expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => router.push('/purchases/expenses/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenseSummary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Receipt className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{expenseSummary.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Receipt className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expenseSummary.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Receipt className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{expenseSummary.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <Receipt className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{expenseSummary.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(expenseSummary.totalAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-semibold leading-none tracking-tight">Expenses</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredExpenses.length} of {expenses.length} expenses
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-8 w-64"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredExpenses}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
