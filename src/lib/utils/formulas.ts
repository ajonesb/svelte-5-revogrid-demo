/**
 * Formula calculations for estimate entry
 */

/**
 * Calculate adjusted quantity based on waste percentage
 */
export function calcAdjQuantity(quantity: number, wastePct: number = 0): number {
	return quantity * (1 + wastePct);
}

/**
 * Calculate total cost
 */
export function calcTotalCost(
	adjQuantity: number,
	unitCost: number,
	taxPct: number
): number {
	return adjQuantity * unitCost * (1 + taxPct);
}

/**
 * Calculate gross price with markup
 */
export function calcGrossPrice(totalCost: number, markupPct: number = 0.18): number {
	return totalCost * (1 + markupPct);
}

/**
 * Calculate sales price (same as gross price for now)
 */
export function calcSalesPrice(grossPrice: number): number {
	return grossPrice;
}

/**
 * Format number as currency (USD)
 */
export function formatCurrency(value: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);
}

/**
 * Format number as percentage
 */
export function formatPercent(value: number): string {
	return `${(value * 100).toFixed(3)}%`;
}

/**
 * Round to 2 decimal places
 */
export function roundCurrency(value: number): number {
	return Math.round(value * 100) / 100;
}
