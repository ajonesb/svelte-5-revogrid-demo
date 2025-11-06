# Live Formula Demo - Bid Item Setup

## How to See It Working

1. **Go to "Bid Item Setup" tab**
2. **Look for the yellow and blue columns**:
   - 🟨 **Yellow** = Editable (Bid Qty, Takeoff Qty, Unit Price)
   - 🟦 **Blue** = Calculated (Total Cost, Variance, Variance %)

## Live Formulas

### Change One Cell → Others Update Automatically

**Formula 1: Total Cost**
```
Total Cost = Bid Quantity × Unit Price
```
- Edit "Bid Qty" → Total Cost updates instantly
- Edit "Unit Price" → Total Cost updates instantly

**Formula 2: Variance**
```
Variance = Takeoff Quantity - Bid Quantity
```
- Edit "Bid Qty" → Variance updates instantly
- Edit "Takeoff Qty" → Variance updates instantly

**Formula 3: Variance %**
```
Variance % = (Variance / Bid Quantity) × 100
```
- Edit any quantity → Variance % updates instantly

## Example Demo Scenario

**Row 1 - Mobilization:**
1. Initial: Bid Qty = 1, Unit Price = $2,500
2. Total Cost shows: $2,500 (calculated automatically)
3. **Change Bid Qty to 2**
4. Total Cost instantly shows: $5,000 ✅
5. **Change Unit Price to $3,000**
6. Total Cost instantly shows: $6,000 ✅

**Row 3 - Silt Fence:**
1. Initial: Bid Qty = 450, Takeoff Qty = 465
2. Variance shows: 15 (calculated)
3. Variance % shows: 3.33% (calculated)
4. **Change Bid Qty to 400**
5. Variance instantly shows: 65 ✅
6. Variance % instantly shows: 16.25% ✅

## Technical Implementation

**Composable Pattern (Svelte 5):**
```typescript
// src/lib/composables/useFormulaCalculator.svelte.ts
const calculator = useFormulaCalculator<BidItem>({
  formulas: {
    totalCost: (row) => (row.bidQuantity || 0) * (row.unitPrice || 0),
    variance: (row) => (row.takeoffQuantity || 0) - (row.bidQuantity || 0),
    variancePct: (row) => {
      const bidQty = row.bidQuantity || 0;
      if (bidQty === 0) return 0;
      return ((row.takeoffQuantity || 0) - bidQty) / bidQty * 100;
    }
  },
  triggers: {
    bidQuantity: ['totalCost', 'variance', 'variancePct'],
    unitPrice: ['totalCost'],
    takeoffQuantity: ['variance', 'variancePct']
  }
});
```

**On Edit Event:**
```typescript
// Automatically recalculate all formulas
if (activeTab === 'bid-item-setup') {
  updatedData = applyFormulasToAll(updatedData);
}
```

## Architecture Benefits

✅ **SOLID** - Formula logic separated into composable  
✅ **DRY** - Reusable across any table  
✅ **KISS** - Simple, declarative formula definitions  
✅ **Testable** - Pure functions, easy to unit test  
✅ **Type-safe** - Full TypeScript support  

## Same Pattern Already Working

**Estimate Entry Tab** has identical live formulas:
- Adj Quantity = Quantity × (1 + Waste%)
- Total Cost = Adj Quantity × Unit Cost × (1 + Tax%)
- Gross Price = Total Cost × 1.18
- Sales Price = Gross Price

**Change any cell → All dependent cells update instantly!**
