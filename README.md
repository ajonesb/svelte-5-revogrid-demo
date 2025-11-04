# SvelteKit Data Table with Autocomplete

Clean, minimal data table implementation with **SvelteKit 5**, **RevoGrid**, and **autocomplete** support.

## ✨ Features

### Three Data Views
- **Estimate List** - Manage project estimates
- **Information Setup** - Configure project information
- **Bid Item Setup** - Manage bid items with **autocomplete dropdowns**

### Excel-like Experience
- ✅ Inline editing
- ✅ Row selection
- ✅ Autocomplete for Bid Items and Units
- ✅ Add/Delete/Clear operations
- ✅ Loading & error states

### Clean Architecture
- ✅ **DRY** - Reusable base store and components
- ✅ **SOLID** - Single responsibility per module
- ✅ **KISS** - Minimal complexity
- ✅ **Svelte 5** - Modern runes API
- ✅ **Shadcn-UI** - Consistent design tokens

## 🚀 Quick Start

```bash
pnpm install
pnpm dev  # → http://localhost:5174
```

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete architecture guide
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Common tasks & API reference

## 🛠 Tech Stack

- **SvelteKit 5** - Framework with modern runes
- **RevoGrid** - High-performance data grid
- **@revolist/revogrid-column-select** - Autocomplete plugin
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn-Svelte** - UI components

## 📁 Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── DataGrid.svelte          # Reusable grid with autocomplete
│   │   ├── GridToolbar.svelte       # Action buttons
│   │   ├── HeaderTabs.svelte        # Tab navigation
│   │   └── ui/                      # Shadcn components
│   ├── stores/
│   │   ├── baseStore.svelte.ts      # Base store factory (DRY)
│   │   ├── tabStore.svelte.ts       # Tab state management
│   │   ├── estimateStore.svelte.ts  # Estimate data
│   │   ├── infoSetupStore.svelte.ts # Info setup data
│   │   └── bidItemStore.svelte.ts   # Bid items with autocomplete
│   └── services/
│       ├── http.service.ts          # HTTP client
│       ├── items.api.service.ts     # API operations
│       └── api.config.ts            # Configuration
└── routes/
    ├── +layout.svelte               # App layout
    └── +page.svelte                 # Main page (minimal)
```

## 🎯 Key Features Explained

### Autocomplete (Bid Item Setup)
The Bid Item Setup tab includes dropdown autocomplete for:
- **Bid Item column**: 25+ predefined construction items
- **Unit column**: Standard measurement units (LS, LF, CY, SY, etc.)

Implementation uses `@revolist/revogrid-column-select` plugin with clean column configuration.

### Tab-Based Data Views
Each tab loads and manages its own data independently:
- Switch tabs without losing data
- Separate CRUD operations per tab
- Optimized loading with Promise.all()

### Svelte 5 Runes
Modern reactive state management:
```typescript
let data = $state<T[]>([]);           // Reactive state
const activeTab = $derived(store.active); // Derived value
$effect(() => { /* side effects */ });    // Effects
```

## 🔧 Customization

### Add a New Tab Type
1. Create store: `src/lib/stores/yourStore.svelte.ts`
2. Define interface and columns
3. Add to `tabStore.TABS`
4. Update `+page.svelte` derived values

### Modify Autocomplete Options
```typescript
// src/lib/stores/bidItemStore.svelte.ts
export const BID_ITEM_OPTIONS = [
  'Your Item 1',
  'Your Item 2',
  // ...
].map(label => ({ label, value: label }));
```

### Change API Endpoint
```typescript
// src/lib/services/api.config.ts
export const API_CONFIG = {
  BASE_URL: 'https://your-api.com',
  ENDPOINTS: { ITEMS: '/your-endpoint' }
};
```

## 📋 Available Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm check        # Type check
pnpm lint         # Lint code
pnpm format       # Format code
```

## 🏗 Architecture Highlights

### DRY (Don't Repeat Yourself)
- `createDataStore<T>()` factory for all stores
- `DataGrid.svelte` reusable component
- Shared error handling utilities

### SOLID Principles
- **Single Responsibility**: Each store handles one data type
- **Open/Closed**: Extend base store without modification
- **Dependency Inversion**: Components depend on interfaces

### KISS (Keep It Simple)
- Minimal component hierarchy
- Clear separation of concerns
- No over-engineering

## 📖 Learn More

- [SvelteKit 5 Docs](https://svelte.dev/docs/kit)
- [RevoGrid Docs](https://revolist.github.io/revogrid/)
- [Shadcn-Svelte](https://www.shadcn-svelte.com/)

## 📝 License

MIT

---

**Built with ❤️ using modern web standards and best practices**
