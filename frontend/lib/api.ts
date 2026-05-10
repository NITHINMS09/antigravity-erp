// Ensure the base URL always ends with /api
function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) return '/api';
  // Remove trailing slash and ensure it ends with /api
  const clean = envUrl.replace(/\/+$/, '');
  if (clean.endsWith('/api')) return clean;
  return `${clean}/api`;
}
export const API_BASE_URL = getApiBaseUrl();

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  async request<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    const authToken = token || this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      const text = await response.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        data = text; // Fallback to raw text if not JSON
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        if (typeof data === 'object' && data !== null) {
          errorMessage = data.error || data.message || errorMessage;
        } else if (typeof data === 'string' && data) {
          errorMessage = data.substring(0, 100);
        }
        console.error(`API Error [${endpoint}]:`, errorMessage);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        console.error('Network Error: Check if the backend is running and reachable.');
        throw new Error('Unable to connect to the server. Please check your internet or if the server is down.');
      }
      throw error;
    }
  }

  get<T = any>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, data?: any, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) });
  }

  put<T = any>(endpoint: string, data?: any, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) });
  }

  delete<T = any>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
