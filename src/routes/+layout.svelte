<script lang="ts">
	import '../app.css';

	import HeaderTabs from '$lib/components/HeaderTabs.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { tabStore, TABS } from '$lib/stores/tabStore.svelte';
	import logo from '../assets/logo.png';

	let { children } = $props();

	// Reactive: Get current tab label
	const activeTabLabel = $derived(
		TABS.find(tab => tab.id === tabStore.active)?.label ?? 'Bid Item Setup'
	);
</script>

<div class="min-h-screen bg-background flex">
	<Sidebar />

	<!-- Main Content -->
	<div class="flex-1 flex flex-col">
		<header class="bg-white">
			<div class="flex items-center gap-3 px-6 py-4 border-b">
				<img src={logo} alt="Perfect Finish" class="h-8" />
			</div>
			<div class="px-6 py-3">
				<h1 class="text-2xl font-bold text-gray-900">{activeTabLabel}</h1>
				<p class="text-sm text-gray-500">Estimate ID: 26000101</p>
			</div>
			<HeaderTabs />
		</header>

		<main class="flex-1">
			{@render children()}
		</main>
	</div>
</div>
