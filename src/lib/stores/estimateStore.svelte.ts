import { createDataStore, handleError } from './baseStore.svelte';
import { itemsApiService } from '../services';
import type { ColumnRegular } from '@revolist/svelte-datagrid';

/**
 * Estimate List Store
 * Manages estimate-level data
 */

export interface EstimateItem {
	id: number;
	estimateNo: string;
	projectName: string;
	client: string;
	status: string;
	total: number;
	createdDate: string;
}

export const ESTIMATE_COLUMNS: ColumnRegular[] = [
	{ prop: 'estimateNo', name: 'Estimate #', size: 120, readonly: false, editor: 'text' },
	{ prop: 'projectName', name: 'Project Name', size: 300, readonly: false, editor: 'text' },
	{ prop: 'client', name: 'Client', size: 200, readonly: false, editor: 'text' },
	{ prop: 'status', name: 'Status', size: 120, readonly: false, editor: 'text' },
	{ prop: 'total', name: 'Total', size: 120, readonly: false, editor: 'text' },
	{ prop: 'createdDate', name: 'Created', size: 120, readonly: false, editor: 'text' }
];

const store = createDataStore<EstimateItem>();

export async function loadEstimates() {
	store.setLoading(true);
	store.setError(null);

	try {
		const apiItems = await itemsApiService.loadItems(10);
		const estimates: EstimateItem[] = apiItems.map((item, i) => ({
			id: i + 1,
			estimateNo: `${26000100 + i}`,
			projectName: item.name,
			client: `Client ${String.fromCharCode(65 + (i % 26))}`,
			status: i % 3 === 0 ? 'Draft' : i % 3 === 1 ? 'In Review' : 'Approved',
			total: item.total * 1000,
			createdDate: new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
		}));
		
		// Always add one empty row for user to start typing
		const newId = estimates.length + 1;
		estimates.push({
			id: newId,
			estimateNo: '',
			projectName: '',
			client: '',
			status: '',
			total: null as any,
			createdDate: ''
		});
		
		store.setData(estimates);
		console.log('[ESTIMATE STORE] Loaded', estimates.length, 'estimates (includes empty row)', estimates);
	} catch (err) {
		console.error('[ESTIMATE STORE] Error loading:', err);
		store.setError(handleError(err, 'Failed to load estimates'));
		const fallback = generateFallbackEstimates();
		store.setData(fallback);
		console.log('[ESTIMATE STORE] Using fallback data:', fallback.length, 'items');
	} finally {
		store.setLoading(false);
	}
}

export function addEstimate() {
	const newId = Math.max(0, ...store.data.map((r) => r.id)) + 1;
	const newEstimate: EstimateItem = {
		id: newId,
		estimateNo: '',
		projectName: '',
		client: '',
		status: '',
		total: null as any,
		createdDate: ''
	};
	store.addRow(newEstimate);
}

function generateFallbackEstimates(): EstimateItem[] {
	return [
		{
			id: 1,
			estimateNo: 'EST-26000101',
			projectName: 'Downtown Office Complex',
			client: 'Client A',
			status: 'Approved',
			total: 1250000,
			createdDate: '2024-11-01'
		},
		{
			id: 2,
			estimateNo: 'EST-26000102',
			projectName: 'Residential Development',
			client: 'Client B',
			status: 'In Review',
			total: 850000,
			createdDate: '2024-11-02'
		}
	];
}

export const estimateStore = store;
