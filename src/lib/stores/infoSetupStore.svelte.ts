import { createDataStore, handleError } from './baseStore.svelte';
import { itemsApiService } from '../services';
import type { ColumnRegular } from '@revolist/svelte-datagrid';

/**
 * Information Setup Store
 * Manages project information and setup data
 */

export interface InfoSetupItem {
	id: number;
	fieldName: string;
	fieldValue: string;
	category: string;
	required: boolean;
}

export const INFO_SETUP_COLUMNS: ColumnRegular[] = [
	{ prop: 'fieldName', name: 'Field Name', size: 200 },
	{ prop: 'fieldValue', name: 'Value', size: 300 },
	{ prop: 'category', name: 'Category', size: 150 },
	{ prop: 'required', name: 'Required', size: 100 }
];

const store = createDataStore<InfoSetupItem>();

export async function loadInfoSetup() {
	store.setLoading(true);
	store.setError(null);

	try {
		const apiItems = await itemsApiService.loadItems(10);
		const infoItems: InfoSetupItem[] = apiItems.map((item, i) => ({
			id: i + 1,
			fieldName: `Field ${i + 1}`,
			fieldValue: item.name,
			category: i % 3 === 0 ? 'Project' : i % 3 === 1 ? 'Client' : 'Billing',
			required: i % 2 === 0
		}));
		store.setData(infoItems);
	} catch (err) {
		store.setError(handleError(err, 'Failed to load information setup'));
		store.setData(generateFallbackInfoSetup());
	} finally {
		store.setLoading(false);
	}
}

export function addInfoSetupItem() {
	const newId = Math.max(0, ...store.data.map((r) => r.id)) + 1;
	const newItem: InfoSetupItem = {
		id: newId,
		fieldName: '',
		fieldValue: '',
		category: 'Project',
		required: false
	};
	store.addRow(newItem);
}

function generateFallbackInfoSetup(): InfoSetupItem[] {
	return [
		{
			id: 1,
			fieldName: 'Project Name',
			fieldValue: 'Downtown Office Complex',
			category: 'Project',
			required: true
		},
		{
			id: 2,
			fieldName: 'Client Name',
			fieldValue: 'ABC Corporation',
			category: 'Client',
			required: true
		},
		{
			id: 3,
			fieldName: 'Project Manager',
			fieldValue: 'John Smith',
			category: 'Project',
			required: true
		}
	];
}

export const infoSetupStore = store;
