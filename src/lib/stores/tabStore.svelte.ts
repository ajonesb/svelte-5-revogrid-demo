/**
 * Tab Store - Manages active tab state
 * Simple, single-responsibility state management
 */

export type TabId = 'estimate-list' | 'information-setup' | 'bid-item-setup';

export interface Tab {
	id: TabId;
	label: string;
}

export const TABS: Tab[] = [
	{ id: 'estimate-list', label: 'Estimate List' },
	{ id: 'information-setup', label: 'Information Setup' },
	{ id: 'bid-item-setup', label: 'Bid Item Setup' }
];

let activeTab = $state<TabId>('bid-item-setup');

export const tabStore = {
	get active() {
		return activeTab;
	},
	setActive(id: TabId) {
		activeTab = id;
	}
};
