# SvelteKit Data Table with Filtered Dropdowns

Clean, minimal data table implementation with **SvelteKit 5**, **RevoGrid**, and **filtered dropdown** support.

## Features

### Four Data Views
- **Estimate List** - Manage project estimates
- **Information Setup** - Configure project information
- **Bid Item Setup** - Manage bid items with **real-time filtered dropdowns**
- **Estimate Entry** - Resource spreadsheet with color-coded cells and live calculations

### Excel-like Experience
- Inline editing with type-to-filter dropdowns
- Full-height spreadsheet layout with scrolling
- Add/Delete/Clear operations
- Loading & error states
- "No results" feedback
- Live formula recalculation
- Color-coded resource cells

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

2. **Estimate Entry Store** (`estimateEntryStore`)
   - Custom store for spreadsheet data
   - Live formula recalculation
   - Manages 20 mock resource rows
   - Calculates summary totals

3. **Tab Store** (`tabStore`)
   - Manages active tab state
   - Used by `HeaderTabs` and `+page.svelte`

4. **Static Exports** (`BID_ITEM_OPTIONS`, `ESTIMATE_COLUMNS`, etc.)
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
│   │   ├── EstimateDataGrid.svelte  # Estimate Entry spreadsheet grid
│   │   ├── SummaryTotals.svelte     # Estimate Entry footer totals
│   │   ├── HeaderTabs.svelte        # Tab navigation
│   │   └── Sidebar.svelte           # Action toolbar
│   ├── stores/
│   │   ├── baseStore.svelte.ts      # Base store factory (DRY)
│   │   ├── tabStore.svelte.ts       # Tab state management
│   │   ├── estimateStore.svelte.ts  # Estimate data
│   │   ├── infoSetupStore.svelte.ts # Info setup data
│   │   ├── bidItemStore.svelte.ts   # Bid items with options
│   │   └── estimateEntryStore.svelte.ts # Estimate Entry spreadsheet store
│   ├── assets/
│   │   └── mock/
│   │       └── estimate.rows.ts     # 20 mock resource rows
│   ├── ui/
│   │   └── tokens.ts                # Color tokens for resource codes
│   ├── utils/
│   │   └── formulas.ts              # Calculation functions
│   └── services/
│       ├── http.service.ts          # HTTP client
│       ├── items.api.service.ts     # API operations
│       └── api.config.ts            # Configuration
└── routes/
    ├── +layout.svelte               # App layout
    └── +page.svelte                 # Main container (smart)
```

## Key Implementation Details

### Estimate Entry Data Flow

**Simple chain from mock data to display:**

1. **Mock Data** (`src/lib/assets/mock/estimate.rows.ts`)
   - 20 ResourceRow objects with sample data
   - Includes resource codes (2xxx, 3xxx, 4xxx, 5xxx, 8xxx, 9xxx, letters)

2. **Store** (`src/lib/stores/estimateEntryStore.svelte.ts`)
   - Imports mock data
   - Stores in `$state` with Svelte 5 runes
   - Handles live recalculation when cells edited
   - Calculates summary totals

3. **Page** (`src/routes/+page.svelte`)
   - Calls `initEstimateStore()` on mount to load mock data
   - Gets rows via `estimateEntryStore.rows`
   - Passes rows to grid component as props
   - **Activity Productivity data is hardcoded HTML** (not from store)

4. **Grid** (`src/lib/components/EstimateDataGrid.svelte`)
   - Receives rows as prop
   - Displays in RevoGrid with color-coded cells
   - 16px vertical color bars based on resource code
   - Emits changes back to page

**Flow:** `Mock Data → Store → Page → Grid Component`

### Estimate Entry Features
- Color-coded resource cells (green, dark-green, gray, dark-gray, blue)
- 16px x 32px vertical color bars in separate column
- Live formula recalculation:
  - `adjQuantity = quantity × (1 + wastePct)`
  - `totalCost = adjQuantity × unitCost × (1 + taxPct)`
  - `grossPrice = totalCost × 1.18`
  - `salesPrice = grossPrice`
- Summary totals footer
- Narrow fixed-width columns
- Activity Productivity section (hardcoded values)
- Currency and percentage formatting

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