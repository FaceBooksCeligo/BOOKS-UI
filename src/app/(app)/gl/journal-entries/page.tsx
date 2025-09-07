"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  FileText,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface JournalEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  reference?: string;
  status: 'DRAFT' | 'POSTED' | 'REVERSED';
  totalDebits: number;
  totalCredits: number;
  lineCount: number;
  createdAt: string;
  updatedAt: string;
}

const JournalEntriesPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Summary data
  const [summary, setSummary] = useState({
    totalEntries: 0,
    postedEntries: 0,
    draftEntries: 0,
    totalDebits: 0,
    totalCredits: 0
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const response = await api.get<JournalEntry[]>("/v1/journal-entries");
      
      if (response.success) {
        const list = (response.data as JournalEntry[]) || [];
        setEntries(list);
        calculateSummary(list);
      } else {
        toast.error("Failed to load journal entries");
      }
    } catch (error) {
      console.error("Error loading journal entries:", error);
      toast.error("Failed to load journal entries");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (entriesData: JournalEntry[]) => {
    const totalEntries = entriesData.length;
    const postedEntries = entriesData.filter(entry => entry.status === 'POSTED').length;
    const draftEntries = entriesData.filter(entry => entry.status === 'DRAFT').length;
    const totalDebits = entriesData.reduce((sum, entry) => sum + entry.totalDebits, 0);
    const totalCredits = entriesData.reduce((sum, entry) => sum + entry.totalCredits, 0);

    setSummary({
      totalEntries,
      postedEntries,
      draftEntries,
      totalDebits,
      totalCredits
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { variant: "secondary" as const, label: "Draft", icon: Clock },
      POSTED: { variant: "default" as const, label: "Posted", icon: CheckCircle },
      REVERSED: { variant: "destructive" as const, label: "Reversed", icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredEntries = entries.filter(entry =>
    entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      accessorKey: "entryNumber",
      header: "Entry #",
      cell: ({ row }: any) => {
        const entry = row.original;
        return (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{entry.entryNumber}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "entryDate",
      header: "Date",
      cell: ({ row }: any) => {
        const entry = row.original;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(entry.entryDate)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }: any) => {
        const entry = row.original;
        return (
          <div>
            <div className="font-medium">{entry.description}</div>
            {entry.reference && (
              <div className="text-sm text-muted-foreground">Ref: {entry.reference}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "totalDebits",
      header: "Total Debits",
      cell: ({ row }: any) => {
        const entry = row.original;
        return (
          <div className="text-right">
            <div className="font-medium text-red-600">{formatCurrency(entry.totalDebits)}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "totalCredits",
      header: "Total Credits",
      cell: ({ row }: any) => {
        const entry = row.original;
        return (
          <div className="text-right">
            <div className="font-medium text-green-600">{formatCurrency(entry.totalCredits)}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "lineCount",
      header: "Lines",
      cell: ({ row }: any) => {
        const entry = row.original;
        return (
          <div className="text-center">
            <span className="font-medium">{entry.lineCount}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const entry = row.original;
        return getStatusBadge(entry.status);
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const entry = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/gl/journal-entries/${entry.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/gl/journal-entries/${entry.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(entry.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleDelete = async (entryId: string) => {
    if (confirm("Are you sure you want to delete this journal entry? This action cannot be undone.")) {
      try {
        const response = await api.delete(`/v1/journal-entries/${entryId}`);
        
        if (response.success) {
          toast.success("Journal entry deleted successfully");
          loadEntries();
        } else {
          toast.error("Failed to delete journal entry");
        }
      } catch (error) {
        console.error("Error deleting journal entry:", error);
        toast.error("Failed to delete journal entry");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Journal Entries</h1>
          <p className="text-muted-foreground">
            Record and manage your general ledger journal entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/gl/journal-entries/import")}>
            <Download className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => router.push("/gl/journal-entries/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalEntries}</div>
            <p className="text-xs text-muted-foreground">
              All journal entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.postedEntries}</div>
            <p className="text-xs text-muted-foreground">
              Successfully posted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.draftEntries}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting posting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalDebits)}</div>
            <p className="text-xs text-muted-foreground">
              Total debit amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalCredits)}</div>
            <p className="text-xs text-muted-foreground">
              Total credit amount
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Journal Entries</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading journal entries...</div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredEntries}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JournalEntriesPage;