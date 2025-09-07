"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft,
  Save,
  CreditCard,
  Building,
  Wallet,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

const NewBankAccountPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    accountType: "",
    currency: "USD",
    currentBalance: 0,
    availableBalance: 0,
    status: "ACTIVE",
    description: "",
    routingNumber: "",
    swiftCode: "",
    iban: ""
  });

  const accountTypes = [
    { value: "CHECKING", label: "Checking", icon: CreditCard },
    { value: "SAVINGS", label: "Savings", icon: Building },
    { value: "CREDIT_CARD", label: "Credit Card", icon: CreditCard },
    { value: "LOAN", label: "Loan", icon: TrendingDown },
    { value: "INVESTMENT", label: "Investment", icon: TrendingUp },
    { value: "OTHER", label: "Other", icon: Wallet }
  ];

  const currencies = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
    { value: "AUD", label: "AUD - Australian Dollar" },
    { value: "JPY", label: "JPY - Japanese Yen" }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (saveAndNew = false) => {
    if (!formData.accountName.trim()) {
      toast.error("Please enter account name");
      return;
    }

    if (!formData.bankName.trim()) {
      toast.error("Please enter bank name");
      return;
    }

    if (!formData.accountType) {
      toast.error("Please select account type");
      return;
    }

    try {
      setSaving(true);

      const accountData = {
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
        accountType: formData.accountType,
        currency: formData.currency,
        currentBalance: parseFloat(formData.currentBalance.toString()),
        availableBalance: parseFloat(formData.availableBalance.toString()),
        status: formData.status,
        description: formData.description,
        routingNumber: formData.routingNumber,
        swiftCode: formData.swiftCode,
        iban: formData.iban
      };

      const response = await api.post("/v1/banking/accounts", accountData);

      if (response.success) {
        toast.success("Bank account created successfully");
        if (saveAndNew) {
          // Reset form
          setFormData({
            accountName: "",
            accountNumber: "",
            bankName: "",
            accountType: "",
            currency: "USD",
            currentBalance: 0,
            availableBalance: 0,
            status: "ACTIVE",
            description: "",
            routingNumber: "",
            swiftCode: "",
            iban: ""
          });
        } else {
          router.push("/banking/accounts");
        }
      } else {
        toast.error("Failed to create bank account");
      }
    } catch (error) {
      console.error("Error creating bank account:", error);
      toast.error("Failed to create bank account");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
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
          <h1 className="text-3xl font-bold tracking-tight">New Bank Account</h1>
          <p className="text-muted-foreground">
            Add a new bank account to track your finances
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name *</Label>
                  <Input
                    id="accountName"
                    value={formData.accountName}
                    onChange={(e) => handleInputChange("accountName", e.target.value)}
                    placeholder="e.g., Main Business Checking"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                    placeholder="Last 4 digits or full number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange("bankName", e.target.value)}
                    placeholder="e.g., Chase Bank"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type *</Label>
                  <Select
                    value={formData.accountType}
                    onValueChange={(value) => handleInputChange("accountType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleInputChange("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Optional description for this account..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Balance Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Balance Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currentBalance">Current Balance</Label>
                  <Input
                    id="currentBalance"
                    type="number"
                    step="0.01"
                    value={formData.currentBalance}
                    onChange={(e) => handleInputChange("currentBalance", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                  <p className="text-sm text-muted-foreground">
                    Current balance: {formatCurrency(formData.currentBalance, formData.currency)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availableBalance">Available Balance</Label>
                  <Input
                    id="availableBalance"
                    type="number"
                    step="0.01"
                    value={formData.availableBalance}
                    onChange={(e) => handleInputChange("availableBalance", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                  <p className="text-sm text-muted-foreground">
                    Available to spend: {formatCurrency(formData.availableBalance, formData.currency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Banking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Banking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input
                    id="routingNumber"
                    value={formData.routingNumber}
                    onChange={(e) => handleInputChange("routingNumber", e.target.value)}
                    placeholder="9-digit routing number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="swiftCode">SWIFT Code</Label>
                  <Input
                    id="swiftCode"
                    value={formData.swiftCode}
                    onChange={(e) => handleInputChange("swiftCode", e.target.value)}
                    placeholder="International SWIFT code"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    value={formData.iban}
                    onChange={(e) => handleInputChange("iban", e.target.value)}
                    placeholder="International Bank Account Number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Account Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Type:</span>
                  <span className="font-medium">
                    {accountTypes.find(t => t.value === formData.accountType)?.label || "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency:</span>
                  <span className="font-medium">{formData.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium capitalize">{formData.status.toLowerCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Balance:</span>
                  <span className="font-medium">{formatCurrency(formData.currentBalance, formData.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available Balance:</span>
                  <span className="font-medium">{formatCurrency(formData.availableBalance, formData.currency)}</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  onClick={() => handleSave(false)}
                  disabled={saving || !formData.accountName || !formData.bankName || !formData.accountType}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Account"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSave(true)}
                  disabled={saving || !formData.accountName || !formData.bankName || !formData.accountType}
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

export default NewBankAccountPage;
