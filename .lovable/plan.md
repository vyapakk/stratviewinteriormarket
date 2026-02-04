
# Year Selector Repositioning and Enhanced Donut Charts Plan

## Overview

This plan implements two key improvements to the Market Overview tab:
1. Move the year selector to be inline with the main navigation tabs
2. Upgrade the mini donut charts to have the same interactive features as SegmentPieChart (slice expansion on hover, drill-down modal on click)

---

## Change 1: Year Selector Inline with Navigation

### Current Layout
```text
+----------------------------------------------------------+
| Market Overview | End-User | Aircraft | Region | ...     |
+----------------------------------------------------------+

                                    [ Year: 2024 ▼ ]  <-- separate row
```

### New Layout
```text
+----------------------------------------------------------------------+
| Market Overview | End-User | Aircraft | Region | ...   [ Year: 2024 ▼ ]
+----------------------------------------------------------------------+
```

### Files to Modify

**1. MainNavigation.tsx**
- Add optional props: `selectedYear`, `onYearChange`, `showYearSelector`
- Wrap the existing content with a flex container
- Conditionally render YearSelector on the right side when props are provided

**2. Index.tsx**
- Pass year selector props to MainNavigation component

**3. MarketOverviewTab.tsx**
- Remove the standalone YearSelector component and its wrapper

---

## Change 2: Enhanced Donut Charts with Drill-Down

### Current Behavior
- Simple hover effect on card border
- Clicking navigates to segment detail tab
- No individual slice interaction

### New Behavior (matching SegmentPieChart)
- Individual slice expands on hover (outerRadius + 8)
- Detailed tooltip showing value, percentage, and "Click to drill down" hint
- Clicking a slice opens the DrillDownModal with that segment's detailed data
- Clicking outside pie area (on card) still navigates to tab

### Files to Modify

**1. DistributionDonutsRow.tsx**

Add to MiniDonut component:
- Import `Sector` from recharts for active shape rendering
- Add `useState` for `activeIndex` to track which slice is hovered
- Add `renderActiveShape` function that renders expanded slice
- Add props to Pie: `activeIndex`, `activeShape`, `onMouseEnter`, `onMouseLeave`, `onClick`
- Update tooltip to show "Click to drill down" hint
- Add new prop for slice click handling: `onSliceClick`

New props for component:
```typescript
onSliceClick?: (
  segmentName: string, 
  segmentData: YearlyData[], 
  color: string,
  relatedSegments?: { title: string; data: SegmentData[] }
) => void;
```

**2. MarketOverviewTab.tsx**

- Import `useDrillDown` hook and `DrillDownModal` component
- Add drill-down state management
- Create handler function `handleDonutSliceClick` that:
  - Receives segment info from the clicked slice
  - Determines related segments based on which donut was clicked
  - Opens the DrillDownModal
- Pass the handler to DistributionDonutsRow
- Render DrillDownModal at the bottom of the component

---

## Technical Details

### Slice Expansion on Hover

The active shape feature uses Recharts' `Sector` component to render an expanded version of the hovered slice:

```text
Normal slice: outerRadius = 55
Hovered slice: outerRadius = 55 + 8 = 63

Additional styling:
- Drop shadow filter for depth
- Cursor pointer for interactivity
```

### Click Handling Strategy

Two distinct click actions:

| Click Target | Action |
|--------------|--------|
| Pie slice | Opens DrillDownModal with segment details |
| Card (outside pie) | Navigates to segment detail tab |

Implementation uses `stopPropagation()` on pie click to prevent both actions firing.

### Related Segments for Drill-Down

Each donut type will have appropriate related segments:

| Donut Type | Related Segments in Modal |
|------------|--------------------------|
| End User | Regions for this End User |
| Aircraft Type | Applications for this Aircraft Type |
| Region | Countries in this Region |
| Application | Aircraft Types by Application |
| Equipment | End Users by Equipment |

---

## File Changes Summary

| File | Action | Changes |
|------|--------|---------|
| `MainNavigation.tsx` | Modify | Add year selector props and inline rendering with flexbox |
| `Index.tsx` | Modify | Pass `selectedYear` and `onYearChange` props to MainNavigation |
| `MarketOverviewTab.tsx` | Modify | Remove year selector, add useDrillDown hook and DrillDownModal |
| `DistributionDonutsRow.tsx` | Modify | Add hover expansion, slice click handler, enhanced tooltip |

---

## Expected Behavior After Changes

1. **Year Selector**: Appears inline on the right side of the navigation bar, visible on all tabs
2. **Donut Hover**: Individual slices expand outward when hovered, with a subtle shadow effect
3. **Donut Click**: Clicking any slice (e.g., "OE" in End User donut) opens the Deep Dive modal showing:
   - KPI summary (2024 Value, 2034 Forecast, CAGR, YoY Growth)
   - Historical and forecast trend chart
   - Related segments bar chart (clickable for further drill-down)
   - Year-over-year data table
4. **Card Click**: Clicking outside the pie chart area still navigates to that segment's detail tab
