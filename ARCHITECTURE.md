# Data Table Architecture - Clean Code Implementation

## Overview
This application implements a clean, minimal data table with three distinct views:
- **Estimate List**: Manages estimates with project details
- **Information Setup**: Manages project information fields
- **Bid Item Setup**: Manages bid items with **autocomplete** for items and units

## Architecture Principles Applied

### 1. **DRY (Don't Repeat Yourself)**
- `baseStore.svelte.ts` - Shared store factory for all data types
- `DataGrid.svelte` - Reusable grid component with autocomplete support
- Common error handling and loading states

### 2. **SOLID Principles**

#### Single Responsibility Principle (SRP)
- Each store handles ONE data type:
  - `estimateStore.svelte.ts` - Estimates only
  - `infoSetupStore.svelte.ts` - Information setup only
  - `bidItemStore.svelte.ts` - Bid items only
- `tabStore.svelte.ts` - Tab state only
- `DataGrid.svelte` - Grid rendering only

#### Open/Closed Principle (OCP)
- Base store is open for extension (via `createDataStore<T>()`)
- Each specific store extends without modifying base

#### Dependency Inversion Principle (DIP)
- Stores depend on abstractions (generic types)
- Components depend on store interfaces, not implementations

### 3. **KISS (Keep It Simple, Stupid)**
- Minimal component hierarchy
- Clear separation of concerns
- No over-engineering
- Straightforward reactive state with Svelte 5 runes

## File Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── DataGrid.svelte          # Reusable grid with autocomplete
│   │   ├── GridToolbar.svelte       # Toolbar actions
│   │   └── HeaderTabs.svelte        # Tab navigation
│   ├── stores/
│   │   ├── baseStore.svelte.ts      # Base store factory (DRY)
│   │   ├── tabStore.svelte.ts       # Tab state management
│   │   ├── estimateStore.svelte.ts  # Estimate data & actions
│   │   ├── infoSetupStore.svelte.ts # Info setup data & actions
│   │   └── bidItemStore.svelte.ts   # Bid items with autocomplete
│   └── services/
│       ├── api.config.ts
│       ├── http.service.ts
│       ├── items.api.service.ts
│       └── index.ts
└── routes/
    ├── +layout.svelte               # App layout with tabs
    └── +page.svelte                 # Main page (minimal logic)
```

## Key Features

### Tab Navigation
- Three tabs: Estimate List, Information Setup, Bid Item Setup
- Centralized state management via `tabStore`

### CRUD Operations
- **Add**: Add new rows to current table
- **Delete**: Delete selected rows
- **Edit**: Inline editing with autocomplete support
- **Clear**: Clear all data from current table

### Data Management
- Loading states with spinners
- Error handling with retry
- Optimistic updates
- Fallback data when API fails

## Svelte 5 Best Practices

### Runes Usage
```typescript
// State
let data = $state<T[]>([]);

// Derived values
const activeTab = $derived(tabStore.active);

// Effects
$effect(() => {
  if (gridEl && SelectTypePlugin) {
    gridEl.columnTypes = { select: new SelectTypePlugin() };
  }
});

// Props (new syntax)
let { data, columns, onEdit }: Props = $props();
```

### Component Props
- Using TypeScript interfaces for type safety
- Destructured props with `$props()`
- Optional callbacks with `?` operator

## Shadcn-UI Integration
- Uses Tailwind utility classes
- Consistent with shadcn design tokens:
  - `bg-primary`, `text-primary-foreground`
  - `bg-accent`, `text-accent-foreground`
  - `text-muted-foreground`
  - `border`, `rounded-md`

## How to Extend

### Adding a New Tab Type
1. Create new store in `stores/` (e.g., `materialsStore.svelte.ts`)
2. Define data interface and columns
3. Implement load/add/update/delete actions
4. Add tab to `tabStore.TABS`
5. Update `+page.svelte` derived values

### Adding New Columns
```typescript
export const BID_ITEM_COLUMNS: ColumnRegular[] = [
  {
    prop: 'fieldName',
    name: 'Display Name',
    size: 200,
    columnType: 'select',  // For autocomplete
    source: OPTIONS_ARRAY   // { label, value }[]
  }
];
```

## Performance Considerations
- Dynamic imports for SSR compatibility
- Lazy loading of RevoGrid
- Efficient reactive updates with Svelte 5
- Minimal re-renders with derived state

## Testing Checklist
- Tab switching works correctly
- Autocomplete dropdowns appear on Bid Item Setup
- Add/Delete/Edit operations work per tab
- Loading states display properly
- Error states with retry functionality
- No TypeScript errors
- Consistent styling with shadcn

---

**Result**: Clean, maintainable, extensible data table following modern best practices.
