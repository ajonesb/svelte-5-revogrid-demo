import { itemsApiService, APIError } from '../services';

/**
 * Base Data Store
 * DRY principle - shared logic for all data tables
 */

export interface StoreState<T> {
	data: T[];
	loading: boolean;
	error: string | null;
	selectedIds: Set<number>;
}

export function createDataStore<T extends { id: number }>() {
	let data = $state<T[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let selectedIds = $state<Set<number>>(new Set());

	return {
		get data() {
			return data;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		get selectedIds() {
			return selectedIds;
		},
		setData(newData: T[]) {
			data = newData;
		},
		setLoading(value: boolean) {
			loading = value;
		},
		setError(value: string | null) {
			error = value;
		},
		addRow(row: T) {
			data = [...data, row];
		},
		updateRow(updatedRow: T) {
			data = data.map((row) => (row.id === updatedRow.id ? updatedRow : row));
		},
		deleteSelected() {
			data = data.filter((row) => !selectedIds.has(row.id));
			selectedIds = new Set();
		},
		clearAll() {
			data = [];
			selectedIds = new Set();
		}
	};
}

/**
 * Handle errors consistently
 */
export function handleError(err: unknown, defaultMessage: string): string {
	return err instanceof APIError ? err.message : defaultMessage;
}
