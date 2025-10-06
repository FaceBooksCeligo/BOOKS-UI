import { ApiResponse, ApiError } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private orgId: string | null = null;
  private entityId: string | null = null;
  private unauthorizedHandler: (() => void) | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  setOrgId(orgId: string | null) {
    this.orgId = orgId;
  }

  setEntityId(entityId: string | null) {
    this.entityId = entityId;
  }

  setUnauthorizedHandler(handler: (() => void) | null) {
    this.unauthorizedHandler = handler;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    if (this.orgId) {
      headers['X-Org-ID'] = this.orgId;
    }
    if (this.entityId) {
      headers['X-Entity-ID'] = this.entityId;
    }

    console.log("API Request:", { url, headers: { ...headers, Authorization: headers.Authorization ? 'Bearer [REDACTED]' : 'None' } });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch (_) {
        // ignore json parse errors
      }
      if (response.status === 401 && this.unauthorizedHandler) {
        try { this.unauthorizedHandler(); } catch (_) { /* noop */ }
      }
      console.error("API Error:", { status: response.status, error: errorBody });
      const message = (errorBody && (errorBody.detail || errorBody.message)) || 'An error occurred';
      throw new Error(message);
    }

    const data = await response.json();
    
    // The backend returns { data: {...} } format, so we need to transform it
    // to match the expected ApiResponse format with success: true
    return {
      success: true,
      data: data.data,
      ...data
    };
  }

  // Generic HTTP methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Auth endpoints
  async login(email: string, password: string, orgId?: string) {
    return this.request('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, orgId }),
    });
  }

  async signup(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    orgName: string;
  }) {
    return this.request('/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyEmail(token: string) {
    return this.request('/v1/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resendVerification(email: string) {
    return this.request('/v1/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Account endpoints
  async getAccounts(params?: {
    'filter[type]'?: string;
    'filter[status]'?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/v1/accounts?${queryString}` : '/v1/accounts';
    
    return this.request(endpoint);
  }

  async getAccount(id: string) {
    return this.request(`/v1/accounts/${id}`);
  }

  async createAccount(data: any) {
    return this.request('/v1/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAccount(id: string, data: any) {
    return this.request(`/v1/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Journal Entry endpoints
  async getJournalEntries(params?: {
    'filter[status]'?: string;
    from?: string;
    to?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/v1/journal-entries?${queryString}` : '/v1/journal-entries';
    
    return this.request(endpoint);
  }

  async getJournalEntry(id: string) {
    return this.request(`/v1/journal-entries/${id}`);
  }

  async createJournalEntry(data: any) {
    return this.request('/v1/journal-entries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async postJournalEntry(id: string) {
    return this.request(`/v1/journal-entries/${id}/post`, {
      method: 'POST',
    });
  }

  // Invoice endpoints
  async getInvoices(params?: {
    'filter[status]'?: string;
    customerId?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/v1/invoices?${queryString}` : '/v1/invoices';
    
    return this.request(endpoint);
  }

  async getInvoice(id: string) {
    return this.request(`/v1/invoices/${id}`);
  }

  async createInvoice(data: any) {
    return this.request('/v1/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInvoice(id: string, data: any) {
    return this.request(`/v1/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Item endpoints
  async getItems(params?: {
    'filter[type]'?: string;
    'filter[status]'?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/v1/items?${queryString}` : '/v1/items';
    
    return this.request(endpoint);
  }

  async getItem(id: string) {
    return this.request(`/v1/items/${id}`);
  }

  async createItem(data: any) {
    return this.request('/v1/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateItem(id: string, data: any) {
    return this.request(`/v1/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Contact endpoints
  async getContacts(params?: {
    'filter[type]'?: string;
    'filter[status]'?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/v1/contacts?${queryString}` : '/v1/contacts';
    
    return this.request(endpoint);
  }

  async getContact(id: string) {
    return this.request(`/v1/contacts/${id}`);
  }

  async createContact(data: any) {
    return this.request('/v1/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContact(id: string, data: any) {
    return this.request(`/v1/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Credit Memo endpoints
  async getCreditMemos(params?: {
    'filter[status]'?: string;
    customerId?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/v1/credit-memos?${queryString}` : '/v1/credit-memos';
    
    return this.request(endpoint);
  }

  async getCreditMemo(id: string) {
    return this.request(`/v1/credit-memos/${id}`);
  }

  async createCreditMemo(data: any) {
    return this.request('/v1/credit-memos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCreditMemo(id: string, data: any) {
    return this.request(`/v1/credit-memos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCreditMemo(id: string) {
    return this.request(`/v1/credit-memos/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export const api = apiClient;
export default apiClient;
