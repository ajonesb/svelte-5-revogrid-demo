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
	import { estimateEntryStore, initEstimateStore, updateCell } from '$lib/stores/estimateEntryStore.svelte';
	import DataGrid from '$lib/components/DataGrid.svelte';
	import EstimateDataGrid from '$lib/components/EstimateDataGrid.svelte';
	import SummaryTotals from '$lib/components/SummaryTotals.svelte';

	onMount(async () => {
		// Load all data on mount
		await Promise.all([loadEstimates(), loadInfoSetup(), loadBidItems()]);
		initEstimateStore();
	});

	// Reactive values based on active tab
	const activeTab = $derived(tabStore.active);
	const currentStore = $derived(
		activeTab === 'estimate-list'
			? estimateStore
			: activeTab === 'information-setup'
				? infoSetupStore
				: activeTab === 'estimate-entry'
					? null
					: bidItemStore
	);
	const currentColumns = $derived(
		activeTab === 'estimate-list'
			? ESTIMATE_COLUMNS
			: activeTab === 'information-setup'
				? INFO_SETUP_COLUMNS
				: BID_ITEM_COLUMNS
	);
	const currentData = $derived(currentStore?.data ?? []);
	const currentLoading = $derived(currentStore?.loading ?? false);
	const currentError = $derived(currentStore?.error ?? null);
	const selectionCount = $derived(currentStore?.selectedIds.size ?? 0);

	// Estimate Entry specific
	const estimateRows = $derived(estimateEntryStore.rows);
	const summaryTotals = $derived(estimateEntryStore.summaryTotals);

	function handleEstimateCellChange(rowId: number, prop: any, value: any) {
		updateCell(rowId, prop, value);
	}

	// Actions
	function handleAdd() {
		console.log('[ACTION] Adding new row to:', activeTab);
		if (currentStore) {
			if (activeTab === 'estimate-list') addEstimate();
			else if (activeTab === 'information-setup') addInfoSetupItem();
			else addBidItem();
		}
	}

	function handleDelete() {
		console.log('[ACTION] Deleting selected rows from:', activeTab, 'Count:', selectionCount);
		if (currentStore) currentStore.deleteSelected();
	}

	function handleClear() {
		console.log('[ACTION] Clearing all data from:', activeTab);
		if (currentStore) currentStore.clearAll();
	}

	function handleEdit(event: any) {
		console.log('[PAGE EDIT] Edit event received:', {
			tab: activeTab,
			detail: event.detail
		});

		if (!currentStore) return;

		const detail = event.detail;
		if (detail && detail.data !== undefined) {
			// RevoGrid afteredit structure: { prop, model, data (new array), column, rowIndex }
			const updatedData = detail.data;

			console.log('[ROW UPDATE]', {
				tab: activeTab,
				rowIndex: detail.rowIndex,
				prop: detail.prop,
				newValue: detail.model,
				dataLength: updatedData.length
			});

			currentStore.setData(updatedData as any);

			// Use setTimeout to check for empty row after the edit is complete and DOM updates
			setTimeout(() => {
				if (!currentStore) return;
				const data = currentStore.data;
				if (data.length > 0) {
					const lastRow: any = data[data.length - 1];
					let isEmpty = false;

					if (activeTab === 'bid-item-setup') {
						isEmpty = !lastRow.bidItem && !lastRow.description && !lastRow.bidQuantity;
					} else if (activeTab === 'information-setup') {
						isEmpty = !lastRow.fieldName && !lastRow.fieldValue;
					} else if (activeTab === 'estimate-list') {
						isEmpty = !lastRow.estimateNo && !lastRow.projectName && !lastRow.client;
					}

					if (!isEmpty) {
						console.log('[AUTO ROW] Adding empty row after edit on', activeTab);
						if (activeTab === 'bid-item-setup') addBidItem();
						else if (activeTab === 'information-setup') addInfoSetupItem();
						else if (activeTab === 'estimate-list') addEstimate();
					}
				}
			}, 100);
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
		if (currentStore) currentStore.setData(event.detail.source);
	}

	async function handleReload() {
		console.log(' [RELOAD] Reloading data for:', activeTab);
		if (activeTab === 'estimate-list') await loadEstimates();
		else if (activeTab === 'information-setup') await loadInfoSetup();
		else await loadBidItems();
	}

	// Track tab changes for logging only
	$effect(() => {
		console.log('[TAB CHANGE] Active tab:', activeTab, 'Row count:', currentData.length);
		console.log('[DATA PREVIEW]', {
			tab: activeTab,
			dataLength: currentData.length,
			firstRow: currentData[0],
			columns: currentColumns.map((c) => c.prop)
		});
	});
</script>

<svelte:head>
	<title>Data Table - {activeTab}</title>
</svelte:head>

<div class=" h-screen flex flex-col">
	<div class="flex-1">
		{#if activeTab === 'estimate-entry'}
			<!-- Estimate Entry Tab -->
			<div class="h-full flex flex-col bg-gray-50">
				<!-- Top Info Card -->
				<div class="bg-white border-b px-6 py-3">
					<!-- Activity Productivity Information and Options -->
					<h2 class="text-sm font-semibold text-gray-700 mb-3">
						Activity Productivity Information and Options
					</h2>
					<div class="flex items-start gap-6">
						<!-- Left side - two rows -->
						<div class="flex-1 space-y-2">
							<!-- First Row -->
							<div class="flex items-center gap-4 text-sm">
								<div class="flex items-center gap-2">
									<span class="text-black text-xs whitespace-nowrap font-bold">Manhours</span>
									<input type="text" value="184.00" class="border rounded px-2 py-1 text-center w-24" readonly />
								</div>
								<div class="flex items-center gap-2">
									<span class="text-black text-xs whitespace-nowrap font-bold">Units/Hr</span>
									<input type="text" value="99.3056" class="border rounded px-2 py-1 text-center w-24" readonly />
								</div>
								<div class="flex items-center gap-2">
									<span class="text-black text-xs whitespace-nowrap font-bold">Un/Shift</span>
									<input type="text" value="893.7500" class="border rounded px-2 py-1 text-center w-24" readonly />
								</div>
								<div class="flex items-center gap-2">
									<span class="text-black text-xs whitespace-nowrap font-bold">Crew Labor</span>
									<input type="text" value="5.00" class="border rounded px-2 py-1 text-center w-24" readonly />
								</div>
							</div>
							<!-- Second Row -->
							<div class="flex items-center gap-4 text-sm">
								<div class="flex items-center gap-2">
									<span class="text-black text-xs whitespace-nowrap font-bold">Unit/MH</span>
									<input type="text" value="19.4293" class="border rounded px-2 py-1 text-center w-24" readonly />
								</div>
								<div class="flex items-center gap-2">
									<span class="text-black text-xs whitespace-nowrap font-bold">Crew$/Unit</span>
									<input type="text" value="5.0671100" class="border rounded px-2 py-1 text-center w-24" readonly />
								</div>
								<div class="flex items-center gap-2">
									<span class="text-black text-xs whitespace-nowrap font-bold">Shifts</span>
									<input type="text" value="4.0000" class="border rounded px-2 py-1 text-center w-24" readonly />
								</div>
								<div class="flex items-center gap-2">
									<span class="text-black text-xs whitespace-nowrap font-bold">Crew Equip</span>
									<input type="text" value="3.00" class="border rounded px-2 py-1 text-center w-24" readonly />
								</div>
							</div>
						</div>
						<!-- Right side - Lock Activity checkbox -->
						<div class="flex items-center">
							<label class="flex items-center gap-2 text-xs text-black font-bold whitespace-nowrap">
								<input type="checkbox" id="lockActivity" class="rounded" />
								<span>Lock Activity</span>
							</label>
						</div>
					</div>
				</div>

				<!-- Data Grid -->
				<div class="flex-1 bg-white">
					<EstimateDataGrid data={estimateRows} onCellChange={handleEstimateCellChange} />
				</div>

				<!-- Summary Totals -->
				<SummaryTotals
					totalCost={summaryTotals.totalCost}
					grossPrice={summaryTotals.grossPrice}
					salesPrice={summaryTotals.salesPrice}
				/>
			</div>
		{:else if currentError}
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
					<div
						class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"
					></div>
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
