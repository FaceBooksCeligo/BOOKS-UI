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
import { Plus, Search, Filter, Download, Upload, MoreHorizontal, Eye, Package } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  vendorName: string;
  date: string;
  expectedDate: string;
  amount: number;
  receivedPercent: number;
  status: string;
  createdAt: string;
}

const router = useRouter();

export default function PurchaseOrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const loadPurchaseOrders = async () => {
    try {
      // For now, return empty array since we don't have purchase orders API yet
      setOrders([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  };

  
  const handleNew = () => {
    router.push("/purchases/orders/new");
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
    router.push(`/purchases/orders/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/purchases/orders/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      toast(`Delete item ${id} - coming soon`);
    }
  };

  const columns = [
    {
      accessorKey: "orderNumber",
      header: "PO #",
      cell: ({ row }: any) => (
        <div className="font-mono text-sm">{row.getValue("orderNumber")}</div>
      ),
    },
    {
      accessorKey: "vendorName",
      header: "Vendor",
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue("vendorName")}</div>
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
      accessorKey: "expectedDate",
      header: "Expected",
      cell: ({ row }: any) => (
        <div>{new Date(row.getValue("expectedDate")).toLocaleDateString()}</div>
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
      accessorKey: "receivedPercent",
      header: "Received",
      cell: ({ row }: any) => (
        <div className="text-right">
          <Badge variant="outline">
            {row.getValue("receivedPercent")}%
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge 
          variant={
            row.getValue("status") === "RECEIVED" ? "default" : 
            row.getValue("status") === "APPROVED" ? "secondary" :
            row.getValue("status") === "CLOSED" ? "destructive" : "outline"
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
            <DropdownMenuItem 
              className="text-red-600" 
              onClick={() => handleDelete(row.original.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filteredOrders = orders.filter(order =>
    order.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Create and manage purchase orders from vendors
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New PO
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                {filteredOrders.length} of {orders.length} orders
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
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
          <DataTable
            columns={columns}
            data={filteredOrders}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
