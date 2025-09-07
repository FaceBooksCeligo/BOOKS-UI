"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Printer,
  Mail,
  Building,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Bill {
  id: string;
  billNumber: string;
  vendor: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      city?: string;
      region?: string;
      postalCode?: string;
      country?: string;
    };
  };
  billDate: string;
  dueDate: string;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  totalAmount: number;
  paidAmount: number;
  balance: number;
  description?: string;
  terms?: string;
  notes?: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  totalTax: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
}

const BillDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadBill(params.id as string);
    }
  }, [params.id]);

  const loadBill = async (billId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/v1/bills/${billId}`);
      
      if (response.success) {
        setBill(response.data as Bill);
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { variant: "secondary" as const, label: "Draft", icon: FileText },
      PENDING: { variant: "default" as const, label: "Pending", icon: Clock },
      PAID: { variant: "default" as const, label: "Paid", icon: CheckCircle },
      OVERDUE: { variant: "destructive" as const, label: "Overdue", icon: AlertCircle },
      CANCELLED: { variant: "outline" as const, label: "Cancelled", icon: FileText }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDelete = async () => {
    if (!bill) return;
    
    if (confirm("Are you sure you want to delete this bill? This action cannot be undone.")) {
      try {
        const response = await api.delete(`/v1/bills/${bill.id}`);
        
        if (response.success) {
          toast.success("Bill deleted successfully");
          router.push("/purchases/bills");
        } else {
          toast.error("Failed to delete bill");
        }
      } catch (error) {
        console.error("Error deleting bill:", error);
        toast.error("Failed to delete bill");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading bill...</div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Bill not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold tracking-tight">Bill {bill.billNumber}</h1>
            <p className="text-muted-foreground">
              {formatDate(bill.billDate)} • {getStatusBadge(bill.status)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/purchases/bills/${bill.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
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
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Vendor</h4>
                  <div className="space-y-1">
                    <div className="font-medium">{bill.vendor.name}</div>
                    {bill.vendor.email && (
                      <div className="text-sm text-muted-foreground">{bill.vendor.email}</div>
                    )}
                    {bill.vendor.phone && (
                      <div className="text-sm text-muted-foreground">{bill.vendor.phone}</div>
                    )}
                    {bill.vendor.address && (
                      <div className="text-sm text-muted-foreground">
                        {[
                          bill.vendor.address.line1,
                          bill.vendor.address.city,
                          bill.vendor.address.region,
                          bill.vendor.address.postalCode
                        ].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Bill Details</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Bill Number:</span>
                      <span className="text-sm font-medium">{bill.billNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Bill Date:</span>
                      <span className="text-sm font-medium">{formatDate(bill.billDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Due Date:</span>
                      <span className="text-sm font-medium">{formatDate(bill.dueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      {getStatusBadge(bill.status)}
                    </div>
                  </div>
                </div>
              </div>

              {bill.description && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
                  <p className="text-sm">{bill.description}</p>
                </div>
              )}

              {(bill.terms || bill.notes) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {bill.terms && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Payment Terms</h4>
                      <p className="text-sm">{bill.terms}</p>
                    </div>
                  )}
                  {bill.notes && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Notes</h4>
                      <p className="text-sm">{bill.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bill Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Bill Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2 md:grid-cols-4 text-sm font-medium text-muted-foreground border-b pb-2">
                  <div>Description</div>
                  <div className="text-center">Quantity</div>
                  <div className="text-right">Unit Price</div>
                  <div className="text-right">Total</div>
                </div>
                {bill.items.map((item, index) => (
                  <div key={item.id || index} className="grid gap-2 md:grid-cols-4 items-center py-2 border-b">
                    <div className="text-sm">{item.description}</div>
                    <div className="text-center text-sm">{item.quantity}</div>
                    <div className="text-right text-sm">{formatCurrency(item.unitPrice)}</div>
                    <div className="text-right text-sm font-medium">{formatCurrency(item.total)}</div>
                  </div>
                ))}
              </div>
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
                  <span>{formatCurrency(bill.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>{formatCurrency(bill.totalTax)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(bill.grandTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid:</span>
                  <span>{formatCurrency(bill.paidAmount)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Balance:</span>
                  <span className={bill.balance > 0 ? "text-red-600" : "text-green-600"}>
                    {formatCurrency(bill.balance)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(bill.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{formatDate(bill.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BillDetailPage;
