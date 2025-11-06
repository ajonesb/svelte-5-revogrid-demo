/**
 * RevoGrid Composable - Svelte 5
 * Manages RevoGrid lifecycle and loading
 */

import { browser } from '$app/environment';

export function useRevoGrid() {
	let RevoGrid = $state<any>(null);
	let mounted = $state(false);
	let error = $state<string | null>(null);

	/**
	 * Load RevoGrid dynamically (client-side only)
	 */
	async function loadGrid() {
		if (!browser) return;
		
		try {
			const module = await import('@revolist/svelte-datagrid');
			RevoGrid = module.RevoGrid;
			
			if (typeof RevoGrid !== 'function') {
				error = 'Invalid RevoGrid component';
				console.error('[GRID INIT] Invalid RevoGrid component:', module);
				return;
			}
			
			mounted = true;
			console.log('[GRID INIT] Grid mounted successfully');
		} catch (err) {
			error = 'Failed to load RevoGrid';
			console.error('[GRID INIT] Failed to load RevoGrid:', err);
		}
	}

	return {
		get component() { return RevoGrid; },
		get mounted() { return mounted; },
		get error() { return error; },
		loadGrid
	};
}
