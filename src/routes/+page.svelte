<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { getData, addRow, deleteSelected, clearAll, updateRow, getSelectedIds, getLoading, getError, loadData } from '$lib/stores/dataStore.svelte';
	import GridToolbar from '$lib/components/GridToolbar.svelte';
	
	// For SSR compatibility: Dynamic import
	let RevoGrid = $state<any>(null);
	let mounted = $state(false);

	onMount(async () => {
		console.log('Component mounting...');
		if (browser) {
			// STEP 1: Load the RevoGrid component
			try {
				const { RevoGrid: RevoGridComponent } = await import('@revolist/svelte-datagrid');
				RevoGrid = RevoGridComponent;
				console.log('RevoGrid component loaded:', typeof RevoGrid);
			} catch (error) {
				console.error('Failed to load RevoGrid:', error);
			}
			
			// STEP 2: Load data from API
			console.log('Loading data...');
			await loadData();
			mounted = true;
			console.log('Component fully mounted');
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

	// Svelte 5: Use $derived for reactive computations
	const currentLoading = $derived(getLoading());
	const currentError = $derived(getError());
	const currentSelectedIds = $derived(getSelectedIds());
	const currentData = $derived(getData());
	const selectionCount = $derived(currentSelectedIds.size);
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
		<!-- ERROR STATE: Show if API fails -->
		{#if currentError}
			<div class="flex items-center justify-center h-full">
				<div class="text-center">
					<p class="text-red-500 mb-4">Error: {currentError}</p>
					<button 
						class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						onclick={() => loadData()}
					>
						Retry
					</button>
				</div>
			</div>
		<!-- LOADING STATE: Show while fetching data -->
		{:else if currentLoading}
			<div class="flex items-center justify-center h-full">
				<div class="text-center">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
					<p>Loading data from API...</p>
				</div>
			</div>
		<!-- SUCCESS STATE: Show the actual grid -->
		{:else if mounted && RevoGrid}
			<!-- This is where the magic happens! -->
			<RevoGrid 
				source={currentData}
				{columns}
				range
				readonly={false}
				on:celledit={handleEdit}
				on:aftersourceset={handleSelection}
				class="h-full"
			/>
		<!-- COMPONENT FAILED: RevoGrid didn't load -->
		{:else if mounted && !RevoGrid}
			<div class="flex items-center justify-center h-full">
				<p class="text-red-500">Failed to load data grid component</p>
			</div>
		<!-- INITIAL STATE: Before anything loads -->
		{:else}
			<div class="flex items-center justify-center h-full">
				<p>Loading grid...</p>
			</div>
		{/if}
	</div>
</div>
