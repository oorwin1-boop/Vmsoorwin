import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { logger } from './logger';

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  timeout?: number;
  failOnStatusCode?: boolean;
}

export interface AuthResponse {
  token?: string;
  access_token?: string;
  refresh_token?: string;
}

export class ApiHelper {
  private readonly request: APIRequestContext;
  private readonly baseURL: string;
  private authToken?: string;

  constructor(request: APIRequestContext, baseURL?: string) {
    this.request = request;
    this.baseURL = baseURL || process.env.API_BASE_URL || process.env.BASE_URL || '';
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  clearAuthToken(): void {
    this.authToken = undefined;
  }

  private buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return { ...headers, ...extra };
  }

  async get<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    logger.debug(`GET ${url}`);

    const response = await this.request.get(url, {
      headers: this.buildHeaders(options.headers),
      params: options.params as Record<string, string>,
      timeout: options.timeout ?? 30_000,
    });

    await this.assertStatus(response, options.failOnStatusCode);
    return response.json() as T;
  }

  async post<T = unknown>(endpoint: string, body: unknown, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    logger.debug(`POST ${url}`);

    const response = await this.request.post(url, {
      headers: this.buildHeaders(options.headers),
      data: body,
      timeout: options.timeout ?? 30_000,
    });

    await this.assertStatus(response, options.failOnStatusCode);
    return response.json() as T;
  }

  async put<T = unknown>(endpoint: string, body: unknown, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    logger.debug(`PUT ${url}`);

    const response = await this.request.put(url, {
      headers: this.buildHeaders(options.headers),
      data: body,
      timeout: options.timeout ?? 30_000,
    });

    await this.assertStatus(response, options.failOnStatusCode);
    return response.json() as T;
  }

  async patch<T = unknown>(endpoint: string, body: unknown, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    logger.debug(`PATCH ${url}`);

    const response = await this.request.patch(url, {
      headers: this.buildHeaders(options.headers),
      data: body,
      timeout: options.timeout ?? 30_000,
    });

    await this.assertStatus(response, options.failOnStatusCode);
    return response.json() as T;
  }

  async delete<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    logger.debug(`DELETE ${url}`);

    const response = await this.request.delete(url, {
      headers: this.buildHeaders(options.headers),
      timeout: options.timeout ?? 30_000,
    });

    await this.assertStatus(response, options.failOnStatusCode);
    return response.json() as T;
  }

  async getRawResponse(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    body?: unknown
  ): Promise<APIResponse> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.buildHeaders();

    switch (method) {
      case 'GET':    return this.request.get(url, { headers });
      case 'POST':   return this.request.post(url, { headers, data: body });
      case 'PUT':    return this.request.put(url, { headers, data: body });
      case 'PATCH':  return this.request.patch(url, { headers, data: body });
      case 'DELETE': return this.request.delete(url, { headers });
    }
  }

  async authenticate(email: string, password: string): Promise<string> {
    const data = await this.post<AuthResponse>('/api/auth/login', { email, password });
    const token = data.token || data.access_token || '';
    this.setAuthToken(token);
    logger.info(`Authenticated as ${email}`);
    return token;
  }

  private async assertStatus(response: APIResponse, fail = true): Promise<void> {
    if (fail !== false) {
      expect(response.ok(), `API call failed with status ${response.status()}: ${response.url()}`).toBeTruthy();
    }
  }
}
