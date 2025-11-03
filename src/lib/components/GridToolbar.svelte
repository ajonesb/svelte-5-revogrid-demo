<script lang="ts">
	interface Props {
		onAdd: () => void;
		onDelete: () => void;
		onClear: () => void;
		selectedCount: number;
	}

	let { onAdd, onDelete, onClear, selectedCount }: Props = $props();
</script>

<div class="flex gap-2 p-4 border-b">
	<button
		class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
		onclick={onAdd}
	>
		Add Row
	</button>
	
	<button 
		class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
		onclick={onDelete} 
		disabled={selectedCount === 0}
	>
		Delete Selected
	</button>
	
	<button 
		class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
		onclick={onClear}
	>
		Clear All
	</button>
</div>