<script lang="ts">
	import { onMount } from 'svelte';
	import { tabStore } from '$lib/stores/tabStore.svelte';
	import {
		estimateStore,
		loadEstimates,
		addEstimate,
		ESTIMATE_COLUMNS
	} from '$lib/stores/estimateStore.svelte';
	import {
		infoSetupStore,
		loadInfoSetup,
		addInfoSetupItem,
		INFO_SETUP_COLUMNS
	} from '$lib/stores/infoSetupStore.svelte';
	import {
		bidItemStore,
		loadBidItems,
		addBidItem,
		BID_ITEM_COLUMNS
	} from '$lib/stores/bidItemStore.svelte';
	import GridToolbar from '$lib/components/GridToolbar.svelte';
	import DataGrid from '$lib/components/DataGrid.svelte';

	onMount(async () => {
		// Load all data on mount
		await Promise.all([loadEstimates(), loadInfoSetup(), loadBidItems()]);
	});

	// Reactive values based on active tab
	const activeTab = $derived(tabStore.active);
	const currentStore = $derived(
		activeTab === 'estimate-list'
			? estimateStore
			: activeTab === 'information-setup'
				? infoSetupStore
				: bidItemStore
	);
	const currentColumns = $derived(
		activeTab === 'estimate-list'
			? ESTIMATE_COLUMNS
			: activeTab === 'information-setup'
				? INFO_SETUP_COLUMNS
				: BID_ITEM_COLUMNS
	);
	const currentData = $derived(currentStore.data);
	const currentLoading = $derived(currentStore.loading);
	const currentError = $derived(currentStore.error);
	const selectionCount = $derived(currentStore.selectedIds.size);

	// Actions
	function handleAdd() {
		console.log('[ACTION] Adding new row to:', activeTab);
		if (activeTab === 'estimate-list') addEstimate();
		else if (activeTab === 'information-setup') addInfoSetupItem();
		else addBidItem();
	}

	function handleDelete() {
		console.log('[ACTION] Deleting selected rows from:', activeTab, 'Count:', selectionCount);
		currentStore.deleteSelected();
	}

	function handleClear() {
		console.log('[ACTION] Clearing all data from:', activeTab);
		currentStore.clearAll();
	}

	function handleEdit(event: any) {
		console.log('[PAGE EDIT] Edit event received:', {
			tab: activeTab,
			detail: event.detail,
			models: event.detail?.models
		});

		const models = event.detail?.models as Record<number, Partial<any>> | undefined;
		if (models) {
			const updatedData = [...currentData];
			for (const [indexStr, patch] of Object.entries(models)) {
				const rowIndex = Number(indexStr);
				const oldRow = updatedData[rowIndex];
				updatedData[rowIndex] = { ...oldRow, ...patch };
				
				console.log('[ROW UPDATE]', {
					tab: activeTab,
					rowIndex,
					oldValues: oldRow,
					changes: patch,
					newValues: updatedData[rowIndex]
				});
			}
			currentStore.setData(updatedData as any);
		}
	}

	function handleCellChange(event: any) {
		console.log('[CELL CHANGE]', {
			tab: activeTab,
			detail: event.detail,
			timestamp: new Date().toISOString()
		});
	}

	function handleSourceSet(event: CustomEvent<any>) {
		console.log(' [SOURCE SET] Data updated:', {
			tab: activeTab,
			rowCount: event.detail.source?.length
		});
		currentStore.setData(event.detail.source);
	}

	async function handleReload() {
		console.log(' [RELOAD] Reloading data for:', activeTab);
		if (activeTab === 'estimate-list') await loadEstimates();
		else if (activeTab === 'information-setup') await loadInfoSetup();
		else await loadBidItems();
	}

	// Track tab changes
	$effect(() => {
		console.log('[TAB CHANGE] Active tab:', activeTab, 'Row count:', currentData.length);
		console.log('[DATA PREVIEW]', {
			tab: activeTab,
			dataLength: currentData.length,
			firstRow: currentData[0],
			columns: currentColumns.map(c => c.prop)
		});
	});
</script>

<svelte:head>
	<title>Data Table - {activeTab}</title>
</svelte:head>

<div class="h-screen flex flex-col">
	<GridToolbar
		onAdd={handleAdd}
		onDelete={handleDelete}
		onClear={handleClear}
		selectedCount={selectionCount}
	/>

	<div class="flex-1">
		{#if currentError}
			<div class="flex items-center justify-center h-full">
				<div class="text-center">
					<p class="text-red-500 mb-4">{currentError}</p>
					<button
						class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
						onclick={handleReload}
					>
						Retry
					</button>
				</div>
			</div>
		{:else if currentLoading}
			<div class="flex items-center justify-center h-full">
				<div class="text-center">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4">
					</div>
					<p class="text-muted-foreground">Loading data...</p>
				</div>
			</div>
		{:else}
			<DataGrid 
				data={currentData} 
				columns={currentColumns} 
				onEdit={handleEdit} 
				onSourceSet={handleSourceSet}
				onCellChange={handleCellChange}
			/>
		{/if}
	</div>
</div>
