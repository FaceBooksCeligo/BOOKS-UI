// Core API Types
export interface Money {
  txn: string;
  base: string;
}

export interface Address {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: Pagination;
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  code: string;
  detail: string;
  instance: string;
  correlationId: string;
}

// User & Auth Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'USER' | 'VIEWER';
  orgId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  orgId: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Account Types
export interface Account {
  _id: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  subtype: 'CASH' | 'BANK' | 'AR' | 'AP' | 'INVENTORY' | 'FIXED_ASSET' | 'EQUITY' | 'REVENUE' | 'COGS' | 'EXPENSE';
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
  balance: Money;
  parentAccountId?: string;
  accountNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountCreate {
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  subtype: 'CASH' | 'BANK' | 'AR' | 'AP' | 'INVENTORY' | 'FIXED_ASSET' | 'EQUITY' | 'REVENUE' | 'COGS' | 'EXPENSE';
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
  parentAccountId?: string;
  accountNumber?: string;
}

export interface AccountUpdate {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// Journal Entry Types
export interface JournalEntryLine {
  seq: number;
  accountId: string;
  contactId?: string;
  debit: Money;
  credit: Money;
  memo?: string;
}

export interface JournalEntry {
  _id: string;
  number: string;
  date: string;
  reference?: string;
  memo?: string;
  status: 'DRAFT' | 'POSTED' | 'VOID';
  fxRate: string;
  lines: JournalEntryLine[];
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryLineCreate {
  seq: number;
  accountId: string;
  contactId?: string;
  debit: Money;
  credit: Money;
  memo?: string;
}

export interface JournalEntryCreate {
  date: string;
  reference?: string;
  memo?: string;
  fxRate: string;
  lines: JournalEntryLineCreate[];
}

// Invoice Types
export interface InvoiceLine {
  seq: number;
  itemId?: string;
  description: string;
  qty: string;
  uom: string;
  unitPrice: Money;
  total: Money;
}

export interface Invoice {
  _id: string;
  number: string;
  date: string;
  customerId: string;
  currency: string;
  fxRate: string;
  lines: InvoiceLine[];
  total: Money;
  balance: Money;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'VOID';
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineCreate {
  seq: number;
  itemId?: string;
  description: string;
  qty: string;
  uom: string;
  unitPrice: Money;
  total: Money;
}

export interface InvoiceCreate {
  date: string;
  customerId: string;
  number?: string;
  currency: string;
  fxRate: string;
  lines: InvoiceLineCreate[];
}

// Item Types
export interface ItemPricing {
  unitPrice: Money;
  cost: Money;
}

export interface Item {
  _id: string;
  name: string;
  description?: string;
  type: 'INVENTORY' | 'SERVICE' | 'NON_INVENTORY';
  status: 'ACTIVE' | 'INACTIVE';
  sku?: string;
  uom: string;
  pricing: ItemPricing;
  incomeAccountId?: string;
  expenseAccountId?: string;
  assetAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemCreate {
  name: string;
  description?: string;
  type: 'INVENTORY' | 'SERVICE' | 'NON_INVENTORY';
  status: 'ACTIVE' | 'INACTIVE';
  sku?: string;
  uom: string;
  pricing: ItemPricing;
  incomeAccountId: string;
  expenseAccountId: string;
  assetAccountId: string;
}

// Contact Types
export interface Contact {
  _id: string;
  name: string;
  type: 'CUSTOMER' | 'VENDOR' | 'EMPLOYEE' | 'OTHER';
  status: 'ACTIVE' | 'INACTIVE';
  email?: string;
  phone?: string;
  address?: Address;
  createdAt: string;
  updatedAt: string;
}

export interface ContactCreate {
  name: string;
  type: 'CUSTOMER' | 'VENDOR' | 'EMPLOYEE' | 'OTHER';
  status: 'ACTIVE' | 'INACTIVE';
  email?: string;
  phone?: string;
  address?: Address;
}

// UI State Types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { value: string; label: string }[];
}

export interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: any;
}

// Status Types
export type DocumentStatus = 'DRAFT' | 'SENT' | 'PAID' | 'VOID' | 'POSTED' | 'APPROVAL_PENDING' | 'APPROVED' | 'RELEASED' | 'CLOSED' | 'RECEIVED';
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type ContactType = 'CUSTOMER' | 'VENDOR' | 'EMPLOYEE' | 'OTHER';
export type ItemType = 'INVENTORY' | 'SERVICE' | 'NON_INVENTORY';
export type UserRole = 'ADMIN' | 'USER' | 'VIEWER';
