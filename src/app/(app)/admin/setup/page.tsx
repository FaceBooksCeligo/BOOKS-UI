"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  Settings, 
  DollarSign, 
  FileText, 
  Upload, 
  Download,
  Shield,
  Globe,
  CreditCard,
  Calculator,
  Mail,
  Palette,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface SetupSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "completed" | "in_progress" | "pending";
  route: string;
  features: string[];
}

const setupSections: SetupSection[] = [
  {
    id: "company",
    title: "Company & Entities",
    description: "Set up your company information, legal entities, and organizational structure",
    icon: <Building2 className="h-6 w-6" />,
    status: "completed",
    route: "/admin/company",
    features: ["Company Profile", "Legal Entities", "Addresses", "Tax IDs", "Registration Info"]
  },
  {
    id: "users",
    title: "Users & Roles",
    description: "Manage user accounts, roles, and permissions for your organization",
    icon: <Users className="h-6 w-6" />,
    status: "completed",
    route: "/admin/users",
    features: ["User Management", "Role Assignment", "Permission Control", "Access Levels", "Security Settings"]
  },
  {
    id: "chart-of-accounts",
    title: "Chart of Accounts",
    description: "Configure your chart of accounts and account structure",
    icon: <DollarSign className="h-6 w-6" />,
    status: "in_progress",
    route: "/admin/chart-of-accounts",
    features: ["Account Types", "Account Categories", "Account Codes", "Parent-Child Relationships", "Account Mapping"]
  },
  {
    id: "numbering",
    title: "Numbering Sequences",
    description: "Set up automatic numbering for invoices, orders, and other documents",
    icon: <FileText className="h-6 w-6" />,
    status: "pending",
    route: "/admin/numbering",
    features: ["Invoice Numbers", "Order Numbers", "Receipt Numbers", "Custom Formats", "Reset Periods"]
  },
  {
    id: "terms",
    title: "Terms & Payment Methods",
    description: "Configure payment terms, methods, and customer/vendor terms",
    icon: <CreditCard className="h-6 w-6" />,
    status: "pending",
    route: "/admin/terms",
    features: ["Payment Terms", "Payment Methods", "Credit Terms", "Discount Terms", "Late Fees"]
  },
  {
    id: "currency",
    title: "Currencies & Exchange Rates",
    description: "Set up multi-currency support and exchange rate management",
    icon: <Globe className="h-6 w-6" />,
    status: "pending",
    route: "/admin/currency",
    features: ["Base Currency", "Foreign Currencies", "Exchange Rates", "Auto Updates", "Currency Symbols"]
  },
  {
    id: "tax",
    title: "Tax Setup",
    description: "Configure tax codes, rates, and tax reporting settings",
    icon: <Calculator className="h-6 w-6" />,
    status: "in_progress",
    route: "/admin/tax",
    features: ["Tax Codes", "Tax Rates", "Tax Groups", "Tax Reports", "Compliance Settings"]
  },
  {
    id: "templates",
    title: "Templates & Branding",
    description: "Customize document templates, email templates, and company branding",
    icon: <Palette className="h-6 w-6" />,
    status: "pending",
    route: "/admin/templates",
    features: ["Document Templates", "Email Templates", "Logo & Branding", "Color Schemes", "Custom Fields"]
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Connect with external services and third-party applications",
    icon: <Zap className="h-6 w-6" />,
    status: "pending",
    route: "/admin/integrations",
    features: ["Bank Feeds", "Payment Gateways", "Email Services", "Accounting Software", "API Keys"]
  },
  {
    id: "approvals",
    title: "Approval Rules",
    description: "Set up approval workflows and authorization rules",
    icon: <Shield className="h-6 w-6" />,
    status: "pending",
    route: "/admin/approvals",
    features: ["Approval Workflows", "Authorization Rules", "Amount Limits", "Department Rules", "Escalation"]
  },
  {
    id: "import",
    title: "Import/Export",
    description: "Configure data import and export settings and templates",
    icon: <Upload className="h-6 w-6" />,
    status: "pending",
    route: "/admin/import",
    features: ["Data Import", "Export Templates", "Mapping Rules", "Validation Rules", "Scheduled Imports"]
  },
  {
    id: "audit",
    title: "Audit Log",
    description: "View and manage system audit logs and user activity",
    icon: <Settings className="h-6 w-6" />,
    status: "pending",
    route: "/admin/audit",
    features: ["User Activity", "System Changes", "Data Modifications", "Login History", "Security Events"]
  }
];

export default function AdminSetupPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const filteredSections = setupSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: setupSections.length,
    completed: setupSections.filter(s => s.status === "completed").length,
    inProgress: setupSections.filter(s => s.status === "in_progress").length,
    pending: setupSections.filter(s => s.status === "pending").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Setup</h1>
          <p className="text-muted-foreground">
            Configure your accounting system settings and preferences
          </p>
        </div>
      </div>

      {/* Setup Progress */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSections.map((section) => (
          <Card 
            key={section.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(section.route)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    {section.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {section.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(section.status)}
                  {getStatusBadge(section.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Features:</h4>
                <ul className="text-sm space-y-1">
                  {section.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                      {feature}
                    </li>
                  ))}
                  {section.features.length > 3 && (
                    <li className="text-xs text-muted-foreground">
                      +{section.features.length - 3} more features
                    </li>
                  )}
                </ul>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(section.route);
                  }}
                >
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common setup tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => router.push("/admin/chart-of-accounts/new")}
            >
              <DollarSign className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Add Account</div>
                <div className="text-xs text-muted-foreground">Create new chart of accounts entry</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => router.push("/admin/users")}
            >
              <Users className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Add User</div>
                <div className="text-xs text-muted-foreground">Create new user account</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => router.push("/admin/company")}
            >
              <Building2 className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Company Info</div>
                <div className="text-xs text-muted-foreground">Update company details</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
