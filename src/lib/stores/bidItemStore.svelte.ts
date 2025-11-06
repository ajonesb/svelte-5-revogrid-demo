import { createDataStore, handleError } from './baseStore.svelte';
import { itemsApiService } from '../services';
import type { ColumnRegular } from '@revolist/svelte-datagrid';
import { useFormulaCalculator } from '$lib/composables/useFormulaCalculator.svelte';

/**
 * Bid Item Setup Store
 * Single responsibility: Manage bid items with autocomplete and live formulas
 */

export interface BidItem {
	id: number;
	bidItem: string;
	description: string;
	bidQuantity: number;
	unit: string;
	takeoffQuantity: number;
	clientNo: string;
	// Calculated fields (live formulas)
	unitPrice: number;      // User can edit
	totalCost: number;      // = bidQuantity * unitPrice (calculated)
	variance: number;       // = takeoffQuantity - bidQuantity (calculated)
	variancePct: number;    // = (variance / bidQuantity) * 100 (calculated)
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
		name: 'Bid Item Number',
		size: 150,
		readonly: false,
		editor: 'text',
		autoFocus: true
	},
	{ 
		prop: 'description', 
		name: 'Description', 
		size: 300, 
		readonly: false, 
		editor: 'text',
		autoFocus: true
	},
	{ 
		prop: 'bidQuantity', 
		name: 'Bid Qty', 
		size: 100, 
		readonly: false, 
		editor: 'text',
		autoFocus: true,
		cellProperties: () => ({ style: { backgroundColor: '#fef3c7' } }) // Yellow - editable
	},
	{
		prop: 'unit',
		name: 'Unit',
		size: 80,
		readonly: false,
		editor: 'text',
		autoFocus: true
	},
	{ 
		prop: 'takeoffQuantity', 
		name: 'Takeoff Qty', 
		size: 120, 
		readonly: false, 
		editor: 'text',
		autoFocus: true,
		cellProperties: () => ({ style: { backgroundColor: '#fef3c7' } }) // Yellow - editable
	},
	{ 
		prop: 'unitPrice', 
		name: 'Unit Price', 
		size: 110, 
		readonly: false, 
		editor: 'text',
		autoFocus: true,
		cellProperties: () => ({ style: { backgroundColor: '#fef3c7' } }) // Yellow - editable
	},
	{ 
		prop: 'totalCost', 
		name: 'Total Cost', 
		size: 120, 
		readonly: true,
		cellProperties: () => ({ style: { backgroundColor: '#dbeafe' } }) // Blue - calculated
	},
	{ 
		prop: 'variance', 
		name: 'Variance', 
		size: 100, 
		readonly: true,
		cellProperties: () => ({ style: { backgroundColor: '#dbeafe' } }) // Blue - calculated
	},
	{ 
		prop: 'variancePct', 
		name: 'Variance %', 
		size: 110, 
		readonly: true,
		cellProperties: () => ({ style: { backgroundColor: '#dbeafe' } }) // Blue - calculated
	},
	{ 
		prop: 'clientNo', 
		name: 'Client #', 
		size: 100, 
		readonly: false, 
		editor: 'text',
		autoFocus: true
	}
];

const store = createDataStore<BidItem>();

// Formula calculator for live calculations
const calculator = useFormulaCalculator<BidItem>({
	formulas: {
		// Total Cost = Bid Quantity × Unit Price
		totalCost: (row) => (row.bidQuantity || 0) * (row.unitPrice || 0),
		
		// Variance = Takeoff Quantity - Bid Quantity
		variance: (row) => (row.takeoffQuantity || 0) - (row.bidQuantity || 0),
		
		// Variance % = (Variance / Bid Quantity) × 100
		variancePct: (row) => {
			const bidQty = row.bidQuantity || 0;
			if (bidQty === 0) return 0;
			const variance = (row.takeoffQuantity || 0) - bidQty;
			return (variance / bidQty) * 100;
		}
	},
	triggers: {
		bidQuantity: ['totalCost', 'variance', 'variancePct'],
		unitPrice: ['totalCost'],
		takeoffQuantity: ['variance', 'variancePct']
	}
});

/**
 * Apply formulas to a single row
 */
function applyFormulas(row: BidItem): BidItem {
	return calculator.calculateRow(row);
}

/**
 * Apply formulas to all rows
 */
function applyFormulasToAll(rows: BidItem[]): BidItem[] {
	return calculator.calculateAllRows(rows);
}

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
			clientNo: String(10 + i * 10),
			unitPrice: Math.round((Math.random() * 50 + 10) * 100) / 100, // Random price $10-$60
			totalCost: 0, // Will be calculated
			variance: 0,  // Will be calculated
			variancePct: 0 // Will be calculated
		}));
		
		// Apply formulas to calculate derived fields
		const calculatedItems = applyFormulasToAll(bidItems);
		
		// Always add one empty row for user to start typing
		const newId = calculatedItems.length + 1;
		calculatedItems.push({
			id: newId,
			bidItem: '',
			description: '',
			bidQuantity: 0,
			unit: '',
			takeoffQuantity: 0,
			clientNo: '',
			unitPrice: 0,
			totalCost: 0,
			variance: 0,
			variancePct: 0
		});
		
		store.setData(calculatedItems);
		console.log('[BID ITEM STORE] Loaded', calculatedItems.length, 'bid items with formulas', calculatedItems);
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
		bidItem: '',
		description: '',
		bidQuantity: 0,
		unit: '',
		takeoffQuantity: 0,
		clientNo: '',
		unitPrice: 0,
		totalCost: 0,
		variance: 0,
		variancePct: 0
	};
	store.addRow(newItem);
}

function generateFallbackBidItems(): BidItem[] {
	const fallback = [
		{
			id: 1,
			bidItem: 'Mobilization',
			description: '',
			bidQuantity: 1.0,
			unit: 'LS',
			takeoffQuantity: 1.0,
			clientNo: '10',
			unitPrice: 2500.00,
			totalCost: 0,
			variance: 0,
			variancePct: 0
		},
		{
			id: 2,
			bidItem: 'SWPPP',
			description: '',
			bidQuantity: 1.0,
			unit: 'LS',
			takeoffQuantity: 1.0,
			clientNo: '15',
			unitPrice: 1200.00,
			totalCost: 0,
			variance: 0,
			variancePct: 0
		},
		{
			id: 3,
			bidItem: 'Silt Fence',
			description: '',
			bidQuantity: 450.0,
			unit: 'LF',
			takeoffQuantity: 465.0,
			clientNo: '20',
			unitPrice: 8.50,
			totalCost: 0,
			variance: 0,
			variancePct: 0
		}
	];
	
	// Apply formulas to fallback data
	return applyFormulasToAll(fallback);
}

export const bidItemStore = store;

// Export formula application functions
export { applyFormulas, applyFormulasToAll };
