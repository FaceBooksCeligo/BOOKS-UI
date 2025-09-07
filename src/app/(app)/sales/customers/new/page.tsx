"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, User } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function NewCustomerPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      region: "",
      postalCode: "",
      country: "US"
    },
    customer: {
      terms: {
        name: "Net",
        days: 30
      },
      creditLimit: "",
      taxId: ""
    }
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any || {}),
          [child]: value
        }
      }));
    } else if (field.includes('address.')) {
      const addressField = field.replace('address.', '');
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (field.includes('customer.terms.')) {
      const termsField = field.replace('customer.terms.', '');
      setFormData(prev => ({
        ...prev,
        customer: {
          ...prev.customer,
          terms: {
            ...prev.customer.terms,
            [termsField]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.displayName && !formData.firstName && !formData.lastName) {
        toast.error("Please provide a display name or first/last name");
        return;
      }

      // Only include address if at least one field is provided
      const customerData: any = {
        displayName: formData.displayName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        type: 'CUSTOMER',
        status: 'ACTIVE',
        customer: formData.customer
      };

      // Only include address if it has meaningful data
      if (formData.address.line1 || formData.address.city || formData.address.region || formData.address.postalCode) {
        customerData.address = formData.address;
      }

      await api.post("/v1/contacts/customers", customerData);
      toast.success("Customer created successfully");
      router.push("/sales/customers");
    } catch (error: any) {
      console.error("Error creating customer:", error);
      toast.error(error.message || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNew = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.displayName && !formData.firstName && !formData.lastName) {
        toast.error("Please provide a display name or first/last name");
        return;
      }

      // Only include address if at least one field is provided
      const customerData: any = {
        displayName: formData.displayName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        type: 'CUSTOMER',
        status: 'ACTIVE',
        customer: formData.customer
      };

      // Only include address if it has meaningful data
      if (formData.address.line1 || formData.address.city || formData.address.region || formData.address.postalCode) {
        customerData.address = formData.address;
      }

      await api.post("/v1/contacts/customers", customerData);
      toast.success("Customer created successfully");
      
      // Reset form for new customer
      setFormData({
        displayName: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: {
          line1: "",
          line2: "",
          city: "",
          region: "",
          postalCode: "",
          country: "US"
        },
        customer: {
          terms: {
            name: "Net",
            days: 30
          },
          creditLimit: "",
          taxId: ""
        }
      });
    } catch (error: any) {
      console.error("Error creating customer:", error);
      toast.error(error.message || "Failed to create customer");
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
          <h1 className="text-3xl font-bold tracking-tight">New Customer</h1>
          <p className="text-muted-foreground">Create a new customer record</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange("displayName", e.target.value)}
                    placeholder="Company or individual name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="customer@example.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address.line1">Address Line 1</Label>
                <Input
                  id="address.line1"
                  value={formData.address.line1}
                  onChange={(e) => handleInputChange("address.line1", e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address.line2">Address Line 2</Label>
                <Input
                  id="address.line2"
                  value={formData.address.line2}
                  onChange={(e) => handleInputChange("address.line2", e.target.value)}
                  placeholder="Suite 100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address.city">City</Label>
                  <Input
                    id="address.city"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange("address.city", e.target.value)}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address.region">State/Region</Label>
                  <Input
                    id="address.region"
                    value={formData.address.region}
                    onChange={(e) => handleInputChange("address.region", e.target.value)}
                    placeholder="NY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address.postalCode">Postal Code</Label>
                  <Input
                    id="address.postalCode"
                    value={formData.address.postalCode}
                    onChange={(e) => handleInputChange("address.postalCode", e.target.value)}
                    placeholder="10001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.country">Country</Label>
                <Select
                  value={formData.address.country}
                  onValueChange={(value) => handleInputChange("address.country", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="IT">Italy</SelectItem>
                    <SelectItem value="ES">Spain</SelectItem>
                    <SelectItem value="JP">Japan</SelectItem>
                    <SelectItem value="CN">China</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Customer Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer.creditLimit">Credit Limit</Label>
                  <Input
                    id="customer.creditLimit"
                    type="number"
                    step="0.01"
                    value={formData.customer.creditLimit}
                    onChange={(e) => handleInputChange("customer.creditLimit", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer.taxId">Tax ID</Label>
                  <Input
                    id="customer.taxId"
                    value={formData.customer.taxId}
                    onChange={(e) => handleInputChange("customer.taxId", e.target.value)}
                    placeholder="12-3456789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer.terms.name">Payment Terms</Label>
                  <Select
                    value={formData.customer.terms.name}
                    onValueChange={(value) => handleInputChange("customer.terms.name", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Net">Net</SelectItem>
                      <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                      <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                      <SelectItem value="2/10 Net 30">2/10 Net 30</SelectItem>
                      <SelectItem value="1/15 Net 30">1/15 Net 30</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer.terms.days">Days</Label>
                  <Input
                    id="customer.terms.days"
                    type="number"
                    value={formData.customer.terms.days}
                    onChange={(e) => handleInputChange("customer.terms.days", parseInt(e.target.value) || 0)}
                    placeholder="30"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Customer
              </Button>
              <Button 
                onClick={handleSaveAndNew} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Save & New
              </Button>
              <Button 
                onClick={() => router.back()} 
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
