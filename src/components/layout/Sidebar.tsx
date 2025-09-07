"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  CreditCard, 
  Package, 
  Clock, 
  Building2, 
  Receipt, 
  FileText, 
  BarChart3, 
  Settings,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { 
    label: "Dashboard", 
    href: "/dashboard", 
    icon: LayoutDashboard 
  },
  { 
    label: "Sales", 
    icon: ShoppingCart,
    children: [
      { label: "Estimates", href: "/sales/estimates" },
      { label: "Sales Orders", href: "/sales/orders" },
      { label: "Invoices", href: "/sales/invoices" },
      { label: "Receive Payments", href: "/sales/payments" },
      { label: "Credit Memos", href: "/sales/credits" },
      { label: "Customers", href: "/sales/customers" },
    ]
  },
  { 
    label: "Purchases", 
    icon: CreditCard,
    children: [
      { label: "Purchase Requests", href: "/purchases/requests" },
      { label: "Purchase Orders", href: "/purchases/orders" },
      { label: "Bills", href: "/purchases/bills" },
      { label: "Pay Bills", href: "/purchases/payments" },
      { label: "Vendor Credits", href: "/purchases/credits" },
      { label: "Vendors", href: "/purchases/vendors" },
    ]
  },
  { 
    label: "Banking", 
    icon: Building2,
    children: [
      { label: "Bank Accounts", href: "/banking/accounts" },
      { label: "Bank Feeds", href: "/banking/feeds" },
      { label: "Rules", href: "/banking/rules" },
      { label: "Reconciliation", href: "/banking/reconciliation" },
      { label: "Transfers & Deposits", href: "/banking/transfers" },
      { label: "Check Printing", href: "/banking/checks" },
    ]
  },
  { 
    label: "Inventory", 
    icon: Package,
    children: [
      { label: "Items", href: "/inventory/items" },
      { label: "Warehouses", href: "/inventory/warehouses" },
      { label: "Stock Adjustments", href: "/inventory/adjustments" },
      { label: "Transfers", href: "/inventory/transfers" },
      { label: "Counts", href: "/inventory/counts" },
      { label: "Assemblies/BOM", href: "/inventory/assemblies" },
    ]
  },
  { 
    label: "Projects & Time", 
    icon: Clock,
    children: [
      { label: "Projects", href: "/projects" },
      { label: "Time Entries", href: "/projects/time" },
      { label: "Expenses", href: "/projects/expenses" },
    ]
  },
  { 
    label: "Fixed Assets", 
    icon: Building2,
    children: [
      { label: "Asset Register", href: "/fixed-assets/assets" },
      { label: "Depreciation", href: "/fixed-assets/depreciation" },
      { label: "Disposals", href: "/fixed-assets/disposals" },
    ]
  },
  { 
    label: "Taxes", 
    icon: Receipt,
    children: [
      { label: "Tax Codes & Rates", href: "/taxes/codes" },
      { label: "Returns/Filings", href: "/taxes/returns" },
    ]
  },
  { 
    label: "General Ledger", 
    icon: FileText,
    children: [
      { label: "Chart of Accounts", href: "/gl/chart-of-accounts" },
      { label: "Journal Entries", href: "/gl/journal-entries" },
      { label: "Recurring Entries", href: "/gl/recurring" },
      { label: "Allocations", href: "/gl/allocations" },
      { label: "Period Close", href: "/gl/close" },
    ]
  },
  { 
    label: "Reports", 
    icon: BarChart3,
    children: [
      { label: "Financial", href: "/reports/financial" },
      { label: "Sales", href: "/reports/sales" },
      { label: "Purchases", href: "/reports/purchases" },
      { label: "Inventory", href: "/reports/inventory" },
      { label: "Banking", href: "/reports/banking" },
      { label: "Projects", href: "/reports/projects" },
    ]
  },
  { 
    label: "Admin & Setup", 
    icon: Settings,
    children: [
      { label: "Company & Entities", href: "/admin/company" },
      { label: "Users & Roles", href: "/admin/users" },
      { label: "Numbering", href: "/admin/numbering" },
      { label: "Terms & Payment Methods", href: "/admin/terms" },
      { label: "Currencies & FX", href: "/admin/currency" },
      { label: "Tax Setup", href: "/admin/tax" },
      { label: "Templates & Branding", href: "/admin/templates" },
      { label: "Integrations", href: "/admin/integrations" },
      { label: "Approval Rules", href: "/admin/approvals" },
      { label: "Import/Export", href: "/admin/import-export" },
      { label: "Audit Log", href: "/admin/audit" },
    ]
  }
];

interface NavItemProps {
  item: typeof navigation[0];
  pathname: string;
}

function NavItem({ item, pathname }: NavItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href || (hasChildren && pathname.startsWith(item.href || ''));

  if (!hasChildren) {
    return (
      <Link
        href={item.href!}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-gray-800 text-white"
            : "text-gray-400 hover:text-white hover:bg-gray-800"
        )}
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </Link>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-gray-800 text-white"
            : "text-gray-400 hover:text-white hover:bg-gray-800"
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon className="h-4 w-4" />
          {item.label}
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      
      {isExpanded && (
        <div className="ml-6 space-y-1">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                "block px-3 py-2 rounded-lg text-sm transition-colors",
                pathname === child.href
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-gray-900 h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gray-800 flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Accounting</h1>
            <p className="text-xs text-gray-400">QuickBooks-class ERP</p>
          </div>
        </div>
      </div>
      
      <nav className="px-4 pb-4 space-y-2">
        {navigation.map((item) => (
          <NavItem key={item.label} item={item} pathname={pathname} />
        ))}
      </nav>
    </aside>
  );
}
