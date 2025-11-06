/**
 * Grid Edit Utilities
 * Helper functions for grid editing and keyboard events
 */

/**
 * Simulate Enter key press to commit edit
 */
export function commitEdit(element?: Element | null) {
	const el = element || document.activeElement;
	if (!el) return;
	
	const enterEvent = new KeyboardEvent('keydown', {
		key: 'Enter',
		code: 'Enter',
		keyCode: 13,
		which: 13,
		bubbles: true
	});
	el.dispatchEvent(enterEvent);
}

/**
 * Check if column is a dropdown type
 */
export function isDropdownColumn(columnProp?: string | number, columnName?: string): boolean {
	const propStr = String(columnProp ?? '');
	return propStr === 'bidItem' || /bid\s*item/i.test(String(columnName ?? ''));
}

/**
 * Get row and column indices from edit event
 */
export function getEditCellIndices(event: any): { row: number; col: number } {
	return {
		row: event?.rowIndex ?? event?.row ?? 0,
		col: event?.colIndex ?? event?.col ?? 0
	};
}
