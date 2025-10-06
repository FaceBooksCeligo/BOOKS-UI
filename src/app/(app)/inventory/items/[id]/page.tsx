"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { ArrowLeft, Edit, Package, DollarSign, Settings, AlertTriangle } from "lucide-react";

interface Item {
  id: string;
  sku: string;
  name: string;
  description: string;
  type: string;
  category: string;
  unitOfMeasure: string;
  unitPrice: number;
  costPrice: number;
  onHand: number;
  reorderPoint: number;
  valuationMethod: string;
  isActive: boolean;
  isInventoryTracked: boolean;
  isService: boolean;
  incomeAccount: string;
  expenseAccount: string;
  assetAccount: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadItem();
    }
  }, [params.id]);

  const loadItem = async () => {
    try {
      const response = await api.get<any>(`/v1/items/${params.id}`);
      if (response.success) {
        const i: any = response.data || {};
        const normalized = {
          ...i,
          id: i.id || i._id,
          unitPrice: i.pricing?.basePrice ? parseFloat(i.pricing.basePrice) : (i.unitPrice ?? 0),
          costPrice: typeof i.costPrice === 'number' ? i.costPrice : 0,
          onHand: i.onHand ?? 0,
          reorderPoint: i.inventory?.reorderPoint ? parseFloat(i.inventory.reorderPoint) : (i.reorderPoint ?? 0),
          valuationMethod: i.inventory?.costing || i.valuationMethod || 'FIFO',
          unitOfMeasure: i.uom || i.unitOfMeasure || 'EACH'
        };
        setItem(normalized);
      } else {
        toast.error("Failed to load item");
        router.push("/inventory/items");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load item");
      router.push("/inventory/items");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/inventory/items/${params.id}/edit`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Item Not Found</h1>
          </div>
        </div>
      </div>
    );
  }

  const isLowStock = item.onHand <= item.reorderPoint;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>
            <p className="text-muted-foreground">SKU: {item.sku}</p>
          </div>
        </div>
        <Button onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Item
        </Button>
      </div>

      {isLowStock && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription className="text-red-600">
              This item is below its reorder point ({item.reorderPoint})
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">SKU</Label>
                  <p className="font-mono">{item.sku}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{item.type}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                  <p>{item.category || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Unit of Measure</Label>
                  <p>{item.unitOfMeasure}</p>
                </div>
              </div>
              {item.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="mt-1">{item.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing & Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Unit Price</Label>
                  <p className="text-lg font-semibold">${(item.unitPrice ?? 0).toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Cost Price</Label>
                  <p className="text-lg font-semibold">${(item.costPrice ?? 0).toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">On Hand</Label>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    {item.onHand}
                    {isLowStock && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Reorder Point</Label>
                  <p className="text-lg font-semibold">{item.reorderPoint}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Valuation Method</Label>
                <p>{item.valuationMethod}</p>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span>Active</span>
                  <Badge variant={item.isActive ? "default" : "secondary"}>
                    {item.isActive ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Track Inventory</span>
                  <Badge variant={item.isInventoryTracked ? "default" : "secondary"}>
                    {item.isInventoryTracked ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Service Item</span>
                  <Badge variant={item.isService ? "default" : "secondary"}>
                    {item.isService ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
              {item.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <p className="mt-1">{item.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={handleEdit} className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Edit Item
              </Button>
              <Button variant="outline" className="w-full">
                Duplicate Item
              </Button>
              <Button variant="outline" className="w-full">
                View History
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Item Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={item.isActive ? "default" : "secondary"}>
                  {item.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated:</span>
                <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
