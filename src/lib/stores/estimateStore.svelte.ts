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
	{ prop: 'estimateNo', name: 'Estimate #', size: 120 },
	{ prop: 'projectName', name: 'Project Name', size: 300 },
	{ prop: 'client', name: 'Client', size: 200 },
	{ prop: 'status', name: 'Status', size: 120 },
	{ prop: 'total', name: 'Total', size: 120, columnType: 'numeric' },
	{ prop: 'createdDate', name: 'Created', size: 120 }
];

const store = createDataStore<EstimateItem>();

export async function loadEstimates() {
	store.setLoading(true);
	store.setError(null);

	try {
		const apiItems = await itemsApiService.loadItems(10);
		const estimates: EstimateItem[] = apiItems.map((item, i) => ({
			id: i + 1,
			estimateNo: `EST-${26000100 + i}`,
			projectName: item.name,
			client: `Client ${String.fromCharCode(65 + (i % 26))}`,
			status: i % 3 === 0 ? 'Draft' : i % 3 === 1 ? 'In Review' : 'Approved',
			total: item.total * 1000,
			createdDate: new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
		}));
		store.setData(estimates);
		console.log('[ESTIMATE STORE] Loaded', estimates.length, 'estimates', estimates);
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
		estimateNo: `EST-${26000100 + newId}`,
		projectName: '',
		client: '',
		status: 'Draft',
		total: 0,
		createdDate: new Date().toISOString().split('T')[0]
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
