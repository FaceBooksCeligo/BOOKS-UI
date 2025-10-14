'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { FileSpreadsheet, Download, Printer, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface IncomeStatementData {
  period: any;
  revenue: any[];
  expenses: any[];
  otherIncome: any[];
  otherExpenses: any[];
  totalRevenue: number;
  totalExpenses: number;
  totalOtherIncome: number;
  totalOtherExpenses: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
}

interface BalanceSheetData {
  asOfDate: string;
  assets: {
    current: any[];
    nonCurrent: any[];
    total: number;
  };
  liabilities: {
    current: any[];
    nonCurrent: any[];
    total: number;
  };
  equity: {
    categories: any[];
    total: number;
  };
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
}

export default function FinancialStatementsPage() {
  const [activeTab, setActiveTab] = useState('income-statement');
  const [loading, setLoading] = useState(false);
  const [periods, setPeriods] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  
  const [filters, setFilters] = useState({
    period: '',
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    asOfDate: new Date().toISOString().split('T')[0],
    department: '',
    project: ''
  });
  
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatementData | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData | null>(null);

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    if (activeTab === 'income-statement') {
      fetchIncomeStatement();
    } else if (activeTab === 'balance-sheet') {
      fetchBalanceSheet();
    }
  }, [activeTab, filters]);

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
    }
  };

  const fetchIncomeStatement = async () => {
    try {
      setLoading(true);
      
      const params: any = {};
      if (filters.period) {
        params.period = filters.period;
      } else {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      }
      if (filters.department) params.department = filters.department;
      if (filters.project) params.project = filters.project;
      
      const response = await api.get('/v1/general-ledger/financial-statements/income-statement', { params });
      setIncomeStatement(response.data);
    } catch (error: any) {
      console.error('Error fetching income statement:', error);
      toast.error('Failed to load income statement');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalanceSheet = async () => {
    try {
      setLoading(true);
      
      const params: any = {};
      if (filters.period) {
        params.period = filters.period;
      } else {
        params.asOfDate = filters.asOfDate;
      }
      if (filters.department) params.department = filters.department;
      if (filters.project) params.project = filters.project;
      
      const response = await api.get('/v1/general-ledger/financial-statements/balance-sheet', { params });
      setBalanceSheet(response.data);
    } catch (error: any) {
      console.error('Error fetching balance sheet:', error);
      toast.error('Failed to load balance sheet');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount || 0));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const exportToCSV = () => {
    let csv = [];
    let filename = '';
    
    if (activeTab === 'income-statement' && incomeStatement) {
      filename = 'income-statement';
      csv = [
        ['Income Statement'],
        ['Period:', filters.period ? periods.find(p => p._id === filters.period)?.name : `${filters.startDate} to ${filters.endDate}`],
        [],
        ['REVENUE'],
        ...incomeStatement.revenue.flatMap(cat => [
          [cat.name],
          ...cat.accounts.map((acc: any) => ['', acc.accountName, formatCurrency(acc.amount)])
        ]),
        ['Total Revenue', '', formatCurrency(incomeStatement.totalRevenue)],
        [],
        ['EXPENSES'],
        ...incomeStatement.expenses.flatMap(cat => [
          [cat.name],
          ...cat.accounts.map((acc: any) => ['', acc.accountName, formatCurrency(acc.amount)])
        ]),
        ['Total Expenses', '', formatCurrency(incomeStatement.totalExpenses)],
        [],
        ['NET INCOME', '', formatCurrency(incomeStatement.netIncome)]
      ];
    } else if (activeTab === 'balance-sheet' && balanceSheet) {
      filename = 'balance-sheet';
      csv = [
        ['Balance Sheet'],
        ['As of:', formatDate(balanceSheet.asOfDate)],
        [],
        ['ASSETS'],
        ['Current Assets'],
        ...balanceSheet.assets.current.flatMap(cat => [
          ['', cat.name],
          ...cat.accounts.map((acc: any) => ['', '', acc.accountName, formatCurrency(acc.balance)])
        ]),
        ['Non-Current Assets'],
        ...balanceSheet.assets.nonCurrent.flatMap(cat => [
          ['', cat.name],
          ...cat.accounts.map((acc: any) => ['', '', acc.accountName, formatCurrency(acc.balance)])
        ]),
        ['Total Assets', '', '', formatCurrency(balanceSheet.totalAssets)],
        [],
        ['LIABILITIES'],
        ['Current Liabilities'],
        ...balanceSheet.liabilities.current.flatMap(cat => [
          ['', cat.name],
          ...cat.accounts.map((acc: any) => ['', '', acc.accountName, formatCurrency(acc.balance)])
        ]),
        ['Non-Current Liabilities'],
        ...balanceSheet.liabilities.nonCurrent.flatMap(cat => [
          ['', cat.name],
          ...cat.accounts.map((acc: any) => ['', '', acc.accountName, formatCurrency(acc.balance)])
        ]),
        ['Total Liabilities', '', '', formatCurrency(balanceSheet.liabilities.total)],
        [],
        ['EQUITY'],
        ...balanceSheet.equity.categories.flatMap(cat => [
          ['', cat.name],
          ...cat.accounts.map((acc: any) => ['', '', acc.accountName, formatCurrency(acc.balance)])
        ]),
        ['Total Equity', '', '', formatCurrency(balanceSheet.equity.total)],
        [],
        ['Total Liabilities and Equity', '', '', formatCurrency(balanceSheet.totalLiabilitiesAndEquity)]
      ];
    }
    
    const csvContent = csv.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Statement exported to CSV');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Statements</h1>
          <p className="text-muted-foreground mt-1">
            Generate income statements, balance sheets, and cash flow reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <h2 className="font-semibold mb-4">Report Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <SelectItem value="">Custom Date Range</SelectItem>
                {periods.map((period) => (
                  <SelectItem key={period._id} value={period._id}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {activeTab === 'income-statement' && !filters.period && (
            <>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </>
          )}
          
          {activeTab === 'balance-sheet' && !filters.period && (
            <div>
              <Label htmlFor="asOfDate">As of Date</Label>
              <Input
                id="asOfDate"
                type="date"
                value={filters.asOfDate}
                onChange={(e) => setFilters({ ...filters, asOfDate: e.target.value })}
              />
            </div>
          )}
          
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

      {/* Statements Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
        </TabsList>
        
        <TabsContent value="income-statement" className="space-y-4">
          {loading ? (
            <Card className="p-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </Card>
          ) : incomeStatement ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(incomeStatement.totalRevenue)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(incomeStatement.totalExpenses)}
                      </p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Gross Profit</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(incomeStatement.grossProfit)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Net Income</p>
                      <p className={`text-2xl font-bold ${incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(incomeStatement.netIncome)}
                      </p>
                    </div>
                    <FileSpreadsheet className="h-8 w-8 text-purple-500" />
                  </div>
                </Card>
              </div>
              
              {/* Income Statement Details */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Income Statement</h3>
                <div className="space-y-4">
                  {/* Revenue Section */}
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">REVENUE</h4>
                    {incomeStatement.revenue.map((category, idx) => (
                      <div key={idx} className="ml-4 mb-2">
                        <p className="font-medium text-sm text-muted-foreground">{category.name}</p>
                        {category.accounts.map((account: any, accIdx: number) => (
                          <div key={accIdx} className="flex justify-between ml-4 py-1">
                            <span className="text-sm">{account.accountName}</span>
                            <span className="text-sm">{formatCurrency(account.amount)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between ml-4 py-1 border-t">
                          <span className="text-sm font-medium">Subtotal</span>
                          <span className="text-sm font-medium">{formatCurrency(category.total)}</span>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total Revenue</span>
                      <span className="text-green-600">{formatCurrency(incomeStatement.totalRevenue)}</span>
                    </div>
                  </div>
                  
                  {/* Expenses Section */}
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">EXPENSES</h4>
                    {incomeStatement.expenses.map((category, idx) => (
                      <div key={idx} className="ml-4 mb-2">
                        <p className="font-medium text-sm text-muted-foreground">{category.name}</p>
                        {category.accounts.map((account: any, accIdx: number) => (
                          <div key={accIdx} className="flex justify-between ml-4 py-1">
                            <span className="text-sm">{account.accountName}</span>
                            <span className="text-sm">{formatCurrency(account.amount)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between ml-4 py-1 border-t">
                          <span className="text-sm font-medium">Subtotal</span>
                          <span className="text-sm font-medium">{formatCurrency(category.total)}</span>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total Expenses</span>
                      <span className="text-red-600">{formatCurrency(incomeStatement.totalExpenses)}</span>
                    </div>
                  </div>
                  
                  {/* Net Income */}
                  <div className="border-t-2 pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>NET INCOME</span>
                      <span className={incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(incomeStatement.netIncome)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                No data available for the selected period
              </div>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="balance-sheet" className="space-y-4">
          {loading ? (
            <Card className="p-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </Card>
          ) : balanceSheet ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Assets</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(balanceSheet.totalAssets)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Liabilities</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(balanceSheet.liabilities.total)}
                      </p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Equity</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(balanceSheet.equity.total)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </Card>
              </div>
              
              {/* Balance Sheet Details */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Balance Sheet as of {formatDate(balanceSheet.asOfDate)}
                </h3>
                <div className="space-y-6">
                  {/* Assets Section */}
                  <div>
                    <h4 className="font-semibold text-blue-600 mb-2">ASSETS</h4>
                    
                    {balanceSheet.assets.current.length > 0 && (
                      <div className="ml-4 mb-3">
                        <p className="font-medium mb-2">Current Assets</p>
                        {balanceSheet.assets.current.map((category, idx) => (
                          <div key={idx} className="ml-4 mb-2">
                            <p className="text-sm text-muted-foreground">{category.name}</p>
                            {category.accounts.map((account: any, accIdx: number) => (
                              <div key={accIdx} className="flex justify-between ml-4 py-1">
                                <span className="text-sm">{account.accountName}</span>
                                <span className="text-sm">{formatCurrency(account.balance)}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {balanceSheet.assets.nonCurrent.length > 0 && (
                      <div className="ml-4 mb-3">
                        <p className="font-medium mb-2">Non-Current Assets</p>
                        {balanceSheet.assets.nonCurrent.map((category, idx) => (
                          <div key={idx} className="ml-4 mb-2">
                            <p className="text-sm text-muted-foreground">{category.name}</p>
                            {category.accounts.map((account: any, accIdx: number) => (
                              <div key={accIdx} className="flex justify-between ml-4 py-1">
                                <span className="text-sm">{account.accountName}</span>
                                <span className="text-sm">{formatCurrency(account.balance)}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total Assets</span>
                      <span className="text-blue-600">{formatCurrency(balanceSheet.totalAssets)}</span>
                    </div>
                  </div>
                  
                  {/* Liabilities Section */}
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">LIABILITIES</h4>
                    
                    {balanceSheet.liabilities.current.length > 0 && (
                      <div className="ml-4 mb-3">
                        <p className="font-medium mb-2">Current Liabilities</p>
                        {balanceSheet.liabilities.current.map((category, idx) => (
                          <div key={idx} className="ml-4 mb-2">
                            <p className="text-sm text-muted-foreground">{category.name}</p>
                            {category.accounts.map((account: any, accIdx: number) => (
                              <div key={accIdx} className="flex justify-between ml-4 py-1">
                                <span className="text-sm">{account.accountName}</span>
                                <span className="text-sm">{formatCurrency(account.balance)}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {balanceSheet.liabilities.nonCurrent.length > 0 && (
                      <div className="ml-4 mb-3">
                        <p className="font-medium mb-2">Non-Current Liabilities</p>
                        {balanceSheet.liabilities.nonCurrent.map((category, idx) => (
                          <div key={idx} className="ml-4 mb-2">
                            <p className="text-sm text-muted-foreground">{category.name}</p>
                            {category.accounts.map((account: any, accIdx: number) => (
                              <div key={accIdx} className="flex justify-between ml-4 py-1">
                                <span className="text-sm">{account.accountName}</span>
                                <span className="text-sm">{formatCurrency(account.balance)}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total Liabilities</span>
                      <span className="text-red-600">{formatCurrency(balanceSheet.liabilities.total)}</span>
                    </div>
                  </div>
                  
                  {/* Equity Section */}
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">EQUITY</h4>
                    {balanceSheet.equity.categories.map((category, idx) => (
                      <div key={idx} className="ml-4 mb-2">
                        <p className="font-medium text-sm text-muted-foreground">{category.name}</p>
                        {category.accounts.map((account: any, accIdx: number) => (
                          <div key={accIdx} className="flex justify-between ml-4 py-1">
                            <span className="text-sm">{account.accountName}</span>
                            <span className="text-sm">{formatCurrency(account.balance)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total Equity</span>
                      <span className="text-green-600">{formatCurrency(balanceSheet.equity.total)}</span>
                    </div>
                  </div>
                  
                  {/* Total Liabilities and Equity */}
                  <div className="border-t-2 pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>TOTAL LIABILITIES AND EQUITY</span>
                      <span>{formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}</span>
                    </div>
                    {Math.abs(balanceSheet.totalAssets - balanceSheet.totalLiabilitiesAndEquity) > 0.01 && (
                      <p className="text-red-600 text-sm mt-2">
                        Warning: Balance sheet is not balanced!
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                No data available for the selected date
              </div>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="cash-flow" className="space-y-4">
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">Cash Flow Statement</p>
              <p className="text-sm mt-2">This feature is coming soon</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

