<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { ColumnRegular } from '@revolist/revogrid';

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

	onMount(async () => {
		if (browser) {
			try {
				// @ts-expect-error - Module resolution issue with svelte-datagrid v4.14.0
				const module = await import('@revolist/svelte-datagrid');
				// Try multiple ways to get the component
				RevoGrid = module.RevoGrid || module.default || module;
				
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
			} catch (error) {
				console.error('[GRID INIT] Failed to load RevoGrid:', error);
			}
		}
	});

	function handleAfterEdit(event: any) {
		console.log('[AFTER EDIT] Full event:', event.detail);
		console.log('[AFTER EDIT] Models:', event.detail?.models);
		isEditing = false;
		currentEditCell = null;
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
		// Explicitly allow editing
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


</script>

{#if mounted && RevoGrid}
	<svelte:component
		this={RevoGrid}
		bind:this={gridRef}
		source={data}
		columns={columns}
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
{:else}
	<div class="flex items-center justify-center h-full">
		<p>Loading...</p>
	</div>
{/if}
