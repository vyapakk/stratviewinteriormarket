

# End User Tab Enhancement Plan

## Overview

This plan implements two key changes:
1. Remove duplicate year selectors from individual tabs (use only the universal one in navigation)
2. Enhance the End User tab with two new stacked horizontal bar charts showing OE/Aftermarket breakdown by Aircraft Type and by Region

---

## Part 1: Remove Duplicate Year Selectors

### Current State
- Year selector appears in MainNavigation (universal)
- Year selector also appears separately in SegmentDetailTab

### Changes Required

**File: `src/pages/tabs/SegmentDetailTab.tsx`**
- Remove the YearSelector component import
- Remove the year selector wrapper div (lines 98-101)
- Keep the `selectedYear` prop but remove `onYearChange` usage within the tab

---

## Part 2: Add Stacked Bar Charts to End User Tab

### Data Challenge

The current JSON data structure has:
- OE and Aftermarket totals by year
- Aircraft Type totals by year
- Region totals by year

But it does NOT have cross-dimensional data like "OE by Aircraft Type" or "Aftermarket by Region".

### Solution

Add new cross-dimensional data sections to `marketData.json`:
```json
{
  "endUserByAircraftType": [
    {
      "name": "Narrow Body",
      "oe": [{ "year": 2024, "value": X }, ...],
      "aftermarket": [{ "year": 2024, "value": Y }, ...]
    },
    ...
  ],
  "endUserByRegion": [
    {
      "name": "North America",
      "oe": [{ "year": 2024, "value": X }, ...],
      "aftermarket": [{ "year": 2024, "value": Y }, ...]
    },
    ...
  ]
}
```

For the initial implementation, we'll estimate these values using proportional distribution based on existing data.

---

## New Component: StackedBarChart

**File: `src/components/dashboard/StackedBarChart.tsx`**

A new reusable component for stacked horizontal bar charts:

```text
+------------------------------------------------------------------------+
| Title                                                      [Download]  |
| Subtitle                                                               |
+------------------------------------------------------------------------+
|                                                                        |
|  Narrow Body    |████████████████████████████████|██████████|          |
|                                                                        |
|  Wide-Body      |████████████████████████████|█████████████|           |
|                                                                        |
|  Regional       |████████████████|██████|                              |
|                                                                        |
|  Business Jets  |██████████████|█████████|                             |
|                                                                        |
+------------------------------------------------------------------------+
|                   [████] OE   [████] Aftermarket                       |
+------------------------------------------------------------------------+
```

### Component Props

```typescript
interface StackedBarChartProps {
  data: {
    name: string;
    oe: number;
    aftermarket: number;
    oeFullData?: YearlyData[];
    aftermarketFullData?: YearlyData[];
  }[];
  year: number;
  title: string;
  subtitle?: string;
  onSegmentClick?: (segmentName: string, endUserType: 'OE' | 'Aftermarket', value: number) => void;
}
```

### Features
- Horizontal stacked bars using Recharts BarChart
- OE portion in cyan color, Aftermarket in amber color
- Custom tooltip showing both values and percentages
- Hover effect highlighting the hovered segment
- Click-to-drill-down functionality
- Download button for chart export

---

## End User Tab Layout

**Updated layout for End User tab:**

```text
+------------------------------------------------------------------+
| [KPI Cards Row - 3 cards]                                        |
+------------------------------------------------------------------+
|                                |                                  |
| [Line Chart - Market Trend]    | [Donut Chart - OE vs Aftermarket]|
| (2016-2034, OE + Aftermarket)  | (Selected Year Distribution)     |
|                                |                                  |
+------------------------------------------------------------------+
|                                                                   |
| [Stacked Bar Chart: OE/Aftermarket by Aircraft Type]             |
| Narrow Body, Wide-Body, Regional, Business Jets                   |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
| [Stacked Bar Chart: OE/Aftermarket by Region]                    |
| North America, Europe, Asia-Pacific, Rest of World               |
|                                                                   |
+------------------------------------------------------------------+
| [Comparison Table - Growth Analysis]                              |
+------------------------------------------------------------------+
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/tabs/SegmentDetailTab.tsx` | Modify | Remove year selector, add condition for End User tab to show stacked charts |
| `src/components/dashboard/StackedBarChart.tsx` | Create | New stacked horizontal bar chart component |
| `src/hooks/useMarketData.ts` | Modify | Add interface for cross-dimensional data, add helper to calculate proportional breakdown |
| `public/data/marketData.json` | Modify | Add `endUserByAircraftType` and `endUserByRegion` data sections |

---

## Implementation Approach for Data

Since the actual cross-dimensional data might not be available, we'll use proportional estimation:

```
OE by Narrow Body = Total Narrow Body × (Total OE / Total Market)
Aftermarket by Narrow Body = Total Narrow Body × (Total Aftermarket / Total Market)
```

This maintains consistency with total values while providing meaningful visualization.

Alternatively, the data can be provided in the JSON file with actual values if available from the research.

---

## Technical Details

### Stacked Bar Chart Implementation

Uses Recharts BarChart with:
- `layout="vertical"` for horizontal bars
- Two Bar components stacked: `stackId="stack"`
- Bar 1: `dataKey="oe"` with cyan fill
- Bar 2: `dataKey="aftermarket"` with amber fill
- Custom tooltip showing both segments
- Legend at bottom showing color keys

### Colors

- OE (Original Equipment): `hsl(192, 95%, 55%)` - Cyan
- Aftermarket: `hsl(38, 92%, 55%)` - Amber

These match the existing chart color scheme.

### Responsive Behavior

- On mobile: Charts stack vertically
- Bar labels remain visible with adequate left margin
- Touch-friendly hover/click areas

