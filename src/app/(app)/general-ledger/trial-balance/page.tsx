'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { FileSpreadsheet, Download, Printer, Calendar, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TrialBalanceAccount {
  _id: string;
  accountCode: string;
  accountName: string;
  totalDebit: number;
  totalCredit: number;
  netAmount: number;
  accountDetails?: any[];
}

interface TrialBalanceData {
  period: string;
  accounts: TrialBalanceAccount[];
  totals: {
    debit: number;
    credit: number;
    difference: number;
  };
  isBalanced: boolean;
}

export default function TrialBalancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trialBalance, setTrialBalance] = useState<TrialBalanceData | null>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  
  const [filters, setFilters] = useState({
    period: '',
    department: '',
    project: '',
    asOfDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    if (filters.period || filters.asOfDate) {
      fetchTrialBalance();
    }
  }, [filters]);

  const fetchReferenceData = async () => {
    try {
      // Fetch periods
      const periodsRes = await api.get('/v1/general-ledger/periods');
      setPeriods(periodsRes.data);
      
      // Set current period
      const currentPeriod = periodsRes.data.find((p: any) => p.status === 'OPEN');
      if (currentPeriod) {
        setFilters(prev => ({ ...prev, period: currentPeriod._id }));
      }
      
      // Fetch departments and projects
      try {
        const [deptRes, projRes] = await Promise.all([
          api.get('/v1/departments').catch(() => ({ data: [] })),
          api.get('/v1/projects').catch(() => ({ data: [] }))
        ]);
        
        setDepartments(deptRes.data);
        setProjects(projRes.data);
      } catch (error) {
        console.log('Some reference data not available');
      }
    } catch (error) {
      console.error('Error fetching reference data:', error);
      toast.error('Failed to load reference data');
    }
  };

  const fetchTrialBalance = async () => {
    try {
      setLoading(true);
      
      const params: any = {};
      if (filters.period) params.period = filters.period;
      if (filters.department) params.department = filters.department;
      if (filters.project) params.project = filters.project;
      if (filters.asOfDate && !filters.period) params.asOfDate = filters.asOfDate;
      
      const response = await api.get('/v1/general-ledger/trial-balance', { params });
      setTrialBalance(response.data);
    } catch (error: any) {
      console.error('Error fetching trial balance:', error);
      toast.error('Failed to load trial balance');
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

  const exportToCSV = () => {
    if (!trialBalance) return;
    
    const csv = [
      ['Account Code', 'Account Name', 'Debit', 'Credit', 'Net Amount'],
      ...trialBalance.accounts.map(account => [
        account.accountCode,
        account.accountName,
        account.totalDebit.toFixed(2),
        account.totalCredit.toFixed(2),
        account.netAmount.toFixed(2)
      ]),
      [],
      ['', 'TOTALS', trialBalance.totals.debit.toFixed(2), trialBalance.totals.credit.toFixed(2), ''],
      ['', 'DIFFERENCE', '', '', trialBalance.totals.difference.toFixed(2)]
    ];
    
    const csvContent = csv.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial-balance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Trial balance exported to CSV');
  };

  const handlePrint = () => {
    window.print();
  };

  const getAccountTypeColor = (accountCode: string) => {
    const firstChar = accountCode?.charAt(0);
    switch (firstChar) {
      case '1': return 'text-blue-600'; // Assets
      case '2': return 'text-red-600'; // Liabilities
      case '3': return 'text-purple-600'; // Equity
      case '4': return 'text-green-600'; // Revenue
      case '5': return 'text-orange-600'; // Expenses
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Trial Balance</h1>
          <p className="text-muted-foreground mt-1">
            View account balances and verify debits equal credits
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} disabled={!trialBalance}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handlePrint} disabled={!trialBalance}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="period">Period</Label>
            <Select
              value={filters.period}
              onValueChange={(value) => setFilters({ ...filters, period: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Use As-Of Date</SelectItem>
                {periods.map((period) => (
                  <SelectItem key={period._id} value={period._id}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="asOfDate">As of Date</Label>
            <Input
              id="asOfDate"
              type="date"
              value={filters.asOfDate}
              onChange={(e) => setFilters({ ...filters, asOfDate: e.target.value })}
              disabled={!!filters.period}
            />
          </div>
          
          <div>
            <Label htmlFor="department">Department</Label>
            <Select
              value={filters.department}
              onValueChange={(value) => setFilters({ ...filters, department: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="project">Project</Label>
            <Select
              value={filters.project}
              onValueChange={(value) => setFilters({ ...filters, project: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Projects</SelectItem>
                {projects.map((proj) => (
                  <SelectItem key={proj._id} value={proj._id}>
                    {proj.projectNumber} - {proj.projectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Trial Balance Status */}
      {trialBalance && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Balance Status</h2>
                <p className="text-sm text-muted-foreground">
                  Period: {periods.find(p => p._id === trialBalance.period)?.name || 'As of ' + filters.asOfDate}
                </p>
              </div>
            </div>
            <div className="text-right">
              {trialBalance.isBalanced ? (
                <div className="text-green-600">
                  <p className="font-semibold">✓ Balanced</p>
                  <p className="text-sm">Debits equal Credits</p>
                </div>
              ) : (
                <div className="text-red-600">
                  <p className="font-semibold">✗ Not Balanced</p>
                  <p className="text-sm">Difference: {formatCurrency(trialBalance.totals.difference)}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Trial Balance Table */}
      {loading ? (
        <Card className="p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Card>
      ) : trialBalance ? (
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Account Code</th>
                  <th className="text-left py-3 px-2">Account Name</th>
                  <th className="text-right py-3 px-2">Debit</th>
                  <th className="text-right py-3 px-2">Credit</th>
                  <th className="text-right py-3 px-2">Net Amount</th>
                </tr>
              </thead>
              <tbody>
                {trialBalance.accounts.map((account) => (
                  <tr
                    key={account._id}
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/general-ledger/accounts/${account._id}/activity`)}
                  >
                    <td className={`py-3 px-2 font-medium ${getAccountTypeColor(account.accountCode)}`}>
                      {account.accountCode}
                    </td>
                    <td className="py-3 px-2">{account.accountName}</td>
                    <td className="text-right py-3 px-2">
                      {account.totalDebit > 0 ? formatCurrency(account.totalDebit) : '-'}
                    </td>
                    <td className="text-right py-3 px-2">
                      {account.totalCredit > 0 ? formatCurrency(account.totalCredit) : '-'}
                    </td>
                    <td className="text-right py-3 px-2 font-medium">
                      {formatCurrency(Math.abs(account.netAmount))}
                      {account.netAmount < 0 && ' CR'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold border-t-2">
                  <td colSpan={2} className="py-3 px-2">TOTALS</td>
                  <td className="text-right py-3 px-2">
                    {formatCurrency(trialBalance.totals.debit)}
                  </td>
                  <td className="text-right py-3 px-2">
                    {formatCurrency(trialBalance.totals.credit)}
                  </td>
                  <td className="text-right py-3 px-2">
                    {trialBalance.isBalanced ? (
                      <span className="text-green-600">Balanced</span>
                    ) : (
                      <span className="text-red-600">
                        {formatCurrency(trialBalance.totals.difference)}
                      </span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            Select a period or date to view the trial balance
          </div>
        </Card>
      )}
    </div>
  );
}

