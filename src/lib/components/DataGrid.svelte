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
	let RevoGrid: any = $state(null);
	let mounted = $state(false);

	onMount(async () => {
		if (browser) {
			try {
				// @ts-expect-error - Module resolution issue with svelte-datagrid v4.14.0
				const module = await import('@revolist/svelte-datagrid');
				// Try multiple ways to get the component
				RevoGrid = module.RevoGrid || module.default || module;
				
				// Check if it's a valid function/component
				if (typeof RevoGrid !== 'function') {
					console.error('[GRID INIT] Invalid RevoGrid component:', module);
					return;
				}
				
				mounted = true;
				console.log('[GRID INIT] Grid mounted successfully');
			} catch (error) {
				console.error('[GRID INIT] Failed to load RevoGrid:', error);
			}
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
