"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import { ArrowLeft, Save } from "lucide-react";

type BankAccountApi = {
  _id?: string;
  id?: string;
  name?: string;
  accountName?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  accountType?: string;
  currency?: string;
  status?: string;
  glAccountId?: string;
};

export default function EditBankAccountPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const accountId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [glAccountId, setGlAccountId] = useState<string>("");

  const [form, setForm] = useState({
    accountName: "",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    accountType: "CHECKING",
    currency: "USD",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (!accountId) return;
    loadAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  const loadAccount = async () => {
    try {
      setLoading(true);
      const res = await api.get<BankAccountApi>(`/v1/banking/accounts/${accountId}`);
      if (!res.success || !res.data) {
        toast.error("Failed to load bank account");
        return;
      }
      const a = res.data as BankAccountApi;
      setForm({
        accountName: a.accountName || a.name || "",
        bankName: a.bankName || "",
        accountNumber: String(a.accountNumber || ""),
        routingNumber: String(a.routingNumber || ""),
        accountType: (a.accountType as any) || "CHECKING",
        currency: a.currency || "USD",
        status: a.status || "ACTIVE",
      });
      setGlAccountId(a.glAccountId || "");
    } catch (e) {
      console.error(e);
      toast.error("Failed to load bank account");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!accountId) return;
    if (!form.accountName || !form.bankName || !form.accountNumber) {
      toast.error("Please fill required fields");
      return;
    }
    try {
      setSaving(true);
      const payload: BankAccountApi = {
        name: form.accountName,
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        routingNumber: form.routingNumber,
        accountType: form.accountType,
        currency: form.currency,
        status: form.status,
        glAccountId: glAccountId || undefined,
      };
      const res = await api.put(`/v1/banking/accounts/${accountId}`, payload);
      if (res.success) {
        toast.success("Bank account updated");
        router.push("/banking/accounts");
      } else {
        toast.error("Update failed");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Bank Account</h1>
            <p className="text-muted-foreground">Update account details</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving || loading}>
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountName">Account Name</Label>
                <Input id="accountName" value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input id="accountNumber" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input id="routingNumber" value={form.routingNumber} onChange={(e) => setForm({ ...form, routingNumber: e.target.value })} />
              </div>
              <div>
                <Label>Account Type</Label>
                <Select value={form.accountType} onValueChange={(v) => setForm({ ...form, accountType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHECKING">Checking</SelectItem>
                    <SelectItem value="SAVINGS">Savings</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="LOAN">Loan</SelectItem>
                    <SelectItem value="INVESTMENT">Investment</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


