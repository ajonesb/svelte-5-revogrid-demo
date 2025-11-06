/**
 * Dropdown Overlay Composable - Svelte 5
 * Manages dropdown overlay state and positioning for grid cells
 */

interface OverlayState {
	visible: boolean;
	left: number;
	top: number;
	isDropdown: boolean;
	options: Array<{ label: string; value: string }>;
	searchTerm: string;
	element: HTMLDivElement | null;
}

interface OverlayConfig {
	gridRef: any;
	onSelect?: (value: string) => void;
}

export function useDropdownOverlay(config: OverlayConfig) {
	let state = $state<OverlayState>({
		visible: false,
		left: 0,
		top: 0,
		isDropdown: false,
		options: [],
		searchTerm: '',
		element: null
	});

	/**
	 * Get filtered options based on search term
	 */
	const filteredOptions = $derived(() => {
		if (!state.searchTerm.trim()) return state.options;
		const term = state.searchTerm.toLowerCase();
		return state.options.filter(opt => 
			opt.label.toLowerCase().includes(term) || 
			opt.value.toLowerCase().includes(term)
		);
	});

	/**
	 * Get cell element from grid (handles shadow DOM)
	 */
	function getCellElement(rowIndex: number, colIndex: number): HTMLElement | null {
		if (!config.gridRef) return null;
		
		try {
			// Use currently focused input element (most reliable)
			const activeInput = document.activeElement;
			if (activeInput && (activeInput.tagName === 'INPUT' || activeInput.tagName === 'TEXTAREA')) {
				return activeInput as HTMLElement;
			}
			
			// Try to find cell in shadow DOM
			const searchRoot: any = config.gridRef.shadowRoot || document;
			
			if (searchRoot && typeof searchRoot.querySelector === 'function') {
				const selectors = [
					`.rgCell[data-rgcol="${colIndex}"][data-rgrow="${rowIndex}"]`,
					`.rgCell[data-rgCol="${colIndex}"][data-rgRow="${rowIndex}"]`,
				];
				
				for (const selector of selectors) {
					const cell = searchRoot.querySelector(selector) as HTMLElement | null;
					if (cell) return cell;
				}
			}
			
			return null;
		} catch (err) {
			return null;
		}
	}

	/**
	 * Position overlay below cell
	 */
	function positionOverlay(rowIndex: number, colIndex: number) {
		const cellEl = getCellElement(rowIndex, colIndex);
		if (!cellEl) {
			state.visible = false;
			return;
		}
		
		const rect = cellEl.getBoundingClientRect();
		
		// Use viewport coordinates (fixed positioning)
		state.left = Math.round(rect.left);
		state.top = Math.round(rect.bottom + 4);
		
		// Hide if cell is outside viewport
		const offscreen = rect.bottom < 0 || rect.top > window.innerHeight || 
		                  rect.right < 0 || rect.left > window.innerWidth;
		state.visible = !offscreen;
	}

	/**
	 * Show overlay with options
	 */
	function show(
		rowIndex: number, 
		colIndex: number, 
		options: Array<{ label: string; value: string }>
	) {
		state.options = options;
		state.searchTerm = '';
		state.isDropdown = true;
		
		// Position immediately
		setTimeout(() => {
			positionOverlay(rowIndex, colIndex);
			state.visible = true;
			
			// Listen to input changes for search
			const inputEl = document.activeElement as HTMLInputElement;
			if (inputEl && 'value' in inputEl) {
				state.searchTerm = inputEl.value || '';
				
				const handleInput = () => {
					state.searchTerm = inputEl.value || '';
				};
				
				inputEl.addEventListener('input', handleInput);
				
				// Cleanup
				setTimeout(() => {
					inputEl.removeEventListener('input', handleInput);
				}, 30000);
			}
		}, 100);
		
		// Keep overlay positioned while visible
		const intervalId = setInterval(() => {
			if (state.visible && state.isDropdown) {
				positionOverlay(rowIndex, colIndex);
			}
		}, 500);
		
		setTimeout(() => clearInterval(intervalId), 30000);
	}

	/**
	 * Hide overlay
	 */
	function hide() {
		state.visible = false;
		state.isDropdown = false;
	}

	/**
	 * Select option and commit to grid
	 */
	function selectOption(value: string) {
		const el = document.activeElement as HTMLInputElement | null;
		try {
			if (el && 'value' in el) {
				el.focus();
				el.value = value;
				el.dispatchEvent(new InputEvent('input', { bubbles: true }));
				
				// Commit with Enter key
				requestAnimationFrame(() => {
					const enterEvent = new KeyboardEvent('keydown', {
						key: 'Enter',
						code: 'Enter',
						keyCode: 13,
						which: 13,
						bubbles: true
					});
					el.dispatchEvent(enterEvent);
				});
			}
		} finally {
			hide();
			if (config.onSelect) config.onSelect(value);
		}
	}

	return {
		// State getters
		get visible() { return state.visible; },
		get left() { return state.left; },
		get top() { return state.top; },
		get isDropdown() { return state.isDropdown; },
		get element() { return state.element; },
		set element(el: HTMLDivElement | null) { state.element = el; },
		
		// Computed
		filteredOptions,
		
		// Actions
		show,
		hide,
		positionOverlay,
		selectOption
	};
}
