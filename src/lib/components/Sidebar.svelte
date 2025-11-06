<script lang="ts">
	import buttonIcon from '../../assets/sidebar/ButtonIcon.png';
	import sidebarMenuButton from '../../assets/sidebar/SidebarMenuButton.png';
</script>

<aside class="w-16 bg-white border-r flex flex-col items-center py-4 gap-4">
	<button class="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-100">
		<img src={buttonIcon} alt="Menu" class="w-6 h-6" />
	</button>
	<button class="w-10 h-10 flex items-center justify-center rounded bg-gray-100">
		<img src={sidebarMenuButton} alt="Grid" class="w-6 h-6" />
	</button>
</aside>
