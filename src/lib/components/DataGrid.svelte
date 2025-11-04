<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, tick } from 'svelte';
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
	}

	let { data, columns, onEdit, onSourceSet }: Props = $props();

	let RevoGrid = $state<any>(null);
	let SelectTypePlugin = $state<any>(null);
	let gridEl = $state<any>(null);
	let mounted = $state(false);

	onMount(async () => {
		if (!browser) return;

		try {
			const { RevoGrid: GridComponent } = await import('@revolist/svelte-datagrid');
			RevoGrid = GridComponent;

			const selectMod: any = await import('@revolist/revogrid-column-select');
			SelectTypePlugin = selectMod?.default ?? selectMod?.SelectTypePlugin ?? selectMod;

			mounted = true;

			await tick();
			if (gridEl && SelectTypePlugin) {
				gridEl.columnTypes = { select: new SelectTypePlugin() };
			}
		} catch (error) {
			console.error('Failed to load DataGrid:', error);
		}
	});

	// Re-apply column types when dependencies change
	$effect(() => {
		if (gridEl && SelectTypePlugin) {
			gridEl.columnTypes = { select: new SelectTypePlugin() };
		}
	});
</script>

{#if mounted && RevoGrid}
	<RevoGrid
		bind:this={gridEl}
		source={data}
		{columns}
		range
		readonly={false}
		rowHeaders
		on:afteredit={onEdit}
		on:aftersourceset={onSourceSet}
		class="h-full"
	/>
{:else}
	<div class="flex items-center justify-center h-full">
		<p class="text-muted-foreground">Loading grid...</p>
	</div>
{/if}
