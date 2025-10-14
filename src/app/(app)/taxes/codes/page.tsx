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
  Download,
  Upload,
  Calculator,
  Receipt,
  FileText,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/lib/auth";
import api, { apiClient } from "@/lib/api";
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
}

const TAX_TYPES = [
  { value: 'SALES_TAX', label: 'Sales Tax' },
  { value: 'VAT', label: 'VAT' },
  { value: 'GST', label: 'GST' },
  { value: 'INCOME_TAX', label: 'Income Tax' },
  { value: 'EXCISE_TAX', label: 'Excise Tax' },
  { value: 'OTHER', label: 'Other' }
];

export default function TaxCodesPage() {
  const router = useRouter();
  const { user, isAuthenticated, token, orgId } = useAuthStore();
  const [taxCodes, setTaxCodes] = useState<TaxCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ACTIVE");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTaxCode, setSelectedTaxCode] = useState<TaxCode | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    rate: 0,
    type: "SALES_TAX",
    jurisdiction: "",
    isActive: true,
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: ""
  });

  useEffect(() => {
    if (isAuthenticated && token && user) {
      loadTaxCodes();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token, user]);

  const loadTaxCodes = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit: 100
      };
      
      if (selectedStatus !== "ALL") {
        params["filter[status]"] = selectedStatus;
      }

      const response = await apiClient.get("/taxes/codes", { params });
      
      if (response.data.success) {
        const rawData = Array.isArray(response.data.data) 
          ? response.data.data 
          : response.data.data?.data || [];
        setTaxCodes(rawData);
      } else {
        toast.error("Failed to load tax codes");
      }
    } catch (error: any) {
      console.error("Error loading tax codes:", error);
      toast.error(error.response?.data?.message || "Failed to load tax codes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await apiClient.post("/taxes/codes", formData);
      
      if (response.data.success) {
        toast.success("Tax code created successfully");
        setShowCreateDialog(false);
        resetForm();
        loadTaxCodes();
      }
    } catch (error: any) {
      console.error("Error creating tax code:", error);
      toast.error(error.response?.data?.message || "Failed to create tax code");
    }
  };

  const handleUpdate = async () => {
    if (!selectedTaxCode) return;

    try {
      const response = await apiClient.put(`/taxes/codes/${selectedTaxCode._id}`, formData);
      
      if (response.data.success) {
        toast.success("Tax code updated successfully");
        setShowEditDialog(false);
        resetForm();
        loadTaxCodes();
      }
    } catch (error: any) {
      console.error("Error updating tax code:", error);
      toast.error(error.response?.data?.message || "Failed to update tax code");
    }
  };

  const handleDelete = async () => {
    if (!selectedTaxCode) return;

    try {
      const response = await apiClient.delete(`/taxes/codes/${selectedTaxCode._id}`);
      
      if (response.status === 204 || response.data?.success) {
        toast.success("Tax code deleted successfully");
        setShowDeleteDialog(false);
        setSelectedTaxCode(null);
        loadTaxCodes();
      }
    } catch (error: any) {
      console.error("Error deleting tax code:", error);
      toast.error(error.response?.data?.message || "Failed to delete tax code");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      rate: 0,
      type: "SALES_TAX",
      jurisdiction: "",
      isActive: true,
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: ""
    });
    setSelectedTaxCode(null);
  };

  const openEditDialog = (taxCode: TaxCode) => {
    setSelectedTaxCode(taxCode);
    setFormData({
      code: taxCode.code,
      name: taxCode.name,
      description: taxCode.description || "",
      rate: taxCode.rate,
      type: taxCode.type,
      jurisdiction: taxCode.jurisdiction,
      isActive: taxCode.isActive,
      effectiveFrom: taxCode.effectiveFrom ? new Date(taxCode.effectiveFrom).toISOString().split('T')[0] : "",
      effectiveTo: taxCode.effectiveTo ? new Date(taxCode.effectiveTo).toISOString().split('T')[0] : ""
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (taxCode: TaxCode) => {
    setSelectedTaxCode(taxCode);
    setShowDeleteDialog(true);
  };

  const filteredTaxCodes = taxCodes.filter(code => {
    const matchesSearch = searchTerm === "" || 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === "ALL" || code.type === selectedType;
    const matchesStatus = selectedStatus === "ALL" || 
      (selectedStatus === "ACTIVE" ? code.isActive : !code.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  const columns = [
    {
      key: "code",
      label: "Code",
      sortable: true,
      render: (row: TaxCode) => (
        <div className="font-medium">{row.code}</div>
      )
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (row: TaxCode) => (
        <div>
          <div className="font-medium">{row.name}</div>
          {row.description && (
            <div className="text-sm text-gray-500 truncate max-w-xs">{row.description}</div>
          )}
        </div>
      )
    },
    {
      key: "rate",
      label: "Rate",
      sortable: true,
      render: (row: TaxCode) => (
        <div className="font-medium">{row.rate}%</div>
      )
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (row: TaxCode) => {
        const typeLabel = TAX_TYPES.find(t => t.value === row.type)?.label || row.type;
        return (
          <Badge variant="outline">{typeLabel}</Badge>
        );
      }
    },
    {
      key: "jurisdiction",
      label: "Jurisdiction",
      sortable: true,
      render: (row: TaxCode) => (
        <div>{row.jurisdiction}</div>
      )
    },
    {
      key: "effectiveFrom",
      label: "Effective From",
      sortable: true,
      render: (row: TaxCode) => (
        <div className="text-sm">
          {new Date(row.effectiveFrom).toLocaleDateString()}
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: false,
      render: (row: TaxCode) => (
        <Badge variant={row.isActive ? "default" : "secondary"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row: TaxCode) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/taxes/codes/${row._id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEditDialog(row)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => openDeleteDialog(row)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Please log in to access tax codes</p>
              <Button onClick={() => router.push('/auth/login')}>
                Go to Login
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
        <div>
          <h1 className="text-3xl font-bold">Tax Codes</h1>
          <p className="text-gray-600">Manage tax codes and rates</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={loadTaxCodes}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Tax Code
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Codes</p>
                <p className="text-2xl font-bold">{taxCodes.length}</p>
              </div>
              <Receipt className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">
                  {taxCodes.filter(c => c.isActive).length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rate</p>
                <p className="text-2xl font-bold">
                  {taxCodes.length > 0 
                    ? (taxCodes.reduce((sum, c) => sum + c.rate, 0) / taxCodes.length).toFixed(2)
                    : 0}%
                </p>
              </div>
              <Calculator className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tax Types</p>
                <p className="text-2xl font-bold">
                  {new Set(taxCodes.map(c => c.type)).size}
                </p>
              </div>
              <Filter className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by code, name, or jurisdiction..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {TAX_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Codes List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredTaxCodes}
              searchable={false}
            />
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Tax Code</DialogTitle>
            <DialogDescription>
              Add a new tax code to your system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="e.g., GST-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Goods and Services Tax 10%"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter tax code description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate">Rate (%)</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.rate}
                  onChange={(e) => setFormData({...formData, rate: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAX_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Input
                id="jurisdiction"
                value={formData.jurisdiction}
                onChange={(e) => setFormData({...formData, jurisdiction: e.target.value})}
                placeholder="e.g., United States, California, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="effectiveFrom">Effective From</Label>
                <Input
                  id="effectiveFrom"
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData({...formData, effectiveFrom: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="effectiveTo">Effective To (Optional)</Label>
                <Input
                  id="effectiveTo"
                  type="date"
                  value={formData.effectiveTo}
                  onChange={(e) => setFormData({...formData, effectiveTo: e.target.value})}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Tax Code</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Tax Code</DialogTitle>
            <DialogDescription>
              Update tax code details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Code</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="e.g., GST-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Goods and Services Tax 10%"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter tax code description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-rate">Rate (%)</Label>
                <Input
                  id="edit-rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.rate}
                  onChange={(e) => setFormData({...formData, rate: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAX_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-jurisdiction">Jurisdiction</Label>
              <Input
                id="edit-jurisdiction"
                value={formData.jurisdiction}
                onChange={(e) => setFormData({...formData, jurisdiction: e.target.value})}
                placeholder="e.g., United States, California, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-effectiveFrom">Effective From</Label>
                <Input
                  id="edit-effectiveFrom"
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData({...formData, effectiveFrom: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-effectiveTo">Effective To (Optional)</Label>
                <Input
                  id="edit-effectiveTo"
                  type="date"
                  value={formData.effectiveTo}
                  onChange={(e) => setFormData({...formData, effectiveTo: e.target.value})}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Tax Code</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the tax code "{selectedTaxCode?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeleteDialog(false);
              setSelectedTaxCode(null);
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Tax Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
