"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Minus, 
  Search, 
  Calendar,
  User,
  Package,
  DollarSign,
  Save,
  ArrowLeft,
  X
} from "lucide-react";
import { format } from "date-fns";

interface Customer {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  address?: {
    line1?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
}

interface Item {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
  sku?: string;
  type: 'PRODUCT' | 'SERVICE';
}

interface CreditMemoItem {
  itemId: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

interface CreditMemoForm {
  creditMemoNumber: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  reference?: string;
  notes?: string;
  items: CreditMemoItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  status: 'DRAFT' | 'SENT' | 'APPLIED' | 'CANCELLED';
}

export default function NewCreditMemoPage() {
  const router = useRouter();
  const { user, orgId } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  const [form, setForm] = useState<CreditMemoForm>({
    creditMemoNumber: "",
    customerId: "",
    customerName: "",
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    reference: "",
    notes: "",
    items: [],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 0,
    status: 'DRAFT'
  });

  useEffect(() => {
    loadCustomers();
    loadItems();
    generateCreditMemoNumber();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await api.getContacts({ "filter[type]": "CUSTOMER" });
      if (response.success) {
        const customersData = Array.isArray(response.data) ? response.data : [];
        setCustomers(customersData);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  const loadItems = async () => {
    try {
      const response = await api.getItems({ "filter[status]": "ACTIVE" });
      if (response.success) {
        const itemsData = Array.isArray(response.data) ? response.data : [];
        setItems(itemsData);
      }
    } catch (error) {
      console.error("Error loading items:", error);
    }
  };

  const generateCreditMemoNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const creditNumber = `CM-${timestamp}`;
    setForm(prev => ({ ...prev, creditMemoNumber: creditNumber }));
  };

  const filteredCustomers = customers.filter(customer =>
    customer.displayName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(itemSearch.toLowerCase()))
  );

  const handleCustomerSelect = (customer: Customer) => {
    setForm(prev => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.displayName
    }));
    setCustomerSearch(customer.displayName);
    setShowCustomerDropdown(false);
  };

  const handleItemAdd = (item: Item) => {
    const newItem: CreditMemoItem = {
      itemId: item.id,
      itemName: item.name,
      description: item.description || "",
      quantity: 1,
      unitPrice: item.unitPrice,
      totalAmount: item.unitPrice
    };

    setForm(prev => {
      const newItems = [...prev.items, newItem];
      const subtotal = newItems.reduce((sum, item) => sum + item.totalAmount, 0);
      const taxAmount = subtotal * (prev.taxRate / 100);
      const totalAmount = subtotal + taxAmount;

      return {
        ...prev,
        items: newItems,
        subtotal,
        taxAmount,
        totalAmount
      };
    });

    setItemSearch("");
    setShowItemDropdown(false);
  };

  const handleItemUpdate = (index: number, field: keyof CreditMemoItem, value: any) => {
    setForm(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].totalAmount = newItems[index].quantity * newItems[index].unitPrice;
      }

      const subtotal = newItems.reduce((sum, item) => sum + item.totalAmount, 0);
      const taxAmount = subtotal * (prev.taxRate / 100);
      const totalAmount = subtotal + taxAmount;

      return {
        ...prev,
        items: newItems,
        subtotal,
        taxAmount,
        totalAmount
      };
    });
  };

  const handleItemRemove = (index: number) => {
    setForm(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const subtotal = newItems.reduce((sum, item) => sum + item.totalAmount, 0);
      const taxAmount = subtotal * (prev.taxRate / 100);
      const totalAmount = subtotal + taxAmount;

      return {
        ...prev,
        items: newItems,
        subtotal,
        taxAmount,
        totalAmount
      };
    });
  };

  const handleTaxRateChange = (taxRate: number) => {
    setForm(prev => {
      const taxAmount = prev.subtotal * (taxRate / 100);
      const totalAmount = prev.subtotal + taxAmount;

      return {
        ...prev,
        taxRate,
        taxAmount,
        totalAmount
      };
    });
  };

  const handleSubmit = async (status: 'DRAFT' | 'SENT') => {
    if (!form.customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (form.items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    try {
      setLoading(true);
      const creditMemoData = {
        ...form,
        status,
        orgId
      };

      const response = await api.createCreditMemo(creditMemoData);
      
      if (response.success) {
        toast.success(`Credit memo ${status === 'DRAFT' ? 'saved as draft' : 'sent'} successfully`);
        router.push("/sales/credits");
      } else {
        toast.error("Failed to create credit memo");
      }
    } catch (error: any) {
      console.error("Error creating credit memo:", error);
      toast.error("Failed to create credit memo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold">New Credit Memo</h1>
            <p className="text-muted-foreground">Create a new credit memo for a customer</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit('DRAFT')}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSubmit('SENT')}
            disabled={loading}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Send Credit Memo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Credit Memo Details */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Memo Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="creditMemoNumber">Credit Memo Number</Label>
                  <Input
                    id="creditMemoNumber"
                    value={form.creditMemoNumber}
                    onChange={(e) => setForm(prev => ({ ...prev, creditMemoNumber: e.target.value }))}
                    placeholder="CM-001"
                  />
                </div>
                <div>
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    value={form.reference}
                    onChange={(e) => setForm(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Invoice reference"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => setForm(prev => ({ ...prev, issueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes for the credit memo"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Label htmlFor="customer">Select Customer</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customer"
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                  />
                </div>
                
                {showCustomerDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <div className="font-medium">{customer.displayName}</div>
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                          {customer.phone && (
                            <div className="text-sm text-muted-foreground">{customer.phone}</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-muted-foreground">No customers found</div>
                    )}
                  </div>
                )}
              </div>

              {form.customerName && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">{form.customerName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setForm(prev => ({ ...prev, customerId: "", customerName: "" }));
                        setCustomerSearch("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add Item */}
              <div className="relative mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items to add..."
                    value={itemSearch}
                    onChange={(e) => {
                      setItemSearch(e.target.value);
                      setShowItemDropdown(true);
                    }}
                    onFocus={() => setShowItemDropdown(true)}
                  />
                </div>
                
                {showItemDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <div
                          key={item.id}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleItemAdd(item)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.sku && `SKU: ${item.sku}`}
                                {item.type && ` • ${item.type}`}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${item.unitPrice.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-muted-foreground">No items found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Items List */}
              {form.items.length > 0 ? (
                <div className="space-y-4">
                  {form.items.map((item, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-md">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.itemName}</h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleItemRemove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemUpdate(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                          <Input
                            id={`unitPrice-${index}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleItemUpdate(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>Total</Label>
                          <div className="h-10 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 flex items-center">
                            ${item.totalAmount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No items added yet. Search and select items to add them to the credit memo.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${form.subtotal.toFixed(2)}</span>
              </div>
              
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={form.taxRate}
                  onChange={(e) => handleTaxRateChange(parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="flex justify-between">
                <span>Tax Amount:</span>
                <span>${form.taxAmount.toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${form.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="w-full justify-center">
                {form.status}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
