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
  CreditCard,
  DollarSign,
  Calendar,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CreditMemo {
  id: string;
  creditMemoNumber: string;
  customerId: string;
  customerName: string;
  status: 'DRAFT' | 'SENT' | 'APPLIED' | 'CANCELLED';
  totalAmount: number;
  currency: string;
  issueDate: string;
  appliedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CreditsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [credits, setCredits] = useState<CreditMemo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      setLoading(true);
      const response = await api.getCreditMemos();
      console.log("Credits API response:", response);
      console.log("Response data:", response.data);
      console.log("Is array:", Array.isArray(response.data));
      const creditsData = Array.isArray(response.data) ? response.data : [];
      setCredits(creditsData as CreditMemo[]);
    } catch (error: any) {
      console.error("Error loading credit memos:", error);
      toast.error("Failed to load credit memos");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: string) => {
    router.push(`/sales/credits/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/sales/credits/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this credit memo?")) return;
    
    try {
      await api.delete(`/v1/credit-memos/${id}`);
      toast.success("Credit memo deleted successfully");
      loadCredits();
    } catch (error: any) {
      console.error("Error deleting credit memo:", error);
      toast.error("Failed to delete credit memo");
    }
  };

  const handleApply = async (id: string) => {
    try {
      await api.post(`/v1/credit-memos/${id}/apply`);
      toast.success("Credit memo applied successfully");
      loadCredits();
    } catch (error: any) {
      console.error("Error applying credit memo:", error);
      toast.error("Failed to apply credit memo");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'APPLIED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      accessorKey: "creditMemoNumber",
      header: "Credit #",
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original?.creditMemoNumber || '—'}</div>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{row.original?.customerName || '—'}</div>
          </div>
        </div>
      ),
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
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }: any) => (
        <div className="font-medium text-red-600">
          {row.original?.totalAmount ? formatCurrency(row.original.totalAmount, row.original.currency) : '—'}
        </div>
      ),
    },
    {
      accessorKey: "issueDate",
      header: "Issue Date",
      cell: ({ row }: any) => (
        <div className="text-sm text-muted-foreground">
          {row.original?.issueDate ? formatDate(row.original.issueDate) : '—'}
        </div>
      ),
    },
    {
      accessorKey: "appliedDate",
      header: "Applied Date",
      cell: ({ row }: any) => (
        <div className="text-sm text-muted-foreground">
          {row.original?.appliedDate ? formatDate(row.original.appliedDate) : '—'}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        if (!row.original || !row.original.id) {
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
              <DropdownMenuItem onClick={() => handleView(row.original.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(row.original.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {row.original.status === 'SENT' && (
                <DropdownMenuItem onClick={() => handleApply(row.original.id)}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Apply
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDelete(row.original.id)}
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

  const filteredCredits = (Array.isArray(credits) ? credits : []).filter(credit => {
    if (!credit) return false;
    
    const creditNumber = credit.creditMemoNumber || '';
    const customerName = credit.customerName || '';
    
    return creditNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
           customerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const creditsArray = Array.isArray(credits) ? credits : [];
  const creditSummary = {
    total: creditsArray.length,
    draft: creditsArray.filter(c => c && c.status === 'DRAFT').length,
    sent: creditsArray.filter(c => c && c.status === 'SENT').length,
    applied: creditsArray.filter(c => c && c.status === 'APPLIED').length,
    totalValue: creditsArray.reduce((sum, c) => sum + (c?.totalAmount || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credit Memos</h1>
          <p className="text-muted-foreground">Create and manage customer credit memos</p>
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
          <Button onClick={() => router.push('/sales/credits/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Credit Memo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditSummary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{creditSummary.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{creditSummary.sent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applied</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{creditSummary.applied}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(creditSummary.totalValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-semibold leading-none tracking-tight">Credit Memos</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredCredits.length} of {credits.length} credit memos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-8 w-64"
                placeholder="Search credit memos..."
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
            data={filteredCredits}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
