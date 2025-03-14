import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// 添加API响应类型定义
export interface ApiResponse<T = any> {
  success: boolean;
  status: string;
  data: T;
  message?: string;
  pages?: number;
  total?: number;
  page?: number;
}

interface CacheItem {
  data: any;
  timestamp: number;
}

class ApiClient {
  private instance: AxiosInstance;
  private cache: Map<string, CacheItem>;
  private cacheTimeout: number;

  constructor(baseURL: string, cacheTimeout: number = 5 * 60 * 1000) { // 5 minutes default cache
    this.instance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.cache = new Map();
    this.cacheTimeout = cacheTimeout;

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Add timestamp to prevent caching by the browser
        const timestamp = new Date().getTime();
        config.params = { ...config.params, _t: timestamp };

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // Handle token refresh
        if (error.response?.status === 401 && originalRequest) {
          try {
            // Attempt to refresh token
            await this.post('/auth/refresh');
            
            // Retry the original request
            return this.instance(originalRequest);
          } catch (refreshError) {
            // Handle refresh token failure
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public setAuthToken(token: string | null) {
    if (token) {
      this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.instance.defaults.headers.common['Authorization'];
    }
  }

  private getCacheKey(config: AxiosRequestConfig): string {
    return `${config.method}-${config.url}-${JSON.stringify(config.params)}-${JSON.stringify(config.data)}`;
  }

  private isCacheValid(cacheItem: CacheItem): boolean {
    return Date.now() - cacheItem.timestamp < this.cacheTimeout;
  }

  private async makeRequest<T>(
    config: AxiosRequestConfig,
    useCache: boolean = false,
    retries: number = 3
  ): Promise<AxiosResponse<T>> {
    if (useCache) {
      const cacheKey = this.getCacheKey(config);
      const cachedResponse = this.cache.get(cacheKey);

      if (cachedResponse && this.isCacheValid(cachedResponse)) {
        return Promise.resolve({
          ...cachedResponse.data,
          fromCache: true,
        } as AxiosResponse<T>);
      }
    }

    try {
      const response = await this.instance.request<T>(config);

      if (useCache) {
        const cacheKey = this.getCacheKey(config);
        this.cache.set(cacheKey, {
          data: response,
          timestamp: Date.now(),
        });
      }

      return response;
    } catch (error) {
      if (retries > 0 && axios.isAxiosError(error)) {
        const status = error.response?.status;
        
        // Retry on network errors or specific status codes
        if (!status || [408, 500, 502, 503, 504].includes(status)) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.makeRequest(config, useCache, retries - 1);
        }
      }
      
      throw error;
    }
  }

  public async get<T>(url: string, config: AxiosRequestConfig = {}, useCache: boolean = false): Promise<T> {
    const response = await this.makeRequest<T>({ ...config, method: 'GET', url }, useCache);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<T> {
    const response = await this.makeRequest<T>({ ...config, method: 'POST', url, data });
    return response.data;
  }

  public async put<T>(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<T> {
    const response = await this.makeRequest<T>({ ...config, method: 'PUT', url, data });
    return response.data;
  }

  public async delete<T>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
    const response = await this.makeRequest<T>({ ...config, method: 'DELETE', url });
    return response.data;
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

export const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL || '/api');