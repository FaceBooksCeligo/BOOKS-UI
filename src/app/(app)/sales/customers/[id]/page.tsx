"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Calendar,
  User,
  Building,
  FileText,
  DollarSign
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

interface Customer {
  id: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  type: 'CUSTOMER';
  status: 'ACTIVE' | 'INACTIVE';
  customer?: {
    terms?: {
      name?: string;
      days?: number;
    };
    creditLimit?: string;
    taxId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CustomerPageProps {
  params: {
    id: string;
  };
}

export default function CustomerDetailPage({ params }: CustomerPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadCustomer();
    }
  }, [params.id]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/v1/contacts/${params.id}`);
      setCustomer(response.data as Customer);
    } catch (error: any) {
      console.error("Error loading customer:", error);
      toast.error("Failed to load customer");
      router.push("/sales/customers");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFullName = (customer: Customer) => {
    return `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.displayName;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Customer not found</p>
      </div>
    );
  }

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
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{getFullName(customer)}</h1>
              <p className="text-muted-foreground">Customer Details</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={customer.status === "ACTIVE" ? "default" : "secondary"}>
            {customer.status}
          </Badge>
          <Button onClick={() => router.push(`/sales/customers/${customer.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                  <p className="text-sm">{customer.displayName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {customer.email || "—"}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">First Name</label>
                  <p className="text-sm">{customer.firstName || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                  <p className="text-sm">{customer.lastName || "—"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {customer.phone || "—"}
                </p>
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
            <CardContent>
              {customer.address ? (
                <div className="space-y-2">
                  <p className="text-sm">{customer.address.line1}</p>
                  {customer.address.line2 && <p className="text-sm">{customer.address.line2}</p>}
                  <p className="text-sm">
                    {customer.address.city}, {customer.address.region} {customer.address.postalCode}
                  </p>
                  <p className="text-sm">{customer.address.country}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No address provided</p>
              )}
            </CardContent>
          </Card>

          {/* Customer Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Customer Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Credit Limit</label>
                  <p className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {customer.customer?.creditLimit ? formatCurrency(customer.customer.creditLimit) : "—"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tax ID</label>
                  <p className="text-sm">{customer.customer?.taxId || "—"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Payment Terms</label>
                <p className="text-sm">
                  {customer.customer?.terms ? 
                    `${customer.customer.terms.name || 'Net'} ${customer.customer.terms.days || 0}` : 
                    "—"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Create Estimate
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Create Sales Order
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </CardContent>
          </Card>

          {/* Customer Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Customer Since</label>
                <p className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(customer.createdAt)}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(customer.updatedAt)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Customer Type</label>
                <p className="text-sm flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {customer.type}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
