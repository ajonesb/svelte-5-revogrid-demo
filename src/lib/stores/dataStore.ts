import { writable, derived } from 'svelte/store';
import { itemsApiService, APIError } from '../services';

// Simple data type
export interface Item {
	id: number;
	name: string;
	qty: number;
	price: number;
	total: number;
}

// Simple column definition
export const columns = [
	{ prop: 'id', name: 'ID', size: 80, readonly: true },
	{ prop: 'name', name: 'Name', size: 200 },
	{ prop: 'qty', name: 'Qty', size: 100 },
	{ prop: 'price', name: 'Price', size: 100 },
	{ prop: 'total', name: 'Total', size: 100, readonly: true }
];

// Fallback demo data for development/testing
function generateFallbackData(): Item[] {
	return Array.from({ length: 50 }, (_, i) => {
		const qty = Math.floor(Math.random() * 10) + 1;
		const price = Math.floor(Math.random() * 100) + 10;
		return {
			id: i + 1,
			name: `Item ${i + 1}`,
			qty,
			price,
			total: qty * price
		};
	});
}

// State stores - Clean separation of concerns
export const rows = writable<Item[]>([]);
export const selectedIds = writable<Set<number>>(new Set());
export const loading = writable<boolean>(false);
export const error = writable<string | null>(null);

// Derived stores for computed values
export const data = derived(rows, ($rows) => 
	$rows.map(row => ({
		...row,
		total: row.qty * row.price
	}))
);

// Action functions using service layer - Clean, SOLID implementation
export async function loadData() {
	loading.set(true);
	error.set(null);
	
	try {
		const items = await itemsApiService.loadItems();
		rows.set(items);
	} catch (err) {
		const errorMessage = err instanceof APIError 
			? err.message 
			: 'Failed to load data from server';
		
		error.set(errorMessage);
		// Fallback to demo data if API fails
		rows.set(generateFallbackData());
	} finally {
		loading.set(false);
	}
}

export async function addRow() {
	const newItem = {
		name: 'New Product',
		qty: 1,
		price: 25,
		total: 25
	};

	try {
		const savedItem = await itemsApiService.createItem(newItem);
		rows.update($rows => [...$rows, savedItem]);
	} catch (err) {
		const errorMessage = err instanceof APIError 
			? err.message 
			: 'Failed to add item';
		
		error.set(errorMessage);
		
		// Fallback: add locally for demo
		rows.update($rows => {
			const newId = Math.max(...$rows.map(r => r.id), 0) + 1;
			return [...$rows, { ...newItem, id: newId, total: newItem.qty * newItem.price }];
		});
	}
}

export async function deleteSelected() {
	let selected: Set<number> = new Set();
	selectedIds.subscribe(s => selected = s)();
	
	if (selected.size === 0) return;
	
	try {
		await itemsApiService.deleteItems(Array.from(selected));
		rows.update($rows => $rows.filter(row => !selected.has(row.id)));
		selectedIds.set(new Set());
	} catch (err) {
		const errorMessage = err instanceof APIError 
			? err.message 
			: 'Failed to delete items';
		
		error.set(errorMessage);
	}
}

export async function clearAll() {
	try {
		// Get current items and delete them
		let currentRows: Item[] = [];
		rows.subscribe(r => currentRows = r)();
		
		if (currentRows.length > 0) {
			const ids = currentRows.map(item => item.id);
			await itemsApiService.deleteItems(ids);
		}
		
		rows.set([]);
		selectedIds.set(new Set());
	} catch (err) {
		const errorMessage = err instanceof APIError 
			? err.message 
			: 'Failed to clear all items';
		
		error.set(errorMessage);
	}
}

export async function updateRow(updatedRow: Item) {
	try {
		const savedItem = await itemsApiService.updateItem(updatedRow);
		rows.update($rows => 
			$rows.map(row => row.id === savedItem.id ? savedItem : row)
		);
	} catch (err) {
		const errorMessage = err instanceof APIError 
			? err.message 
			: 'Failed to update item';
		
		error.set(errorMessage);
		
		// Fallback: update locally for demo
		rows.update($rows => 
			$rows.map(row => row.id === updatedRow.id ? updatedRow : row)
		);
	}
}