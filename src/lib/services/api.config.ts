// API configuration and types
export const API_CONFIG = {
	BASE_URL: 'https://jsonplaceholder.typicode.com',
	ENDPOINTS: {
		POSTS: '/posts',
		ITEMS: '/items'
	},
	LIMITS: {
		DEFAULT: 20
	}
} as const;

export interface APIResponse<T> {
	data: T;
	success: boolean;
	message?: string;
}

export class APIError extends Error {
	constructor(
		message: string,
		public status?: number,
		public response?: Response
	) {
		super(message);
		this.name = 'APIError';
	}
}
