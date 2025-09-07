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
import { Plus, Search, Filter, Download, Upload, MoreHorizontal, Send, Eye, CreditCard } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  dueDate: string;
  amount: number;
  balance: number;
  status: string;
  createdAt: string;
}

export default function InvoicesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const response = await api.get<any[]>("/v1/invoices");
      if (response.success) {
        setInvoices((response.data as any[]) || []);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleNewInvoice = () => {
    router.push("/sales/invoices/new");
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

  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/sales/invoices/${invoiceId}`);
  };

  const handleEditInvoice = (invoiceId: string) => {
    router.push(`/sales/invoices/${invoiceId}/edit`);
  };

  const handleSendInvoice = (invoiceId: string) => {
    toast(`Send invoice ${invoiceId} - coming soon`);
  };

  const handleReceivePayment = (invoiceId: string) => {
    router.push(`/sales/payments/new?invoice=${invoiceId}`);
  };

  const handlePrintInvoice = (invoiceId: string) => {
    toast(`Print invoice ${invoiceId} - coming soon`);
  };

  const handleDuplicateInvoice = (invoiceId: string) => {
    toast(`Duplicate invoice ${invoiceId} - coming soon`);
  };

  const handleVoidInvoice = (invoiceId: string) => {
    if (confirm("Are you sure you want to void this invoice?")) {
      toast(`Void invoice ${invoiceId} - coming soon`);
    }
  };

  const columns = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }: any) => (
        <div className="font-mono text-sm">{row.getValue("invoiceNumber")}</div>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue("customerName")}</div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => (
        <div>{new Date(row.getValue("date")).toLocaleDateString()}</div>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }: any) => (
        <div>{new Date(row.getValue("dueDate")).toLocaleDateString()}</div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }: any) => (
        <div className="text-right font-mono">
          ${row.getValue("amount")?.toLocaleString() || "0.00"}
        </div>
      ),
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }: any) => (
        <div className="text-right font-mono">
          ${row.getValue("balance")?.toLocaleString() || "0.00"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge 
          variant={
            row.getValue("status") === "PAID" ? "default" : 
            row.getValue("status") === "SENT" ? "secondary" :
            row.getValue("status") === "PARTIALLY_PAID" ? "outline" :
            row.getValue("status") === "VOID" ? "destructive" : "outline"
          }
        >
          {row.getValue("status")}
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
            <DropdownMenuItem onClick={() => handleViewInvoice(row.original.id)}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditInvoice(row.original.id)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSendInvoice(row.original.id)}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleReceivePayment(row.original.id)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Receive Payment
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePrintInvoice(row.original.id)}>Print</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDuplicateInvoice(row.original.id)}>Duplicate</DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600" 
              onClick={() => handleVoidInvoice(row.original.id)}
            >
              Void
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filteredInvoices = invoices.filter(invoice =>
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Create and manage customer invoices
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleNewInvoice}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                {filteredInvoices.length} of {invoices.length} invoices
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
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
            data={filteredInvoices}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}