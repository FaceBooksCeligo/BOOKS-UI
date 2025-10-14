'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  BookOpen, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  BarChart3,
  Calendar,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Clock,
  Lock
} from 'lucide-react';

interface PeriodSummary {
  _id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  periodBalances: {
    revenue: number;
    expenses: number;
    assets: number;
    liabilities: number;
    equity: number;
    netIncome: number;
  };
  transactionCounts: {
    journalEntries: number;
    total: number;
  };
}

interface TrialBalance {
  isBalanced: boolean;
  totals: {
    debit: number;
    credit: number;
    difference: number;
  };
}

export default function GeneralLedgerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentPeriod, setCurrentPeriod] = useState<PeriodSummary | null>(null);
  const [trialBalance, setTrialBalance] = useState<TrialBalance | null>(null);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch current period
      try {
        const periodRes = await api.get('/v1/general-ledger/periods/current');
        setCurrentPeriod(periodRes.data);
      } catch (error) {
        console.log('No current period found');
      }
      
      // Fetch all periods
      const periodsRes = await api.get('/v1/general-ledger/periods', {
        params: { isActive: true }
      });
      setPeriods(periodsRes.data);
      
      // Fetch trial balance
      try {
        const trialRes = await api.get('/v1/general-ledger/trial-balance');
        setTrialBalance(trialRes.data);
      } catch (error) {
        console.log('Could not fetch trial balance');
      }
      
      // Fetch recent journal entries
      const entriesRes = await api.get('/v1/general-ledger/journal-entries', {
        params: { status: 'POSTED' }
      });
      setRecentEntries(entriesRes.data.slice(0, 5));
      
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  const getPeriodStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CLOSED':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'LOCKED':
        return <Lock className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'POSTED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVERSED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">General Ledger</h1>
          <p className="text-muted-foreground mt-1">
            Manage journal entries, periods, and financial reporting
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push('/general-ledger/journal-entries/new')}
          >
            <FileText className="h-4 w-4 mr-2" />
            New Journal Entry
          </Button>
        </div>
      </div>

      {/* Current Period Card */}
      {currentPeriod && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Current Period</h2>
            </div>
            {getPeriodStatusIcon(currentPeriod.status)}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Period</p>
              <p className="font-medium">{currentPeriod.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date Range</p>
              <p className="font-medium">
                {formatDate(currentPeriod.startDate)} - {formatDate(currentPeriod.endDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Income</p>
              <p className="font-medium">{formatCurrency(currentPeriod.periodBalances?.netIncome || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="font-medium">{currentPeriod.transactionCounts?.total || 0}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">
                {formatCurrency(currentPeriod?.periodBalances?.revenue || 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Expenses</p>
              <p className="text-2xl font-bold">
                {formatCurrency(currentPeriod?.periodBalances?.expenses || 0)}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Assets</p>
              <p className="text-2xl font-bold">
                {formatCurrency(currentPeriod?.periodBalances?.assets || 0)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Trial Balance</p>
              <p className="text-sm font-medium">
                {trialBalance?.isBalanced ? (
                  <span className="text-green-600">Balanced</span>
                ) : (
                  <span className="text-red-600">
                    Off by {formatCurrency(trialBalance?.totals?.difference || 0)}
                  </span>
                )}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          variant="outline"
          className="h-24 flex-col"
          onClick={() => router.push('/general-ledger/journal-entries')}
        >
          <BookOpen className="h-6 w-6 mb-2" />
          <span>Journal Entries</span>
        </Button>

        <Button
          variant="outline"
          className="h-24 flex-col"
          onClick={() => router.push('/general-ledger/trial-balance')}
        >
          <BarChart3 className="h-6 w-6 mb-2" />
          <span>Trial Balance</span>
        </Button>

        <Button
          variant="outline"
          className="h-24 flex-col"
          onClick={() => router.push('/general-ledger/financial-statements')}
        >
          <FileSpreadsheet className="h-6 w-6 mb-2" />
          <span>Financial Statements</span>
        </Button>

        <Button
          variant="outline"
          className="h-24 flex-col"
          onClick={() => router.push('/general-ledger/periods')}
        >
          <Calendar className="h-6 w-6 mb-2" />
          <span>Period Management</span>
        </Button>
      </div>

      {/* Recent Journal Entries */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Journal Entries</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/general-ledger/journal-entries')}
          >
            View All
          </Button>
        </div>
        <div className="space-y-2">
          {recentEntries.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No journal entries found
            </p>
          ) : (
            recentEntries.map((entry) => (
              <div
                key={entry._id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => router.push(`/general-ledger/journal-entries/${entry._id}`)}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{entry.transactionNumber}</p>
                    <p className="text-sm text-muted-foreground">{entry.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(entry.totalDebit)}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(entry.status)}`}>
                      {entry.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(entry.transactionDate)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* GL Periods */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">GL Periods</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/general-ledger/periods')}
          >
            Manage Periods
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {periods.slice(0, 6).map((period) => (
            <div
              key={period._id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-2">
                {getPeriodStatusIcon(period.status)}
                <div>
                  <p className="font-medium">{period.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(period.startDate)} - {formatDate(period.endDate)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

