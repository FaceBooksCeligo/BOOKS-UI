'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Lock, 
  Unlock, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Plus,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface GLPeriod {
  _id: string;
  periodId: string;
  name: string;
  year: number;
  quarter?: number;
  month?: number;
  periodNumber: number;
  startDate: string;
  endDate: string;
  status: string;
  isAdjustment: boolean;
  isYearEnd: boolean;
  allowPosting: boolean;
  closedDate?: string;
  closedBy?: any;
  lockedDate?: string;
  lockedBy?: any;
  periodBalances?: {
    revenue: number;
    expenses: number;
    netIncome: number;
  };
  transactionCounts?: {
    total: number;
  };
}

export default function PeriodManagementPage() {
  const [periods, setPeriods] = useState<GLPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPeriodDialog, setShowNewPeriodDialog] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [newPeriod, setNewPeriod] = useState({
    name: '',
    year: new Date().getFullYear(),
    quarter: 1,
    month: 1,
    periodNumber: 1,
    startDate: '',
    endDate: '',
    isAdjustment: false,
    isYearEnd: false
  });

  useEffect(() => {
    fetchPeriods();
  }, [selectedYear]);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const response = await api.get('/v1/general-ledger/periods', {
        params: { year: selectedYear }
      });
      setPeriods(response.data);
    } catch (error: any) {
      console.error('Error fetching periods:', error);
      toast.error('Failed to load periods');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePeriod = async () => {
    try {
      await api.post('/v1/general-ledger/periods', newPeriod);
      toast.success('Period created successfully');
      setShowNewPeriodDialog(false);
      fetchPeriods();
      // Reset form
      setNewPeriod({
        name: '',
        year: new Date().getFullYear(),
        quarter: 1,
        month: 1,
        periodNumber: 1,
        startDate: '',
        endDate: '',
        isAdjustment: false,
        isYearEnd: false
      });
    } catch (error: any) {
      console.error('Error creating period:', error);
      toast.error(error.response?.data?.error || 'Failed to create period');
    }
  };

  const handleClosePeriod = async (periodId: string) => {
    if (!confirm('Are you sure you want to close this period? This action cannot be easily undone.')) {
      return;
    }
    
    try {
      await api.post(`/v1/general-ledger/periods/${periodId}/close`);
      toast.success('Period closed successfully');
      fetchPeriods();
    } catch (error: any) {
      console.error('Error closing period:', error);
      toast.error(error.response?.data?.error || 'Failed to close period');
    }
  };

  const handleLockPeriod = async (periodId: string) => {
    if (!confirm('Are you sure you want to lock this period? No changes will be allowed.')) {
      return;
    }
    
    try {
      await api.post(`/v1/general-ledger/periods/${periodId}/lock`);
      toast.success('Period locked successfully');
      fetchPeriods();
    } catch (error: any) {
      console.error('Error locking period:', error);
      toast.error(error.response?.data?.error || 'Failed to lock period');
    }
  };

  const handleReopenPeriod = async (periodId: string) => {
    if (!confirm('Are you sure you want to reopen this period?')) {
      return;
    }
    
    try {
      await api.post(`/v1/general-ledger/periods/${periodId}/reopen`);
      toast.success('Period reopened successfully');
      fetchPeriods();
    } catch (error: any) {
      console.error('Error reopening period:', error);
      toast.error(error.response?.data?.error || 'Failed to reopen period');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'CLOSED':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'LOCKED':
        return <Lock className="h-5 w-5 text-red-500" />;
      case 'FUTURE':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge className="bg-green-100 text-green-800">Open</Badge>;
      case 'CLOSED':
        return <Badge className="bg-yellow-100 text-yellow-800">Closed</Badge>;
      case 'LOCKED':
        return <Badge className="bg-red-100 text-red-800">Locked</Badge>;
      case 'FUTURE':
        return <Badge className="bg-blue-100 text-blue-800">Future</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Period Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage accounting periods and control posting access
          </p>
        </div>
        <Dialog open={showNewPeriodDialog} onOpenChange={setShowNewPeriodDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Period
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Period</DialogTitle>
              <DialogDescription>
                Set up a new accounting period for transaction posting
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Period Name *</Label>
                <Input
                  id="name"
                  value={newPeriod.name}
                  onChange={(e) => setNewPeriod({ ...newPeriod, name: e.target.value })}
                  placeholder="e.g., January 2024"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={newPeriod.year}
                    onChange={(e) => setNewPeriod({ ...newPeriod, year: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="periodNumber">Period Number *</Label>
                  <Input
                    id="periodNumber"
                    type="number"
                    value={newPeriod.periodNumber}
                    onChange={(e) => setNewPeriod({ ...newPeriod, periodNumber: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quarter">Quarter</Label>
                  <Input
                    id="quarter"
                    type="number"
                    min="1"
                    max="4"
                    value={newPeriod.quarter}
                    onChange={(e) => setNewPeriod({ ...newPeriod, quarter: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="month">Month</Label>
                  <Input
                    id="month"
                    type="number"
                    min="1"
                    max="12"
                    value={newPeriod.month}
                    onChange={(e) => setNewPeriod({ ...newPeriod, month: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newPeriod.startDate}
                    onChange={(e) => setNewPeriod({ ...newPeriod, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newPeriod.endDate}
                    onChange={(e) => setNewPeriod({ ...newPeriod, endDate: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPeriod.isAdjustment}
                    onChange={(e) => setNewPeriod({ ...newPeriod, isAdjustment: e.target.checked })}
                  />
                  <span className="text-sm">Adjustment Period</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPeriod.isYearEnd}
                    onChange={(e) => setNewPeriod({ ...newPeriod, isYearEnd: e.target.checked })}
                  />
                  <span className="text-sm">Year-End Period</span>
                </label>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewPeriodDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePeriod}>
                  Create Period
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Year Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Label>Select Year:</Label>
          <div className="flex gap-2">
            {years.map((year) => (
              <Button
                key={year}
                variant={selectedYear === year ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Current Period Highlight */}
      {periods.find(p => p.status === 'OPEN') && (
        <Card className="p-6 border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h2 className="text-lg font-semibold">Current Open Period</h2>
                <p className="text-sm text-muted-foreground">
                  {periods.find(p => p.status === 'OPEN')?.name} 
                  ({formatDate(periods.find(p => p.status === 'OPEN')?.startDate || '')} - 
                  {formatDate(periods.find(p => p.status === 'OPEN')?.endDate || '')})
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="text-2xl font-bold">
                {periods.find(p => p.status === 'OPEN')?.transactionCounts?.total || 0}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Periods Grid */}
      {loading ? (
        <Card className="p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {periods.map((period) => (
            <Card key={period._id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(period.status)}
                  <h3 className="font-semibold">{period.name}</h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {period.status === 'OPEN' && (
                      <>
                        <DropdownMenuItem onClick={() => handleClosePeriod(period._id)}>
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Close Period
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleLockPeriod(period._id)}>
                          <Lock className="mr-2 h-4 w-4" />
                          Lock Period
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {period.status === 'CLOSED' && (
                      <>
                        <DropdownMenuItem onClick={() => handleReopenPeriod(period._id)}>
                          <Unlock className="mr-2 h-4 w-4" />
                          Reopen Period
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleLockPeriod(period._id)}>
                          <Lock className="mr-2 h-4 w-4" />
                          Lock Period
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {period.status === 'FUTURE' && (
                      <DropdownMenuItem onClick={() => handleReopenPeriod(period._id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Open Period
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge(period.status)}
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Period</span>
                  <span className="text-sm font-medium">
                    {formatDate(period.startDate)} - {formatDate(period.endDate)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transactions</span>
                  <span className="text-sm font-medium">{period.transactionCounts?.total || 0}</span>
                </div>
                
                {period.periodBalances && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Revenue</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(period.periodBalances.revenue)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Expenses</span>
                      <span className="text-sm font-medium text-red-600">
                        {formatCurrency(period.periodBalances.expenses)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-sm font-medium">Net Income</span>
                      <span className={`text-sm font-bold ${
                        period.periodBalances.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(period.periodBalances.netIncome)}
                      </span>
                    </div>
                  </>
                )}
                
                {period.isAdjustment && (
                  <Badge variant="outline" className="w-full justify-center">
                    Adjustment Period
                  </Badge>
                )}
                
                {period.isYearEnd && (
                  <Badge variant="outline" className="w-full justify-center">
                    Year-End Period
                  </Badge>
                )}
                
                {period.closedDate && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Closed on {formatDate(period.closedDate)}
                      {period.closedBy && ` by ${period.closedBy.name}`}
                    </p>
                  </div>
                )}
                
                {period.lockedDate && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Locked on {formatDate(period.lockedDate)}
                      {period.lockedBy && ` by ${period.lockedBy.name}`}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && periods.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Periods Found</h3>
            <p className="text-muted-foreground mb-4">
              No accounting periods exist for {selectedYear}
            </p>
            <Button onClick={() => setShowNewPeriodDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Period
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

