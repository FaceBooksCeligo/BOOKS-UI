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
  Save,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  DollarSign,
  FileText
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface CompanyInfo {
  id: string;
  name: string;
  legalName: string;
  taxId: string;
  registrationNumber: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  fiscalYear: {
    startMonth: number;
    startDay: number;
  };
  currency: string;
  timezone: string;
  description?: string;
  logo?: string;
}

const CompanyPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState<CompanyInfo>({
    id: "",
    name: "",
    legalName: "",
    taxId: "",
    registrationNumber: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      region: "",
      postalCode: "",
      country: "US"
    },
    contact: {
      phone: "",
      email: "",
      website: ""
    },
    fiscalYear: {
      startMonth: 1,
      startDay: 1
    },
    currency: "USD",
    timezone: "America/New_York",
    description: "",
    logo: ""
  });

  const currencies = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
    { value: "AUD", label: "AUD - Australian Dollar" },
    { value: "JPY", label: "JPY - Japanese Yen" }
  ];

  const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
    { value: "Europe/Paris", label: "Central European Time (CET)" },
    { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" }
  ];

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get<CompanyInfo>("/v1/organizations/me");
      
      if (response.success) {
        const data = response.data as any;
        // Ensure all nested objects are properly initialized
        setFormData({
          id: data.id || "",
          name: data.name || "",
          legalName: data.legalName || "",
          taxId: data.taxId || "",
          registrationNumber: data.registrationNumber || "",
          address: {
            line1: data.address?.line1 || "",
            line2: data.address?.line2 || "",
            city: data.address?.city || "",
            region: data.address?.region || "",
            postalCode: data.address?.postalCode || "",
            country: data.address?.country || "US"
          },
          contact: {
            phone: data.contact?.phone || "",
            email: data.contact?.email || "",
            website: data.contact?.website || ""
          },
          fiscalYear: {
            startMonth: data.fiscalYear?.startMonth || 1,
            startDay: data.fiscalYear?.startDay || 1
          },
          currency: data.currency || "USD",
          timezone: data.timezone || "America/New_York",
          description: data.description || "",
          logo: data.logo || ""
        });
      } else {
        toast.error("Failed to load company information");
      }
    } catch (error) {
      console.error("Error loading company info:", error);
      toast.error("Failed to load company information");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const parentObj = (prev as any)[parent] || {};
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value,
          },
        } as CompanyInfo;
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await api.put("/v1/organizations/me", formData);

      if (response.success) {
        toast.success("Company information updated successfully");
      } else {
        toast.error("Failed to update company information");
      }
    } catch (error) {
      console.error("Error updating company info:", error);
      toast.error("Failed to update company information");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading company information...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Information</h1>
          <p className="text-muted-foreground">
            Manage your company details and settings
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalName">Legal Name</Label>
              <Input
                id="legalName"
                value={formData.legalName}
                onChange={(e) => handleInputChange("legalName", e.target.value)}
                placeholder="Enter legal company name"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => handleInputChange("taxId", e.target.value)}
                  placeholder="Enter tax ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                  placeholder="Enter registration number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter company description"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address.line1">Address Line 1 *</Label>
              <Input
                id="address.line1"
                value={formData.address.line1}
                onChange={(e) => handleInputChange("address.line1", e.target.value)}
                placeholder="Enter street address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.line2">Address Line 2</Label>
              <Input
                id="address.line2"
                value={formData.address.line2}
                onChange={(e) => handleInputChange("address.line2", e.target.value)}
                placeholder="Apartment, suite, etc."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address.city">City *</Label>
                <Input
                  id="address.city"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange("address.city", e.target.value)}
                  placeholder="Enter city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.region">State/Region *</Label>
                <Input
                  id="address.region"
                  value={formData.address.region}
                  onChange={(e) => handleInputChange("address.region", e.target.value)}
                  placeholder="Enter state or region"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address.postalCode">Postal Code *</Label>
                <Input
                  id="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={(e) => handleInputChange("address.postalCode", e.target.value)}
                  placeholder="Enter postal code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.country">Country *</Label>
                <Select
                  value={formData.address.country}
                  onValueChange={(value) => handleInputChange("address.country", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact.phone">Phone Number</Label>
              <Input
                id="contact.phone"
                value={formData.contact.phone}
                onChange={(e) => handleInputChange("contact.phone", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact.email">Email Address</Label>
              <Input
                id="contact.email"
                type="email"
                value={formData.contact.email}
                onChange={(e) => handleInputChange("contact.email", e.target.value)}
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact.website">Website</Label>
              <Input
                id="contact.website"
                value={formData.contact.website}
                onChange={(e) => handleInputChange("contact.website", e.target.value)}
                placeholder="Enter website URL"
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
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
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => handleInputChange("timezone", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((timezone) => (
                    <SelectItem key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fiscal Year Start</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  value={formData.fiscalYear.startMonth.toString()}
                  onValueChange={(value) => handleInputChange("fiscalYear.startMonth", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.fiscalYear.startDay}
                  onChange={(e) => handleInputChange("fiscalYear.startDay", parseInt(e.target.value))}
                  placeholder="Day"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyPage;