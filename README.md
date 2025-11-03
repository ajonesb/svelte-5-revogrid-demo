# SvelteKit + RevoGrid Demo

Minimal Excel-like data grid with **SvelteKit 5**, **RevoGrid**, and real API data.

## Features

- Excel-like editing with auto-calculations  
- Real API data from JSONPlaceholder
- Add, edit, delete rows
- Loading states and error handling
- Clean service architecture (SOLID principles)

## Quick Start

```bash
pnpm install
pnpm dev  # → http://localhost:5173
```

## Tech Stack

**SvelteKit 5** + **RevoGrid** + **TypeScript** + **TailwindCSS**

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/button/           # shadcn-svelte button
│   │   └── GridToolbar.svelte   # Add/Delete/Clear buttons
│   ├── services/
│   │   ├── http.service.ts      # Generic HTTP client
│   │   ├── items.api.service.ts # API calls & data mapping
│   │   └── api.config.ts        # API configuration
│   └── stores/
│       └── dataStore.ts         # State management
├── routes/
│   └── +page.svelte             # Main grid component
└── app.css                      # Tailwind styles
```

## Key Components

### Data Store (`dataStore.ts`)
```typescript
interface Item {
  id: number;
  name: string;
  qty: number;
  price: number;
  total: number; // auto-calculated
}

// Functions: addRow, deleteSelected, clearAll, updateRow
```

### Main Grid (`+page.svelte`)
- Dynamic RevoGrid import (SSR compatibility)
- Error states and loading indicators
- Real-time data updates

## Customize for Your API

1. **Update API config:**
```typescript
// src/lib/services/api.config.ts
export const API_CONFIG = {
  BASE_URL: 'https://your-api.com/api',
  ENDPOINTS: { ITEMS: '/your-endpoint' }
};
```

2. **Map your data structure:**
```typescript
// src/lib/services/items.api.service.ts
private transformToItems(apiData: YourApiType[]): Item[] {
  return apiData.map(item => ({
    id: item.your_id_field,
    name: item.your_name_field,
    qty: item.your_quantity_field,
    price: item.your_price_field,
    total: item.your_quantity_field * item.your_price_field
  }));
}
```

3. **Add authentication (if needed):**
```typescript
// src/lib/services/http.service.ts
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

## Development

```bash
pnpm dev        # Development server
pnpm build      # Production build  
pnpm preview    # Preview build
```

---

**Perfect for**: Learning RevoGrid, prototyping, data management demos
