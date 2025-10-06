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
interface ProductOption { id: string; label: string; uom?: string; }
interface BomOption { id: string; label: string; }

export default function NewAssemblyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [boms, setBoms] = useState<BomOption[]>([]);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    productId: "",
    warehouseId: "",
    quantity: "",
    uom: "",
    description: "",
    reason: "",
    bomId: ""
  });

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    // Load BOM options for selected product
    (async () => {
      if (!form.productId) { setBoms([]); return; }
      try {
        // Use existing items endpoint and BOMs not exposed; leave BOM select optional
        // If BOMs had an endpoint, we would fetch here.
        setBoms([]);
      } catch (e: any) {
        toast.error(e?.message || "Failed to load BOMs");
      }
    })();
  }, [form.productId]);

  const loadLookups = async () => {
    try {
      const [whRes, itemsRes] = await Promise.all([
        api.get<any[]>("/v1/inventory/warehouses"),
        api.get<any[]>("/v1/items", { 'filter[type]': 'INVENTORY', 'filter[status]': 'ACTIVE' })
      ]);
      if (whRes.success) {
        const options = (whRes.data as any[]).map((w: any) => ({ id: w._id || w.id, label: w.name || w.code || "Warehouse" }));
        setWarehouses(options);
      }
      if (itemsRes.success) {
        const options = (itemsRes.data as any[]).map((it: any) => ({ id: it._id || it.id, label: it.sku ? `${it.sku} - ${it.name}` : it.name, uom: it.uom || "EACH" }));
        setProducts(options);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load lookups");
    }
  };

  const selectedProduct = useMemo(() => products.find(p => p.id === form.productId), [products, form.productId]);
  const canSave = useMemo(() => (
    form.productId && form.warehouseId && Number(form.quantity) > 0
  ), [form]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: any = {
        date: form.date,
        productId: form.productId,
        warehouseId: form.warehouseId,
        quantity: Number(form.quantity),
        uom: form.uom || selectedProduct?.uom || 'EACH',
        description: form.description || undefined,
        reason: form.reason || undefined,
        bomId: form.bomId || undefined
      };
      const res = await api.post("/v1/inventory/assemblies", payload);
      if (res.success) {
        toast.success("Assembly created");
        router.push("/inventory/assemblies");
      } else {
        toast.error("Failed to create assembly");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to create assembly");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Assembly</h1>
          <p className="text-muted-foreground">Build a finished good from components</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assembly Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Warehouse</Label>
              <Select value={form.warehouseId} onValueChange={(v) => setForm({ ...form, warehouseId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
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
              <Input id="quantity" type="number" min="0" step="0.0001" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uom">Unit of Measure</Label>
              <Input id="uom" placeholder="EACH" value={form.uom} onChange={(e) => setForm({ ...form, uom: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea id="reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.push("/inventory/assemblies")}>Cancel</Button>
            <Button onClick={handleSave} disabled={!canSave || saving}>{saving ? "Building..." : "Build"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


