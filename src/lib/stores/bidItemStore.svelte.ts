import { createDataStore, handleError } from './baseStore.svelte';
import { itemsApiService } from '../services';
import type { ColumnRegular } from '@revolist/svelte-datagrid';

/**
 * Bid Item Setup Store
 * Single responsibility: Manage bid items with autocomplete
 */

export interface BidItem {
	id: number;
	bidItem: string;
	description: string;
	bidQuantity: number;
	unit: string;
	takeoffQuantity: number;
	clientNo: string;
}

// Autocomplete options
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
	'6" San Sewer - left 5\' out from bldg',
	'Trench Safety',
	'Testing',
	'2" water - left 5\' out from bldg w/ NO taps',
	'2" water - left 5\' out from bldg w/ NO taps',
	'Rip Rap - No Size on Plans (8" x 12")',
	'6" Thick Headwall',
	'6" Parking w/ 4,000 psi @ 24" OC',
	'6" Concrete Curb',
	'Handicap Ramps',
	'Light Pole Bases - 24" x 9" (buried & 3")',
	'8" Trail - 4" w/ #3 @16" OC & 4,000 PSI',
	'5" w/ #3 @16" OC & 4,000 PSI',
	'11" Trail - 5" w/ #3 @16" OC & 4,000 PSI',
	'Paver Band',
	'4" slab w/ #4 @ 4,000 PSI',
	'Masonry Column Footings',
	'Grade Beam at Retaining Wall',
	'Handicap Ramp at Playground'
].map((label) => ({ label, value: label }));

export const UNIT_OPTIONS = ['LS', 'LF', 'CY', 'SY', 'BCY', 'LCY', 'EA', 'SF'].map((u) => ({
	label: u,
	value: u
}));

export const BID_ITEM_COLUMNS: ColumnRegular[] = [
	{
		prop: 'bidItem',
		name: 'Bid Item',
		size: 200
	},
	{ prop: 'description', name: 'Description', size: 300 },
	{ prop: 'bidQuantity', name: 'Bid Quantity', size: 120 },
	{
		prop: 'unit',
		name: 'Unit',
		size: 80
	},
	{ prop: 'takeoffQuantity', name: 'Takeoff Quantity', size: 150 },
	{ prop: 'clientNo', name: 'Client #', size: 100 }
];

const store = createDataStore<BidItem>();

// Actions
export async function loadBidItems() {
	store.setLoading(true);
	store.setError(null);

	try {
		const apiItems = await itemsApiService.loadItems(25);
		const bidItems: BidItem[] = apiItems.map((item, i) => ({
			id: i + 1,
			bidItem: BID_ITEM_OPTIONS[i % BID_ITEM_OPTIONS.length].value,
			description: item.name,
			bidQuantity: item.qty,
			unit: UNIT_OPTIONS[i % UNIT_OPTIONS.length].value,
			takeoffQuantity: item.total,
			clientNo: String(10 + i * 10)
		}));
		store.setData(bidItems);
		console.log('[BID ITEM STORE] Loaded', bidItems.length, 'bid items', bidItems);
	} catch (err) {
		console.error('[BID ITEM STORE] Error loading:', err);
		store.setError(handleError(err, 'Failed to load bid items'));
		const fallback = generateFallbackBidItems();
		store.setData(fallback);
		console.log('[BID ITEM STORE] Using fallback data:', fallback.length, 'items');
	} finally {
		store.setLoading(false);
	}
}

export function addBidItem() {
	const newId = Math.max(0, ...store.data.map((r) => r.id)) + 1;
	const newItem: BidItem = {
		id: newId,
		bidItem: BID_ITEM_OPTIONS[0].value,
		description: '',
		bidQuantity: 1,
		unit: 'LS',
		takeoffQuantity: 1,
		clientNo: ''
	};
	store.addRow(newItem);
}

function generateFallbackBidItems(): BidItem[] {
	return [
		{
			id: 1,
			bidItem: 'Mobilization',
			description: '',
			bidQuantity: 1.0,
			unit: 'LS',
			takeoffQuantity: 1.0,
			clientNo: '10'
		},
		{
			id: 2,
			bidItem: 'SWPPP',
			description: '',
			bidQuantity: 1.0,
			unit: 'LS',
			takeoffQuantity: 1.0,
			clientNo: '15'
		},
		{
			id: 3,
			bidItem: 'Silt Fence',
			description: '',
			bidQuantity: 450.0,
			unit: 'LF',
			takeoffQuantity: 450.0,
			clientNo: '20'
		}
	];
}

export const bidItemStore = store;
