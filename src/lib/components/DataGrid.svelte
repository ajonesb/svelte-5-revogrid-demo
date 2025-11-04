<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { ColumnRegular } from '@revolist/revogrid';

	interface Props {
		data: any[];
		columns: ColumnRegular[];
		onEdit?: (event: any) => void;
		onSourceSet?: (event: CustomEvent<any>) => void;
		onCellChange?: (event: any) => void;
	}

	let { data, columns, onEdit, onSourceSet }: Props = $props();
	let RevoGrid: any = null;
	let mounted = $state(false);

	onMount(async () => {
		if (browser) {
			// @ts-expect-error - Module resolution issue with svelte-datagrid v4.14.0
			const module = await import('@revolist/svelte-datagrid');
			RevoGrid = module.RevoGrid || module.default;
			mounted = true;
			console.log('[GRID INIT] Grid mounted');
		}
	});

	function handleAfterEdit(event: any) {
		console.log('[AFTER EDIT]', event.detail);
		if (onEdit) onEdit(event);
	}

	function handleSourceSet(event: CustomEvent<any>) {
		console.log('[SOURCE SET]', event.detail.source?.length);
		if (onSourceSet) onSourceSet(event);
	}
</script>

{#if mounted && RevoGrid}
	<svelte:component
		this={RevoGrid}
		source={data}
		columns={columns}
		on:afteredit={handleAfterEdit}
		on:aftersourceset={handleSourceSet}
	/>
{:else}
	<div class="flex items-center justify-center h-full">
		<p>Loading...</p>
	</div>
{/if}
