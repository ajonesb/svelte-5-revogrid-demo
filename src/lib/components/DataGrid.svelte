<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import type { ColumnRegular } from '@revolist/svelte-datagrid';

	/**
	 * DataGrid Component
	 * Clean, reusable wrapper for RevoGrid with autocomplete support
	 */

	interface Props {
		data: any[];
		columns: ColumnRegular[];
		onEdit?: (event: any) => void;
		onSourceSet?: (event: CustomEvent<any>) => void;
		onCellChange?: (event: any) => void;
	}

	let { data, columns, onEdit, onSourceSet, onCellChange }: Props = $props();

	let RevoGrid = $state<any>(null);
	let selectPlugin = $state<any>(null);
	let gridRef = $state<any>(null);
	let mounted = $state(false);

	// Enhance columns reactively based on columns prop
	const enhancedColumns = $derived.by(() => {
		if (!mounted || !selectPlugin) return columns;
		
		return columns.map(col => {
			if (col.prop === 'bidItem') {
				return {
					...col,
					columnType: 'select',
					editor: 'select',
					source: [
						{ label: 'Mobilization', value: 'Mobilization' },
						{ label: 'SWPPP', value: 'SWPPP' },
						{ label: 'Silt Fence', value: 'Silt Fence' },
						{ label: 'Tree Protection', value: 'Tree Protection' },
						{ label: 'Clearing and Grubbing', value: 'Clearing and Grubbing' },
						{ label: 'Site Cut / Fill to +/- 10th', value: 'Site Cut / Fill to +/- 10th' },
						{ label: 'Import Fill & Grading', value: 'Import Fill & Grading' },
						{ label: 'Machine Grade Paving Areas', value: 'Machine Grade Paving Areas' },
						{ label: 'Lime Stabilization - EXCLUDED', value: 'Lime Stabilization - EXCLUDED' },
						{ label: 'Backfill with Onsite Material', value: 'Backfill with Onsite Material' },
						{ label: '6" San Sewer - left 5\' out from bldg', value: '6" San Sewer - left 5\' out from bldg' },
						{ label: 'Trench Safety', value: 'Trench Safety' },
						{ label: 'Testing', value: 'Testing' },
						{ label: '2" water - left 5\' out from bldg w/ NO taps', value: '2" water - left 5\' out from bldg w/ NO taps' },
						{ label: 'Rip Rap - No Size on Plans (8" x 12")', value: 'Rip Rap - No Size on Plans (8" x 12")' },
						{ label: '6" Thick Headwall', value: '6" Thick Headwall' },
						{ label: '6" Parking w/ 4,000 psi @ 24" OC', value: '6" Parking w/ 4,000 psi @ 24" OC' },
						{ label: '6" Concrete Curb', value: '6" Concrete Curb' },
						{ label: 'Handicap Ramps', value: 'Handicap Ramps' },
						{ label: 'Light Pole Bases - 24" x 9" (buried & 3")', value: 'Light Pole Bases - 24" x 9" (buried & 3")' },
						{ label: '8" Trail - 4" w/ #3 @16" OC & 4,000 PSI', value: '8" Trail - 4" w/ #3 @16" OC & 4,000 PSI' },
						{ label: '5" w/ #3 @16" OC & 4,000 PSI', value: '5" w/ #3 @16" OC & 4,000 PSI' },
						{ label: '11" Trail - 5" w/ #3 @16" OC & 4,000 PSI', value: '11" Trail - 5" w/ #3 @16" OC & 4,000 PSI' },
						{ label: 'Paver Band', value: 'Paver Band' },
						{ label: '4" slab w/ #4 @ 4,000 PSI', value: '4" slab w/ #4 @ 4,000 PSI' },
						{ label: 'Masonry Column Footings', value: 'Masonry Column Footings' },
						{ label: 'Grade Beam at Retaining Wall', value: 'Grade Beam at Retaining Wall' },
						{ label: 'Handicap Ramp at Playground', value: 'Handicap Ramp at Playground' }
					]
				};
			}
			if (col.prop === 'unit') {
				return {
					...col,
					columnType: 'select',
					editor: 'select',
					source: [
						{ label: 'LS', value: 'LS' },
						{ label: 'LF', value: 'LF' },
						{ label: 'CY', value: 'CY' },
						{ label: 'SY', value: 'SY' },
						{ label: 'BCY', value: 'BCY' },
						{ label: 'LCY', value: 'LCY' },
						{ label: 'EA', value: 'EA' },
						{ label: 'SF', value: 'SF' }
					]
				};
			}
			return col;
		});
	});

	onMount(async () => {
		if (!browser) return;

		try {
			const { RevoGrid: GridComponent } = await import('@revolist/svelte-datagrid');
			RevoGrid = GridComponent;

			const selectMod: any = await import('@revolist/revogrid-column-select');
			const SelectTypePlugin = selectMod?.default ?? selectMod?.SelectTypePlugin ?? selectMod;

			selectPlugin = new SelectTypePlugin();
			
			console.log('[GRID INIT] RevoGrid and select plugin loaded');
			mounted = true;
		} catch (error) {
			console.error('[GRID INIT] Failed to load DataGrid:', error);
		}
	});

	// Apply columnTypes when grid reference is available
	$effect(() => {
		if (gridRef && selectPlugin) {
			setTimeout(() => {
				try {
					gridRef.columnTypes = { select: selectPlugin };
					console.log('[GRID] Column types applied');
				} catch (error) {
					console.error('[GRID] Failed to apply column types:', error);
				}
			}, 50);
		}
	});

	// Log data changes
	$effect(() => {
		console.log('[GRID DATA]', {
			dataLength: data.length,
			columnsLength: enhancedColumns.length,
			firstRow: data[0],
			columnProps: enhancedColumns.map(c => c.prop)
		});
	});

	// Log all cell changes for debugging
	function handleBeforeEdit(event: any) {
		console.log('[BEFORE EDIT]', {
			detail: event.detail,
			timestamp: new Date().toISOString()
		});
	}

	function handleAfterEdit(event: any) {
		console.log('[AFTER EDIT]', {
			detail: event.detail,
			models: event.detail?.models,
			timestamp: new Date().toISOString()
		});
		
		if (onEdit) onEdit(event);
		if (onCellChange) onCellChange(event);
	}

	function handleCellEdit(event: any) {
		console.log('[CELL EDIT]', {
			detail: event.detail,
			timestamp: new Date().toISOString()
		});
	}

	function handleSourceSet(event: CustomEvent<any>) {
		console.log('[SOURCE SET]', {
			source: event.detail.source,
			length: event.detail.source?.length,
			timestamp: new Date().toISOString()
		});
		
		if (onSourceSet) onSourceSet(event);
	}
</script>

{#if mounted && RevoGrid && selectPlugin}
	<RevoGrid
		bind:this={gridRef}
		source={data}
		columns={enhancedColumns}
		range
		readonly={false}
		rowHeaders
		on:beforeedit={handleBeforeEdit}
		on:afteredit={handleAfterEdit}
		on:celledit={handleCellEdit}
		on:aftersourceset={handleSourceSet}
		class="h-full"
	/>
{:else}
	<div class="flex items-center justify-center h-full">
		<p class="text-muted-foreground">Loading grid...</p>
	</div>
{/if}
