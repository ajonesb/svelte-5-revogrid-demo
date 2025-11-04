<script lang="ts">
	import '../app.css';

	import HeaderTabs from '$lib/components/HeaderTabs.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen bg-background">
	<header class="">
		<HeaderTabs />
	</header>

	<main>
		{@render children()}
	</main>
</div>
