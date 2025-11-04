# Is JSONPlaceholder Being Used?

##  YES - It's Being Used!

Your JSONPlaceholder integration is **actively being used** in the application.

---

## How It's Being Used

### 1. **API Configuration** (`api.config.ts`)
```typescript
export const API_CONFIG = {
  BASE_URL: 'https://jsonplaceholder.typicode.com',  //  JSONPlaceholder URL
  ENDPOINTS: {
    POSTS: '/posts',  //  Using /posts endpoint
    ITEMS: '/items'
  }
};
```

### 2. **HTTP Service** (`http.service.ts`)
```typescript
export class HttpService {
  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;  //  Points to JSONPlaceholder
  }
  
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    // Makes actual HTTP calls to JSONPlaceholder
  }
}
```

### 3. **Items API Service** (`items.api.service.ts`)
```typescript
async loadItems(limit: number = 20): Promise<Item[]> {
  //  Actually fetching from JSONPlaceholder
  const posts = await httpService.get<any[]>(API_CONFIG.ENDPOINTS.POSTS, {
    _limit: limit.toString()
  });

  //  Transform JSONPlaceholder posts into our Item format
  return this.transformPostsToItems(posts);
}
```

### 4. **Data Transformation**
```typescript
private transformPostsToItems(posts: any[]): Item[] {
  return posts.map((post) => {
    const qty = (post.id % 10) + 1;
    const price = Math.floor(post.title.length * 2.5) + 10;

    return {
      id: post.id,
      name: post.title.split(' ').slice(0, 3).join(' '), //  Using post.title
      qty,
      price,
      total: qty * price
    };
  });
}
```

---

##  Data Flow

```
User opens app
     ↓
Store calls loadBidItems() / loadEstimates() / loadInfoSetup()
     ↓
Store calls itemsApiService.loadItems(25)
     ↓
itemsApiService calls httpService.get('/posts', { _limit: '25' })
     ↓
httpService makes HTTP GET to https://jsonplaceholder.typicode.com/posts?_limit=25
     ↓
JSONPlaceholder returns 25 posts
     ↓
transformPostsToItems() converts posts to items:
  - post.id → item.id
  - post.title → item.name (first 3 words)
  - Calculates qty, price, total
     ↓
Returns transformed items to store
     ↓
Store updates reactive data
     ↓
Grid displays data from JSONPlaceholder
```

---

## What Data Comes From JSONPlaceholder

### JSONPlaceholder Post Object:
```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident",
  "body": "quia et suscipit..."
}
```

### Transformed to Item:
```typescript
{
  id: 1,                    // ← from post.id
  name: "sunt aut facere",  // ← from post.title (first 3 words)
  qty: 2,                   // ← calculated: (1 % 10) + 1
  price: 92,                // ← calculated: floor(33 * 2.5) + 10
  total: 184                // ← calculated: qty * price
}
```

---

## Where It's Used in Each Store

### 1. **Bid Items Store** (`bidItemStore.svelte.ts`)
```typescript
export async function loadBidItems() {
  const apiItems = await itemsApiService.loadItems(25);  //  JSONPlaceholder
  const bidItems: BidItem[] = apiItems.map((item, i) => ({
    id: i + 1,
    bidItem: BID_ITEM_OPTIONS[i % BID_ITEM_OPTIONS.length].value,
    description: item.name,  //  From JSONPlaceholder post.title
    bidQuantity: item.qty,   //  Calculated from post.id
    unit: UNIT_OPTIONS[i % UNIT_OPTIONS.length].value,
    takeoffQuantity: item.total,  //  Calculated
    clientNo: String(10 + i * 10)
  }));
}
```

### 2. **Estimate Store** (`estimateStore.svelte.ts`)
```typescript
export async function loadEstimates() {
  const apiItems = await itemsApiService.loadItems(10);  //  JSONPlaceholder
  const estimates: EstimateItem[] = apiItems.map((item, i) => ({
    id: i + 1,
    estimateNo: `EST-${26000100 + i}`,
    projectName: item.name,  //  From JSONPlaceholder post.title
    client: `Client ${String.fromCharCode(65 + (i % 26))}`,
    status: i % 3 === 0 ? 'Draft' : i % 3 === 1 ? 'In Review' : 'Approved',
    total: item.total * 1000,  //  Calculated from post data
    createdDate: new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
  }));
}
```

