<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="min-h-screen">
	<header class="border-b p-4">
		<h1 class="text-xl font-bold">Simple Data Grid</h1>
	</header>

	<main>
		{@render children()}
	</main>
</div>
