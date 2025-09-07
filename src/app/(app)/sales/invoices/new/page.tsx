"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save, Send, Plus, Trash2, Edit, X } from "lucide-react";

interface InvoiceItem {
  id: string;
  itemId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  netPrice: number;
  extendedAmount: number;
  taxCodeId?: string;
  taxAmount: number;
  unitOfMeasure: string;
}

interface TaxCode {
  _id: string;
  code: string;
  name: string;
  rate: number;
  type: string;
}

interface Item {
  _id: string;
  sku: string;
  name: string;
  description?: string;
  type: string;
  pricing: {
    basePrice: string;
    currency: string;
  };
  uom: string;
  taxCodeId?: string;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [taxCodes, setTaxCodes] = useState<TaxCode[]>([]);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    notes: "",
    status: "DRAFT"
  });
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState({
    itemId: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
    taxCodeId: "",
    unitOfMeasure: "ea"
  });

  // Load data on component mount
  useEffect(() => {
    loadItems();
    loadTaxCodes();
  }, []);

  const loadItems = async () => {
    try {
      const response = await api.get("/v1/items?filter[status]=ACTIVE&limit=100");
      if (response.success) {
        setItems(response.data);
      }
    } catch (error) {
      console.error("Failed to load items:", error);
    }
  };

  const loadTaxCodes = async () => {
    try {
      const response = await api.get("/v1/taxes/codes?filter[status]=ACTIVE&limit=100");
      if (response.success) {
        setTaxCodes(response.data);
      }
    } catch (error) {
      console.error("Failed to load tax codes:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemInputChange = (field: string, value: string | number) => {
    setItemForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateItemTotals = (item: Partial<InvoiceItem>) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const discountPercent = item.discountPercent || 0;
    
    const lineAmount = quantity * unitPrice;
    const discountAmount = lineAmount * (discountPercent / 100);
    const netPrice = unitPrice - (unitPrice * discountPercent / 100);
    const extendedAmount = lineAmount - discountAmount;
    
    // Calculate tax
    const taxCode = taxCodes.find(tc => tc._id === item.taxCodeId);
    const taxAmount = taxCode ? extendedAmount * (taxCode.rate / 100) : 0;
    
    return {
      discountAmount,
      netPrice,
      extendedAmount,
      taxAmount
    };
  };

  const calculateInvoiceTotals = () => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.extendedAmount, 0);
    const totalTax = invoiceItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const total = subtotal + totalTax;
    
    return { subtotal, totalTax, total };
  };

  const handleAddItem = () => {
    if (!itemForm.description.trim()) {
      toast.error("Please enter item description");
      return;
    }

    const totals = calculateItemTotals(itemForm);
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      itemId: itemForm.itemId || undefined,
      description: itemForm.description,
      quantity: itemForm.quantity,
      unitPrice: itemForm.unitPrice,
      discountPercent: itemForm.discountPercent,
      discountAmount: totals.discountAmount,
      netPrice: totals.netPrice,
      extendedAmount: totals.extendedAmount,
      taxCodeId: itemForm.taxCodeId || undefined,
      taxAmount: totals.taxAmount,
      unitOfMeasure: itemForm.unitOfMeasure
    };

    setInvoiceItems(prev => [...prev, newItem]);
    resetItemForm();
    setShowItemForm(false);
    toast.success("Item added to invoice");
  };

  const handleEditItem = (item: InvoiceItem) => {
    setEditingItem(item);
    setItemForm({
      itemId: item.itemId || "",
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      taxCodeId: item.taxCodeId || "",
      unitOfMeasure: item.unitOfMeasure
    });
    setShowItemForm(true);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;

    const totals = calculateItemTotals(itemForm);
    const updatedItem: InvoiceItem = {
      ...editingItem,
      itemId: itemForm.itemId || undefined,
      description: itemForm.description,
      quantity: itemForm.quantity,
      unitPrice: itemForm.unitPrice,
      discountPercent: itemForm.discountPercent,
      discountAmount: totals.discountAmount,
      netPrice: totals.netPrice,
      extendedAmount: totals.extendedAmount,
      taxCodeId: itemForm.taxCodeId || undefined,
      taxAmount: totals.taxAmount,
      unitOfMeasure: itemForm.unitOfMeasure
    };

    setInvoiceItems(prev => prev.map(item => item.id === editingItem.id ? updatedItem : item));
    resetItemForm();
    setEditingItem(null);
    setShowItemForm(false);
    toast.success("Item updated");
  };

  const handleRemoveItem = (itemId: string) => {
    setInvoiceItems(prev => prev.filter(item => item.id !== itemId));
    toast.success("Item removed from invoice");
  };

  const resetItemForm = () => {
    setItemForm({
      itemId: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      taxCodeId: "",
      unitOfMeasure: "ea"
    });
  };

  const handleItemSelect = (itemId: string) => {
    const item = items.find(i => i._id === itemId);
    if (item) {
      setItemForm(prev => ({
        ...prev,
        itemId: item._id,
        description: item.name,
        unitPrice: parseFloat(item.pricing.basePrice),
        unitOfMeasure: item.uom,
        taxCodeId: item.taxCodeId || ""
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Implement save to API
      toast.success("Invoice saved as draft");
      router.push("/sales/invoices");
    } catch (error: any) {
      toast.error(error.message || "Failed to save invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // TODO: Implement submit to API
      toast.success("Invoice submitted");
      router.push("/sales/invoices");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Invoice</h1>
          <p className="text-muted-foreground">
            Create a new invoice
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>
                Enter the basic information for this invoice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange("customerName", e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Customer Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                    placeholder="customer@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Invoice Date *</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => handleInputChange("invoiceDate", e.target.value)}
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
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Additional notes for this invoice"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoice Items</CardTitle>
                  <CardDescription>
                    Add items to this invoice
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowItemForm(true)}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {invoiceItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No items added yet</p>
                  <p className="text-sm">Click "Add Item" to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoiceItems.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{item.description}</h4>
                            {item.itemId && (
                              <Badge variant="secondary" className="text-xs">
                                {items.find(i => i._id === item.itemId)?.sku || 'SKU'}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Qty:</span> {item.quantity} {item.unitOfMeasure}
                            </div>
                            <div>
                              <span className="font-medium">Price:</span> ${item.unitPrice.toFixed(2)}
                            </div>
                            <div>
                              <span className="font-medium">Discount:</span> {item.discountPercent}%
                            </div>
                            <div>
                              <span className="font-medium">Total:</span> ${item.extendedAmount.toFixed(2)}
                            </div>
                          </div>
                          {item.taxCodeId && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              <span className="font-medium">Tax:</span> {taxCodes.find(tc => tc._id === item.taxCodeId)?.name} (${item.taxAmount.toFixed(2)})
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Item Form Modal - Same as Sales Order */}
              {showItemForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        {editingItem ? 'Edit Item' : 'Add Item'}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowItemForm(false);
                          setEditingItem(null);
                          resetItemForm();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="itemSelect">Select Item (Optional)</Label>
                          <Select
                            value={itemForm.itemId}
                            onValueChange={handleItemSelect}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose from inventory" />
                            </SelectTrigger>
                            <SelectContent>
                              {items.map((item) => (
                                <SelectItem key={item._id} value={item._id}>
                                  {item.sku} - {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
                          <Input
                            id="unitOfMeasure"
                            value={itemForm.unitOfMeasure}
                            onChange={(e) => handleItemInputChange("unitOfMeasure", e.target.value)}
                            placeholder="ea, kg, lb, etc."
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Input
                          id="description"
                          value={itemForm.description}
                          onChange={(e) => handleItemInputChange("description", e.target.value)}
                          placeholder="Item description"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="0"
                            step="0.01"
                            value={itemForm.quantity}
                            onChange={(e) => handleItemInputChange("quantity", parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="unitPrice">Unit Price</Label>
                          <Input
                            id="unitPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            value={itemForm.unitPrice}
                            onChange={(e) => handleItemInputChange("unitPrice", parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="discountPercent">Discount %</Label>
                          <Input
                            id="discountPercent"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={itemForm.discountPercent}
                            onChange={(e) => handleItemInputChange("discountPercent", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="taxCode">Tax Code</Label>
                        <Select
                          value={itemForm.taxCodeId}
                          onValueChange={(value) => handleItemInputChange("taxCodeId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select tax code" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No Tax</SelectItem>
                            {taxCodes.map((taxCode) => (
                              <SelectItem key={taxCode._id} value={taxCode._id}>
                                {taxCode.code} - {taxCode.name} ({taxCode.rate}%)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Preview totals */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Line Totals</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Line Amount:</span>
                            <div className="font-medium">
                              ${(itemForm.quantity * itemForm.unitPrice).toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Discount:</span>
                            <div className="font-medium">
                              ${(itemForm.quantity * itemForm.unitPrice * itemForm.discountPercent / 100).toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Net Amount:</span>
                            <div className="font-medium">
                              ${(itemForm.quantity * itemForm.unitPrice * (1 - itemForm.discountPercent / 100)).toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tax:</span>
                            <div className="font-medium">
                              ${calculateItemTotals(itemForm).taxAmount.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowItemForm(false);
                            setEditingItem(null);
                            resetItemForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={editingItem ? handleUpdateItem : handleAddItem}
                        >
                          {editingItem ? 'Update Item' : 'Add Item'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateInvoiceTotals().subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${calculateInvoiceTotals().totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${calculateInvoiceTotals().total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={handleSubmit}
                disabled={loading}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
