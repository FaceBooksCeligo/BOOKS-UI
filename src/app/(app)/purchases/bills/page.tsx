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
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  Building
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Bill {
  id: string;
  billNumber: string;
  vendor: {
    id: string;
    name: string;
    email?: string;
  };
  billDate: string;
  dueDate: string;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  totalAmount: number;
  paidAmount: number;
  balance: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const BillsPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Summary data
  const [summary, setSummary] = useState({
    totalBills: 0,
    pendingBills: 0,
    overdueBills: 0,
    totalAmount: 0,
    paidAmount: 0,
    balanceAmount: 0
  });

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      const response = await api.get<Bill[]>("/v1/bills");
      
      if (response.success) {
        const list = (response.data as Bill[]) || [];
        setBills(list);
        calculateSummary(list);
      } else {
        toast.error("Failed to load bills");
      }
    } catch (error) {
      console.error("Error loading bills:", error);
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (billsData: Bill[]) => {
    const totalBills = billsData.length;
    const pendingBills = billsData.filter(bill => bill.status === 'PENDING').length;
    const overdueBills = billsData.filter(bill => bill.status === 'OVERDUE').length;
    const totalAmount = billsData.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const paidAmount = billsData.reduce((sum, bill) => sum + bill.paidAmount, 0);
    const balanceAmount = billsData.reduce((sum, bill) => sum + bill.balance, 0);

    setSummary({
      totalBills,
      pendingBills,
      overdueBills,
      totalAmount,
      paidAmount,
      balanceAmount
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { variant: "secondary" as const, label: "Draft" },
      PENDING: { variant: "default" as const, label: "Pending" },
      PAID: { variant: "default" as const, label: "Paid" },
      OVERDUE: { variant: "destructive" as const, label: "Overdue" },
      CANCELLED: { variant: "outline" as const, label: "Cancelled" }
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

  const filteredBills = bills.filter(bill =>
    bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bill.description && bill.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    {
      accessorKey: "billNumber",
      header: "Bill #",
      cell: ({ row }: any) => {
        const bill = row.original;
        return (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{bill.billNumber}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }: any) => {
        const bill = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Building className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">{bill.vendor.name}</div>
              {bill.vendor.email && (
                <div className="text-sm text-muted-foreground">{bill.vendor.email}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "billDate",
      header: "Bill Date",
      cell: ({ row }: any) => {
        const bill = row.original;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(bill.billDate)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }: any) => {
        const bill = row.original;
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(bill.dueDate)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const bill = row.original;
        return getStatusBadge(bill.status);
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }: any) => {
        const bill = row.original;
        return (
          <div className="text-right">
            <div className="font-medium">{formatCurrency(bill.totalAmount)}</div>
            {bill.balance > 0 && (
              <div className="text-sm text-muted-foreground">
                Balance: {formatCurrency(bill.balance)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const bill = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/purchases/bills/${bill.id}`)}
            >
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/purchases/bills/${bill.id}/edit`)}
            >
              Edit
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bills</h1>
          <p className="text-muted-foreground">
            Manage your vendor bills and payments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/purchases/bills/import")}>
            <Download className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => router.push("/purchases/bills/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Bill
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalBills}</div>
            <p className="text-xs text-muted-foreground">
              All bills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pendingBills}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Bills</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.overdueBills}</div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Balance: {formatCurrency(summary.balanceAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bills</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bills..."
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
              <div className="text-muted-foreground">Loading bills...</div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredBills}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillsPage;