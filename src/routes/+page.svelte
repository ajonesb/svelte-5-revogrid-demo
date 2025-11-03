<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { data, addRow, deleteSelected, clearAll, updateRow, selectedIds, loadData, loading, error } from '$lib/stores/dataStore';
	import GridToolbar from '$lib/components/GridToolbar.svelte';
	
	// Import RevoGrid dynamically only on client side
	let RevoGrid: any = null;
	let mounted = false;

	onMount(async () => {
		if (browser) {
			// Load RevoGrid component
			try {
				const module = await import('@revolist/svelte-datagrid');
				RevoGrid = (module as any).default || (module as any).RevoGrid || module;
				console.log('RevoGrid loaded:', RevoGrid);
			} catch (error) {
				console.error('Failed to load RevoGrid:', error);
			}
			
			// Load data from API
			await loadData();
			mounted = true;
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
		{#if $error}
			<div class="flex items-center justify-center h-full">
				<div class="text-center">
					<p class="text-red-500 mb-4">Error: {$error}</p>
					<button 
						class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						onclick={() => loadData()}
					>
						Retry
					</button>
				</div>
			</div>
		{:else if $loading}
			<div class="flex items-center justify-center h-full">
				<div class="text-center">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
					<p>Loading data from API...</p>
				</div>
			</div>
		{:else if mounted && RevoGrid}
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
