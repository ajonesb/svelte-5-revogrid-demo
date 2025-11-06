# SvelteKit Data Table with Filtered Dropdowns

Clean, minimal data table implementation with **SvelteKit 5**, **RevoGrid**, and **filtered dropdown** support.

## Features

### Three Data Views
- **Estimate List** - Manage project estimates
- **Information Setup** - Configure project information
- **Bid Item Setup** - Manage bid items with **real-time filtered dropdowns**

### Excel-like Experience
- Inline editing with type-to-filter dropdowns
- Full-height spreadsheet layout with scrolling
- Add/Delete/Clear operations
- Loading & error states
- "No results" feedback

### Clean Architecture
- **DRY** - Reusable base store and components
- **SOLID** - Single responsibility per module
- **KISS** - Minimal complexity
- **Svelte 5** - Modern runes API (`$state`, `$derived`, `$props`)

## Store Architecture

### Pattern: Smart Container + Dumb Components

```
┌─────────────────────────────────┐
│    +page.svelte (Smart)         │
│  • Imports all stores           │
│  • Uses $derived reactivity     │
│  • Manages CRUD operations      │
│  • Passes data as props         │
└────────────┬────────────────────┘
             │
             ├─> DataGrid.svelte (Dumb)
             │   • Receives data via props
             │   • Static BID_ITEM_OPTIONS only
             │   • No store subscriptions
             │
             └─> HeaderTabs.svelte (Semi-Smart)
                 • tabStore for navigation
                 • Reactive with $derived
```

### Store Types

1. **Data Stores** (`estimateStore`, `infoSetupStore`, `bidItemStore`)
   - Built with `createDataStore()` from `baseStore.svelte.ts`
   - Reactive with Svelte 5 runes
   - Manage CRUD operations for each tab

2. **Tab Store** (`tabStore`)
   - Manages active tab state
   - Used by `HeaderTabs` and `+page.svelte`

3. **Static Exports** (`BID_ITEM_OPTIONS`, `ESTIMATE_COLUMNS`, etc.)
   - Non-reactive reference data
   - Imported directly (no `$` prefix needed)

### Example Usage

```typescript
// In +page.svelte (Smart Component)
import { estimateStore, loadEstimates } from '$lib/stores/estimateStore.svelte';

const currentData = $derived(estimateStore.data);       // Reactive
const isLoading = $derived(estimateStore.loading);     // Reactive

await loadEstimates();                                 // Load data
estimateStore.setData(updatedData);                   // Update
estimateStore.deleteSelected();                       // Delete

// In DataGrid.svelte (Dumb Component)
import { BID_ITEM_OPTIONS } from '$lib/stores/bidItemStore.svelte';

overlayOptions = BID_ITEM_OPTIONS;  // Static array, no reactivity
```

## Quick Start

```bash
pnpm install
pnpm dev  # → http://localhost:5173
```

## Tech Stack

- **SvelteKit 5** - Framework with modern runes
- **RevoGrid** - High-performance data grid
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── DataGrid.svelte          # Grid with filtered dropdown overlay
│   │   ├── HeaderTabs.svelte        # Tab navigation
│   │   └── Sidebar.svelte           # Action toolbar
│   ├── stores/
│   │   ├── baseStore.svelte.ts      # Base store factory (DRY)
│   │   ├── tabStore.svelte.ts       # Tab state management
│   │   ├── estimateStore.svelte.ts  # Estimate data
│   │   ├── infoSetupStore.svelte.ts # Info setup data
│   │   └── bidItemStore.svelte.ts   # Bid items with options
│   └── services/
│       ├── http.service.ts          # HTTP client
│       ├── items.api.service.ts     # API operations
│       └── api.config.ts            # Configuration
└── routes/
    ├── +layout.svelte               # App layout
    └── +page.svelte                 # Main container (smart)
```

## Key Implementation Details

### Filtered Dropdown Overlay
The Bid Item column features a custom overlay that:
- Shows all 29 options initially
- Filters in real-time as you type
- Displays "No results" when no matches found
- Uses `$derived` for reactive filtering
- Positioned with fixed coordinates below editing cell

```typescript
const filteredOptions = $derived(() => {
  if (!searchTerm.trim()) return overlayOptions;
  const term = searchTerm.toLowerCase();
  return overlayOptions.filter(opt => 
    opt.label.toLowerCase().includes(term) || 
    opt.value.toLowerCase().includes(term)
  );
});
```

### Svelte 5 Best Practices
- **`$state`** - For reactive local state
- **`$derived`** - For computed values (replaces `$:`)
- **`$props`** - For component props with destructuring
- **`$effect`** - For side effects (replaces `$:` with side effects)
- No more `$:` reactive statements in Svelte 5

## Demo
https://svelte-5-revo-grid-demo.netlify.app/