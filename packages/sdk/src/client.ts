import type { ApiError } from './types';

export class ApiClient {
    private baseUrl: string;
    private getToken?: () => Promise<string | null>;
    private onUnauthorized?: () => void;

    constructor(config: {
        baseUrl: string;
        getToken?: () => Promise<string | null>;
        onUnauthorized?: () => void;
    }) {
        this.baseUrl = config.baseUrl;
        this.getToken = config.getToken;
        this.onUnauthorized = config.onUnauthorized;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...((options.headers as Record<string, string>) || {}),
        };

        // Add auth token if available
        if (this.getToken) {
            const token = await this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            // Handle unauthorized
            if (response.status === 401 || response.status === 403) {
                if (this.onUnauthorized) {
                    this.onUnauthorized();
                }
                throw new Error('Unauthorized');
            }

            // Parse response
            const data = await response.json();

            if (!response.ok) {
                const error = data as ApiError;
                throw new Error(error.message || 'API request failed');
            }

            return data as T;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error');
        }
    }

    async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
        const query = params
            ? '?' + new URLSearchParams(
                Object.fromEntries(
                    Object.entries(params)
                        .filter(([_, v]) => v !== undefined && v !== null)
                        .map(([k, v]) => [k, String(v)])
                )
            ).toString()
            : '';
        return this.request<T>(`${endpoint}${query}`, { method: 'GET' });
    }

    async post<T>(endpoint: string, body?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async patch<T>(endpoint: string, body?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}
