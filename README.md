# SvelteKit + RevoGrid Demo

Minimal Excel-like data grid with **SvelteKit 5**, **RevoGrid**, and **clean service architecture**.

## Features

- **Real API data** from JSONPlaceholder
- **Excel-like editing** with auto-calculations  
- **CRUD operations** with API sync
- **Loading states** and error handling
- **Clean service layer** (SOLID principles)

## Tech Stack

**SvelteKit** + **Svelte 5** + **TypeScript** + **TailwindCSS** + **RevoGrid**

## Quick Start

```bash
pnpm install
pnpm dev
```

## Service Architecture

```
src/lib/services/
├── http.service.ts       # Generic HTTP operations
├── items.api.service.ts  # Item-specific API calls  
└── api.config.ts         # Configuration & types
```

## API Integration

**Current:** Uses JSONPlaceholder demo API  
**Your API:** Update `API_CONFIG.BASE_URL` and data mapping in `ItemsApiService`

```typescript
// Example: Adapt for your API
const API_CONFIG = {
  BASE_URL: 'https://your-api.com/api'
};
```

---

**Clean, minimal, production-ready.** 

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
