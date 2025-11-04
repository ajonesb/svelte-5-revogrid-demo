<script lang="ts">
	import { onMount } from 'svelte';
	import { RevoGrid } from '@revolist/svelte-datagrid';
	import type { ColumnRegular } from '@revolist/svelte-datagrid';

	interface Props {
		data: any[];
		columns: ColumnRegular[];
		onEdit?: (event: any) => void;
		onSourceSet?: (event: CustomEvent<any>) => void;
		onCellChange?: (event: any) => void;
	}

	let { data, columns, onEdit, onSourceSet }: Props = $props();
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
		console.log('[GRID INIT] Grid mounted');
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

{#if mounted}
	<RevoGrid
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
