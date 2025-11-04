<script lang="ts">
	import { tabStore, TABS, type TabId } from '$lib/stores/tabStore.svelte';

	const activeTab = $derived(tabStore.active);

	function selectTab(id: TabId) {
		tabStore.setActive(id);
	}
</script>

<nav class="w-full border-b bg-background">
	<ul class="mx-auto flex w-full max-w-[1200px] items-center gap-2 px-2 py-2">
		{#each TABS as tab}
			<li>
				<button
					class="rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
            {activeTab === tab.id
						? 'bg-primary text-primary-foreground'
						: 'hover:bg-accent hover:text-accent-foreground'}"
					aria-current={activeTab === tab.id ? 'page' : undefined}
					onclick={() => selectTab(tab.id)}
				>
					{tab.label}
				</button>
			</li>
		{/each}
	</ul>
</nav>
