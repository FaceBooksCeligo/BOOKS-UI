"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Building2,
  DollarSign,
  Calendar,
  User,
  Phone,
  MapPin
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Vendor {
  id: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
  status: 'ACTIVE' | 'INACTIVE';
  creditLimit?: number;
  paymentTerms?: {
    name: string;
    days: number;
  };
  taxId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function VendorsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/v1/contacts?filter[type]=VENDOR");
      setVendors((response.data as Vendor[]) || []);
    } catch (error: any) {
      console.error("Error loading vendors:", error);
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: string) => {
    router.push(`/purchases/vendors/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/purchases/vendors/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;
    
    try {
      await api.delete(`/v1/contacts/${id}`);
      toast.success("Vendor deleted successfully");
      loadVendors();
    } catch (error: any) {
      console.error("Error deleting vendor:", error);
      toast.error("Failed to delete vendor");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.patch(`/v1/contacts/${id}`, { status: newStatus });
      toast.success(`Vendor ${newStatus.toLowerCase()}d successfully`);
      loadVendors();
    } catch (error: any) {
      console.error("Error updating vendor status:", error);
      toast.error("Failed to update vendor status");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const columns = [
    {
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }: any) => {
        const vendor = row.original;
        if (!vendor) {
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">Loading...</div>
                <div className="text-sm text-muted-foreground">-</div>
              </div>
            </div>
          );
        }
        const fullName = vendor.fullName || `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || vendor.displayName || 'Unknown Vendor';
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">{fullName}</div>
              <div className="text-sm text-muted-foreground">{vendor.email || '-'}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }: any) => {
        const phone = row.original?.phone;
        return (
          <div className="text-sm">
            {phone || "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }: any) => {
        const address = row.original?.address;
        if (!address) return <div className="text-sm text-muted-foreground">—</div>;
        return (
          <div className="text-sm">
            <div>{address.line1}</div>
            {address.line2 && <div>{address.line2}</div>}
            <div>{address.city}, {address.region} {address.postalCode}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "creditLimit",
      header: "Credit Limit",
      cell: ({ row }: any) => {
        const creditLimit = row.original?.creditLimit;
        return (
          <div className="text-sm">
            {creditLimit ? formatCurrency(creditLimit) : "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "paymentTerms",
      header: "Payment Terms",
      cell: ({ row }: any) => {
        const terms = row.original?.paymentTerms;
        return (
          <div className="text-sm">
            {terms ? `${terms.name || 'Net'} ${terms.days || 0}` : "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original?.status;
        return (
          <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
            {status || "UNKNOWN"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }: any) => {
        const createdAt = row.original?.createdAt;
        return (
          <div className="text-sm text-muted-foreground">
            {createdAt ? formatDate(createdAt) : "—"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const vendor = row.original;
        if (!vendor || !vendor.id) {
          return (
            <Button variant="ghost" className="h-8 w-8 p-0" disabled>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          );
        }
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(vendor.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(vendor.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleToggleStatus(vendor.id, vendor.status)}
              >
                {vendor.status === 'ACTIVE' ? (
                  <>
                    <Building2 className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDelete(vendor.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const filteredVendors = vendors.filter(vendor => {
    if (!vendor) return false;
    
    const displayName = vendor.displayName || '';
    const firstName = vendor.firstName || '';
    const lastName = vendor.lastName || '';
    const email = vendor.email || '';
    
    return displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const vendorSummary = {
    total: vendors.length,
    active: vendors.filter(v => v && v.status === 'ACTIVE').length,
    inactive: vendors.filter(v => v && v.status === 'INACTIVE').length,
    totalCreditLimit: vendors.reduce((sum, v) => sum + (v?.creditLimit || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">Manage your vendor relationships</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => router.push('/purchases/vendors/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Vendor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorSummary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{vendorSummary.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Building2 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{vendorSummary.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credit Limit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(vendorSummary.totalCreditLimit)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-semibold leading-none tracking-tight">Vendors</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredVendors.length} of {vendors.length} vendors
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-8 w-64"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredVendors}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
