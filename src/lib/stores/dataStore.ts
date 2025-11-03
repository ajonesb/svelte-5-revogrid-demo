import { writable, derived } from 'svelte/store';

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

// Generate simple demo data
function generateData(): Item[] {
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

// Simple stores
export const rows = writable<Item[]>(generateData());
export const selectedIds = writable<Set<number>>(new Set());

// Auto-calculate totals
export const data = derived(rows, ($rows) => 
	$rows.map(row => ({
		...row,
		total: row.qty * row.price
	}))
);

// Simple actions
export function addRow() {
	rows.update($rows => {
		const newId = Math.max(...$rows.map(r => r.id), 0) + 1;
		return [...$rows, { id: newId, name: `Item ${newId}`, qty: 1, price: 10, total: 10 }];
	});
}

export function deleteSelected() {
	let selected: Set<number> = new Set();
	selectedIds.subscribe(s => selected = s)();
	
	if (selected.size === 0) return;
	
	rows.update($rows => $rows.filter(row => !selected.has(row.id)));
	selectedIds.set(new Set());
}

export function clearAll() {
	rows.set([]);
	selectedIds.set(new Set());
}

export function updateRow(updatedRow: Item) {
	rows.update($rows => 
		$rows.map(row => row.id === updatedRow.id ? updatedRow : row)
	);
}