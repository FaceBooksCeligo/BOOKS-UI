"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { Plus, Search, Filter, Download, Upload, MoreHorizontal, Send, Eye } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface Estimate {
  id: string;
  estimateNumber: string;
  customerName: string;
  date: string;
  dueDate: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function EstimatesPage() {
  const { user } = useAuthStore();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadEstimates();
  }, []);

  const loadEstimates = async () => {
    try {
      // For now, return empty array since we don't have estimates API yet
      setEstimates([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to load estimates");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: "estimateNumber",
      header: "Estimate #",
      cell: ({ row }: any) => (
        <div className="font-mono text-sm">{row.getValue("estimateNumber")}</div>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue("customerName")}</div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => (
        <div>{new Date(row.getValue("date")).toLocaleDateString()}</div>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Expires",
      cell: ({ row }: any) => (
        <div>{new Date(row.getValue("dueDate")).toLocaleDateString()}</div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }: any) => (
        <div className="text-right font-mono">
          ${row.getValue("amount")?.toLocaleString() || "0.00"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge 
          variant={
            row.getValue("status") === "SENT" ? "default" : 
            row.getValue("status") === "ACCEPTED" ? "secondary" :
            row.getValue("status") === "EXPIRED" ? "destructive" : "outline"
          }
        >
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>
              <Send className="h-4 w-4 mr-2" />
              Send
            </DropdownMenuItem>
            <DropdownMenuItem>Convert to Invoice</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filteredEstimates = estimates.filter(estimate =>
    estimate.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estimate.estimateNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estimates</h1>
          <p className="text-muted-foreground">
            Create and manage estimates for your customers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Estimate
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Estimates</CardTitle>
              <CardDescription>
                {filteredEstimates.length} of {estimates.length} estimates
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search estimates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredEstimates}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
