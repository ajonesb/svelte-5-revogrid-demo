<script lang="ts">
	import { formatCurrency } from '$lib/utils/formulas';

	interface Props {
		totalCost: number;
		grossPrice: number;
		salesPrice: number;
	}

	let { totalCost, grossPrice, salesPrice }: Props = $props();
</script>

<div class="bg-white border-t-2 border-gray-200 px-6 py-4">
	<div class="flex justify-end gap-8 text-sm font-semibold">
		<div class="flex items-center gap-2">
			<span class="text-gray-600">Total Cost:</span>
			<span class="text-gray-900">{formatCurrency(totalCost)}</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-gray-600">Total Gross Cost:</span>
			<span class="text-gray-900">{formatCurrency(grossPrice)}</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-gray-600">Total Sales Cost:</span>
			<span class="text-blue-600 text-base">{formatCurrency(salesPrice)}</span>
		</div>
	</div>
</div>
