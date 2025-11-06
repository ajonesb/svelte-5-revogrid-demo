<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import type { ColumnRegular } from '@revolist/revogrid';
	import { BID_ITEM_OPTIONS } from '$lib/stores/bidItemStore.svelte';

	interface Props {
		data: any[];
		columns: ColumnRegular[];
		onEdit?: (event: any) => void;
		onSourceSet?: (event: CustomEvent<any>) => void;
		onCellChange?: (event: any) => void;
	}

	let { data, columns, onEdit, onSourceSet }: Props = $props();
	let RevoGrid: any = $state(null);
	let mounted = $state(false);
	let gridRef: any = $state(null);
	let isEditing = $state(false);
	let currentEditCell: any = $state(null);

	// Minimal inline overlay state (no portaling)
	let overlayVisible = $state(false);
	let overlayLeft = $state(0);
	let overlayTop = $state(0);
	let overlayIsDropdown = $state(false);
	let overlayLabel = $state(''); // kept for backward minimal text, no longer shown
	let overlayEl = $state<HTMLDivElement | null>(null);
	let overlayOptions = $state<Array<{ label: string; value: string }>>([]);
	let searchTerm = $state('');

	// Filtered options based on search term
	const filteredOptions = $derived(() => {
		if (!searchTerm.trim()) return overlayOptions;
		const term = searchTerm.toLowerCase();
		return overlayOptions.filter(opt => 
			opt.label.toLowerCase().includes(term) || 
			opt.value.toLowerCase().includes(term)
		);
	});

	function getCellElement(rowIndex: number, colIndex: number): HTMLElement | null {
		if (!gridRef) return null;
		
		try {
			// Fallback: just use the currently focused input element (simplest and most reliable)
			const activeInput = document.activeElement;
			if (activeInput && (activeInput.tagName === 'INPUT' || activeInput.tagName === 'TEXTAREA')) {
				return activeInput as HTMLElement;
			}
			
			// If no active input, try to find the cell in shadow DOM
			const gridElement = gridRef as any;
			const searchRoot: any = gridElement.shadowRoot || document;
			
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

	function positionOverlayForCell(rowIndex: number, colIndex: number) {
		const cellEl = getCellElement(rowIndex, colIndex);
		if (!cellEl) {
			overlayVisible = false;
			return;
		}
		
		const rect = cellEl.getBoundingClientRect();
		
		// Use viewport coordinates (fixed positioning)
		overlayLeft = Math.round(rect.left);
		overlayTop = Math.round(rect.bottom + 4);
		
		// Hide if cell is outside viewport
		const offscreen = rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth;
		overlayVisible = !offscreen;
	}

	onMount(async () => {
		if (browser) {
			try {
				const module = await import('@revolist/svelte-datagrid');
				// Get the RevoGrid component
				RevoGrid = module.RevoGrid;

				// Check if it's a valid function/component
				if (typeof RevoGrid !== 'function') {
					console.error('[GRID INIT] Invalid RevoGrid component:', module);
					return;
				}

				mounted = true;
				console.log('[GRID INIT] Grid mounted successfully');

				// Add a global click listener to commit edits when clicking outside edit cell
				setTimeout(() => {
					if (gridRef) {
						const gridElement = gridRef;
						document.addEventListener('mousedown', (e: MouseEvent) => {
							if (isEditing) {
								// If click happens inside the overlay, don't auto-commit yet
								if (overlayVisible && overlayEl && overlayEl.contains(e.target as Node)) {
									return;
								}
								console.log('[GLOBAL CLICK] Committing edit due to outside click');
								// Simulate pressing Enter to commit the edit
								const enterEvent = new KeyboardEvent('keydown', {
									key: 'Enter',
									code: 'Enter',
									keyCode: 13,
									which: 13,
									bubbles: true
								});
								const activeElement = document.activeElement;
								if (activeElement) {
									activeElement.dispatchEvent(enterEvent);
								}
							}
						});
			}
		}, 500);

		// Reposition overlay while editing
		const reposition = () => {
			if (!isEditing || !currentEditCell) return;
			const r = currentEditCell?.rowIndex ?? currentEditCell?.row ?? 0;
			const c = currentEditCell?.colIndex ?? currentEditCell?.col ?? 0;
			positionOverlayForCell(r, c);
		};
		window.addEventListener('scroll', reposition, true);
		window.addEventListener('resize', reposition, true);
	} catch (error) {
		console.error('[GRID INIT] Failed to load RevoGrid:', error);
	}
	}
});

onDestroy(() => {
	// Clean up event listeners - only in browser
	if (browser) {
		window.removeEventListener('scroll', () => {}, true);
		window.removeEventListener('resize', () => {}, true);
	}
});

	function handleAfterEdit(event: any) {
		console.log('[AFTER EDIT] Full event:', event.detail);
		isEditing = false;
		currentEditCell = null;
		overlayVisible = false;
		overlayIsDropdown = false;
		if (onEdit) onEdit(event);
	}

	function handleSourceSet(event: CustomEvent<any>) {
		console.log('[SOURCE SET]', event.detail.source?.length);
		if (onSourceSet) onSourceSet(event);
	}

	function handleBeforeEdit(event: any) {
		console.log('[BEFORE EDIT] Starting edit:', event.detail);
		// Allow the edit - don't prevent default
		return true;
	}

	function handleBeforeEditStart(event: any) {
		console.log('[BEFORE EDIT START]:', event.detail);
		isEditing = true;
		currentEditCell = event.detail;
		try {
			const r = event.detail?.rowIndex ?? event.detail?.row ?? 0;
			const c = event.detail?.colIndex ?? event.detail?.col ?? 0;
			const col = columns?.[c];
			// Only show overlay for Bid Item column to indicate dropdown
			overlayIsDropdown = (col?.prop === 'bidItem') || /bid\s*item/i.test(String(col?.name ?? ''));
			
			console.log('>>> OVERLAY CHECK: isDropdown=', overlayIsDropdown, 'col=', col?.prop);
			
			if (overlayIsDropdown) {
				overlayLabel = 'Select Bid Item';
				overlayOptions = BID_ITEM_OPTIONS;
				searchTerm = ''; // Reset search term
				
				console.log('>>> SETTING OVERLAY: options count=', overlayOptions.length);
				
				// Position immediately
				setTimeout(() => {
					positionOverlayForCell(r, c);
					overlayVisible = true;
					console.log('>>> OVERLAY STATE: visible=', overlayVisible, 'left=', overlayLeft, 'top=', overlayTop);
					
					// Listen to input changes to update search term
					const inputEl = document.activeElement as HTMLInputElement;
					if (inputEl && ('value' in inputEl)) {
						searchTerm = inputEl.value || '';
						
						const handleInput = () => {
							searchTerm = inputEl.value || '';
						};
						
						inputEl.addEventListener('input', handleInput);
						
						// Cleanup when overlay closes
						const cleanup = () => {
							inputEl.removeEventListener('input', handleInput);
						};
						setTimeout(cleanup, 30000); // Auto-cleanup after 30s
					}
				}, 100);
				
				// Update position occasionally to reduce errors
				const keepVisible = () => {
					if (isEditing && overlayIsDropdown) {
						positionOverlayForCell(r, c);
					}
				};
				
				const intervalId = setInterval(keepVisible, 500);
				setTimeout(() => clearInterval(intervalId), 30000);
			} else {
				overlayVisible = false;
			}
		} catch (err) {
			console.error('[OVERLAY ERROR]:', err);
		}
		return true;
	}

	function handleCellFocus(event: any) {
		console.log('[CELL FOCUS] Cell focused:', event.detail);
		// If we're currently editing and about to focus a different cell, commit the edit
		if (isEditing && gridRef) {
			console.log('[CELL FOCUS] Committing previous edit before focus change');
			// Trigger the grid to commit/save the current edit
			try {
				// Try to programmatically end the edit
				const editEvent = new CustomEvent('keydown', {
					detail: { key: 'Enter' }
				});
				gridRef.dispatchEvent?.(editEvent);
			} catch (e) {
				console.log('[CELL FOCUS] Could not trigger commit:', e);
			}
		}
	}

	function handleCellEdit(event: any) {
		console.log('[CELL EDIT] Cell being edited:', event.detail);
		if (onEdit) onEdit(event);
	}

	function selectOverlayOption(value: string) {
		// Try to write into active editor input and commit with Enter
		const el = document.activeElement as HTMLInputElement | null;
		try {
			if (el && ('value' in el)) {
				el.focus();
				(el as HTMLInputElement).value = value;
				el.dispatchEvent(new InputEvent('input', { bubbles: true }));
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
			overlayVisible = false;
		}
	}
</script>

{#if mounted && RevoGrid}
	<div class="grid-wrapper" style="position: relative; height: 100%; overflow: auto;">
		<RevoGrid
			bind:this={gridRef}
			source={data}
			{columns}
			readonly={false}
			range={false}
			resize={true}
			canFocus={true}
			useClipboard={true}
			on:beforeeditstart={handleBeforeEditStart}
			on:beforeedit={handleBeforeEdit}
			on:afteredit={handleAfterEdit}
			on:beforecellfocus={handleCellFocus}
			on:aftersourceset={handleSourceSet}
			on:beforerangeedit={handleBeforeEdit}
		/>

		{#if overlayVisible}
			<div bind:this={overlayEl} class="dg-overlay" style={`position:fixed;left:${overlayLeft}px;top:${overlayTop}px;`}>
				<ul class="dg-list" role="listbox" aria-label="Bid Items">
					{#each filteredOptions() as opt, idx (idx)}
						<li
							class="dg-option"
							role="option"
							aria-selected="false"
							tabindex="0"
							onmousedown={(e) => { e.preventDefault(); selectOverlayOption(opt.value); }}
							onclick={() => selectOverlayOption(opt.value)}
							onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectOverlayOption(opt.value); } }}
						>
							{opt.label}
						</li>
					{:else}
						<li class="dg-option dg-no-results">
							No results
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
{:else}
	<div class="flex items-center justify-center h-full">
		<p>Loading...</p>
	</div>
{/if}

<style>
	:global(revo-grid) {
		--rgCell-padding: 0 0.5rem;
		height: 100vh !important;
	}

	:global(.rgCell),
	:global(revo-grid .rgCell) {
		padding-left: 0.5rem !important;
		padding-right: 0.5rem !important;
	}

	:global(.rgHeaderCell),
	:global(revo-grid .rgHeaderCell) {
		font-weight: 600 !important;
		color: #52525b !important;
		text-transform: none !important;
		background-color: #fafafa !important;
		border-bottom: 1px solid #e4e4e7 !important;
	}

	/* Hide RevoGrid attribution link */
	:global(revogr-attribution),
	:global(.attribution),
	:global([class*="attribution"]) {
		display: none !important;
		visibility: hidden !important;
		opacity: 0 !important;
		height: 0 !important;
		width: 0 !important;
		position: absolute !important;
		pointer-events: none !important;
	}

	/* Minimal overlay: tiny neutral pill under the editing cell */
	.grid-wrapper > .dg-overlay,
	.dg-overlay {
		position: fixed;
		background: #ffffff;
		border: 1px solid #e5e7eb; /* gray-200 */
		border-radius: 8px;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0,0,0,0.06);
		pointer-events: auto; /* interactive for selection */
		z-index: 9999;
		min-width: 220px;
		max-height: 220px;
		overflow: auto;
		padding: 4px 0;
	}

	.grid-wrapper > .dg-overlay .dg-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.grid-wrapper > .dg-overlay .dg-option {
		padding: 6px 10px;
		font-size: 12px;
		line-height: 1.2;
		color: #0f172a; /* slate-900 */
		cursor: pointer;
	}

	.grid-wrapper > .dg-overlay .dg-option:hover {
		background: #f1f5f9; /* slate-100 */
	}

	.grid-wrapper > .dg-overlay .dg-no-results {
		color: #94a3b8; /* slate-400 */
		cursor: default;
		font-style: italic;
		pointer-events: none;
	}

	.grid-wrapper > .dg-overlay .dg-no-results:hover {
		background: transparent;
	}
</style>
