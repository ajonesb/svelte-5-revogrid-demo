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

// Svelte 5 State - Using runes instead of stores
let rows = $state<Item[]>([]);
let selectedIds = $state<Set<number>>(new Set());
let loading = $state<boolean>(false);
let error = $state<string | null>(null);

// Derived values using $derived rune
const data = $derived(
	rows.map(row => ({
		...row,
		total: row.qty * row.price
	}))
);

// Export reactive getters
export const getData = () => data;
export const getRows = () => rows;
export const getSelectedIds = () => selectedIds;
export const getLoading = () => loading;
export const getError = () => error;

// Action functions using service layer - Clean, SOLID implementation
export async function loadData() {
	console.log('Starting data load...');
	loading = true;
	error = null;
	
	try {
		console.log('Calling itemsApiService.loadItems()...');
		const items = await itemsApiService.loadItems();
		console.log('Data loaded successfully:', items.length, 'items');
		rows = items;
	} catch (err) {
		console.error('API Error:', err);
		const errorMessage = err instanceof APIError 
			? err.message 
			: 'Failed to load data from server';
		
		error = errorMessage;
		// Fallback to demo data if API fails
		const fallbackData = generateFallbackData();
		console.log('Using fallback data:', fallbackData.length, 'items');
		rows = fallbackData;
	} finally {
		loading = false;
		console.log('Data load complete');
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
		rows = [...rows, savedItem];
	} catch (err) {
		const errorMessage = err instanceof APIError 
			? err.message 
			: 'Failed to add item';
		
		error = errorMessage;
		
		// Fallback: add locally for demo
		const newId = Math.max(...rows.map(r => r.id), 0) + 1;
		rows = [...rows, { ...newItem, id: newId, total: newItem.qty * newItem.price }];
	}
}

export async function deleteSelected() {
	const selected = selectedIds;
	
	if (selected.size === 0) return;
	
	try {
		await itemsApiService.deleteItems(Array.from(selected));
		rows = rows.filter(row => !selected.has(row.id));
		selectedIds = new Set();
	} catch (err) {
		const errorMessage = err instanceof APIError 
			? err.message 
			: 'Failed to delete items';
		
		error = errorMessage;
	}
}

export async function clearAll() {
	try {
		// In a real app, you might call API to delete all items
		if (rows.length > 0) {
			const ids = rows.map(item => item.id);
			await itemsApiService.deleteItems(ids);
		}
		
		rows = [];
		selectedIds = new Set();
	} catch (err) {
		const errorMessage = err instanceof APIError 
			? err.message 
			: 'Failed to clear all items';
		
		error = errorMessage;
	}
}

export async function updateRow(updatedRow: Item) {
	try {
		const savedItem = await itemsApiService.updateItem(updatedRow);
		rows = rows.map(row => row.id === savedItem.id ? savedItem : row);
	} catch (err) {
		const errorMessage = err instanceof APIError 
			? err.message 
			: 'Failed to update item';
		
		error = errorMessage;
		
		// Fallback: update locally for demo
		rows = rows.map(row => row.id === updatedRow.id ? updatedRow : row);
	}
}