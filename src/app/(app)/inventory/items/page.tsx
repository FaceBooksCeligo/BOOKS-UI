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
import { Plus, Search, Filter, Download, Upload, MoreHorizontal, Eye, Package, AlertTriangle } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface Item {
  id: string;
  sku: string;
  name: string;
  type: string;
  onHand: number;
  reorderPoint: number;
  valuationMethod: string;
  status: string;
  createdAt: string;
}

export default function ItemsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await api.get<any[]>("/v1/items");
      if (response.success) {
        const raw = (response.data as any[]) || [];
        const list = raw.map((i: any) => ({
          ...i,
          id: i.id || i._id,
          // Normalize fields for display fallbacks
          onHand: i.onHand ?? 0,
          reorderPoint: i.inventory?.reorderPoint ? parseFloat(i.inventory.reorderPoint) : (i.reorderPoint ?? 0),
          valuationMethod: i.inventory?.costing || i.valuationMethod || 'FIFO'
        }));
        setItems(list as any);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  
  const handleNew = () => {
    router.push("/inventory/items/new");
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
    router.push(`/inventory/items/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/inventory/items/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      toast(`Delete item ${id} - coming soon`);
    }
  };

  const columns = [
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }: any) => (
        <div className="font-mono text-sm">{row.sku}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "Item Name",
      cell: ({ row }: any) => (
        <div className="font-medium">{row.name}</div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }: any) => (
        <Badge variant="outline">{row.type}</Badge>
      ),
    },
    {
      accessorKey: "onHand",
      header: "On Hand",
      cell: ({ row }: any) => {
        const onHand = row.onHand;
        const reorderPoint = row.reorderPoint;
        const isLowStock = onHand <= reorderPoint;
        
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono">{onHand}</span>
            {isLowStock && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "reorderPoint",
      header: "Reorder Point",
      cell: ({ row }: any) => (
        <div className="font-mono">{row.reorderPoint}</div>
      ),
    },
    {
      accessorKey: "valuationMethod",
      header: "Valuation",
      cell: ({ row }: any) => (
        <Badge variant="secondary">{row.valuationMethod}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge 
          variant={
            row.status === "ACTIVE" ? "default" : 
            row.status === "INACTIVE" ? "secondary" : "destructive"
          }
        >
          {row.status}
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
            <DropdownMenuItem onClick={() => handleView(row.id)}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row.id)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600" 
              onClick={() => handleDelete(row.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = items.filter(item => item.onHand <= item.reorderPoint);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Items</h1>
          <p className="text-muted-foreground">
            Manage your inventory items and stock levels
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
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Item
          </Button>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription className="text-red-600">
              {lowStockItems.length} items are below their reorder point
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Items</CardTitle>
              <CardDescription>
                {filteredItems.length} of {items.length} items
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
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
            data={filteredItems}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
