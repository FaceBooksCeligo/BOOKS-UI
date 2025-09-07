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

interface SalesOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  fulfillmentDate: string;
  amount: number;
  fulfillmentStatus: string;
  status: string;
  createdAt: string;
}

export default function SalesOrdersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadSalesOrders();
  }, []);

  const loadSalesOrders = async () => {
    try {
      // For now, return empty array since we don't have sales orders API yet
      setOrders([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to load sales orders");
    } finally {
      setLoading(false);
    }
  };

  const handleNewOrder = () => {
    router.push("/sales/orders/new");
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

  const handleViewOrder = (orderId: string) => {
    router.push(`/sales/orders/${orderId}`);
  };

  const handleEditOrder = (orderId: string) => {
    router.push(`/sales/orders/${orderId}/edit`);
  };

  const handleFulfillOrder = (orderId: string) => {
    toast(`Fulfill order ${orderId} - coming soon`);
  };

  const handleConvertToInvoice = (orderId: string) => {
    toast(`Convert order ${orderId} to invoice - coming soon`);
  };

  const handleDuplicateOrder = (orderId: string) => {
    toast(`Duplicate order ${orderId} - coming soon`);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      toast(`Delete order ${orderId} - coming soon`);
    }
  };

  const columns = [
    {
      accessorKey: "orderNumber",
      header: "Order #",
      cell: ({ row }: any) => (
        <div className="font-mono text-sm">{row.getValue("orderNumber")}</div>
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
      accessorKey: "fulfillmentDate",
      header: "Fulfillment Date",
      cell: ({ row }: any) => (
        <div>{new Date(row.getValue("fulfillmentDate")).toLocaleDateString()}</div>
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
      accessorKey: "fulfillmentStatus",
      header: "Fulfillment",
      cell: ({ row }: any) => (
        <Badge 
          variant={
            row.getValue("fulfillmentStatus") === "FULFILLED" ? "default" : 
            row.getValue("fulfillmentStatus") === "PARTIALLY_FULFILLED" ? "secondary" : "outline"
          }
        >
          {row.getValue("fulfillmentStatus")}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge 
          variant={
            row.getValue("status") === "RELEASED" ? "default" : 
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
            <DropdownMenuItem onClick={() => handleViewOrder(row.original.id)}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditOrder(row.original.id)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFulfillOrder(row.original.id)}>
              <Package className="h-4 w-4 mr-2" />
              Fulfill
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleConvertToInvoice(row.original.id)}>Convert to Invoice</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDuplicateOrder(row.original.id)}>Duplicate</DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600" 
              onClick={() => handleDeleteOrder(row.original.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Orders</h1>
          <p className="text-muted-foreground">
            Manage sales orders and fulfillment
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
          <Button onClick={handleNewOrder}>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sales Orders</CardTitle>
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
            data={filteredOrders}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
