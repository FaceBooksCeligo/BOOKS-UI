"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

interface WarehouseOption { id: string; label: string; }
interface ItemOption { id: string; label: string; uom?: string; }

export default function NewTransferPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    itemId: "",
    fromWarehouseId: "",
    toWarehouseId: "",
    quantity: "",
    uom: "",
    description: "",
    reason: ""
  });

  useEffect(() => {
    loadLookups();
  }, []);

  const loadLookups = async () => {
    try {
      const [whRes, itemsRes] = await Promise.all([
        api.get<any[]>("/v1/inventory/warehouses"),
        api.get<any[]>("/v1/items")
      ]);
      if (whRes.success) {
        const options = (whRes.data as any[]).map((w: any) => ({ id: w._id || w.id, label: w.name || w.code || "Warehouse" }));
        setWarehouses(options);
      }
      if (itemsRes.success) {
        const options = (itemsRes.data as any[]).map((it: any) => ({ id: it._id || it.id, label: it.sku ? `${it.sku} - ${it.name}` : it.name, uom: it.uom || "EACH" }));
        setItems(options);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load lookups");
    }
  };

  const selectedItem = useMemo(() => items.find(i => i.id === form.itemId), [items, form.itemId]);
  const canSave = useMemo(() => {
    return (
      form.itemId && form.fromWarehouseId && form.toWarehouseId && form.fromWarehouseId !== form.toWarehouseId && Number(form.quantity) > 0
    );
  }, [form]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: any = {
        date: form.date,
        itemId: form.itemId,
        fromWarehouseId: form.fromWarehouseId,
        toWarehouseId: form.toWarehouseId,
        quantity: Number(form.quantity),
        uom: form.uom || selectedItem?.uom || "EACH",
        description: form.description || undefined,
        reason: form.reason || undefined
      };
      const res = await api.post("/v1/inventory/transfers", payload);
      if (res.success) {
        toast.success("Transfer created");
        router.push("/inventory/transfers");
      } else {
        toast.error("Failed to create transfer");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to create transfer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Inventory Transfer</h1>
          <p className="text-muted-foreground">Move stock from one warehouse to another</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Item</Label>
              <Select value={form.itemId} onValueChange={(v) => setForm({ ...form, itemId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map(i => (
                    <SelectItem key={i.id} value={i.id}>{i.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>From Warehouse</Label>
              <Select value={form.fromWarehouseId} onValueChange={(v) => setForm({ ...form, fromWarehouseId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To Warehouse</Label>
              <Select value={form.toWarehouseId} onValueChange={(v) => setForm({ ...form, toWarehouseId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.0001"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uom">Unit of Measure</Label>
              <Input
                id="uom"
                placeholder="EACH"
                value={form.uom}
                onChange={(e) => setForm({ ...form, uom: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.push("/inventory/transfers")}>Cancel</Button>
            <Button onClick={handleSave} disabled={!canSave || saving}>
              {saving ? "Saving..." : "Create Transfer"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


