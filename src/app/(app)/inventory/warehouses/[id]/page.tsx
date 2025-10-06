"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import { ArrowLeft, Save, Trash2, Building } from "lucide-react";

export default function WarehouseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warehouse, setWarehouse] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    type: "MAIN",
    description: "",
    phone: "",
    email: "",
    status: "ACTIVE",
    address: {
      line1: "",
      line2: "",
      city: "",
      region: "",
      postalCode: "",
      country: ""
    }
  });

  useEffect(() => {
    if (params.id) loadWarehouse();
  }, [params.id]);

  const setField = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const setAddr = (field: string, value: any) => setForm(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));

  const loadWarehouse = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>(`/v1/inventory/warehouses/${params.id}`);
      if (res.success) {
        const w = res.data as any;
        setWarehouse(w);
        setForm({
          name: w.name || "",
          code: w.code || "",
          type: w.type || "MAIN",
          description: w.description || "",
          phone: w.phone || "",
          email: w.email || "",
          status: w.status || "ACTIVE",
          address: {
            line1: w.address?.line1 || "",
            line2: w.address?.line2 || "",
            city: w.address?.city || "",
            region: w.address?.region || "",
            postalCode: w.address?.postalCode || "",
            country: w.address?.country || ""
          }
        });
      } else {
        toast.error("Failed to load warehouse");
        router.push("/inventory/warehouses");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load warehouse");
      router.push("/inventory/warehouses");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: any = {
        name: form.name,
        type: form.type,
        description: form.description || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address?.line1 && form.address?.city && form.address?.region && form.address?.postalCode && form.address?.country
          ? { ...form.address }
          : undefined
      };
      const res = await api.put(`/v1/inventory/warehouses/${params.id}`, payload);
      if (res.success) {
        toast.success("Warehouse updated");
        await loadWarehouse();
      } else {
        toast.error("Failed to update warehouse");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update warehouse");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm("Deactivate this warehouse?")) return;
    try {
      const res = await api.delete(`/v1/inventory/warehouses/${params.id}`);
      if (res.success) {
        toast.success("Warehouse deactivated");
        router.push("/inventory/warehouses");
      } else {
        toast.error("Failed to deactivate");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to deactivate");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Warehouse Not Found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{form.name}</h1>
            <p className="text-muted-foreground">Code: <span className="font-mono">{form.code}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={form.status === 'ACTIVE' ? 'default' : 'secondary'}>{form.status}</Badge>
          <Button onClick={handleSave} disabled={saving || !form.name}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={handleDeactivate}>
            <Trash2 className="h-4 w-4 mr-2" />
            Deactivate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={e => setField("name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input value={form.code} disabled />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setField("type", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAIN">Main</SelectItem>
                      <SelectItem value="BRANCH">Branch</SelectItem>
                      <SelectItem value="STORAGE">Storage</SelectItem>
                      <SelectItem value="RETAIL">Retail</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={e => setField("description", e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={e => setField("phone", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={e => setField("email", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Line 1</Label>
                <Input value={form.address.line1} onChange={e => setAddr("line1", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Line 2</Label>
                <Input value={form.address.line2} onChange={e => setAddr("line2", e.target.value)} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={form.address.city} onChange={e => setAddr("city", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Region/State</Label>
                  <Input value={form.address.region} onChange={e => setAddr("region", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input value={form.address.postalCode} onChange={e => setAddr("postalCode", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Country (2-letter)</Label>
                <Input value={form.address.country} onChange={e => setAddr("country", e.target.value.toUpperCase())} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between"><span>Name</span><span>{form.name || '-'}</span></div>
              <div className="flex justify-between"><span>Code</span><span className="font-mono">{form.code || '-'}</span></div>
              <div className="flex justify-between"><span>Type</span><span>{form.type}</span></div>
              <div className="flex justify-between"><span>Status</span><span>{form.status}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


