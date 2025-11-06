/**
 * Estimate Entry Store - Svelte 5
 * Manages resource rows and calculations
 */

import type { ResourceRow } from '$lib/assets/mock/estimate.rows';
import { mockEstimateRows } from '$lib/assets/mock/estimate.rows';
import {
	calcAdjQuantity,
	calcTotalCost,
	calcGrossPrice,
	calcSalesPrice,
	roundCurrency
} from '$lib/utils/formulas';

interface EstimateState {
	rows: ResourceRow[];
	projectMarkupPct: number;
}

// Create reactive state
let state = $state<EstimateState>({
	rows: [],
	projectMarkupPct: 0.18
});

/**
 * Recalculate computed fields for a single row
 */
function recalculateRow(row: ResourceRow, markupPct: number): ResourceRow {
	const adjQty = calcAdjQuantity(row.quantity, row.wastePct);
	const totalCost = calcTotalCost(adjQty, row.unitCost, row.taxPct);
	const grossPrice = calcGrossPrice(totalCost, markupPct);
	const salesPrice = calcSalesPrice(grossPrice);

	return {
		...row,
		adjQuantity: roundCurrency(adjQty),
		totalCost: roundCurrency(totalCost),
		grossPrice: roundCurrency(grossPrice),
		salesPrice: roundCurrency(salesPrice)
	};
}

/**
 * Recalculate all rows
 */
function recalculateAllRows() {
	state.rows = state.rows.map((row) => recalculateRow(row, state.projectMarkupPct));
}

/**
 * Initialize store with mock data
 */
export function initEstimateStore() {
	state.rows = mockEstimateRows.map((row) => recalculateRow(row, state.projectMarkupPct));
}

/**
 * Update a single cell and recalculate
 */
export function updateCell(rowId: number, prop: keyof ResourceRow, value: any) {
	const rowIndex = state.rows.findIndex((r) => r.id === rowId);
	if (rowIndex === -1) return;

	// Update the property
	const updatedRow = { ...state.rows[rowIndex], [prop]: value };

	// Recalculate computed fields
	state.rows[rowIndex] = recalculateRow(updatedRow, state.projectMarkupPct);
}

/**
 * Update markup percentage and recalculate all
 */
export function updateMarkup(newMarkupPct: number) {
	state.projectMarkupPct = newMarkupPct;
	recalculateAllRows();
}

/**
 * Export the store with derived values
 */
export const estimateEntryStore = {
	get rows() {
		return state.rows;
	},
	get projectMarkupPct() {
		return state.projectMarkupPct;
	},
	get summaryTotals() {
		const totalCost = state.rows.reduce((sum, row) => sum + row.totalCost, 0);
		const grossPrice = state.rows.reduce((sum, row) => sum + row.grossPrice, 0);
		const salesPrice = state.rows.reduce((sum, row) => sum + row.salesPrice, 0);

		return {
			totalCost: roundCurrency(totalCost),
			grossPrice: roundCurrency(grossPrice),
			salesPrice: roundCurrency(salesPrice)
		};
	}
};
