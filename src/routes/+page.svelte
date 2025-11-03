<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { data, addRow, deleteSelected, clearAll, updateRow, selectedIds } from '$lib/stores/dataStore';
	import GridToolbar from '$lib/components/GridToolbar.svelte';
	
	// Import RevoGrid dynamically only on client side
	let RevoGrid: any = null;
	let mounted = false;

	onMount(async () => {
		if (browser) {
			try {
				const module = await import('@revolist/svelte-datagrid');
				// Try different possible exports
				RevoGrid = (module as any).default || (module as any).RevoGrid || module;
				console.log('RevoGrid loaded:', RevoGrid);
				mounted = true;
			} catch (error) {
				console.error('Failed to load RevoGrid:', error);
				mounted = true; // Show error state
			}
		}
	});

	const columns = [
		{ prop: 'id', name: 'ID', size: 80, readonly: true },
		{ prop: 'name', name: 'Name', size: 150 },
		{ prop: 'qty', name: 'Qty', size: 80 },
		{ prop: 'price', name: 'Price', size: 100 },
		{ prop: 'total', name: 'Total', size: 100, readonly: true }
	];

	function handleEdit(event: any) {
		const { detail } = event;
		const updatedItem = detail.val;
		updateRow(updatedItem);
	}

	function handleSelection(event: any) {
		// Selection is handled automatically by the store
	}

	// Derive selection count from selectedIds store
	$: selectionCount = $selectedIds.size;
</script>

<svelte:head>
	<title>Excel-like Data Grid</title>
</svelte:head>

<div class="h-screen flex flex-col">
	<GridToolbar 
		onAdd={addRow}
		onDelete={deleteSelected} 
		onClear={clearAll} 
		selectedCount={selectionCount}
	/>
	
	<div class="flex-1">
		{#if mounted && RevoGrid}
			<svelte:component 
				this={RevoGrid}
				source={$data}
				{columns}
				range
				readonly={false}
				on:celledit={handleEdit}
				on:aftersourceset={handleSelection}
				class="h-full"
			/>
		{:else if mounted && !RevoGrid}
			<div class="flex items-center justify-center h-full">
				<p class="text-red-500">Failed to load data grid component</p>
			</div>
		{:else}
			<div class="flex items-center justify-center h-full">
				<p>Loading grid...</p>
			</div>
		{/if}
	</div>
</div>
