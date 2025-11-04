<script lang="ts">
	import { tabStore, TABS, type TabId } from '$lib/stores/tabStore.svelte';

	const activeTab = $derived(tabStore.active);

	function selectTab(id: TabId) {
		tabStore.setActive(id);
	}
</script>

<nav class="w-full bg-white border-b">
	<ul class="flex items-center gap-1 px-6">
		{#each TABS as tab}
			<li>
				<button
					class="relative px-6 py-3 text-sm font-medium transition-colors rounded-t-lg border-2 border-b-0
            {activeTab === tab.id
						? 'text-blue-600 border-blue-600 bg-white -mb-[2px]'
						: 'text-gray-600 border-transparent hover:text-gray-900 bg-gray-50/50'}"
					aria-current={activeTab === tab.id ? 'page' : undefined}
					onclick={() => selectTab(tab.id)}
				>
					{tab.label}
				</button>
			</li>
		{/each}
	</ul>
</nav>
