import { itemsApiService, APIError } from '../services';

// Data Models - Bid Item Setup
export interface BidRow {
	id: number;
	bidItem: string; // autocomplete/select
	description: string;
	bidQuantity: number;
	unit: string; // EA, LF, LS, etc
	takeoffQuantity: number;
	clientNo: string;
}

// Options for Bid Item autocomplete and Unit select
export const BID_ITEM_OPTIONS = [
	'Mobilization',
	'SWPPP',
	'Silt Fence',
	'Tree Protection',
	'Clearing and Grubbing',
	'Site Cut / Fill to +/- 10th',
	'Import Fill & Grading',
	'Machine Grade Paving Areas',
	'Lime Stabilization - EXCLUDED',
	'Backfill with Onsite Material',
	'San Sewer - left 5’ out from bldg',
	'Trench Safety',
	'Testing',
	'Rip Rap - No Size on Plans (8” x 12”)',
	'6” Thick Headwall',
	'6” Parking w/ 4,000 psi @ 24” OC',
	'6” Concrete Curb',
	'Handicap Ramps',
	'Light Pole Bases - 24” x 9” 6” (buried & 3’ above)',
	'8” Trail - 4” w/ #3 @16” OC & 4,000 PSI',
	'11” Trail - 5” w/ #3 @16” OC & 4,000 PSI',
	'Paver Band',
	'4” slab w/ #4 @ 4,000 PSI',
	'Masonry Column Footings',
	'Grade Beam at Retaining Wall',
	'Handicap Ramp at Playground'
].map((label) => ({ label, value: label }));

export const UNIT_OPTIONS = ['LS', 'LF', 'CY', 'SY', 'BCY', 'LCY', 'EA', 'SF'].map((u) => ({
	label: u,
	value: u
}));

export const GRID_COLUMNS = [
	{
		prop: 'bidItem',
		name: 'Bid Item',
		size: 180,
		columnType: 'select',
		labelKey: 'label',
		valueKey: 'value',
		source: BID_ITEM_OPTIONS
	},
	{ prop: 'description', name: 'Description', size: 360 },
	{ prop: 'bidQuantity', name: 'Bid Quantity', size: 140 },
	{
		prop: 'unit',
		name: 'Unit',
		size: 90,
		columnType: 'select',
		labelKey: 'label',
		valueKey: 'value',
		source: UNIT_OPTIONS
	},
	{ prop: 'takeoffQuantity', name: 'Takeoff Quantity', size: 180 },
	{ prop: 'clientNo', name: 'Client #', size: 110 }
] as const;

// State Management
let rows = $state<BidRow[]>([]);
let selectedIds = $state<Set<number>>(new Set());
let loading = $state(false);
let error = $state<string | null>(null);

// Computed Values
const data = $derived(rows);

// Public API
export const store = {
	get data() {
		return data;
	},
	get rows() {
		return rows;
	},
	get selectedIds() {
		return selectedIds;
	},
	get loading() {
		return loading;
	},
	get error() {
		return error;
	}
};

// Utilities
function generateFallbackData(): BidRow[] {
	const sample = [
		{
			bidItem: 'Mobilization',
			description: '',
			bidQuantity: 1.0,
			unit: 'LS',
			takeoffQuantity: 1.0,
			clientNo: '10'
		},
		{
			bidItem: 'SWPPP',
			description: '',
			bidQuantity: 1.0,
			unit: 'LS',
			takeoffQuantity: 1.0,
			clientNo: '15'
		},
		{
			bidItem: 'Silt Fence',
			description: '',
			bidQuantity: 450.0,
			unit: 'LF',
			takeoffQuantity: 450.0,
			clientNo: '20'
		},
		{
			bidItem: 'Tree Protection',
			description: '',
			bidQuantity: 1230.0,
			unit: 'LF',
			takeoffQuantity: 1230.0,
			clientNo: '30'
		},
		{
			bidItem: 'Clearing and Grubbing',
			description: '',
			bidQuantity: 840.0,
			unit: 'CY',
			takeoffQuantity: 840.0,
			clientNo: '100'
		}
	];
	return sample.map((r, i) => ({ id: i + 1, ...r }));
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
		// Using API demo as filler, then mapping
		const apiItems = await itemsApiService.loadItems(25);
		rows = apiItems.map((p, i) => ({
			id: i + 1,
			bidItem: BID_ITEM_OPTIONS[i % BID_ITEM_OPTIONS.length].value,
			description: p.name,
			bidQuantity: p.qty,
			unit: UNIT_OPTIONS[i % UNIT_OPTIONS.length].value,
			takeoffQuantity: p.total,
			clientNo: String(10 + i * 5)
		}));
	} catch (err) {
		error = handleError(err, 'Failed to load data');
		rows = generateFallbackData(); // Graceful fallback
	} finally {
		loading = false;
	}
}

export async function addRow() {
	const base: Omit<BidRow, 'id'> = {
		bidItem: BID_ITEM_OPTIONS[0].value,
		description: '',
		bidQuantity: 1,
		unit: 'LS',
		takeoffQuantity: 1,
		clientNo: ''
	};

	try {
		await itemsApiService.createItem({
			name: base.bidItem,
			qty: base.bidQuantity,
			price: base.takeoffQuantity,
			total: base.takeoffQuantity
		});
		const newId = Math.max(0, ...rows.map((r) => r.id)) + 1;
		rows = [...rows, { id: newId, ...base }];
	} catch (err) {
		error = handleError(err, 'Failed to add row');
		const newId = Math.max(0, ...rows.map((r) => r.id)) + 1;
		rows = [...rows, { id: newId, ...base }];
	}
}

export async function deleteSelected() {
	if (selectedIds.size === 0) return;
	rows = rows.filter((r) => !selectedIds.has(r.id));
	resetSelection();
}

export async function clearAll() {
	if (rows.length === 0) return;
	rows = [];
	resetSelection();
}

export async function updateRow(updatedRow: BidRow) {
	try {
		// optimistic update, also log to console
		rows = rows.map((row) => (row.id === updatedRow.id ? updatedRow : row));
		console.log('[grid] row updated:', updatedRow);
		await itemsApiService.updateItem({
			id: updatedRow.id,
			name: updatedRow.description,
			qty: updatedRow.bidQuantity,
			price: 0,
			total: updatedRow.takeoffQuantity
		} as any);
	} catch (err) {
		error = handleError(err, 'Failed to update row');
	}
}

export function setAllRows(newRows: BidRow[]) {
	rows = newRows;
}
