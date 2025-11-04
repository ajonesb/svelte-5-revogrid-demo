import { httpService } from './http.service';
import { API_CONFIG } from './api.config';

// Lightweight local type to decouple API service from store shapes
type Item = {
	id: number;
	name: string;
	qty: number;
	price: number;
	total: number;
};

/**
 * Items API Service - Handles all item-related API operations
 * Follows Single Responsibility Principle
 */
export class ItemsApiService {
	/**
	 * Load items from API and transform to our data structure
	 */
	async loadItems(limit: number = API_CONFIG.LIMITS.DEFAULT): Promise<Item[]> {
		try {
			// For demo: Using posts API and transforming to items
			const posts = await httpService.get<any[]>(API_CONFIG.ENDPOINTS.POSTS, {
				_limit: limit.toString()
			});

			return this.transformPostsToItems(posts);
		} catch (error) {
			console.error('Failed to load items from API:', error);
			throw error;
		}
	}

	/**
	 * Create a new item
	 */
	async createItem(item: Omit<Item, 'id'>): Promise<Item> {
		try {
			// For demo: Just return with timestamp ID
			await new Promise((resolve) => setTimeout(resolve, 200)); // Simulate network delay
			return { ...item, id: Date.now() };

			// In real app:
			// return httpService.post<Item>(API_CONFIG.ENDPOINTS.ITEMS, item);
		} catch (error) {
			console.error('Failed to create item:', error);
			throw error;
		}
	}

	/**
	 * Update an existing item
	 */
	async updateItem(item: Item): Promise<Item> {
		try {
			// For demo: Just return the item
			await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate network delay
			return item;

			// In real app:
			// return httpService.put<Item>(`${API_CONFIG.ENDPOINTS.ITEMS}/${item.id}`, item);
		} catch (error) {
			console.error('Failed to update item:', error);
			throw error;
		}
	}

	/**
	 * Delete an item
	 */
	async deleteItem(_id: number): Promise<void> {
		try {
			// For demo: Just simulate delay
			await new Promise((resolve) => setTimeout(resolve, 100));

			// In real app:
			// await httpService.delete(`${API_CONFIG.ENDPOINTS.ITEMS}/${id}`);
		} catch (error) {
			console.error('Failed to delete item:', error);
			throw error;
		}
	}

	/**
	 * Delete multiple items
	 */
	async deleteItems(ids: number[]): Promise<void> {
		try {
			// For demo: Simulate multiple deletes
			await Promise.all(ids.map((id) => this.deleteItem(id)));

			// In real app, might have a batch delete endpoint:
			// await httpService.post(`${API_CONFIG.ENDPOINTS.ITEMS}/batch-delete`, { ids });
		} catch (error) {
			console.error('Failed to delete items:', error);
			throw error;
		}
	}

	/**
	 * Transform API posts data to our Item interface
	 * This method would be customized for your actual API response structure
	 */
	private transformPostsToItems(posts: any[]): Item[] {
		return posts.map((post) => {
			const qty = (post.id % 10) + 1; // Quantity 1-10 based on ID
			const price = Math.floor(post.title.length * 2.5) + 10; // Price based on title length

			return {
				id: post.id,
				name: post.title.split(' ').slice(0, 3).join(' '), // First 3 words as product name
				qty,
				price,
				total: qty * price
			};
		});
	}
}

// Export singleton instance
export const itemsApiService = new ItemsApiService();
