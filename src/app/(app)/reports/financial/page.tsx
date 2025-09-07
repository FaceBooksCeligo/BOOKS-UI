"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  FileText,
  RefreshCw
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface FinancialReport {
  id: string;
  name: string;
  type: string;
  description: string;
  lastGenerated?: string;
  status: 'READY' | 'GENERATING' | 'ERROR';
}

const FinancialReportsPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  // Date range
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Report type filter
  const [reportType, setReportType] = useState("all");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await api.get("/v1/reports/financial");
      
      if (response.success) {
        setReports((response.data as FinancialReport[]) || []);
      } else {
        toast.error("Failed to load financial reports");
      }
    } catch (error) {
      console.error("Error loading financial reports:", error);
      toast.error("Failed to load financial reports");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportId: string) => {
    try {
      setGenerating(reportId);
      const response = await api.post(`/v1/reports/financial/${reportId}/generate`, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      if (response.success) {
        toast.success("Report generated successfully");
        loadReports();
      } else {
        toast.error("Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setGenerating(null);
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      const response = await api.get(`/v1/reports/financial/${reportId}/download`, {
        responseType: 'blob'
      });
      
      if (response.success) {
        // Create download link
        const url = window.URL.createObjectURL(response.data as Blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `financial-report-${reportId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        toast.error("Failed to download report");
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report");
    }
  };

  const getReportIcon = (type: string) => {
    const typeConfig = {
      'BALANCE_SHEET': BarChart3,
      'INCOME_STATEMENT': TrendingUp,
      'CASH_FLOW': DollarSign,
      'TRIAL_BALANCE': FileText,
      'GENERAL_LEDGER': FileText,
      'AGING_REPORT': Calendar
    };

    return typeConfig[type as keyof typeof typeConfig] || FileText;
  };

  const getReportTypeLabel = (type: string) => {
    const typeConfig = {
      'BALANCE_SHEET': 'Balance Sheet',
      'INCOME_STATEMENT': 'Income Statement',
      'CASH_FLOW': 'Cash Flow Statement',
      'TRIAL_BALANCE': 'Trial Balance',
      'GENERAL_LEDGER': 'General Ledger',
      'AGING_REPORT': 'Aging Report'
    };

    return typeConfig[type as keyof typeof typeConfig] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'READY': { variant: "default" as const, label: "Ready" },
      'GENERATING': { variant: "secondary" as const, label: "Generating" },
      'ERROR': { variant: "destructive" as const, label: "Error" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.READY;
    return config;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredReports = reports.filter(report => 
    reportType === "all" || report.type === reportType
  );

  const reportTypes = [
    { value: "all", label: "All Reports" },
    { value: "BALANCE_SHEET", label: "Balance Sheet" },
    { value: "INCOME_STATEMENT", label: "Income Statement" },
    { value: "CASH_FLOW", label: "Cash Flow Statement" },
    { value: "TRIAL_BALANCE", label: "Trial Balance" },
    { value: "GENERAL_LEDGER", label: "General Ledger" },
    { value: "AGING_REPORT", label: "Aging Report" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">
            Generate and download your financial reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadReports}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Date Range and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Report Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading reports...</div>
          </div>
        ) : (
          filteredReports.map((report) => {
            const Icon = getReportIcon(report.type);
            const statusConfig = getStatusBadge(report.status);
            
            return (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <CardDescription>{getReportTypeLabel(report.type)}</CardDescription>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusConfig.variant === 'default' ? 'bg-green-100 text-green-800' :
                      statusConfig.variant === 'secondary' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {statusConfig.label}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                  
                  {report.lastGenerated && (
                    <div className="text-sm text-muted-foreground">
                      Last generated: {formatDate(report.lastGenerated)}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => generateReport(report.id)}
                      disabled={generating === report.id || report.status === 'GENERATING'}
                      className="flex-1"
                    >
                      {generating === report.id ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <BarChart3 className="h-4 w-4 mr-2" />
                      )}
                      {generating === report.id ? 'Generating...' : 'Generate'}
                    </Button>
                    
                    {report.status === 'READY' && (
                      <Button
                        variant="outline"
                        onClick={() => downloadReport(report.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {!loading && filteredReports.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No reports found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or date range
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialReportsPage;