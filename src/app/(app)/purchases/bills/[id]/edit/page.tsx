"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Calculator,
  Building,
  Calendar,
  DollarSign
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Vendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface BillItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface TaxCode {
  id: string;
  code: string;
  name: string;
  rate: number;
}

interface Bill {
  id: string;
  vendor?: {
    id: string;
    name: string;
  };
  billNumber?: string;
  billDate?: string;
  dueDate?: string;
  description?: string;
  terms?: string;
  notes?: string;
  items?: BillItem[];
}

const EditBillPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    vendorId: "",
    billNumber: "",
    billDate: "",
    dueDate: "",
    description: "",
    terms: "",
    notes: ""
  });

  // Data for dropdowns
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [taxCodes, setTaxCodes] = useState<TaxCode[]>([]);

  // Bill items
  const [items, setItems] = useState<BillItem[]>([]);
  const [newItem, setNewItem] = useState<BillItem>({
    id: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    total: 0
  });

  // Calculations
  const [subtotal, setSubtotal] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    loadVendors();
    loadTaxCodes();
    if (params.id) {
      loadBill(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    calculateTotals();
  }, [items]);

  const loadBill = async (billId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/v1/bills/${billId}`);
      
      if (response.success) {
        const bill = response.data as Bill;
        setFormData({
          vendorId: bill.vendor?.id || "",
          billNumber: bill.billNumber || "",
          billDate: bill.billDate || "",
          dueDate: bill.dueDate || "",
          description: bill.description || "",
          terms: bill.terms || "",
          notes: bill.notes || ""
        });
        setItems(bill.items || []);
      } else {
        toast.error("Failed to load bill");
        router.push("/purchases/bills");
      }
    } catch (error) {
      console.error("Error loading bill:", error);
      toast.error("Failed to load bill");
      router.push("/purchases/bills");
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    try {
      const response = await api.get("/v1/contacts?filter[type]=VENDOR");
      if (response.success) {
        setVendors((response.data as Vendor[]) || []);
      }
    } catch (error) {
      console.error("Error loading vendors:", error);
    }
  };

  const loadTaxCodes = async () => {
    try {
      const response = await api.get("/v1/taxes/codes");
      if (response.success) {
        setTaxCodes((response.data as TaxCode[]) || []);
      }
    } catch (error) {
      console.error("Error loading tax codes:", error);
    }
  };

  const calculateTotals = () => {
    const subtotalAmount = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotalAmount * 0.1; // 10% tax for now
    const grandTotalAmount = subtotalAmount + taxAmount;

    setSubtotal(subtotalAmount);
    setTotalTax(taxAmount);
    setGrandTotal(grandTotalAmount);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (field: keyof BillItem, value: any) => {
    setNewItem(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'quantity' || field === 'unitPrice') {
        updated.total = updated.quantity * updated.unitPrice;
      }
      
      return updated;
    });
  };

  const addItem = () => {
    if (!newItem.description.trim()) {
      toast.error("Please enter item description");
      return;
    }

    const item: BillItem = {
      ...newItem,
      id: Date.now().toString()
    };

    setItems(prev => [...prev, item]);
    setNewItem({
      id: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    if (!formData.vendorId) {
      toast.error("Please select a vendor");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    try {
      setSaving(true);

      const billData = {
        vendorId: formData.vendorId,
        billNumber: formData.billNumber,
        billDate: formData.billDate,
        dueDate: formData.dueDate,
        description: formData.description,
        terms: formData.terms,
        notes: formData.notes,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        })),
        subtotal,
        totalTax,
        grandTotal
      };

      const response = await api.put(`/v1/bills/${params.id}`, billData);

      if (response.success) {
        toast.success("Bill updated successfully");
        router.push(`/purchases/bills/${params.id}`);
      } else {
        toast.error("Failed to update bill");
      }
    } catch (error) {
      console.error("Error updating bill:", error);
      toast.error("Failed to update bill");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading bill...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <h1 className="text-3xl font-bold tracking-tight">Edit Bill</h1>
          <p className="text-muted-foreground">
            Update bill information and items
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bill Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Bill Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vendorId">Vendor *</Label>
                  <Select
                    value={formData.vendorId}
                    onValueChange={(value) => handleInputChange("vendorId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billNumber">Bill Number</Label>
                  <Input
                    id="billNumber"
                    value={formData.billNumber}
                    onChange={(e) => handleInputChange("billNumber", e.target.value)}
                    placeholder="Enter bill number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billDate">Bill Date *</Label>
                  <Input
                    id="billDate"
                    type="date"
                    value={formData.billDate}
                    onChange={(e) => handleInputChange("billDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter bill description..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="terms">Payment Terms</Label>
                  <Input
                    id="terms"
                    value={formData.terms}
                    onChange={(e) => handleInputChange("terms", e.target.value)}
                    placeholder="e.g., Net 30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Internal notes..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bill Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Bill Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Item Form */}
              <div className="grid gap-4 md:grid-cols-5">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="itemDescription">Description</Label>
                  <Input
                    id="itemDescription"
                    value={newItem.description}
                    onChange={(e) => handleItemChange("description", e.target.value)}
                    placeholder="Item description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemQuantity">Qty</Label>
                  <Input
                    id="itemQuantity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.quantity}
                    onChange={(e) => handleItemChange("quantity", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemUnitPrice">Unit Price</Label>
                  <Input
                    id="itemUnitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.unitPrice}
                    onChange={(e) => handleItemChange("unitPrice", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={formatCurrency(newItem.total)}
                      disabled
                      className="bg-muted"
                    />
                    <Button onClick={addItem} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              {items.length > 0 && (
                <div className="space-y-2">
                  <div className="grid gap-2 md:grid-cols-5 text-sm font-medium text-muted-foreground">
                    <div>Description</div>
                    <div className="text-center">Qty</div>
                    <div className="text-right">Unit Price</div>
                    <div className="text-right">Total</div>
                    <div className="text-center">Actions</div>
                  </div>
                  {items.map((item) => (
                    <div key={item.id} className="grid gap-2 md:grid-cols-5 items-center py-2 border-b">
                      <div className="text-sm">{item.description}</div>
                      <div className="text-center text-sm">{item.quantity}</div>
                      <div className="text-right text-sm">{formatCurrency(item.unitPrice)}</div>
                      <div className="text-right text-sm font-medium">{formatCurrency(item.total)}</div>
                      <div className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Bill Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>{formatCurrency(totalTax)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  onClick={handleSave}
                  disabled={saving || !formData.vendorId || items.length === 0}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditBillPage;
