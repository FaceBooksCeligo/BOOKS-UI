"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/DataTable";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Package, ArrowLeftRight, Calendar, Warehouse, Eye, Plus } from "lucide-react";

interface TransferRow {
  id: string;
  transferNumber: string;
  transferDate: string;
  itemId: string;
  itemLabel: string;
  fromWarehouseId: string;
  fromWarehouseLabel: string;
  toWarehouseId: string;
  toWarehouseLabel: string;
  quantity: number;
  status: "PENDING" | "APPROVED";
  description?: string;
}

export default function InventoryTransfersPage() {
  const router = useRouter();
  const [rows, setRows] = useState<TransferRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await api.get<TransferRow[]>("/v1/inventory/transfers");
      if (resp.success) {
        const list = (resp.data as TransferRow[]) || [];
        setRows(list);
      } else {
        toast.error("Failed to load transfers");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load transfers");
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    const term = search.toLowerCase();
    return rows.filter(r =>
      r.transferNumber?.toLowerCase().includes(term) ||
      r.itemLabel?.toLowerCase().includes(term) ||
      r.fromWarehouseLabel?.toLowerCase().includes(term) ||
      r.toWarehouseLabel?.toLowerCase().includes(term) ||
      r.description?.toLowerCase().includes(term)
    );
  }, [rows, search]);

  const formatDate = (value: string) => new Date(value).toLocaleDateString();

  const columns = [
    {
      accessorKey: "transferNumber",
      header: "Transfer #",
      cell: ({ row }: any) => {
        const t = row?.original || row;
        return (
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{t.transferNumber}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "transferDate",
      header: "Date",
      cell: ({ row }: any) => {
        const t = row?.original || row;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(t.transferDate)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "itemLabel",
      header: "Item",
      cell: ({ row }: any) => {
        const t = row?.original || row;
        return (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{t.itemLabel}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "fromWarehouseLabel",
      header: "From",
      cell: ({ row }: any) => {
        const t = row?.original || row;
        return (
          <div className="flex items-center gap-2">
            <Warehouse className="h-4 w-4 text-muted-foreground" />
            <span>{t.fromWarehouseLabel}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "toWarehouseLabel",
      header: "To",
      cell: ({ row }: any) => {
        const t = row?.original || row;
        return (
          <div className="flex items-center gap-2">
            <Warehouse className="h-4 w-4 text-muted-foreground" />
            <span>{t.toWarehouseLabel}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: "Qty",
      cell: ({ row }: any) => {
        const t = row?.original || row;
        return <span className="font-medium">{t.quantity}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const t = row?.original || row;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/inventory/transfers/${t.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Transfers</h1>
          <p className="text-muted-foreground">Move stock between warehouses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push("/inventory/transfers/new")}> 
            <Plus className="h-4 w-4 mr-2" />
            New Transfer
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transfers</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search transfers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredRows} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}


