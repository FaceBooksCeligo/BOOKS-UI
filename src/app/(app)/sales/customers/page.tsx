"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/auth";
import api, { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";

interface Customer {
  id: string;
  displayName?: string;
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
  customer?: {
    creditLimit?: number;
    terms?: {
      name?: string;
      days?: number;
    };
  };
  status?: string;
  createdAt?: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const { user, isAuthenticated, token, orgId } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log("useEffect triggered - isAuthenticated:", isAuthenticated, "token:", !!token, "user:", !!user);
    if (isAuthenticated && token && user) {
      console.log("All auth conditions met, loading customers...");
      loadCustomers();
    } else {
      console.log("Auth conditions not met, setting loading to false");
      setLoading(false);
    }
  }, [isAuthenticated, token, user]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      console.log("Loading customers...");
      console.log("Current auth state:", { isAuthenticated, token: !!token, user: !!user, orgId });
      console.log("API client state:", { 
        hasToken: !!apiClient.token, 
        hasOrgId: !!apiClient.orgId 
      });
      const response = await api.getContacts({ "filter[type]": "CUSTOMER" });
      console.log("API Response:", response);
      
      if (response.success) {
        console.log("Raw customer data:", response.data);
        console.log("Response structure:", response);
        
        // Handle both array and object responses
        const rawData = Array.isArray(response.data) ? response.data : response.data.data || [];
        console.log("Raw data array:", rawData);
        
        const customerData = rawData.map((customer: any) => {
          console.log("Processing customer:", customer);
          return {
            id: customer._id || customer.id,
            displayName: customer.displayName || customer.fullName,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            customer: customer.customer,
            status: customer.status,
            createdAt: customer.createdAt
          };
        });
        console.log("Processed customer data:", customerData);
        setCustomers(customerData);
      } else {
        console.error("API response not successful:", response);
        toast.error("Failed to load customers");
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      customer?.displayName?.toLowerCase().includes(searchLower) ||
      customer?.firstName?.toLowerCase().includes(searchLower) ||
      customer?.lastName?.toLowerCase().includes(searchLower) ||
      customer?.email?.toLowerCase().includes(searchLower) ||
      customer?.phone?.toLowerCase().includes(searchLower)
    );
  });

  // Debug logging
  console.log("Render - isAuthenticated:", isAuthenticated, "token:", !!token, "user:", !!user);
  console.log("Customers state:", customers);
  console.log("Filtered customers:", filteredCustomers);
  console.log("Customers length:", customers.length);
  console.log("First customer:", customers[0]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleView = (customerId: string) => {
    console.log("handleView called with customerId:", customerId);
    router.push(`/sales/customers/${customerId}`);
  };

  const handleEdit = (customerId: string) => {
    console.log("handleEdit called with customerId:", customerId);
    router.push(`/sales/customers/${customerId}/edit`);
  };

  const handleDelete = async (customerId: string) => {
    console.log("handleDelete called with customerId:", customerId);
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        console.log("Deleting customer:", customerId);
        await api.delete(`/v1/contacts/${customerId}`);
        toast.success("Customer deleted successfully");
        loadCustomers();
      } catch (error) {
        console.error("Error deleting customer:", error);
        toast.error("Failed to delete customer");
      }
    }
  };

  const columns = [
    {
      accessorKey: "displayName",
      header: "Customer",
      cell: ({ row }: any) => {
        const customer = row.original || row;
        console.log("Customer cell - row:", row);
        console.log("Customer cell - customer:", customer);
        
        // Add null checks and debugging
        if (!customer) {
          console.log("Customer is undefined in table cell");
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">No Data</div>
                <div className="text-sm text-gray-500">-</div>
              </div>
            </div>
          );
        }
        
        const fullName = customer.displayName || 
          `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 
          'Unnamed Customer';
        
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{fullName}</div>
              <div className="text-sm text-gray-500">{customer.email || '-'}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }: any) => {
        const phone = (row.original || row)?.phone;
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            {phone || "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }: any) => {
        const address = (row.original || row)?.address;
        if (!address) return <div className="text-sm text-gray-500">—</div>;
        return (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 mt-0.5" />
            <div>
              <div>{address.line1}</div>
              {address.line2 && <div>{address.line2}</div>}
              <div>{address.city}, {address.region} {address.postalCode}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "customer.creditLimit",
      header: "Credit Limit",
      cell: ({ row }: any) => {
        const creditLimit = (row.original || row)?.customer?.creditLimit;
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CreditCard className="h-4 w-4" />
            {creditLimit ? formatCurrency(creditLimit) : "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "customer.terms",
      header: "Payment Terms",
      cell: ({ row }: any) => {
        const terms = (row.original || row)?.customer?.terms;
        return (
          <div className="text-sm text-gray-600">
            {terms ? `${terms.name || 'Net'} ${terms.days || 0}` : "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = (row.original || row)?.status;
        return (
          <Badge 
            variant={status === "ACTIVE" ? "default" : "secondary"}
            className={status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
          >
            {status || "INACTIVE"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }: any) => {
        const createdAt = (row.original || row)?.createdAt;
        return (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            {createdAt ? formatDate(createdAt) : "—"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const customer = row.original || row;
        console.log("Actions cell - customer:", customer);
        console.log("Actions cell - customer.id:", customer?.id);
        
        if (!customer || !customer.id) {
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
              <DropdownMenuItem onClick={() => {
                console.log("View clicked for customer:", customer.id);
                handleView(customer.id);
              }}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                console.log("Edit clicked for customer:", customer.id);
                handleEdit(customer.id);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  console.log("Delete clicked for customer:", customer.id);
                  handleDelete(customer.id);
                }}
                className="text-red-600"
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

  const stats = {
    total: customers.length,
    active: customers.filter(c => c && c.status === 'ACTIVE').length,
    inactive: customers.filter(c => c && c.status === 'INACTIVE').length,
    withCreditLimit: customers.filter(c => c && c.customer?.creditLimit).length,
  };

  // Show login message if not authenticated
  if (!isAuthenticated || !token || !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
              <p className="text-gray-600">Please log in to view customers</p>
            </div>
          </div>
          
          {/* Debug Information */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Is Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}</p>
                <p><strong>Token:</strong> {token ? "Present" : "Missing"}</p>
                <p><strong>User:</strong> {user ? "Present" : "Missing"}</p>
                <p><strong>Loading:</strong> {loading ? "Yes" : "No"}</p>
                <p><strong>Customers Count:</strong> {customers.length}</p>
                <div className="mt-4">
                  <Button 
                    onClick={async () => {
                      try {
                        console.log("Attempting manual login...");
                        const response = await fetch('http://localhost:3000/v1/auth/login', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            email: 'sanayhcu01@gmail.com',
                            password: 'password123'
                          })
                        });
                        const data = await response.json();
                        console.log("Login response:", data);
                        
                        if (data.data) {
                          // Manually set auth state
                          const { setAuth } = useAuthStore.getState();
                          setAuth({
                            token: data.data.accessToken,
                            user: data.data.user,
                            orgId: data.data.user.orgId
                          });
                          console.log('Manual login successful, reloading customers...');
                          // Reload customers
                          loadCustomers();
                        }
                      } catch (error) {
                        console.error('Manual login failed:', error);
                      }
                    }}
                    className="bg-gray-900 hover:bg-gray-800 text-white mr-2"
                  >
                    Manual Login
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/auth/login'}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Go to Login Page
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">You need to be logged in to view customers.</p>
                <Button 
                  onClick={() => window.location.href = '/auth/login'}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600">Manage your customer relationships and information</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Export
            </Button>
            <Button 
              onClick={loadCustomers}
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Refresh Data
            </Button>
            <Button 
              onClick={() => router.push("/sales/customers/new")}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Customer
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">With Credit Limit</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.withCreditLimit}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customers Table */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Customers</CardTitle>
                <p className="text-sm text-gray-600">{filteredCustomers.length} of {customers.length} customers</p>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2 text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  Loading customers...
                </div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-500">No customers found</div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredCustomers}
                loading={loading}
                className="border-0"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
