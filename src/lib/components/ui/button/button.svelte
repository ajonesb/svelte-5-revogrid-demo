<script lang="ts">
	import { cn } from "$lib/utils";
	import { buttonVariants, type Props, type Events } from "./index.js";

	type $$Props = Props;
	type $$Events = Events;

	let { variant = "default", size = "default", class: className, children, ...restProps }: $$Props & { children?: any } = $props();
</script>

<button
	class={cn(buttonVariants({ variant, size }), className)}
	{...restProps}
>
	{@render children?.()}
</button>