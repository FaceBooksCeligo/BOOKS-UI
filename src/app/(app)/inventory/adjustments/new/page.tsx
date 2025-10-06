"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import { ArrowLeft, Save, Package, Warehouse } from "lucide-react";

type AdjustmentType = "INCREASE" | "DECREASE" | "COUNT";

export default function NewInventoryAdjustmentPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0,10),
    type: "INCREASE" as AdjustmentType,
    itemId: "",
    warehouseId: "",
    quantity: 0,
    unitCost: "",
    countedQuantity: "",
    reason: "",
    description: "",
    uom: "EACH"
  });

  useEffect(() => {
    Promise.all([loadItems(), loadWarehouses()]).finally(() => setLoading(false));
  }, []);

  const loadItems = async () => {
    try {
      const res = await api.get<any[]>("/v1/items?filter[status]=ACTIVE&limit=200");
      if (res.success) setItems((res.data as any[]) || []);
    } catch (e) {
      toast.error("Failed to load items");
    }
  };

  const loadWarehouses = async () => {
    try {
      const res = await api.get<any[]>("/v1/inventory/warehouses");
      if (res.success) setWarehouses((res.data as any[]) || []);
    } catch (e) {
      toast.error("Failed to load warehouses");
    }
  };

  const setField = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const canSave = () => {
    if (!form.itemId || !form.warehouseId || !form.type) return false;
    if (form.type === "COUNT") return form.countedQuantity !== "";
    return Number(form.quantity) > 0;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: any = {
        date: form.date,
        type: form.type,
        itemId: form.itemId,
        warehouseId: form.warehouseId,
        reason: form.reason || undefined,
        description: form.description || undefined,
        uom: form.uom
      };
      if (form.type === "COUNT") {
        payload.countedQuantity = Number(form.countedQuantity);
      } else {
        payload.quantity = Number(form.quantity);
        if (form.unitCost !== "") payload.unitCost = Number(form.unitCost);
      }
      const res = await api.post("/v1/inventory/adjustments", payload);
      if (res.success) {
        toast.success("Adjustment created");
        router.push("/inventory/adjustments");
      } else {
        toast.error("Failed to create adjustment");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to create adjustment");
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
          <h1 className="text-3xl font-bold tracking-tight">New Inventory Adjustment</h1>
          <p className="text-muted-foreground">Adjust on-hand quantities and reflect corrections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Adjustment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={e => setField("date", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setField("type", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INCREASE">Increase</SelectItem>
                      <SelectItem value="DECREASE">Decrease</SelectItem>
                      <SelectItem value="COUNT">Count</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Item</Label>
                  <Select value={form.itemId} onValueChange={v => setField("itemId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? "Loading items..." : "Select item"} />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((it: any) => (
                        <SelectItem key={it._id || it.id} value={it._id || it.id}>
                          {`${it.sku} - ${it.name}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Warehouse</Label>
                  <Select value={form.warehouseId} onValueChange={v => setField("warehouseId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? "Loading warehouses..." : "Select warehouse"} />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((wh: any) => (
                        <SelectItem key={wh._id || wh.id} value={wh._id || wh.id}>
                          {`${wh.code || ''} ${wh.name ? '- ' + wh.name : ''}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {form.type !== "COUNT" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" value={form.quantity} onChange={e => setField("quantity", Number(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Cost (optional)</Label>
                    <Input type="number" step="0.01" value={form.unitCost} onChange={e => setField("unitCost", e.target.value)} />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Counted Quantity</Label>
                    <Input type="number" value={form.countedQuantity} onChange={e => setField("countedQuantity", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit of Measure</Label>
                    <Input value={form.uom} onChange={e => setField("uom", e.target.value)} />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Reason</Label>
                <Input value={form.reason} onChange={e => setField("reason", e.target.value)} placeholder="e.g., Cycle count variance" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setField("description", e.target.value)} rows={3} />
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
                {saving ? "Saving..." : "Save Adjustment"}
              </Button>
              <Button className="w-full" variant="outline" onClick={() => router.back()} disabled={saving}>Cancel</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between"><span>Date</span><span>{form.date}</span></div>
              <div className="flex justify-between"><span>Type</span><span>{form.type}</span></div>
              <div className="flex justify-between"><span>Quantity</span><span>{form.type === "COUNT" ? form.countedQuantity : form.quantity}</span></div>
              {form.type !== "COUNT" && (
                <div className="flex justify-between"><span>Unit Cost</span><span>{form.unitCost || '-'}</span></div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


