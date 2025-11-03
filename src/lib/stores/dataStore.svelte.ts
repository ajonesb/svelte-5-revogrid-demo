import { itemsApiService, APIError } from '../services';

// Data Models
export interface Item {
	id: number;
	name: string;
	qty: number;
	price: number;
	total: number;
}

export const GRID_COLUMNS = [
	{ prop: 'id', name: 'ID', size: 80, readonly: true },
	{ prop: 'name', name: 'Name', size: 200 },
	{ prop: 'qty', name: 'Qty', size: 100 },
	{ prop: 'price', name: 'Price', size: 100 },
	{ prop: 'total', name: 'Total', size: 100, readonly: true }
] as const;

// State Management
let rows = $state<Item[]>([]);
let selectedIds = $state<Set<number>>(new Set());
let loading = $state(false);
let error = $state<string | null>(null);

// Computed Values
const data = $derived(rows.map(row => ({ ...row, total: row.qty * row.price })));

// Public API
export const store = {
	get data() { return data; },
	get rows() { return rows; },
	get selectedIds() { return selectedIds; },
	get loading() { return loading; },
	get error() { return error; }
};

// Utilities
function generateFallbackData(): Item[] {
	return Array.from({ length: 50 }, (_, i) => {
		const qty = Math.floor(Math.random() * 10) + 1;
		const price = Math.floor(Math.random() * 100) + 10;
		return { id: i + 1, name: `Item ${i + 1}`, qty, price, total: qty * price };
	});
}

function handleError(err: unknown, defaultMessage: string): string {
	return err instanceof APIError ? err.message : defaultMessage;
}

function resetSelection() {
	selectedIds = new Set();
}

// Actions
export async function loadData() {
	loading = true;
	error = null;
	
	try {
		rows = await itemsApiService.loadItems();
	} catch (err) {
		error = handleError(err, 'Failed to load data');
		rows = generateFallbackData(); // Graceful fallback
	} finally {
		loading = false;
	}
}

export async function addRow() {
	const newItem = { name: 'New Product', qty: 1, price: 25, total: 25 };
	
	try {
		const savedItem = await itemsApiService.createItem(newItem);
		rows = [...rows, savedItem];
	} catch (err) {
		error = handleError(err, 'Failed to add item');
		// Optimistic update on API failure
		const newId = Math.max(...rows.map(r => r.id), 0) + 1;
		rows = [...rows, { ...newItem, id: newId }];
	}
}

export async function deleteSelected() {
	if (selectedIds.size === 0) return;
	
	const idsToDelete = Array.from(selectedIds);
	
	try {
		await itemsApiService.deleteItems(idsToDelete);
		rows = rows.filter(row => !selectedIds.has(row.id));
		resetSelection();
	} catch (err) {
		error = handleError(err, 'Failed to delete items');
	}
}

export async function clearAll() {
	if (rows.length === 0) return;
	
	try {
		const allIds = rows.map(item => item.id);
		await itemsApiService.deleteItems(allIds);
		rows = [];
		resetSelection();
	} catch (err) {
		error = handleError(err, 'Failed to clear data');
	}
}

export async function updateRow(updatedRow: Item) {
	try {
		const savedItem = await itemsApiService.updateItem(updatedRow);
		rows = rows.map(row => row.id === savedItem.id ? savedItem : row);
	} catch (err) {
		error = handleError(err, 'Failed to update item');
		// Optimistic update on API failure
		rows = rows.map(row => row.id === updatedRow.id ? updatedRow : row);
	}
}