### 3. **Info Setup Store** (`infoSetupStore.svelte.ts`)
```typescript
export async function loadInfoSetup() {
  const apiItems = await itemsApiService.loadItems(10);  //  JSONPlaceholder
  const infoItems: InfoSetupItem[] = apiItems.map((item, i) => ({
    id: i + 1,
    fieldName: `Field ${i + 1}`,
    fieldValue: item.name,  //  From JSONPlaceholder post.title
    category: i % 3 === 0 ? 'Project' : i % 3 === 1 ? 'Client' : 'Billing',
    required: i % 2 === 0
  }));
}
```

---

##  What's Working

1. **Real HTTP Calls** - App makes actual GET requests to JSONPlaceholder
2. **Data Transformation** - Posts are converted to items with calculated values
3. **All Three Stores** - Bid items, estimates, and info setup all use JSONPlaceholder data
4. **Error Handling** - If JSONPlaceholder fails, fallback data is used

---

## What's Simulated (Not Using JSONPlaceholder)

### Create/Update/Delete Operations:
```typescript
async createItem(item: Omit<Item, 'id'>): Promise<Item> {
  // NOT calling JSONPlaceholder
  // Just returns item with timestamp ID
  return { ...item, id: Date.now() };
  
  // Real implementation would be:
  // return httpService.post<Item>('/items', item);
}

async updateItem(item: Item): Promise<Item> {
  // NOT calling JSONPlaceholder
  // Just returns the item as-is
  return item;
}

async deleteItem(id: number): Promise<void> {
  // NOT calling JSONPlaceholder
  // Just simulates delay
  await new Promise(resolve => setTimeout(resolve, 100));
}
```

**Why?** JSONPlaceholder is read-only for `/posts`. We simulate create/update/delete locally.

---

## 🔍 How to Verify It's Working

### 1. Open Browser DevTools → Network Tab
- Refresh the page
- Look for requests to `jsonplaceholder.typicode.com/posts?_limit=25`
- You'll see 3 requests (one for each store)

### 2. Check Console Logs
```
[BID ITEM STORE] Loaded 25 bid items
[ESTIMATE STORE] Loaded 10 estimates
[INFO SETUP STORE] Loaded 10 items
```

### 3. Look at the Data
- The descriptions/project names come from real JSONPlaceholder post titles
- Examples:
  - "sunt aut facere"
  - "qui est esse"
  - "ea molestias quasi"

---

## Summary

###  YES, JSONPlaceholder is being used for:
- Loading initial data (GET requests)
- All three tabs (Bid Items, Estimates, Info Setup)
- Real HTTP calls through the service layer

### NO, JSONPlaceholder is NOT being used for:
- Create operations (simulated locally)
- Update operations (simulated locally)  
- Delete operations (simulated locally)

**Reason:** JSONPlaceholder's `/posts` endpoint is read-only. Create/update/delete would need a real backend.

---

## To Use a Real Backend

When you have a real API, just update these methods:

```typescript
// items.api.service.ts
async createItem(item: Omit<Item, 'id'>): Promise<Item> {
  // Replace simulation with real API call
  return httpService.post<Item>(API_CONFIG.ENDPOINTS.ITEMS, item);
}

async updateItem(item: Item): Promise<Item> {
  return httpService.put<Item>(`${API_CONFIG.ENDPOINTS.ITEMS}/${item.id}`, item);
}

async deleteItem(id: number): Promise<void> {
  await httpService.delete(`${API_CONFIG.ENDPOINTS.ITEMS}/${id}`);
}
```

And update the API config:
```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-real-api.com',
  ENDPOINTS: {
    ITEMS: '/api/items'
  }
};
```

---

## Bottom Line

**Your JSONPlaceholder service IS being used!** Every time you load the app, it fetches real data from `https://jsonplaceholder.typicode.com/posts` and transforms it into bid items, estimates, and info setup data.

You can see it in action in the Network tab! 
