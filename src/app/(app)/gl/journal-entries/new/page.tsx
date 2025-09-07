"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Calculator,
  FileText,
  Calendar,
  DollarSign,
  Minus
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  category: string;
}

interface JournalEntryLine {
  id: string;
  accountId: string;
  account: Account;
  description: string;
  debit: number;
  credit: number;
}

const NewJournalEntryPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    entryNumber: "",
    entryDate: new Date().toISOString().split('T')[0],
    description: "",
    reference: ""
  });

  // Data for dropdowns
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Journal entry lines
  const [lines, setLines] = useState<JournalEntryLine[]>([]);
  const [newLine, setNewLine] = useState<JournalEntryLine>({
    id: "",
    accountId: "",
    account: { id: "", code: "", name: "", type: "", category: "" },
    description: "",
    debit: 0,
    credit: 0
  });

  // Calculations
  const [totalDebits, setTotalDebits] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [isBalanced, setIsBalanced] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [lines]);

  const loadAccounts = async () => {
    try {
      const response = await api.get<Account[]>("/v1/accounts");
      if (response.success) {
        setAccounts((response.data as Account[]) || []);
      }
    } catch (error) {
      console.error("Error loading accounts:", error);
    }
  };

  const calculateTotals = () => {
    const debits = lines.reduce((sum, line) => sum + line.debit, 0);
    const credits = lines.reduce((sum, line) => sum + line.credit, 0);
    const balanced = Math.abs(debits - credits) < 0.01; // Allow for small rounding differences

    setTotalDebits(debits);
    setTotalCredits(credits);
    setIsBalanced(balanced);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLineChange = (field: keyof JournalEntryLine, value: any) => {
    setNewLine(prev => ({ ...prev, [field]: value }));
  };

  const handleAccountChange = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (account) {
      setNewLine(prev => ({
        ...prev,
        accountId,
        account
      }));
    }
  };

  const addLine = () => {
    if (!newLine.accountId) {
      toast.error("Please select an account");
      return;
    }

    if (newLine.debit === 0 && newLine.credit === 0) {
      toast.error("Please enter either a debit or credit amount");
      return;
    }

    if (newLine.debit > 0 && newLine.credit > 0) {
      toast.error("Please enter either a debit or credit amount, not both");
      return;
    }

    const line: JournalEntryLine = {
      ...newLine,
      id: Date.now().toString()
    };

    setLines(prev => [...prev, line]);
    setNewLine({
      id: "",
      accountId: "",
      account: { id: "", code: "", name: "", type: "", category: "" },
      description: "",
      debit: 0,
      credit: 0
    });
  };

  const removeLine = (id: string) => {
    setLines(prev => prev.filter(line => line.id !== id));
  };

  const handleSave = async (saveAndNew = false) => {
    if (lines.length === 0) {
      toast.error("Please add at least one journal entry line");
      return;
    }

    if (!isBalanced) {
      toast.error("Journal entry must be balanced (total debits = total credits)");
      return;
    }

    try {
      setSaving(true);

      const entryData = {
        entryNumber: formData.entryNumber || `JE-${Date.now()}`,
        entryDate: formData.entryDate,
        description: formData.description,
        reference: formData.reference,
        lines: lines.map(line => ({
          accountId: line.accountId,
          description: line.description,
          debit: line.debit,
          credit: line.credit
        })),
        totalDebits,
        totalCredits
      };

      const response = await api.post("/v1/journal-entries", entryData);

      if (response.success) {
        toast.success("Journal entry created successfully");
        if (saveAndNew) {
          // Reset form
          setFormData({
            entryNumber: "",
            entryDate: new Date().toISOString().split('T')[0],
            description: "",
            reference: ""
          });
          setLines([]);
        } else {
          router.push("/gl/journal-entries");
        }
      } else {
        toast.error("Failed to create journal entry");
      }
    } catch (error) {
      console.error("Error creating journal entry:", error);
      toast.error("Failed to create journal entry");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Journal Entry</h1>
          <p className="text-muted-foreground">
            Create a new general ledger journal entry
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Entry Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Entry Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="entryNumber">Entry Number</Label>
                  <Input
                    id="entryNumber"
                    value={formData.entryNumber}
                    onChange={(e) => handleInputChange("entryNumber", e.target.value)}
                    placeholder="Auto-generated if empty"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entryDate">Entry Date *</Label>
                  <Input
                    id="entryDate"
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => handleInputChange("entryDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter entry description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => handleInputChange("reference", e.target.value)}
                    placeholder="Optional reference"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Journal Entry Lines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Journal Entry Lines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Line Form */}
              <div className="grid gap-4 md:grid-cols-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="accountId">Account *</Label>
                  <Select
                    value={newLine.accountId}
                    onValueChange={handleAccountChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="lineDescription">Description</Label>
                  <Input
                    id="lineDescription"
                    value={newLine.description}
                    onChange={(e) => handleLineChange("description", e.target.value)}
                    placeholder="Line description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="debit">Debit</Label>
                  <Input
                    id="debit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newLine.debit}
                    onChange={(e) => handleLineChange("debit", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credit">Credit</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="credit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newLine.credit}
                      onChange={(e) => handleLineChange("credit", parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                    <Button onClick={addLine} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Lines List */}
              {lines.length > 0 && (
                <div className="space-y-2">
                  <div className="grid gap-2 md:grid-cols-6 text-sm font-medium text-muted-foreground border-b pb-2">
                    <div>Account</div>
                    <div className="md:col-span-2">Description</div>
                    <div className="text-right">Debit</div>
                    <div className="text-right">Credit</div>
                    <div className="text-center">Actions</div>
                  </div>
                  {lines.map((line) => (
                    <div key={line.id} className="grid gap-2 md:grid-cols-6 items-center py-2 border-b">
                      <div className="text-sm">
                        <div className="font-medium">{line.account.code}</div>
                        <div className="text-muted-foreground">{line.account.name}</div>
                      </div>
                      <div className="md:col-span-2 text-sm">{line.description}</div>
                      <div className="text-right text-sm font-medium text-red-600">
                        {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                      </div>
                      <div className="text-right text-sm font-medium text-green-600">
                        {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                      </div>
                      <div className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLine(line.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Entry Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Debits:</span>
                  <span className="font-medium text-red-600">{formatCurrency(totalDebits)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Credits:</span>
                  <span className="font-medium text-green-600">{formatCurrency(totalCredits)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difference:</span>
                  <span className={`font-medium ${Math.abs(totalDebits - totalCredits) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(totalDebits - totalCredits))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                    {isBalanced ? 'Balanced' : 'Not Balanced'}
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  onClick={() => handleSave(false)}
                  disabled={saving || lines.length === 0 || !isBalanced}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Entry"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSave(true)}
                  disabled={saving || lines.length === 0 || !isBalanced}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save & New
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewJournalEntryPage;
