"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import { ArrowLeft, Save, Building } from "lucide-react";

export default function NewWarehousePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    type: "MAIN",
    description: "",
    phone: "",
    email: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      region: "",
      postalCode: "",
      country: ""
    }
  });

  const setField = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const setAddr = (field: string, value: any) => setForm(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));

  const canSave = () => !!form.name && !!form.code;

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: any = {
        name: form.name,
        code: form.code,
        type: form.type,
        description: form.description || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
      };
      // Only send address if line1 and required fields provided
      if (form.address.line1 && form.address.city && form.address.region && form.address.postalCode && form.address.country) {
        payload.address = { ...form.address };
      }
      const res = await api.post("/v1/inventory/warehouses", payload);
      if (res.success) {
        toast.success("Warehouse created");
        router.push("/inventory/warehouses");
      } else {
        toast.error("Failed to create warehouse");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to create warehouse");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Warehouse</h1>
          <p className="text-muted-foreground">Create a new warehouse location</p>
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
                  <Input value={form.name} onChange={e => setField("name", e.target.value)} placeholder="Main Warehouse" />
                </div>
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input value={form.code} onChange={e => setField("code", e.target.value)} placeholder="WH-MAIN" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setField("type", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
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
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={e => setField("phone", e.target.value)} placeholder="(555) 555-5555" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={e => setField("email", e.target.value)} placeholder="warehouse@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={e => setField("description", e.target.value)} placeholder="Optional description" />
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
                <Input value={form.address.country} onChange={e => setAddr("country", e.target.value.toUpperCase())} placeholder="US" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={handleSave} disabled={saving || !canSave()}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Warehouse"}
              </Button>
              <Button className="w-full" variant="outline" onClick={() => router.back()} disabled={saving}>Cancel</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between"><span>Name</span><span>{form.name || '-'}</span></div>
              <div className="flex justify-between"><span>Code</span><span className="font-mono">{form.code || '-'}</span></div>
              <div className="flex justify-between"><span>Type</span><span>{form.type}</span></div>
              <div className="flex justify-between"><span>Country</span><span>{form.address.country || '-'}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


