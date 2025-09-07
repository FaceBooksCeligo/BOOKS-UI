import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: string | number, currency: string = 'USD'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(numAmount);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

export function formatNumber(value: string | number, decimals: number = 2): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue);
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SENT: 'bg-blue-100 text-blue-800',
    PAID: 'bg-green-100 text-green-800',
    VOID: 'bg-red-100 text-red-800',
    POSTED: 'bg-green-100 text-green-800',
    APPROVAL_PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    RELEASED: 'bg-purple-100 text-purple-800',
    CLOSED: 'bg-gray-100 text-gray-800',
    RECEIVED: 'bg-green-100 text-green-800',
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

export function getAccountTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    ASSET: 'bg-green-100 text-green-800',
    LIABILITY: 'bg-red-100 text-red-800',
    EQUITY: 'bg-blue-100 text-blue-800',
    REVENUE: 'bg-purple-100 text-purple-800',
    EXPENSE: 'bg-orange-100 text-orange-800',
  };
  
  return typeColors[type] || 'bg-gray-100 text-gray-800';
}

export function getContactTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    CUSTOMER: 'bg-blue-100 text-blue-800',
    VENDOR: 'bg-green-100 text-green-800',
    EMPLOYEE: 'bg-purple-100 text-purple-800',
    OTHER: 'bg-gray-100 text-gray-800',
  };
  
  return typeColors[type] || 'bg-gray-100 text-gray-800';
}

export function getItemTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    INVENTORY: 'bg-blue-100 text-blue-800',
    SERVICE: 'bg-green-100 text-green-800',
    NON_INVENTORY: 'bg-gray-100 text-gray-800',
  };
  
  return typeColors[type] || 'bg-gray-100 text-gray-800';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function calculateTotal(lines: Array<{ total: { txn: string } }>): string {
  const total = lines.reduce((sum, line) => {
    return sum + parseFloat(line.total.txn || '0');
  }, 0);
  return total.toFixed(2);
}

export function calculateSubtotal(lines: Array<{ total: { txn: string } }>): string {
  return calculateTotal(lines);
}

export function calculateTax(subtotal: string, taxRate: number = 0): string {
  const subtotalNum = parseFloat(subtotal);
  const tax = subtotalNum * (taxRate / 100);
  return tax.toFixed(2);
}

export function calculateGrandTotal(subtotal: string, tax: string, shipping: string = '0'): string {
  const subtotalNum = parseFloat(subtotal);
  const taxNum = parseFloat(tax);
  const shippingNum = parseFloat(shipping);
  const total = subtotalNum + taxNum + shippingNum;
  return total.toFixed(2);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatAccountNumber(number: string): string {
  // Format account number with leading zeros if needed
  return number.padStart(4, '0');
}

export function generateDocumentNumber(prefix: string, sequence: number): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const seq = String(sequence).padStart(4, '0');
  return `${prefix}-${year}-${month}-${day}-${seq}`;
}

export function parseMoney(money: { txn: string; base: string }): number {
  return parseFloat(money.txn || '0');
}

export function createMoney(amount: string | number): { txn: string; base: string } {
  const amountStr = typeof amount === 'number' ? amount.toFixed(2) : amount;
  return {
    txn: amountStr,
    base: amountStr,
  };
}

export function isValidMoney(money: { txn: string; base: string }): boolean {
  return !isNaN(parseFloat(money.txn)) && !isNaN(parseFloat(money.base));
}

export function compareMoney(a: { txn: string; base: string }, b: { txn: string; base: string }): number {
  return parseFloat(a.txn) - parseFloat(b.txn);
}

export function addMoney(a: { txn: string; base: string }, b: { txn: string; base: string }): { txn: string; base: string } {
  const total = parseFloat(a.txn) + parseFloat(b.txn);
  return createMoney(total);
}

export function subtractMoney(a: { txn: string; base: string }, b: { txn: string; base: string }): { txn: string; base: string } {
  const total = parseFloat(a.txn) - parseFloat(b.txn);
  return createMoney(total);
}

export function multiplyMoney(money: { txn: string; base: string }, multiplier: number): { txn: string; base: string } {
  const total = parseFloat(money.txn) * multiplier;
  return createMoney(total);
}
