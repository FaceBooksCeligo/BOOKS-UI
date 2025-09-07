"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save, Package, DollarSign, Settings } from "lucide-react";

interface ItemForm {
  sku: string;
  name: string;
  description: string;
  type: string;
  category: string;
  unitOfMeasure: string;
  unitPrice: number;
  costPrice: number;
  reorderPoint: number;
  valuationMethod: string;
  isActive: boolean;
  isInventoryTracked: boolean;
  isService: boolean;
  incomeAccount: string;
  expenseAccount: string;
  assetAccount: string;
  notes: string;
}

export default function NewItemPage() {
  const router = useRouter();
  const { user, orgId } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ItemForm>({
    sku: "",
    name: "",
    description: "",
    type: "INVENTORY",
    category: "",
    unitOfMeasure: "EACH",
    unitPrice: 0,
    costPrice: 0,
    reorderPoint: 0,
    valuationMethod: "FIFO",
    isActive: true,
    isInventoryTracked: true,
    isService: false,
    incomeAccount: "",
    expenseAccount: "",
    assetAccount: "",
    notes: "",
  });

  const handleInputChange = (field: keyof ItemForm, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const response = await api.post("/v1/items", {
        sku: form.sku,
        name: form.name,
        description: form.description,
        type: form.type,
        category: form.category,
        uom: form.unitOfMeasure, // Map unitOfMeasure to uom
        unitPrice: form.unitPrice,
        costPrice: form.costPrice,
        reorderPoint: form.reorderPoint,
        valuationMethod: form.valuationMethod,
        isActive: form.isActive,
        isInventoryTracked: form.isInventoryTracked,
        isService: form.isService,
        incomeAccountId: form.incomeAccount || null, // Map to incomeAccountId
        expenseAccountId: form.expenseAccount || null, // Map to expenseAccountId
        assetAccountId: form.assetAccount || null, // Map to assetAccountId
        notes: form.notes,
        organizationId: orgId,
        createdBy: user?._id,
        updatedBy: user?._id,
      });

      if (response.success) {
        toast.success("Item created successfully");
        router.push("/inventory/items");
      } else {
        toast.error("Failed to create item");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNew = async () => {
    try {
      setLoading(true);
      
      const response = await api.post("/v1/items", {
        sku: form.sku,
        name: form.name,
        description: form.description,
        type: form.type,
        category: form.category,
        uom: form.unitOfMeasure, // Map unitOfMeasure to uom
        unitPrice: form.unitPrice,
        costPrice: form.costPrice,
        reorderPoint: form.reorderPoint,
        valuationMethod: form.valuationMethod,
        isActive: form.isActive,
        isInventoryTracked: form.isInventoryTracked,
        isService: form.isService,
        incomeAccountId: form.incomeAccount || null, // Map to incomeAccountId
        expenseAccountId: form.expenseAccount || null, // Map to expenseAccountId
        assetAccountId: form.assetAccount || null, // Map to assetAccountId
        notes: form.notes,
        organizationId: orgId,
        createdBy: user?._id,
        updatedBy: user?._id,
      });

      if (response.success) {
        toast.success("Item created successfully");
        // Reset form for new item
        setForm({
          sku: "",
          name: "",
          description: "",
          type: "INVENTORY",
          category: "",
          unitOfMeasure: "EACH",
          unitPrice: 0,
          costPrice: 0,
          reorderPoint: 0,
          valuationMethod: "FIFO",
          isActive: true,
          isInventoryTracked: true,
          isService: false,
          incomeAccount: "",
          expenseAccount: "",
          assetAccount: "",
          notes: "",
        });
      } else {
        toast.error("Failed to create item");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create item");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">New Inventory Item</h1>
          <p className="text-muted-foreground">
            Create a new inventory item for your organization
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Enter the basic details for this inventory item
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={form.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                    placeholder="Enter SKU"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter item name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter item description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={form.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INVENTORY">Inventory</SelectItem>
                      <SelectItem value="SERVICE">Service</SelectItem>
                      <SelectItem value="NON_INVENTORY">Non-Inventory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    placeholder="Enter category"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
                <Select
                  value={form.unitOfMeasure}
                  onValueChange={(value) => handleInputChange("unitOfMeasure", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EACH">Each</SelectItem>
                    <SelectItem value="HOUR">Hour</SelectItem>
                    <SelectItem value="DAY">Day</SelectItem>
                    <SelectItem value="KG">Kilogram</SelectItem>
                    <SelectItem value="LB">Pound</SelectItem>
                    <SelectItem value="METER">Meter</SelectItem>
                    <SelectItem value="FOOT">Foot</SelectItem>
                    <SelectItem value="LITER">Liter</SelectItem>
                    <SelectItem value="GALLON">Gallon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing & Inventory
              </CardTitle>
              <CardDescription>
                Set pricing and inventory tracking options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={form.unitPrice}
                    onChange={(e) => handleInputChange("unitPrice", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    value={form.costPrice}
                    onChange={(e) => handleInputChange("costPrice", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reorderPoint">Reorder Point</Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    value={form.reorderPoint}
                    onChange={(e) => handleInputChange("reorderPoint", parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valuationMethod">Valuation Method</Label>
                  <Select
                    value={form.valuationMethod}
                    onValueChange={(value) => handleInputChange("valuationMethod", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIFO">FIFO (First In, First Out)</SelectItem>
                      <SelectItem value="LIFO">LIFO (Last In, First Out)</SelectItem>
                      <SelectItem value="AVERAGE">Average Cost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Mapping */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Account Mapping
              </CardTitle>
              <CardDescription>
                Map this item to chart of accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incomeAccount">Income Account *</Label>
                  <Input
                    id="incomeAccount"
                    value={form.incomeAccount}
                    onChange={(e) => handleInputChange("incomeAccount", e.target.value)}
                    placeholder="e.g., 4000 - Sales Revenue"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expenseAccount">Expense Account *</Label>
                  <Input
                    id="expenseAccount"
                    value={form.expenseAccount}
                    onChange={(e) => handleInputChange("expenseAccount", e.target.value)}
                    placeholder="e.g., 5000 - Cost of Goods Sold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assetAccount">Asset Account</Label>
                  <Input
                    id="assetAccount"
                    value={form.assetAccount}
                    onChange={(e) => handleInputChange("assetAccount", e.target.value)}
                    placeholder="e.g., 1200 - Inventory"
                  />
                </div>
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
              <CardDescription>
                Configure item behavior and tracking options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Active</Label>
                    <p className="text-sm text-muted-foreground">
                      Item is available for use
                    </p>
                  </div>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Track Inventory</Label>
                    <p className="text-sm text-muted-foreground">
                      Track quantity on hand
                    </p>
                  </div>
                  <Switch
                    checked={form.isInventoryTracked}
                    onCheckedChange={(checked) => handleInputChange("isInventoryTracked", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Service Item</Label>
                    <p className="text-sm text-muted-foreground">
                      This is a service rather than a physical item
                    </p>
                  </div>
                  <Switch
                    checked={form.isService}
                    onCheckedChange={(checked) => handleInputChange("isService", checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Additional notes about this item"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={handleSave} 
                className="w-full"
                disabled={loading || !form.sku || !form.name || !form.incomeAccount || !form.expenseAccount}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Item"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSaveAndNew}
                className="w-full"
                disabled={loading || !form.sku || !form.name || !form.incomeAccount || !form.expenseAccount}
              >
                <Save className="h-4 w-4 mr-2" />
                Save & New
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="w-full"
                disabled={loading}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Item Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">SKU:</span>
                <span className="font-mono">{form.sku || "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="truncate">{form.name || "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span>{form.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit Price:</span>
                <span>${form.unitPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={form.isActive ? "text-green-600" : "text-red-600"}>
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
