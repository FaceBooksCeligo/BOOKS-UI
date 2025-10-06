"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function WarehousesPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const res = await api.get<any[]>("/v1/inventory/warehouses");
      if (res.success) setWarehouses((res.data as any[]) || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load warehouses");
    } finally {
      setLoading(false);
    }
  };

  const filtered = warehouses.filter(w => {
    const t = (searchTerm || '').toLowerCase();
    return (w.name || '').toLowerCase().includes(t) || (w.code || '').toLowerCase().includes(t);
  });

  const columns = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }: any) => <div className="font-mono text-sm">{row.code}</div>
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: any) => <div className="font-medium">{row.name}</div>
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }: any) => <Badge variant="outline">{row.type || 'MAIN'}</Badge>
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <Badge variant={row.status === 'ACTIVE' ? 'default' : 'secondary'}>{row.status}</Badge>
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/inventory/warehouses/${row.id || row._id}`)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={async () => {
            const id = row.id || row._id;
            if (!id) return;
            if (!confirm('Deactivate this warehouse?')) return;
            const resp = await api.delete(`/v1/inventory/warehouses/${id}`);
            if (resp.success) { toast.success('Warehouse deactivated'); loadWarehouses(); } else { toast.error('Failed'); }
          }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
          <p className="text-muted-foreground">Manage warehouse locations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Filter</Button>
          <Button onClick={() => router.push('/inventory/warehouses/new')}><Plus className="h-4 w-4 mr-2" />New Warehouse</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Warehouses</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search warehouses..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 w-64" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}


