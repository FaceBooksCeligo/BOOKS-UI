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
import { 
  ArrowLeft,
  Save,
  Receipt,
  Percent,
  Calculator
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

const NewTaxCodePage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    rate: 0,
    type: "SALES",
    isActive: true
  });

  const taxTypes = [
    { value: "SALES", label: "Sales Tax" },
    { value: "PURCHASE", label: "Purchase Tax" },
    { value: "BOTH", label: "Both Sales & Purchase" }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (saveAndNew = false) => {
    if (!formData.code.trim()) {
      toast.error("Please enter tax code");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Please enter tax name");
      return;
    }

    if (formData.rate < 0 || formData.rate > 1) {
      toast.error("Please enter a valid tax rate (0-100%)");
      return;
    }

    try {
      setSaving(true);

      const taxCodeData = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        rate: formData.rate,
        type: formData.type,
        isActive: formData.isActive
      };

      const response = await api.post("/v1/taxes/codes", taxCodeData);

      if (response.success) {
        toast.success("Tax code created successfully");
        if (saveAndNew) {
          // Reset form
          setFormData({
            code: "",
            name: "",
            description: "",
            rate: 0,
            type: "SALES",
            isActive: true
          });
        } else {
          router.push("/admin/tax");
        }
      } else {
        toast.error("Failed to create tax code");
      }
    } catch (error) {
      console.error("Error creating tax code:", error);
      toast.error("Failed to create tax code");
    } finally {
      setSaving(false);
    }
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

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
          <h1 className="text-3xl font-bold tracking-tight">New Tax Code</h1>
          <p className="text-muted-foreground">
            Create a new tax code for your business
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="code">Tax Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    placeholder="e.g., GST, VAT, SALES"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Tax Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Goods and Services Tax"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter tax description..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tax Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Tax Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rate">Tax Rate *</Label>
                  <div className="relative">
                    <Input
                      id="rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.rate * 100}
                      onChange={(e) => handleInputChange("rate", parseFloat(e.target.value) / 100)}
                      placeholder="0.00"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      %
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter as percentage (e.g., 10 for 10%)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tax Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax type" />
                    </SelectTrigger>
                    <SelectContent>
                      {taxTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Tax Code Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code:</span>
                  <span className="font-medium">{formData.code || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{formData.name || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate:</span>
                  <span className="font-medium">{formatPercentage(formData.rate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">
                    {taxTypes.find(t => t.value === formData.type)?.label || "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium">
                    {formData.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  onClick={() => handleSave(false)}
                  disabled={saving || !formData.code || !formData.name || formData.rate < 0}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Tax Code"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSave(true)}
                  disabled={saving || !formData.code || !formData.name || formData.rate < 0}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save & New
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewTaxCodePage;