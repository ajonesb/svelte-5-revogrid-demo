/**
 * Formula Calculator Composable - Svelte 5
 * Handles live cell-to-cell formula calculations
 * 
 * Example: If Quantity changes, Total = Quantity * UnitPrice automatically updates
 */

interface FormulaConfig<T> {
	/**
	 * Define formulas as functions that compute values from row data
	 * Key is the target field, value is the computation function
	 */
	formulas: Record<string, (row: T) => any>;
	
	/**
	 * Optional: Define which fields trigger recalculation when changed
	 * If not provided, all edits trigger recalculation
	 */
	triggers?: Record<string, string[]>; // { changedField: [fieldsToRecalculate] }
}

export function useFormulaCalculator<T extends Record<string, any>>(config: FormulaConfig<T>) {
	/**
	 * Recalculate computed fields for a single row
	 */
	function calculateRow(row: T): T {
		const updatedRow = { ...row } as any;
		
		// Apply all formulas
		for (const [field, formula] of Object.entries(config.formulas)) {
			try {
				updatedRow[field] = formula(row);
			} catch (err) {
				console.error(`[FORMULA] Error calculating ${field}:`, err);
			}
		}
		
		return updatedRow as T;
	}

	/**
	 * Recalculate specific fields based on what changed
	 */
	function calculateFields(row: T, changedField: string): T {
		// If no triggers defined, recalculate everything
		if (!config.triggers || !config.triggers[changedField]) {
			return calculateRow(row);
		}
		
		const updatedRow = { ...row } as any;
		const fieldsToUpdate = config.triggers[changedField] || [];
		
		// Only recalculate triggered fields
		for (const field of fieldsToUpdate) {
			if (config.formulas[field]) {
				try {
					updatedRow[field] = config.formulas[field](row);
				} catch (err) {
					console.error(`[FORMULA] Error calculating ${field}:`, err);
				}
			}
		}
		
		return updatedRow as T;
	}

	/**
	 * Recalculate all rows
	 */
	function calculateAllRows(rows: T[]): T[] {
		return rows.map(row => calculateRow(row));
	}

	return {
		calculateRow,
		calculateFields,
		calculateAllRows
	};
}

/**
 * Example Usage:
 * 
 * const calculator = useFormulaCalculator<BidItem>({
 *   formulas: {
 *     total: (row) => row.quantity * row.unitPrice,
 *     discount: (row) => row.total * 0.1,
 *     finalPrice: (row) => row.total - row.discount
 *   },
 *   triggers: {
 *     quantity: ['total', 'discount', 'finalPrice'],
 *     unitPrice: ['total', 'discount', 'finalPrice']
 *   }
 * });
 * 
 * // On cell edit:
 * const updatedRow = calculator.calculateFields(editedRow, 'quantity');
 */
