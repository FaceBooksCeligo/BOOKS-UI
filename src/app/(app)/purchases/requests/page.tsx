"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/DataTable";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { FilePlus2, Calendar, ClipboardList, Eye, Plus } from "lucide-react";

interface PRRow {
  id: string;
  number: string;
  status: string;
  requestDate: string;
  department?: string;
  vendorId?: string | null;
  total?: number;
  lineCount: number;
}

export default function PurchaseRequestsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PRRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await api.get<PRRow[]>("/v1/purchases/requests");
      if (resp.success) {
        setRows((resp.data as PRRow[]) || []);
      } else {
        toast.error("Failed to load requests");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString();
  const fmtCurrency = (n: number | undefined) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

  const filtered = useMemo(() => {
    const t = search.toLowerCase();
    return rows.filter(r => r.number?.toLowerCase().includes(t) || r.department?.toLowerCase().includes(t));
  }, [rows, search]);

  const columns = [
    {
      accessorKey: "number",
      header: "Request #",
      cell: ({ row }: any) => {
        const r = row?.original || row;
        return (
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{r.number}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "requestDate",
      header: "Date",
      cell: ({ row }: any) => {
        const r = row?.original || row;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{fmtDate(r.requestDate)}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "department",
      header: "Department",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const r = row?.original || row;
        return <span className="font-medium">{r.status}</span>;
      }
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }: any) => {
        const r = row?.original || row;
        return <span className="font-medium">{fmtCurrency(r.total as number)}</span>;
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const r = row?.original || row;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/purchases/requests/${r.id}`)}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Requests</h1>
          <p className="text-muted-foreground">Submit and track purchase requisitions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push("/purchases/requests/new")}>
            <Plus className="h-4 w-4 mr-2" /> New Request
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Requests</CardTitle>
            <Input placeholder="Search requests..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
