'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowLeft, Save, FileText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface JournalLine {
  account: string;
  accountName?: string;
  description: string;
  debit: number;
  credit: number;
  department?: string;
  location?: string;
  project?: string;
  customer?: string;
  vendor?: string;
}

export default function NewJournalEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copyId = searchParams.get('copy');
  
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    transactionDate: new Date().toISOString().split('T')[0],
    period: '',
    description: '',
    memo: '',
    notes: ''
  });
  
  const [lines, setLines] = useState<JournalLine[]>([
    { account: '', description: '', debit: 0, credit: 0 },
    { account: '', description: '', debit: 0, credit: 0 }
  ]);

  useEffect(() => {
    fetchReferenceData();
    if (copyId) {
      fetchEntryToCopy(copyId);
    }
  }, [copyId]);

  const fetchReferenceData = async () => {
    try {
      // Fetch accounts
      const accountsRes = await api.get('/v1/accounts');
      setAccounts(accountsRes.data);
      
      // Fetch periods
      const periodsRes = await api.get('/v1/general-ledger/periods', {
        params: { status: 'OPEN' }
      });
      setPeriods(periodsRes.data);
      
      // Set current period if available
      if (periodsRes.data.length > 0) {
        const currentPeriod = periodsRes.data.find((p: any) => p.status === 'OPEN');
        if (currentPeriod) {
          setFormData(prev => ({ ...prev, period: currentPeriod._id }));
        }
      }
      
      // Fetch other reference data
      try {
        const [deptRes, projRes, custRes, vendRes] = await Promise.all([
          api.get('/v1/departments').catch(() => ({ data: [] })),
          api.get('/v1/projects').catch(() => ({ data: [] })),
          api.get('/v1/customers').catch(() => ({ data: [] })),
          api.get('/v1/vendors').catch(() => ({ data: [] }))
        ]);
        
        setDepartments(deptRes.data);
        setProjects(projRes.data);
        setCustomers(custRes.data);
        setVendors(vendRes.data);
      } catch (error) {
        console.log('Some reference data not available');
      }
    } catch (error) {
      console.error('Error fetching reference data:', error);
      toast.error('Failed to load reference data');
    }
  };

  const fetchEntryToCopy = async (id: string) => {
    try {
      const response = await api.get(`/v1/general-ledger/journal-entries/${id}`);
      const entry = response.data;
      
      // Copy the entry data
      setFormData({
        transactionDate: new Date().toISOString().split('T')[0],
        period: entry.period?._id || '',
        description: `Copy of ${entry.description}`,
        memo: entry.memo || '',
        notes: entry.notes || ''
      });
      
      // Copy the lines
      setLines(entry.lines.map((line: any) => ({
        account: line.account._id || line.account,
        accountName: line.account.name || line.accountName,
        description: line.description || '',
        debit: line.debit || 0,
        credit: line.credit || 0,
        department: line.department?._id || line.department,
        location: line.location?._id || line.location,
        project: line.project?._id || line.project,
        customer: line.customer?._id || line.customer,
        vendor: line.vendor?._id || line.vendor
      })));
    } catch (error) {
      console.error('Error fetching entry to copy:', error);
      toast.error('Failed to load entry to copy');
    }
  };

  const handleSubmit = async (e: React.FormEvent, postImmediately = false) => {
    e.preventDefault();
    
    // Validate
    if (!formData.description) {
      toast.error('Please enter a description');
      return;
    }
    
    if (lines.every(line => !line.account)) {
      toast.error('Please add at least one line');
      return;
    }
    
    // Check if balanced
    const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast.error(`Entry is not balanced. Difference: ${Math.abs(totalDebit - totalCredit).toFixed(2)}`);
      return;
    }
    
    try {
      setLoading(true);
      
      // Filter out empty lines
      const validLines = lines.filter(line => line.account);
      
      const payload = {
        ...formData,
        lines: validLines.map(line => ({
          account: line.account,
          description: line.description,
          debit: line.debit || 0,
          credit: line.credit || 0,
          department: line.department,
          location: line.location,
          project: line.project,
          customer: line.customer,
          vendor: line.vendor
        }))
      };
      
      const response = await api.post('/v1/general-ledger/journal-entries', payload);
      
      // If post immediately is requested, post the entry
      if (postImmediately && response.data._id) {
        await api.post(`/v1/general-ledger/journal-entries/${response.data._id}/post`);
        toast.success('Journal entry created and posted successfully');
      } else {
        toast.success('Journal entry created successfully');
      }
      
      router.push('/general-ledger/journal-entries');
    } catch (error: any) {
      console.error('Error creating journal entry:', error);
      toast.error(error.response?.data?.error || 'Failed to create journal entry');
    } finally {
      setLoading(false);
    }
  };

  const addLine = () => {
    setLines([...lines, { account: '', description: '', debit: 0, credit: 0 }]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const updateLine = (index: number, field: keyof JournalLine, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    
    // If account is changed, update account name
    if (field === 'account') {
      const account = accounts.find(a => a._id === value);
      if (account) {
        newLines[index].accountName = account.name;
      }
    }
    
    setLines(newLines);
  };

  const calculateTotals = () => {
    const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    const difference = Math.abs(totalDebit - totalCredit);
    const isBalanced = difference < 0.01;
    
    return { totalDebit, totalCredit, difference, isBalanced };
  };

  const { totalDebit, totalCredit, difference, isBalanced } = calculateTotals();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/general-ledger/journal-entries')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">New Journal Entry</h1>
          <p className="text-muted-foreground mt-1">
            Create a new general ledger journal entry
          </p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Entry Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transactionDate">Transaction Date</Label>
              <Input
                id="transactionDate"
                type="date"
                value={formData.transactionDate}
                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="period">Period</Label>
              <Select
                value={formData.period}
                onValueChange={(value) => setFormData({ ...formData, period: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period._id} value={period._id}>
                      {period.name} ({period.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter journal entry description"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="memo">Memo</Label>
              <Textarea
                id="memo"
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                placeholder="Optional memo"
                rows={2}
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Internal notes (not visible on reports)"
                rows={2}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Journal Lines</h2>
            <Button type="button" onClick={addLine} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Line
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Account</th>
                  <th className="text-left py-2 px-2">Description</th>
                  <th className="text-left py-2 px-2">Project</th>
                  <th className="text-right py-2 px-2">Debit</th>
                  <th className="text-right py-2 px-2">Credit</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-2">
                      <Select
                        value={line.account}
                        onValueChange={(value) => updateLine(index, 'account', value)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account._id} value={account._id}>
                              {account.code} - {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        value={line.description}
                        onChange={(e) => updateLine(index, 'description', e.target.value)}
                        placeholder="Line description"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Select
                        value={line.project || ''}
                        onValueChange={(value) => updateLine(index, 'project', value)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {projects.map((project) => (
                            <SelectItem key={project._id} value={project._id}>
                              {project.projectNumber} - {project.projectName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={line.debit || ''}
                        onChange={(e) => updateLine(index, 'debit', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="text-right w-[120px]"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={line.credit || ''}
                        onChange={(e) => updateLine(index, 'credit', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="text-right w-[120px]"
                      />
                    </td>
                    <td className="py-2 px-2">
                      {lines.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLine(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold">
                  <td colSpan={3} className="py-2 px-2 text-right">Totals:</td>
                  <td className="py-2 px-2 text-right">{formatCurrency(totalDebit)}</td>
                  <td className="py-2 px-2 text-right">{formatCurrency(totalCredit)}</td>
                  <td></td>
                </tr>
                {!isBalanced && (
                  <tr>
                    <td colSpan={6} className="py-2 px-2 text-center text-red-600">
                      Entry is not balanced. Difference: {formatCurrency(difference)}
                    </td>
                  </tr>
                )}
                {isBalanced && totalDebit > 0 && (
                  <tr>
                    <td colSpan={6} className="py-2 px-2 text-center text-green-600">
                      ✓ Entry is balanced
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/general-ledger/journal-entries')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !isBalanced}
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            type="button"
            onClick={(e) => handleSubmit(e as any, true)}
            disabled={loading || !isBalanced}
          >
            <FileText className="h-4 w-4 mr-2" />
            Save and Post
          </Button>
        </div>
      </form>
    </div>
  );
}

