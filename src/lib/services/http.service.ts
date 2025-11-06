import { API_CONFIG, APIError } from './api.config';

/**
 * Base HTTP service for making API requests
 * Follows SOLID principles - Single responsibility for HTTP operations
 */
export class HttpService {
	private baseUrl: string;

	constructor(baseUrl: string = API_CONFIG.BASE_URL) {
		this.baseUrl = baseUrl;
	}

	/**
	 * Generic GET request
	 */
	async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
		const url = this.buildUrl(endpoint, params);
		return this.request<T>(url, { method: 'GET' });
	}

	/**
	 * Generic POST request
	 */
	async post<T>(endpoint: string, data?: unknown): Promise<T> {
		const url = this.buildUrl(endpoint);
		return this.request<T>(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: data ? JSON.stringify(data) : undefined
		});
	}

	/**
	 * Generic PUT request
	 */
	async put<T>(endpoint: string, data?: unknown): Promise<T> {
		const url = this.buildUrl(endpoint);
		return this.request<T>(url, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: data ? JSON.stringify(data) : undefined
		});
	}

	/**
	 * Generic DELETE request
	 */
	async delete<T>(endpoint: string): Promise<T> {
		const url = this.buildUrl(endpoint);
		return this.request<T>(url, { method: 'DELETE' });
	}

	/**
	 * Core request method with error handling
	 */
	private async request<T>(url: string, options: RequestInit): Promise<T> {
		try {
			const response = await fetch(url, options);

			if (!response.ok) {
				throw new APIError(
					`HTTP ${response.status}: ${response.statusText}`,
					response.status,
					response
				);
			}

			// Handle empty responses (like DELETE)
			const contentType = response.headers.get('content-type');
			if (contentType && contentType.includes('application/json')) {
				return response.json();
			}

			return {} as T;
		} catch (error) {
			if (error instanceof APIError) {
				throw error;
			}
			throw new APIError(
				`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Build URL with query parameters
	 */
	private buildUrl(endpoint: string, params?: Record<string, string>): string {
		const url = new URL(endpoint, this.baseUrl);

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				url.searchParams.append(key, value);
			});
		}

		return url.toString();
	}
}

// Export singleton instance
export const httpService = new HttpService();
