'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Search, FileText, MoreHorizontal, Eye, Edit, Copy, RotateCcw, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function JournalEntriesPage() {
  const router = useRouter();
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [periods, setPeriods] = useState<any[]>([]);

  useEffect(() => {
    fetchPeriods();
    fetchJournalEntries();
  }, [statusFilter, periodFilter]);

  const fetchPeriods = async () => {
    try {
      const response = await api.get('/v1/general-ledger/periods');
      setPeriods(response.data);
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  const fetchJournalEntries = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (periodFilter !== 'all') {
        params.period = periodFilter;
      }
      
      const response = await api.get('/v1/general-ledger/journal-entries', { params });
      setJournalEntries(response.data);
    } catch (error: any) {
      console.error('Error fetching journal entries:', error);
      toast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (id: string) => {
    try {
      await api.post(`/v1/general-ledger/journal-entries/${id}/post`);
      toast.success('Journal entry posted successfully');
      fetchJournalEntries();
    } catch (error: any) {
      console.error('Error posting journal entry:', error);
      toast.error(error.response?.data?.error || 'Failed to post journal entry');
    }
  };

  const handleReverse = async (id: string) => {
    const reason = prompt('Please provide a reason for reversal:');
    if (!reason) return;
    
    try {
      await api.post(`/v1/general-ledger/journal-entries/${id}/reverse`, { reason });
      toast.success('Journal entry reversed successfully');
      fetchJournalEntries();
    } catch (error: any) {
      console.error('Error reversing journal entry:', error);
      toast.error(error.response?.data?.error || 'Failed to reverse journal entry');
    }
  };

  const handleVoid = async (id: string) => {
    const reason = prompt('Please provide a reason for voiding:');
    if (!reason) return;
    
    try {
      await api.post(`/v1/general-ledger/journal-entries/${id}/void`, { reason });
      toast.success('Journal entry voided successfully');
      fetchJournalEntries();
    } catch (error: any) {
      console.error('Error voiding journal entry:', error);
      toast.error(error.response?.data?.error || 'Failed to void journal entry');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return;
    
    try {
      await api.delete(`/v1/general-ledger/journal-entries/${id}`);
      toast.success('Journal entry deleted successfully');
      fetchJournalEntries();
    } catch (error: any) {
      console.error('Error deleting journal entry:', error);
      toast.error(error.response?.data?.error || 'Failed to delete journal entry');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'POSTED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800';
      case 'REVERSED':
        return 'bg-red-100 text-red-800';
      case 'VOIDED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      accessorKey: 'transactionNumber',
      header: 'Number',
      cell: ({ row }: any) => {
        const entry = row?.original || row;
        return (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{entry.transactionNumber}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'transactionDate',
      header: 'Date',
      cell: ({ row }: any) => {
        const entry = row?.original || row;
        return formatDate(entry.transactionDate);
      },
    },
    {
      accessorKey: 'period',
      header: 'Period',
      cell: ({ row }: any) => {
        const entry = row?.original || row;
        return entry.period?.name || '-';
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => {
        const entry = row?.original || row;
        return (
          <div>
            <p className="font-medium">{entry.description}</p>
            {entry.memo && (
              <p className="text-sm text-muted-foreground">{entry.memo}</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'totalDebit',
      header: 'Debit',
      cell: ({ row }: any) => {
        const entry = row?.original || row;
        return formatCurrency(entry.totalDebit);
      },
    },
    {
      accessorKey: 'totalCredit',
      header: 'Credit',
      cell: ({ row }: any) => {
        const entry = row?.original || row;
        return formatCurrency(entry.totalCredit);
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const entry = row?.original || row;
        return (
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(entry.status)}`}>
            {entry.status}
          </span>
        );
      },
    },
    {
      accessorKey: 'isBalanced',
      header: 'Balanced',
      cell: ({ row }: any) => {
        const entry = row?.original || row;
        return entry.isBalanced ? (
          <span className="text-green-600">✓</span>
        ) : (
          <span className="text-red-600">✗</span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const entry = row?.original || row;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/general-ledger/journal-entries/${entry._id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              
              {entry.status === 'DRAFT' && (
                <>
                  <DropdownMenuItem
                    onClick={() => router.push(`/general-ledger/journal-entries/${entry._id}/edit`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handlePost(entry._id)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Post Entry
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleVoid(entry._id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Void
                  </DropdownMenuItem>
                </>
              )}
              
              {entry.status === 'POSTED' && (
                <DropdownMenuItem
                  onClick={() => handleReverse(entry._id)}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reverse
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem
                onClick={() => router.push(`/general-ledger/journal-entries/new?copy=${entry._id}`)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Entry
              </DropdownMenuItem>
              
              {entry.status === 'DRAFT' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDelete(entry._id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const filteredEntries = journalEntries.filter(entry => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.transactionNumber?.toLowerCase().includes(searchLower) ||
      entry.description?.toLowerCase().includes(searchLower) ||
      entry.memo?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Journal Entries</h1>
          <p className="text-muted-foreground mt-1">
            Manage and review general ledger journal entries
          </p>
        </div>
        <Button onClick={() => router.push('/general-ledger/journal-entries/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Journal Entry
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search journal entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="POSTED">Posted</SelectItem>
            <SelectItem value="REVERSED">Reversed</SelectItem>
            <SelectItem value="VOIDED">Voided</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Periods</SelectItem>
            {periods.map((period) => (
              <SelectItem key={period._id} value={period._id}>
                {period.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredEntries}
        loading={loading}
      />
    </div>
  );
}

