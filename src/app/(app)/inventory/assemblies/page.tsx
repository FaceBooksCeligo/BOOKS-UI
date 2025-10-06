"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/DataTable";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Package, Calendar, Factory, Plus, Eye } from "lucide-react";

interface AssemblyRow {
  id: string;
  buildNumber: string;
  buildDate: string;
  productId: string;
  productLabel: string;
  warehouseId: string;
  warehouseLabel: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  description?: string;
}

export default function AssembliesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AssemblyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await api.get<AssemblyRow[]>("/v1/inventory/assemblies");
      if (resp.success) {
        setRows((resp.data as AssemblyRow[]) || []);
      } else {
        toast.error("Failed to load assemblies");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load assemblies");
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (v: string) => new Date(v).toLocaleDateString();
  const fmtCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

  const filtered = useMemo(() => {
    const t = search.toLowerCase();
    return rows.filter(r =>
      r.buildNumber?.toLowerCase().includes(t) ||
      r.productLabel?.toLowerCase().includes(t) ||
      r.warehouseLabel?.toLowerCase().includes(t) ||
      r.description?.toLowerCase().includes(t)
    );
  }, [rows, search]);

  const columns = [
    {
      accessorKey: "buildNumber",
      header: "Build #",
      cell: ({ row }: any) => {
        const a = row?.original || row;
        return (
          <div className="flex items-center gap-2">
            <Factory className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{a.buildNumber}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "buildDate",
      header: "Date",
      cell: ({ row }: any) => {
        const a = row?.original || row;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{fmtDate(a.buildDate)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "productLabel",
      header: "Product",
      cell: ({ row }: any) => {
        const a = row?.original || row;
        return (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{a.productLabel}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "warehouseLabel",
      header: "Warehouse",
      cell: ({ row }: any) => {
        const a = row?.original || row;
        return <span>{a.warehouseLabel}</span>;
      },
    },
    {
      accessorKey: "quantity",
      header: "Qty",
      cell: ({ row }: any) => {
        const a = row?.original || row;
        return <span className="font-medium">{a.quantity}</span>;
      },
    },
    {
      accessorKey: "totalCost",
      header: "Total Cost",
      cell: ({ row }: any) => {
        const a = row?.original || row;
        return <span className="font-medium">{fmtCurrency(a.totalCost)}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const a = row?.original || row;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/inventory/assemblies/${a.id}`)}>
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
          <h1 className="text-3xl font-bold tracking-tight">Assemblies</h1>
          <p className="text-muted-foreground">Build finished goods from components</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push("/inventory/assemblies/new")}> 
            <Plus className="h-4 w-4 mr-2" />
            New Assembly
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assembly Builds</CardTitle>
            <Input
              placeholder="Search assemblies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}


