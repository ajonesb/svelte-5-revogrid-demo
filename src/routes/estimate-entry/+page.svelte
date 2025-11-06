<script lang="ts">
	import { onMount } from 'svelte';
	import { estimateEntryStore, initEstimateStore, updateCell } from '$lib/stores/estimateEntryStore.svelte';
	import EstimateDataGrid from '$lib/components/EstimateDataGrid.svelte';
	import SummaryTotals from '$lib/components/SummaryTotals.svelte';

	onMount(() => {
		initEstimateStore();
	});

	const rows = $derived(estimateEntryStore.rows);
	const summaryTotals = $derived(estimateEntryStore.summaryTotals);

	function handleCellChange(rowId: number, prop: any, value: any) {
		updateCell(rowId, prop, value);
	}
</script>

<div class="h-full flex flex-col bg-gray-50">
	<!-- Top Info Cards -->
	<div class="bg-white border-b px-6 py-4">
		<div class="grid grid-cols-2 gap-6">
			<!-- Bid Item Information Card -->
			<div class="space-y-3">
				<h2 class="text-sm font-semibold text-gray-700 border-b pb-2">Bid Item Information</h2>
				<div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
					<div class="flex justify-between">
						<span class="text-gray-600">Contract Item No:</span>
						<span class="font-medium">102</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Estimate Quantity:</span>
						<span class="font-medium">596</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Units:</span>
						<span class="font-medium">LF</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Crew Makeup:</span>
						<span class="font-medium">2F/2L</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Prod Rate:</span>
						<span class="font-medium">16.556</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Man Hours Per Unit:</span>
						<span class="font-medium">0.2416</span>
					</div>
				</div>
			</div>

			<!-- Activity Productivity Card -->
			<div class="space-y-3">
				<h2 class="text-sm font-semibold text-gray-700 border-b pb-2">Activity Productivity Information and Options</h2>
				<div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
					<div class="flex justify-between">
						<span class="text-gray-600">Manhours:</span>
						<span class="font-medium">184.00</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Units/Hr:</span>
						<span class="font-medium">99.3056</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Un/Shift:</span>
						<span class="font-medium">893.7500</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Crew Labor:</span>
						<span class="font-medium">5.00</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Unit/MH:</span>
						<span class="font-medium">19.4293</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Crew$/Unit:</span>
						<span class="font-medium">5.0671100</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Shifts:</span>
						<span class="font-medium">4.0000</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Crew Equip:</span>
						<span class="font-medium">3.00</span>
					</div>
					<div class="flex items-center gap-2">
						<input type="checkbox" id="lockActivity" class="rounded" />
						<label for="lockActivity" class="text-gray-600 text-xs">Lock Activity</label>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Data Grid -->
	<div class="flex-1 bg-white">
		<EstimateDataGrid data={rows} onCellChange={handleCellChange} />
	</div>

	<!-- Summary Totals -->
	<SummaryTotals
		totalCost={summaryTotals.totalCost}
		grossPrice={summaryTotals.grossPrice}
		salesPrice={summaryTotals.salesPrice}
	/>
</div>
