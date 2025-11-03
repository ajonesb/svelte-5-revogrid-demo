# Simple Data Grid with SvelteKit

A **minimal**, clean data grid built with SvelteKit, Svelte 5 runes, and RevoGrid.

## Tech Stack

- **SvelteKit** + **Svelte 5** (runes) + **TypeScript**  
- **TailwindCSS** + **shadcn-svelte** (minimal components)
- **RevoGrid** for the data grid
- **ESLint** + **Prettier** for code quality

## Features

✅ **Simple data grid** with 50 demo rows  
✅ **Excel-like editing** with auto-calculation (`total = qty * price`)  
✅ **Basic toolbar** - Add Row, Delete Selected, Clear All  
✅ **Row selection** with multi-select  
✅ **Clean, minimal code** - KISS principle

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev  # → http://localhost:5173

# Build for production
pnpm build
```

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/button/           # Simple shadcn button
│   │   └── GridToolbar.svelte   # 3-button toolbar
│   ├── stores/
│   │   └── dataStore.ts         # Minimal data management
│   └── utils.ts                 # CN helper
├── routes/
│   ├── +layout.svelte           # Simple layout
│   └── +page.svelte             # Grid + toolbar (50 lines)
└── app.css                      # Tailwind styles
```

## Key Components

### DataStore (`dataStore.ts`) - 75 lines
```typescript
// Simple data type
interface Item {
  id: number;
  name: string;
  qty: number;
  price: number;
  total: number; // auto-calculated
}

// Basic functions
export function addRow()
export function deleteSelected()
export function clearAll()
export function updateRow(item)
```

### GridToolbar (`GridToolbar.svelte`) - 15 lines
```svelte
<div class="flex gap-2 p-4 border-b">
  <Button onclick={onAdd}>Add Row</Button>
  <Button onclick={onDelete} disabled={selectedCount === 0}>
    Delete ({selectedCount})
  </Button>
  <Button onclick={onClear}>Clear All</Button>
</div>
```

### Main Page (`+page.svelte`) - 45 lines
```svelte
<GridToolbar {...toolbarProps} />
<RevoGrid 
  source={$data} 
  columns={columns}
  editable={true}
  on:afterEdit={handleEdit}
  on:selectionChanged={handleSelection}
/>
```

## Demo Data

- **50 rows** of sample data
- **5 columns**: ID, Name, Qty, Price, Total
- **Auto-calculation**: Total updates when Qty or Price changes
- **Editable**: Click any cell to edit (except ID and Total)

## Why This is Better

❌ **Before**: 300+ lines per component, complex state management, too many features  
✅ **After**: ~50 lines per component, simple reactive stores, core functionality only

### Code Comparison
- **DataStore**: 200+ lines → **75 lines** (-62%)
- **GridToolbar**: 300+ lines → **15 lines** (-95%)  
- **Main Page**: 200+ lines → **45 lines** (-77%)
- **Total**: ~800 lines → **150 lines** (-81%)

### Build Performance
- **Bundle size**: Significantly smaller
- **Build time**: Much faster
- **Dependencies**: Minimal (no XLSX, no complex dialogs)

## Development

```bash
# Available scripts
pnpm dev        # Development server
pnpm build      # Production build  
pnpm preview    # Preview build
pnpm lint       # ESLint check
pnpm format     # Prettier format
```

## Principles Applied

- **KISS**: Keep It Simple, Stupid
- **DRY**: Don't Repeat Yourself  
- **SOLID**: Single Responsibility Principle
- **Minimal**: Only essential features
- **Clean**: Readable, maintainable code

---

**Perfect for**: Learning RevoGrid, prototyping, simple data management demos
