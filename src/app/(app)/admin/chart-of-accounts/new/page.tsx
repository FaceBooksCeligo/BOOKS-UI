"use client";

import { useState } from "react";
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
import { 
  Save, 
  ArrowLeft, 
  DollarSign,
  Building2,
  TrendingUp,
  TrendingDown,
  CreditCard
} from "lucide-react";

interface AccountForm {
  code: string;
  name: string;
  type: string;
  category: string;
  parentId?: string;
  description: string;
  isActive: boolean;
}

const accountTypes = [
  { value: "ASSET", label: "Asset", description: "Resources owned by the company" },
  { value: "LIABILITY", label: "Liability", description: "Debts and obligations" },
  { value: "EQUITY", label: "Equity", description: "Owner's interest in the company" },
  { value: "REVENUE", label: "Revenue", description: "Income from business operations" },
  { value: "EXPENSE", label: "Expense", description: "Costs of doing business" },
];

const accountCategories = {
  ASSET: [
    "Current Assets",
    "Fixed Assets",
    "Other Assets",
    "Bank Accounts",
    "Accounts Receivable",
    "Inventory",
    "Prepaid Expenses"
  ],
  LIABILITY: [
    "Current Liabilities",
    "Long-term Liabilities",
    "Accounts Payable",
    "Accrued Expenses",
    "Notes Payable",
    "Taxes Payable"
  ],
  EQUITY: [
    "Owner's Equity",
    "Retained Earnings",
    "Common Stock",
    "Preferred Stock",
    "Additional Paid-in Capital"
  ],
  REVENUE: [
    "Sales Revenue",
    "Service Revenue",
    "Interest Income",
    "Other Income",
    "Product Sales",
    "Consulting Revenue"
  ],
  EXPENSE: [
    "Cost of Goods Sold",
    "Operating Expenses",
    "Administrative Expenses",
    "Marketing Expenses",
    "Rent Expense",
    "Utilities Expense",
    "Salaries Expense",
    "Office Supplies"
  ]
};

export default function NewAccountPage() {
  const router = useRouter();
  const { user, orgId } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<AccountForm>({
    code: "",
    name: "",
    type: "",
    category: "",
    parentId: "",
    description: "",
    isActive: true,
  });

  const handleInputChange = (field: keyof AccountForm, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const response = await api.post("/v1/accounts", {
        ...form,
        organizationId: orgId,
        createdBy: user?._id,
        updatedBy: user?._id,
      });

      if (response.success) {
        toast.success("Account created successfully");
        router.push("/admin/chart-of-accounts");
      } else {
        toast.error("Failed to create account");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNew = async () => {
    try {
      setLoading(true);
      
      const response = await api.post("/v1/accounts", {
        ...form,
        organizationId: orgId,
        createdBy: user?._id,
        updatedBy: user?._id,
      });

      if (response.success) {
        toast.success("Account created successfully");
        // Reset form for new account
        setForm({
          code: "",
          name: "",
          type: "",
          category: "",
          parentId: "",
          description: "",
          isActive: true,
        });
      } else {
        toast.error("Failed to create account");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "ASSET": return <Building2 className="h-5 w-5" />;
      case "LIABILITY": return <CreditCard className="h-5 w-5" />;
      case "EQUITY": return <TrendingUp className="h-5 w-5" />;
      case "REVENUE": return <DollarSign className="h-5 w-5" />;
      case "EXPENSE": return <TrendingDown className="h-5 w-5" />;
      default: return <Building2 className="h-5 w-5" />;
    }
  };

  const getAvailableCategories = () => {
    return accountCategories[form.type as keyof typeof accountCategories] || [];
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
          <h1 className="text-3xl font-bold tracking-tight">New Account</h1>
          <p className="text-muted-foreground">
            Create a new account in your chart of accounts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Enter the basic details for this account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Account Code *</Label>
                  <Input
                    id="code"
                    value={form.code}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    placeholder="e.g., 1000, 4000, 5000"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Unique identifier for this account
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Account Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Cash, Sales Revenue, Office Supplies"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Account Type *</Label>
                  <Select
                    value={form.type}
                    onValueChange={(value) => {
                      handleInputChange("type", value);
                      handleInputChange("category", ""); // Reset category when type changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            {getAccountIcon(type.value)}
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {type.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) => handleInputChange("category", value)}
                    disabled={!form.type}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableCategories().map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Optional description for this account"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Settings
              </CardTitle>
              <CardDescription>
                Configure account behavior and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Account is available for use
                  </p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={handleSave} 
                className="w-full"
                disabled={loading || !form.code || !form.name || !form.type || !form.category}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Account"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSaveAndNew}
                className="w-full"
                disabled={loading || !form.code || !form.name || !form.type || !form.category}
              >
                <Save className="h-4 w-4 mr-2" />
                Save & New
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>

          {/* Account Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Account Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                {form.type && getAccountIcon(form.type)}
                <div>
                  <div className="font-mono text-sm font-medium">
                    {form.code || "XXXX"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {form.name || "Account Name"}
                  </div>
                </div>
              </div>
              {form.type && (
                <div className="text-xs text-muted-foreground">
                  Type: {accountTypes.find(t => t.value === form.type)?.label}
                </div>
              )}
              {form.category && (
                <div className="text-xs text-muted-foreground">
                  Category: {form.category}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Status: {form.isActive ? "Active" : "Inactive"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
