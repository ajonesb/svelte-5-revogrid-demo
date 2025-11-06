<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { ColumnRegular } from '@revolist/revogrid';
	import type { ResourceRow } from '$lib/assets/mock/estimate.rows';
	import { colors } from '$lib/ui/tokens';
	import { formatCurrency, formatPercent } from '$lib/utils/formulas';
	import '$lib/styles/revogrid.css';

	interface Props {
		data: ResourceRow[];
		onCellChange: (rowId: number, prop: keyof ResourceRow, value: any) => void;
	}

	let { data, onCellChange }: Props = $props();
	let RevoGrid: any = $state(null);
	let mounted = $state(false);
	let gridRef: any = $state(null);

	// Get color based on resource code first character
	function getCodeColor(code: string): string {
		if (!code) return 'transparent';
		const firstChar = code[0];
		if (firstChar === '2') return colors.code2;      // PERMIMENT MATERIALS
		if (firstChar === '3') return colors.code3;      // CONSTRUCTION MATERIAL
		if (firstChar === '4') return colors.code4;      // SUBCONTRACTORS
		if (firstChar === '5') return colors.code5;      // SERVICES
		if (firstChar === '8') return colors.code8;      // EQUIPMENT
		if (firstChar === '9') return colors.code9;      // GENERAL CONDITIONS
		if (/[A-Za-z]/.test(firstChar)) return colors.codeChar; // Crew Labor
		return 'transparent';
	}

	// Column definitions
	const columns: ColumnRegular[] = [
		{
			prop: 'colorBox',
			name: '',
			size: 24,
			minSize: 24,
			readonly: true,
			cellTemplate: (h: any, { model }: any) => {
				const color = getCodeColor(model.resourceCode);
				return h('div', {
					style: {
						backgroundColor: color,
						width: '16px',
						height: '100%',
						margin: '0 auto'
					}
				});
			}
		},
		{
			prop: 'resourceCode',
			name: 'Resource',
			size: 100,
			minSize: 80,
			readonly: true
		},
		{
			prop: 'description',
			name: 'Description',
			size: 340,
			minSize: 140,
			readonly: false,
			editor: 'text'
		},
		{
			prop: 'quantity',
			name: 'Quantity',
			size: 90,
			minSize: 70,
			readonly: false,
			editor: 'text',
			columnType: 'numeric'
		},
		{
			prop: 'unit',
			name: 'Unit',
			size: 60,
			minSize: 50,
			readonly: false,
			editor: 'text'
		},
		{
			prop: 'unitCost',
			name: 'Unit Cost',
			size: 100,
			minSize: 80,
			readonly: false,
			editor: 'text',
			columnType: 'numeric',
			cellTemplate: (h: any, { model }: any) => {
				return formatCurrency(model.unitCost || 0);
			}
		},
		{
			prop: 'taxPct',
			name: 'Tax',
			size: 70,
			minSize: 60,
			readonly: false,
			editor: 'text',
			columnType: 'numeric',
			cellTemplate: (h: any, { model }: any) => {
				return `${((model.taxPct || 0) * 100).toFixed(3)}`;
			}
		},
		{
			prop: 'wastePct',
			name: 'Pcs/Wste',
			size: 70,
			minSize: 60,
			readonly: false,
			editor: 'text',
			columnType: 'numeric',
			cellTemplate: (h: any, { model }: any) => {
				return `${((model.wastePct || 0) * 100).toFixed(0)}`;
			}
		},
		{
			prop: 'adjQuantity',
			name: 'Adj Qty',
			size: 90,
			minSize: 70,
			readonly: true,
			columnType: 'numeric',
			cellTemplate: (h: any, { model }: any) => {
				return (model.adjQuantity || 0).toFixed(2);
			}
		},
		{
			prop: 'totalCost',
			name: 'Total Cost',
			size: 120,
			minSize: 90,
			readonly: true,
			columnType: 'numeric',
			cellTemplate: (h: any, { model }: any) => {
				return formatCurrency(model.totalCost || 0);
			}
		},
		{
			prop: 'grossPrice',
			name: 'Gross Price',
			size: 120,
			minSize: 90,
			readonly: true,
			columnType: 'numeric',
			cellTemplate: (h: any, { model }: any) => {
				return formatCurrency(model.grossPrice || 0);
			}
		},
		{
			prop: 'salesPrice',
			name: 'Sales Price',
			size: 120,
			minSize: 90,
			readonly: true,
			columnType: 'numeric',
			cellTemplate: (h: any, { model }: any) => {
				return formatCurrency(model.salesPrice || 0);
			}
		},
		{
			prop: 'actions',
			name: '',
			size: 50,
			minSize: 50,
			readonly: true,
			pin: 'colPinEnd',
			cellTemplate: (h: any, { model }: any) => {
				const button = h('button', {
					class: 'text-gray-600 hover:text-gray-900 p-1',
					onclick: () => handleMoreClick(model)
				}, '⋮');
				return button;
			}
		}
	];

	function handleMoreClick(row: ResourceRow) {
		alert(`More actions for: ${row.resourceCode} - ${row.description}`);
	}

	function handleAfterEdit(event: any) {
		const detail = event.detail;
		if (!detail || !detail.models) return;

		// Find the edited row
		const editedModel = detail.models[0];
		if (!editedModel) return;

		const rowId = editedModel.id;
		const prop = detail.prop;
		let value = detail.val;

		// Convert string values to numbers for numeric fields
		if (['quantity', 'unitCost', 'taxPct', 'wastePct'].includes(prop)) {
			value = parseFloat(value) || 0;
			// Convert percentage inputs from 10.825 to 0.10825 for tax/waste
			if (prop === 'taxPct' || prop === 'wastePct') {
				if (value > 1) {
					value = value / 100;
				}
			}
		}

		onCellChange(rowId, prop as keyof ResourceRow, value);
	}

	onMount(async () => {
		if (browser) {
			try {
				const module = await import('@revolist/svelte-datagrid');
				RevoGrid = module.RevoGrid;
				mounted = true;
			} catch (error) {
				console.error('Failed to load RevoGrid:', error);
			}
		}
	});
</script>

{#if mounted && RevoGrid}
	<div class="estimate-grid-wrapper">
		<RevoGrid
			bind:this={gridRef}
			source={data}
			{columns}
			readonly={false}
			range={false}
			resize={true}
			canFocus={true}
			theme="compact"
			rowSize={32}
			on:afteredit={handleAfterEdit}
		/>
	</div>
{:else}
	<div class="flex items-center justify-center h-64">
		<p class="text-gray-500">Loading grid...</p>
	</div>
{/if}
