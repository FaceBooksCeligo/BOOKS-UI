"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar,
  Calculator,
  MapPin,
  FileText,
  Activity,
  Clock,
  User,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";

interface TaxCode {
  _id: string;
  code: string;
  name: string;
  description?: string;
  rate: number;
  type: string;
  jurisdiction: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
}

const TAX_TYPES: { [key: string]: string } = {
  SALES_TAX: 'Sales Tax',
  VAT: 'VAT',
  GST: 'GST',
  INCOME_TAX: 'Income Tax',
  EXCISE_TAX: 'Excise Tax',
  OTHER: 'Other'
};

export default function TaxCodeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [taxCode, setTaxCode] = useState<TaxCode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && params.id) {
      loadTaxCode();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, params.id]);

  const loadTaxCode = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/taxes/codes/${params.id}`);
      
      if (response.data.success) {
        setTaxCode(response.data.data);
      } else {
        toast.error("Failed to load tax code");
        router.push("/taxes/codes");
      }
    } catch (error: any) {
      console.error("Error loading tax code:", error);
      toast.error(error.response?.data?.message || "Failed to load tax code");
      router.push("/taxes/codes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!taxCode || !confirm(`Are you sure you want to delete the tax code "${taxCode.name}"?`)) {
      return;
    }

    try {
      const response = await apiClient.delete(`/taxes/codes/${taxCode._id}`);
      
      if (response.status === 204 || response.data?.success) {
        toast.success("Tax code deleted successfully");
        router.push("/taxes/codes");
      }
    } catch (error: any) {
      console.error("Error deleting tax code:", error);
      toast.error(error.response?.data?.message || "Failed to delete tax code");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Please log in to access tax code details</p>
              <Button onClick={() => router.push('/auth/login')}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!taxCode) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Tax code not found</p>
              <Button onClick={() => router.push('/taxes/codes')}>
                Back to Tax Codes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/taxes/codes')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{taxCode.code}</h1>
              <Badge variant={taxCode.isActive ? "default" : "secondary"}>
                {taxCode.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-gray-600">{taxCode.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => router.push(`/taxes/codes?edit=${taxCode._id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tax Code Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Code Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Code</div>
                  <div className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    {taxCode.code}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Name</div>
                  <div className="font-medium">{taxCode.name}</div>
                </div>
              </div>

              {taxCode.description && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Description</div>
                  <div className="text-gray-700">{taxCode.description}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Tax Rate</div>
                  <div className="font-medium text-lg flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-gray-400" />
                    {taxCode.rate}%
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Type</div>
                  <Badge variant="outline" className="mt-1">
                    {TAX_TYPES[taxCode.type] || taxCode.type}
                  </Badge>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Jurisdiction</div>
                <div className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {taxCode.jurisdiction}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Effective From</div>
                  <div className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {new Date(taxCode.effectiveFrom).toLocaleDateString()}
                  </div>
                </div>
                {taxCode.effectiveTo && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Effective To</div>
                    <div className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {new Date(taxCode.effectiveTo).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                <div className="flex items-center gap-2">
                  {taxCode.isActive ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600 font-medium">Inactive</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax Calculation Example</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-2">Sample Calculation</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Amount:</span>
                      <span className="font-medium">$1,000.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax Rate ({taxCode.rate}%):</span>
                      <span className="font-medium">
                        ${(1000 * taxCode.rate / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-medium">Total with Tax:</span>
                      <span className="font-bold text-lg">
                        ${(1000 * (1 + taxCode.rate / 100)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Activity className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Created</div>
                    <div className="text-sm text-gray-500">
                      {new Date(taxCode.createdAt).toLocaleString()}
                    </div>
                    {taxCode.createdBy && (
                      <div className="text-xs text-gray-400 mt-1">
                        By {taxCode.createdBy.name || taxCode.createdBy.email}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Last Updated</div>
                    <div className="text-sm text-gray-500">
                      {new Date(taxCode.updatedAt).toLocaleString()}
                    </div>
                    {taxCode.updatedBy && (
                      <div className="text-xs text-gray-400 mt-1">
                        By {taxCode.updatedBy.name || taxCode.updatedBy.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  navigator.clipboard.writeText(taxCode.code);
                  toast.success("Tax code copied to clipboard");
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Copy Tax Code
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.print()}
              >
                <FileText className="h-4 w-4 mr-2" />
                Print Details
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  const data = JSON.stringify(taxCode, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `tax-code-${taxCode.code}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("Tax code exported");
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export as JSON
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-500">ID</div>
                <div className="text-xs font-mono text-gray-600 break-all">
                  {taxCode._id}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Tax Type Category</div>
                <div className="text-sm">
                  {TAX_TYPES[taxCode.type] || taxCode.type}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Applicable Period</div>
                <div className="text-sm">
                  {(() => {
                    const from = new Date(taxCode.effectiveFrom);
                    const to = taxCode.effectiveTo ? new Date(taxCode.effectiveTo) : null;
                    const now = new Date();
                    
                    if (now < from) {
                      return <span className="text-yellow-600">Future (Not yet effective)</span>;
                    } else if (to && now > to) {
                      return <span className="text-gray-500">Expired</span>;
                    } else {
                      return <span className="text-green-600">Currently Effective</span>;
                    }
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
