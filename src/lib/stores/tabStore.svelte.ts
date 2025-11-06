/**
 * Tab Store - Manages active tab state
 * Simple, single-responsibility state management
 */

export type TabId = 'estimate-list' | 'information-setup' | 'bid-item-setup' | 'estimate-entry';

export interface Tab {
	id: TabId;
	label: string;
}

export const TABS: Tab[] = [
	{ id: 'estimate-list', label: 'Estimate List' },
	{ id: 'information-setup', label: 'Information Setup' },
	{ id: 'bid-item-setup', label: 'Bid Item Setup' },
	{ id: 'estimate-entry', label: 'Estimate Entry' }
];

let activeTab = $state<TabId>('estimate-entry');

export const tabStore = {
	get active() {
		return activeTab;
	},
	setActive(id: TabId) {
		activeTab = id;
	}
};
