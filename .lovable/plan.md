
# Fix Stacked Bar Chart Data and Tooltip Display

## Problem Analysis

### Issue 1: Data Calculation Errors
The current `getStackedBarData` function uses an incorrect proportional calculation method. It applies stack segment ratios from the total market to primary segment values, which results in inaccurate stacked totals that don't match the actual primary segment values.

**Current flawed logic:**
- Primary value (e.g., Narrow Body) = $7,724.6M
- Stack ratio = North America value / Total Market = 48.2%
- Calculated segment = $7,724.6M x 48.2% = $3,724M

This approach causes the sum of all stacks to not equal the primary segment's actual value.

**Correct approach:**
The stacked segments should be calculated so they proportionally sum to exactly the primary segment value. Each stack segment's proportion within that primary bar should be based on the stack segment's share of the total market.

### Issue 2: Missing Bar Total in Tooltip
The tooltip currently only shows:
- Segment name and value
- Percentage of bar

It should also display:
- **Total bar value** (sum of all stacks in that bar)

---

## Solution

### Part 1: Fix Data Calculation Logic

**File: `src/pages/tabs/SegmentDetailTab.tsx`**

Update the `getStackedBarData` function to ensure stacked segments sum correctly to the primary segment value:

```typescript
const getStackedBarData = (
  primarySegments: SegmentData[],
  stackSegments: SegmentData[]
) => {
  const totalMarketData = marketData.totalMarket;
  const totalMarketValue = totalMarketData.find((d) => d.year === selectedYear)?.value ?? 1;

  // Calculate the total of all stack segments for the selected year
  const stackTotal = stackSegments.reduce((sum, stack) => {
    return sum + (stack.data.find((d) => d.year === selectedYear)?.value ?? 0);
  }, 0);

  return primarySegments.map((primary) => {
    const primaryValue = primary.data.find((d) => d.year === selectedYear)?.value ?? 0;

    const segments = stackSegments.map((stack) => {
      const stackValue = stack.data.find((d) => d.year === selectedYear)?.value ?? 0;
      // Calculate proportion based on stack segment's share of stack total
      const stackRatio = stackTotal > 0 ? stackValue / stackTotal : 0;
      // Apply ratio to primary value so segments sum to primaryValue
      const segmentValue = primaryValue * stackRatio;

      // Similar calculation for full historical data
      const fullData = primary.data.map((d) => {
        const yearStackTotal = stackSegments.reduce((sum, s) => {
          return sum + (s.data.find((sd) => sd.year === d.year)?.value ?? 0);
        }, 0);
        const yearStackValue = stack.data.find((s) => s.year === d.year)?.value ?? 0;
        const yearStackRatio = yearStackTotal > 0 ? yearStackValue / yearStackTotal : 0;
        return { year: d.year, value: d.value * yearStackRatio };
      });

      return { name: stack.name, value: segmentValue, fullData };
    });

    return {
      name: primary.name,
      segments,
      total: primaryValue, // Use actual primary value as total
    };
  });
};
```

Apply the same fix to `getEndUserStackedData` function for consistency.

---

### Part 2: Update Tooltip to Show Bar Total

**File: `src/components/dashboard/StackedBarChart.tsx`**

Modify the `CustomTooltip` component to include the bar total:

**Before:**
```jsx
<span className="font-mono font-medium text-foreground">
  ${hoveredEntry.value?.toLocaleString()}M
</span>
<span className="text-muted-foreground">({percent}% of {label})</span>
```

**After:**
```jsx
<div className="flex items-center gap-2">
  <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: hoveredEntry.fill }} />
  <span className="font-mono font-medium text-foreground">
    ${hoveredEntry.value?.toLocaleString()}M
  </span>
  <span className="text-muted-foreground">({percent}% of {label})</span>
</div>
<div className="mt-1 pt-1 border-t border-border flex items-center gap-2 text-muted-foreground">
  <span>Bar Total:</span>
  <span className="font-mono font-medium text-foreground">
    ${total.toLocaleString()}M
  </span>
</div>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/tabs/SegmentDetailTab.tsx` | Fix `getStackedBarData` and `getEndUserStackedData` calculation logic |
| `src/components/dashboard/StackedBarChart.tsx` | Update `CustomTooltip` to display bar total |

---

## Technical Details

### Data Flow After Fix
1. Primary segment value (e.g., Narrow Body = $7,724.6M)
2. Stack segments share calculated from stack total (not total market)
   - NA: 48.2%, Europe: 25.9%, APAC: 20.5%, RoW: 5.4%
3. Calculated stacks:
   - NA: $7,724.6M x 48.2% = $3,724M
   - Europe: $7,724.6M x 25.9% = $2,001M
   - APAC: $7,724.6M x 20.5% = $1,584M
   - RoW: $7,724.6M x 5.4% = $417M
4. Sum = $7,726M (matches primary value within rounding)

### Tooltip Display Format
```
Narrow Body - North America (2025)
  [color] $3,724M (48.2% of Narrow Body)
  ─────────────────────────────────
  Bar Total: $7,725M
```
