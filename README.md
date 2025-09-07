# BOOKS-UI - Complete Accounting System UI

A comprehensive, QuickBooks-class accounting and business management system built with Next.js, React, and TypeScript.

## 🚀 Features

### Core Modules
- **General Ledger (GL)**: Chart of Accounts, Journal Entries, Recurring Entries, Allocations, Period Close
- **Accounts Receivable (AR)**: Estimates/Quotes, Sales Orders, Invoices, Credit Memos, Receive Payments, Refunds
- **Accounts Payable (AP)**: Purchase Requests, Purchase Orders, Bills/Vendor Bills, Vendor Credits, Pay Bills
- **Banking**: Bank Feeds, Rules, Transfers, Deposits, Checks, Reconciliation
- **Inventory**: Items, Warehouses, Stock Adjustments, Transfers, Counts, Assemblies/BOM
- **Projects & Time**: Projects, Tasks, Time Entries, Billable expenses
- **Fixed Assets**: Asset register, Depreciation runs, Disposals
- **Taxes**: Tax Codes/Rates, Returns/Filings, EC Sales
- **Reporting & Dashboards**: Financial + operational reports
- **Admin & Setup**: Company, Entities, Users/Roles, Currencies & FX, Numbering, Terms, Payment Methods, Email Templates, Branding, Integrations, Approval Rules, Import/Export, Audit Log

### Key Features
- **Modern UI**: Built with Tailwind CSS and Radix UI components
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Data**: Powered by React Query for efficient data fetching and caching
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **Multi-currency**: Support for multiple currencies with FX rate management
- **Role-based Access**: Granular permissions for different user types
- **Audit Trail**: Complete audit logging for compliance
- **Import/Export**: Data import and export capabilities
- **Print Support**: Professional PDF generation for documents

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom components
- **State Management**: React Query + Zustand
- **Forms**: React Hook Form + Zod validation
- **Data Tables**: TanStack Table
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BOOKS-UI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the environment variables:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3001](http://localhost:3001)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard page
│   ├── sales/            # Sales module pages
│   ├── purchases/        # Purchases module pages
│   ├── banking/          # Banking module pages
│   ├── inventory/        # Inventory module pages
│   ├── projects/         # Projects & Time module pages
│   ├── fixed-assets/     # Fixed Assets module pages
│   ├── taxes/            # Taxes module pages
│   ├── gl/               # General Ledger module pages
│   ├── reports/          # Reports module pages
│   └── admin/            # Admin & Setup module pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   ├── forms/            # Form components
│   └── providers/        # Context providers
├── lib/                  # Utility functions and configurations
│   ├── api.ts           # API client
│   └── utils.ts         # Utility functions
├── types/                # TypeScript type definitions
└── hooks/                # Custom React hooks
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Secondary**: Gray (#6B7280)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Info**: Blue (#3B82F6)

### Typography
- **Font Family**: Inter
- **Base Size**: 14px
- **Scale**: 1.25 (Major Third)

### Spacing
- **Base Unit**: 4px
- **Scale**: 0.25rem, 0.5rem, 0.75rem, 1rem, 1.25rem, 1.5rem, 2rem, 2.5rem, 3rem, 4rem, 5rem, 6rem

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px - 1440px
- **Large Desktop**: 1440px+

## 🔐 User Roles & Permissions

### Admin
- Full system access
- User management
- System configuration
- All financial operations

### Accountant
- General Ledger management
- Journal entries
- Financial reporting
- Period close operations

### AR Clerk
- Invoice management
- Payment processing
- Customer management
- Credit memo processing

### AP Clerk
- Bill management
- Vendor payments
- Purchase order processing
- Vendor management

### Operations
- Inventory management
- Stock adjustments
- Warehouse operations
- Item management

### Project Manager
- Project management
- Time tracking
- Expense management
- Billable operations

### Viewer
- Read-only access
- Report viewing
- Dashboard access

## 🚀 Getting Started

### 1. Dashboard
The dashboard provides an overview of key business metrics:
- Cash balance
- A/R aging
- A/P aging
- Monthly revenue vs expenses
- Recent transactions
- Top customers and vendors
- System alerts

### 2. Chart of Accounts
Manage your company's chart of accounts:
- Create and edit accounts
- Set account types and subtypes
- Track account balances
- Organize account hierarchy

### 3. Journal Entries
Create and manage journal entries:
- Manual journal entries
- Recurring entries
- Entry templates
- Approval workflow

### 4. Invoices
Complete invoice management:
- Create and send invoices
- Track payments
- Manage credit memos
- Customer communication

### 5. Items
Product and service catalog:
- Inventory items
- Service items
- Non-inventory items
- Pricing management
- Stock tracking

## 🔌 API Integration

The UI integrates with the accounting API microservice:

```typescript
// Example API usage
import { apiClient } from '@/lib/api';

// Get accounts
const accounts = await apiClient.getAccounts({
  'filter[type]': 'ASSET',
  page: 1,
  limit: 20
});

// Create invoice
const invoice = await apiClient.createInvoice({
  date: '2025-01-15',
  customerId: 'customer-1',
  currency: 'USD',
  fxRate: '1.0',
  lines: [/* invoice lines */]
});
```

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (when implemented)
npm run test

# Run E2E tests (when implemented)
npm run test:e2e
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🚀 Deployment

The application can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Docker** (see Dockerfile)

### Environment Variables

Required environment variables:
- `NEXT_PUBLIC_API_BASE_URL`: API base URL
- `NEXTAUTH_SECRET`: Authentication secret
- `NEXTAUTH_URL`: Application URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with core modules
- **v1.1.0** - Added advanced reporting features
- **v1.2.0** - Enhanced mobile responsiveness
- **v1.3.0** - Added multi-currency support

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered insights
- [ ] Third-party integrations
- [ ] Advanced workflow automation
- [ ] Multi-language support
- [ ] Advanced security features
- [ ] Real-time collaboration

---

Built with ❤️ for modern accounting needs.
