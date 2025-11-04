# Quick Reference Guide

## Common Tasks

### Switch Between Tabs
Click any tab in the header:
- **Estimate List** - View/edit project estimates
- **Information Setup** - Manage project information fields  
- **Bid Item Setup** - Manage bid items with autocomplete

### Use Autocomplete (Bid Item Setup Only)
1. Click on a cell in the "Bid Item" column
2. Select from dropdown list of construction items
3. Click on a cell in the "Unit" column  
4. Select measurement unit (LS, LF, CY, etc.)

### Add a New Row
Click the "Add Row" button in the toolbar

### Delete Rows
1. Select rows by clicking row headers
2. Click "Delete Selected" button

### Edit Data
1. Double-click any cell
2. Type new value or select from dropdown (if autocomplete)
3. Press Enter or Tab to save

### Clear All Data
Click "Clear All" button (removes all rows from current tab)

## Store Methods Reference

### Tab Store
```typescript
import { tabStore } from '$lib/stores/tabStore.svelte';

tabStore.active;              // Get current tab
tabStore.setActive('bid-item-setup'); // Change tab
```

### Data Stores
```typescript
import { bidItemStore, loadBidItems, addBidItem } from '$lib/stores/bidItemStore.svelte';

// Access data
bidItemStore.data;            // Current data array
bidItemStore.loading;         // Loading state
bidItemStore.error;           // Error message
bidItemStore.selectedIds;     // Selected row IDs

// Actions
await loadBidItems();         // Load from API
addBidItem();                 // Add new row
bidItemStore.updateRow(row);  // Update specific row
bidItemStore.deleteSelected(); // Delete selected
bidItemStore.clearAll();      // Clear all data
```

## Column Configuration

### Basic Column
```typescript
{ 
  prop: 'fieldName',      // Property name in data
  name: 'Display Name',   // Column header
  size: 200               // Width in pixels
}
```

### Numeric Column
```typescript
{ 
  prop: 'quantity',
  name: 'Quantity',
  size: 120,
  columnType: 'numeric'
}
```

### Autocomplete Column
```typescript
{ 
  prop: 'category',
  name: 'Category',
  size: 150,
  columnType: 'select',
  source: [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' }
  ]
}
```

## Troubleshooting

### Autocomplete Not Working
1. Check column has `columnType: 'select'`
2. Ensure `source` array is provided
3. Verify SelectTypePlugin is loaded in DataGrid.svelte

### Data Not Loading
1. Check browser console for errors
2. Verify API service is working
3. Check network tab for failed requests

### Tab Switching Issues  
1. Ensure tabStore is imported correctly
2. Check activeTab derived value
3. Verify tab IDs match in tabStore.TABS

## Development Commands

```bash
# Start dev server
pnpm run dev

# Type check
pnpm run check

# Lint & format
pnpm run lint
pnpm run format

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## File Locations

- **Add new tab**: `src/lib/stores/tabStore.svelte.ts`
- **Add new store**: `src/lib/stores/[name]Store.svelte.ts`
- **Modify columns**: In respective store file (e.g., `BID_ITEM_COLUMNS`)
- **Update API**: `src/lib/services/items.api.service.ts`
- **Styling**: Uses Tailwind + shadcn design tokens

## Best Practices

✅ Keep stores focused (one data type per store)  
✅ Use TypeScript interfaces for type safety  
✅ Follow Svelte 5 runes (`$state`, `$derived`, `$effect`)  
✅ Leverage shadcn design tokens for consistent styling  
✅ Handle loading and error states  
✅ Provide fallback data when API fails  

---

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md)
