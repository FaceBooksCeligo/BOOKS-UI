"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { DollarSign, Users, ShoppingCart, TrendingUp, RefreshCw } from "lucide-react";

interface DashboardData {
  totalRevenue: number;
  totalCustomers: number;
  totalInvoices: number;
  pendingInvoices: number;
  recentTransactions: any[];
  topCustomers: any[];
  lowStockItems: any[];
}

export default function DashboardPage() {
  const { user, orgId } = useAuthStore();
  const [data, setData] = useState<DashboardData>({
    totalRevenue: 0,
    totalCustomers: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
    recentTransactions: [],
    topCustomers: [],
    lowStockItems: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [orgId]);

  const loadDashboardData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [revenueRes, customersRes, invoicesRes, transactionsRes, topCustomersRes, lowStockRes] = await Promise.all([
        api.get<{ total: number }>("/v1/reports/revenue-summary"),
        api.get<any[]>("/v1/contacts", { "filter[type]": "CUSTOMER" }),
        api.get<any[]>("/v1/invoices"),
        api.get<any[]>("/v1/transactions/recent"),
        api.get<any[]>("/v1/reports/top-customers"),
        api.get<any[]>("/v1/items", { "filter[status]": "ACTIVE" }),
      ]);

      setData({
        totalRevenue: revenueRes.success ? revenueRes.data.total : 0,
        totalCustomers: customersRes.success ? customersRes.data.length : 0,
        totalInvoices: invoicesRes.success ? invoicesRes.data.length : 0,
        pendingInvoices: invoicesRes.success ? invoicesRes.data.filter((inv: any) => inv.status === "PENDING").length : 0,
        recentTransactions: transactionsRes.success ? transactionsRes.data : [],
        topCustomers: topCustomersRes.success ? topCustomersRes.data : [],
        lowStockItems: lowStockRes.success ? lowStockRes.data.filter((item: any) => item.onHand <= item.reorderPoint) : [],
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your business performance</p>
        </div>
        <Button variant="outline" onClick={loadDashboardData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Revenue to date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Active customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">All invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {loading ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Loading transactions...
              </div>
            ) : data.recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {data.recentTransactions.slice(0, 5).map((transaction: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {transaction.description || "Transaction"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(transaction.amount || 0)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No recent transactions
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="h-4 bg-muted rounded w-24"></div>
                      <div className="h-3 bg-muted rounded w-32"></div>
                    </div>
                    <div className="h-4 bg-muted rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : data.topCustomers.length > 0 ? (
              <div className="space-y-4">
                {data.topCustomers.slice(0, 5).map((customer: any, index: number) => (
                  <div key={index} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {customer.name || customer.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {customer.email}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {formatCurrency(customer.totalSpent || 0)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No customer data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {data.lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Low Stock Alert</CardTitle>
            <CardDescription>
              The following items are running low on stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {data.lowStockItems.slice(0, 6).map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {item.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">
                      {item.onHand} left
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reorder at {item.reorderPoint}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}