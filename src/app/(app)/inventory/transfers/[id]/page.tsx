"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowLeftRight, Calendar, Package, Warehouse } from "lucide-react";

interface TransferDetail {
  id: string;
  transferNumber: string;
  transferDate: string;
  item: { id: string; label: string; uom?: string };
  fromWarehouse: { id: string; label: string };
  toWarehouse: { id: string; label: string };
  quantity: number;
  cost: { unitCost: number; totalCost: number };
  status: string;
  description?: string;
  reason?: string;
  linkedInTransactionId?: string | null;
}

export default function TransferDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || "";
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TransferDetail | null>(null);

  useEffect(() => {
    if (id) load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get<TransferDetail>(`/v1/inventory/transfers/${id}`);
      if (res.success) {
        setData(res.data as any);
      } else {
        toast.error("Failed to load transfer");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load transfer");
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleString();
  const fmtCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push("/inventory/transfers")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Transfer Details</h1>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
            {data?.transferNumber || (loading ? "Loading..." : "Transfer")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-muted-foreground">Loading transfer...</div>
          ) : !data ? (
            <div className="text-destructive">Transfer not found</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-medium">{fmtDate(data.transferDate)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Item</div>
                    <div className="font-medium">{data.item?.label}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Warehouse className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">From</div>
                    <div className="font-medium">{data.fromWarehouse?.label}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Warehouse className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">To</div>
                    <div className="font-medium">{data.toWarehouse?.label}</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Quantity</div>
                  <div className="font-medium">{data.quantity} {data.item?.uom || ""}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Unit Cost</div>
                  <div className="font-medium">{fmtCurrency(data.cost?.unitCost)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Cost</div>
                  <div className="font-medium">{fmtCurrency(data.cost?.totalCost)}</div>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
