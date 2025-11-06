<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { ColumnRegular } from '@revolist/revogrid';
	import { BID_ITEM_OPTIONS } from '$lib/stores/bidItemStore.svelte';
	import { useRevoGrid } from '$lib/composables/useRevoGrid.svelte';
	import { useDropdownOverlay } from '$lib/composables/useDropdownOverlay.svelte';
	import { commitEdit, isDropdownColumn, getEditCellIndices } from '$lib/utils/gridEdit';
	import '$lib/styles/revogrid.css';

	interface DataGridProps {
		data: any[];
		columns: ColumnRegular[];
		onEdit?: (event: any) => void;
		onSourceSet?: (event: CustomEvent<any>) => void;
		onCellChange?: (event: any) => void;
	}

	let { data, columns, onEdit, onSourceSet }: DataGridProps = $props();
	let gridRef: any = $state(null);
	let isEditing = $state(false);
	let currentEditCell: any = $state(null);

	// Composables
	const grid = useRevoGrid();
	const overlay = useDropdownOverlay({ 
		get gridRef() { return gridRef; },
		onSelect: (value) => console.log('[OVERLAY] Selected:', value)
	});

	/**
	 * Setup global click handler to commit edits
	 */
	function setupEditCommitHandler() {
		document.addEventListener('mousedown', (e: MouseEvent) => {
			if (isEditing) {
				// Don't commit if clicking inside overlay
				if (overlay.visible && overlay.element?.contains(e.target as Node)) {
					return;
				}
				console.log('[GLOBAL CLICK] Committing edit due to outside click');
				commitEdit();
			}
		});
	}

	/**
	 * Setup overlay repositioning on scroll/resize
	 */
	function setupOverlayRepositioning() {
		const reposition = () => {
			if (!isEditing || !currentEditCell) return;
			const { row, col } = getEditCellIndices(currentEditCell);
			overlay.positionOverlay(row, col);
		};
		
		window.addEventListener('scroll', reposition, true);
		window.addEventListener('resize', reposition, true);
		
		// Cleanup
		return () => {
			window.removeEventListener('scroll', reposition, true);
			window.removeEventListener('resize', reposition, true);
		};
	}

	onMount(async () => {
		await grid.loadGrid();
		
		if (grid.mounted) {
			setTimeout(setupEditCommitHandler, 500);
			setupOverlayRepositioning();
			
			// iOS-specific: Add double-tap handler to trigger edit mode
			if (gridRef) {
				let lastTap = 0;
				gridRef.addEventListener('touchend', (e: TouchEvent) => {
					const currentTime = new Date().getTime();
					const tapLength = currentTime - lastTap;
					
					if (tapLength < 500 && tapLength > 0) {
						// Double tap detected - force edit mode
						const target = e.target as HTMLElement;
						const cell = target.closest('.rgCell');
						if (cell) {
							console.log('[iOS DOUBLE TAP] Triggering edit mode');
							cell.dispatchEvent(new Event('dblclick', { bubbles: true }));
						}
					}
					lastTap = currentTime;
				});
			}
		}
	});

	onDestroy(() => {
		// Cleanup handled by setupOverlayRepositioning
	});

	// Event Handlers
	function handleAfterEdit(event: any) {
		console.log('[AFTER EDIT] Full event:', event.detail);
		isEditing = false;
		currentEditCell = null;
		overlay.hide();
		if (onEdit) onEdit(event);
	}

	function handleSourceSet(event: CustomEvent<any>) {
		console.log('[SOURCE SET]', event.detail.source?.length);
		if (onSourceSet) onSourceSet(event);
	}

	function handleBeforeEdit(event: any) {
		console.log('[BEFORE EDIT] Starting edit:', event.detail);
		return true;
	}

	function handleBeforeEditStart(event: any) {
		console.log('[BEFORE EDIT START]:', event.detail);
		isEditing = true;
		currentEditCell = event.detail;
		
		try {
			const { row, col } = getEditCellIndices(event.detail);
			const column = columns?.[col];
			
			// iOS fix: Force focus on input element
			setTimeout(() => {
				const inputElement = gridRef?.querySelector('.rgCell input, .edit-input input');
				if (inputElement) {
					console.log('[iOS FIX] Forcing input focus');
					inputElement.focus();
					inputElement.click();
				}
			}, 50);
			
			// Check if this column should show dropdown
			const showDropdown = isDropdownColumn(column?.prop, column?.name);
			
			console.log('>>> OVERLAY CHECK: isDropdown=', showDropdown, 'col=', column?.prop);
			
			if (showDropdown) {
				console.log('>>> SETTING OVERLAY: options count=', BID_ITEM_OPTIONS.length);
				overlay.show(row, col, BID_ITEM_OPTIONS);
			} else {
				overlay.hide();
			}
		} catch (err) {
			console.error('[OVERLAY ERROR]:', err);
		}
		
		return true;
	}

	function handleCellFocus(event: any) {
		console.log('[CELL FOCUS] Cell focused:', event.detail);
		if (isEditing && gridRef) {
			console.log('[CELL FOCUS] Committing previous edit before focus change');
			try {
				commitEdit();
			} catch (e) {
				console.log('[CELL FOCUS] Could not trigger commit:', e);
			}
		}
	}

	function handleCellEdit(event: any) {
		console.log('[CELL EDIT] Cell being edited:', event.detail);
		if (onEdit) onEdit(event);
	}

</script>

{#if grid.mounted && grid.component}
	<div class="grid-wrapper">
		<grid.component
			bind:this={gridRef}
			source={data}
			{columns}
			readonly={false}
			range={false}
			resize={true}
			canFocus={true}
			useClipboard={true}
			autoFocus={true}
			on:beforeeditstart={handleBeforeEditStart}
			on:beforeedit={handleBeforeEdit}
			on:afteredit={handleAfterEdit}
			on:beforecellfocus={handleCellFocus}
			on:aftersourceset={handleSourceSet}
			on:beforerangeedit={handleBeforeEdit}
		/>

		{#if overlay.visible}
			<div 
				bind:this={overlay.element} 
				class="dropdown-overlay" 
				style="left: {overlay.left}px; top: {overlay.top}px;"
			>
				<ul class="dropdown-list" role="listbox" aria-label="Bid Items">
					{#each overlay.filteredOptions() as opt, idx (idx)}
						<li
							class="dropdown-option"
							role="option"
							aria-selected="false"
							tabindex="0"
							onmousedown={(e) => { e.preventDefault(); overlay.selectOption(opt.value); }}
							onclick={() => overlay.selectOption(opt.value)}
							onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); overlay.selectOption(opt.value); } }}
						>
							{opt.label}
						</li>
					{:else}
						<li class="dropdown-option no-results">
							No results
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
{:else if grid.error}
	<div class="flex items-center justify-center h-full">
		<p class="text-red-500">{grid.error}</p>
	</div>
{:else}
	<div class="flex items-center justify-center h-full">
		<p>Loading...</p>
	</div>
{/if}

<style>
	.grid-wrapper {
		position: relative;
		height: 100%;
	}
</style>

