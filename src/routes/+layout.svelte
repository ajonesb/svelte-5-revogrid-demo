<script lang="ts">
	import '../app.css';

	import HeaderTabs from '$lib/components/HeaderTabs.svelte';
	import logo from '../assets/logo.png';

	let { children } = $props();
</script>

<div class="min-h-screen bg-background flex">
	<!-- Sidebar -->
	<aside class="w-16 bg-white border-r flex flex-col items-center py-4 gap-4">
		<button class="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-100">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
		</button>
		<button class="w-10 h-10 flex items-center justify-center rounded bg-gray-100">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
			</svg>
		</button>
	</aside>

	<!-- Main Content -->
	<div class="flex-1 flex flex-col">
		<header class="bg-white">
			<div class="flex items-center gap-3 px-6 py-4 border-b">
				<img src={logo} alt="Perfect Finish" class="h-8" />
			</div>
			<div class="px-6 py-3">
				<h1 class="text-2xl font-bold text-gray-900">Bid Item Setup</h1>
				<p class="text-sm text-gray-500">Estimate ID: 26000101</p>
			</div>
			<HeaderTabs />
		</header>

		<main class="flex-1">
			{@render children()}
		</main>
	</div>
</div>
