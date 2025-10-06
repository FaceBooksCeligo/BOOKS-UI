"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { ArrowLeft, Factory, Calendar, Package, Warehouse, RotateCcw } from "lucide-react";

interface IssueLine {
  id: string;
  number: string;
  itemId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface AssemblyDetail {
  id: string;
  buildNumber: string;
  buildDate: string;
  product: { id: string; label: string; uom?: string };
  warehouse: { id: string; label: string };
  quantity: number;
  unitCost: number;
  totalCost: number;
  description?: string;
  reason?: string;
  issues: IssueLine[];
}

export default function AssemblyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || "";
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AssemblyDetail | null>(null);
  const [reversing, setReversing] = useState(false);

  useEffect(() => {
    if (id) load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get<AssemblyDetail>(`/v1/inventory/assemblies/${id}`);
      if (res.success) {
        setData(res.data as any);
      } else {
        toast.error("Failed to load assembly");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load assembly");
    } finally {
      setLoading(false);
    }
  };

  const reverseAssembly = async () => {
    if (!confirm("Reverse this assembly? This will reverse the receipt and component issues.")) return;
    try {
      setReversing(true);
      const res = await api.post(`/v1/inventory/assemblies/${id}/reverse`);
      if (res.success) {
        toast.success("Assembly reversed");
        router.push("/inventory/assemblies");
      } else {
        toast.error("Failed to reverse assembly");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to reverse assembly");
    } finally {
      setReversing(false);
    }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleString();
  const fmtCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push("/inventory/assemblies")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Assembly Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={reverseAssembly} disabled={reversing || loading}>
            <RotateCcw className="h-4 w-4 mr-2" />
            {reversing ? "Reversing..." : "Reverse"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5 text-muted-foreground" />
            {data?.buildNumber || (loading ? "Loading..." : "Assembly")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-muted-foreground">Loading assembly...</div>
          ) : !data ? (
            <div className="text-destructive">Assembly not found</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-medium">{fmtDate(data.buildDate)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Product</div>
                    <div className="font-medium">{data.product?.label}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Warehouse className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Warehouse</div>
                    <div className="font-medium">{data.warehouse?.label}</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Quantity</div>
                  <div className="font-medium">{data.quantity} {data.product?.uom || ""}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Unit Cost</div>
                  <div className="font-medium">{fmtCurrency(data.unitCost)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Cost</div>
                  <div className="font-medium">{fmtCurrency(data.totalCost)}</div>
                </div>
              </div>

              {(data.description || data.reason) && (
                <div className="space-y-4">
                  {data.description && (
                    <div>
                      <div className="text-sm text-muted-foreground">Description</div>
                      <div className="font-medium">{data.description}</div>
                    </div>
                  )}
                  {data.reason && (
                    <div>
                      <div className="text-sm text-muted-foreground">Reason</div>
                      <div className="font-medium">{data.reason}</div>
                    </div>
                  )}
                </div>
              )}

              {data.issues?.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">Component Issues</div>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 gap-2 p-2 text-sm font-medium">
                      <div>No.</div>
                      <div>Component</div>
                      <div className="text-right">Qty</div>
                      <div className="text-right">Unit Cost</div>
                      <div className="text-right">Total Cost</div>
                    </div>
                    {data.issues.map((i) => (
                      <div key={i.id} className="grid grid-cols-5 gap-2 p-2 text-sm">
                        <div>{i.number}</div>
                        <div>{i.itemId}</div>
                        <div className="text-right">{Math.abs(i.quantity)}</div>
                        <div className="text-right">{fmtCurrency(i.unitCost)}</div>
                        <div className="text-right">{fmtCurrency(i.totalCost)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
