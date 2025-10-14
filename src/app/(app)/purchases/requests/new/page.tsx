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

interface ItemOption { id: string; label: string; uom?: string; }
interface VendorOption { id: string; label: string; }

export default function NewPurchaseRequestPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [lines, setLines] = useState([{ itemId: "", description: "", qty: "1", uom: "", unitCost: "" }]);
  const [form, setForm] = useState({
    number: `PR-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random()*9000+1000)}`,
    requestDate: new Date().toISOString().slice(0, 10),
    department: "",
    vendorId: "",
    description: ""
  });

  useEffect(() => { loadLookups(); }, []);

  const loadLookups = async () => {
    try {
      const [itemsRes, vendorsRes] = await Promise.all([
        api.get<any[]>("/v1/items", { 'filter[status]': 'ACTIVE' }),
        api.get<any[]>("/v1/contacts", { 'filter[type]': 'VENDOR', 'filter[status]': 'ACTIVE' })
      ]);
      if (itemsRes.success) setItems((itemsRes.data as any[]).map((it: any) => ({ id: it._id || it.id, label: it.sku ? `${it.sku} - ${it.name}` : it.name, uom: it.uom || 'EACH' })));
      if (vendorsRes.success) setVendors((vendorsRes.data as any[]).map((v: any) => ({ id: v._id || v.id, label: v.name || (v.companyName || v.email) })));
    } catch (e: any) {
      toast.error(e?.message || "Failed to load lookups");
    }
  };

  const canSave = useMemo(() => form.number && lines.length > 0 && lines.every(l => Number(l.qty) > 0 && (l.itemId || l.description)), [form, lines]);

  const handleAddLine = () => setLines([...lines, { itemId: "", description: "", qty: "1", uom: "", unitCost: "" }]);
  const handleRemoveLine = (idx: number) => setLines(lines.filter((_, i) => i !== idx));

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: any = {
        number: form.number,
        requestDate: form.requestDate,
        department: form.department || undefined,
        vendorId: form.vendorId || undefined,
        description: form.description || undefined,
        lines: lines.map((l, i) => ({ seq: i + 1, itemId: l.itemId || undefined, description: l.description || undefined, qty: l.qty || '1', uom: l.uom || 'EACH', unitCost: l.unitCost ? Number(l.unitCost) : undefined }))
      };
      const res = await api.post("/v1/purchases/requests", payload);
      if (res.success) {
        toast.success("Purchase request created");
        router.push("/purchases/requests");
      } else {
        toast.error("Failed to create request");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to create request");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Purchase Request</h1>
          <p className="text-muted-foreground">Create a purchase requisition</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Request #</Label>
              <Input id="number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={form.requestDate} onChange={(e) => setForm({ ...form, requestDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Select value={form.vendorId} onValueChange={(v) => setForm({ ...form, vendorId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map(v => (<SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Lines</div>
              <Button variant="outline" onClick={handleAddLine}>Add Line</Button>
            </div>
            <div className="space-y-3">
              {lines.map((l, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <Label className="text-xs">Item</Label>
                    <Select value={l.itemId} onValueChange={(v) => setLines(lines.map((x, i) => i === idx ? { ...x, itemId: v } : x))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map(it => (<SelectItem key={it.id} value={it.id}>{it.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-4">
                    <Label className="text-xs">Description</Label>
                    <Input value={l.description} onChange={(e) => setLines(lines.map((x, i) => i === idx ? { ...x, description: e.target.value } : x))} />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-xs">Qty</Label>
                    <Input type="number" min="0" step="0.0001" value={l.qty} onChange={(e) => setLines(lines.map((x, i) => i === idx ? { ...x, qty: e.target.value } : x))} />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-xs">UOM</Label>
                    <Input value={l.uom} onChange={(e) => setLines(lines.map((x, i) => i === idx ? { ...x, uom: e.target.value } : x))} />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-xs">Unit Cost</Label>
                    <Input type="number" min="0" step="0.01" value={l.unitCost} onChange={(e) => setLines(lines.map((x, i) => i === idx ? { ...x, unitCost: e.target.value } : x))} />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button variant="ghost" onClick={() => handleRemoveLine(idx)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.push("/purchases/requests")}>Cancel</Button>
            <Button onClick={handleSave} disabled={!canSave || saving}>{saving ? "Saving..." : "Create Request"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


