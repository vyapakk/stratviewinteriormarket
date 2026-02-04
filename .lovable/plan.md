

# Dashboard Navigation Restructure Plan

## Overview

Transform the current single-page dashboard into a multi-tab navigation structure with 6 main sections. Each tab will provide focused analysis for its specific segment type.

---

## New Navigation Structure

```text
+------------------+------------+---------------+----------+-------------+-----------+
| Market Overview  | End-User   | Aircraft-Type | Region   | Application | Equipment |
+------------------+------------+---------------+----------+-------------+-----------+
```

---

## Tab 1: Market Overview (Home Tab)

This is the main landing page with a comprehensive market summary.

### Components:

1. **Dual-Line Chart** (Market Size + YoY Growth %)
   - X-axis: Years (2016-2034)
   - Left Y-axis: Market size in US$ Millions
   - Right Y-axis: YoY Growth %
   - Line 1: Market size trend
   - Line 2: YoY growth percentage for each year

2. **KPI Boxes** (3 cards)
   - Total Market of Selected Year (with $ value)
   - CAGR through 2034
   - Forecasted Market in 2034

3. **Donut Charts Row** (5 charts showing distribution in selected year)
   - End User distribution
   - Aircraft Type distribution
   - Region distribution
   - Application distribution
   - Equipment distribution

4. **Year Selector** - dropdown/slider to change the selected year

---

## Tabs 2-6: Segment Detail Pages

Each segment tab (End-User, Aircraft-Type, Region, Application, Equipment) will show:

1. **KPI Cards** - Total for segment, CAGR, 2034 forecast
2. **Stacked Area Chart** - Trend by segment breakdown (existing MarketTrendChart style)
3. **Pie Chart** - Distribution for selected year
4. **Bar Chart** - Horizontal bars showing each sub-segment
5. **Comparison Table** - Growth analysis table

These pages will reuse existing components with the appropriate data slice.

---

## Implementation Steps

### Step 1: Create Navigation Component

Create `src/components/dashboard/MainNavigation.tsx`:
- Horizontal tab navigation below the header
- 6 tabs: Market Overview, End-User, Aircraft-Type, Region, Application, Equipment
- Uses the same styling pattern as current SegmentTabs
- Tab state managed via URL or local state

### Step 2: Create Market Overview Page Components

**Create `src/components/dashboard/MarketOverviewChart.tsx`:**
- New dual-axis line chart with Recharts
- Shows market size (line 1) and YoY growth % (line 2)
- Uses ComposedChart from Recharts with Line + Line
- Custom tooltip showing both values
- Same styling as existing charts

**Create `src/components/dashboard/DistributionDonutsRow.tsx`:**
- Responsive grid of 5 smaller donut charts
- Each shows one segment distribution
- Clickable to navigate to that segment's detail tab

### Step 3: Create Tab Content Components

**Create `src/pages/tabs/MarketOverviewTab.tsx`:**
- Contains the dual-line chart
- 3 KPI boxes (Selected Year Market, CAGR, 2034 Forecast)
- 5 donut charts in a row
- Year selector

**Create `src/pages/tabs/SegmentDetailTab.tsx`:**
- Reusable component for End-User, Aircraft-Type, Region, Application, Equipment
- Props: segmentType, segmentData, title
- Includes: KPI cards, trend chart, pie chart, bar chart, comparison table

### Step 4: Update Index Page

Modify `src/pages/Index.tsx`:
- Add MainNavigation component after DashboardHeader
- Use state to track active tab
- Conditionally render tab content based on selection
- Remove old SegmentTabs component

### Step 5: Create Helper for YoY Calculation

Add to `src/hooks/useMarketData.ts`:
- Function to calculate YoY growth % for each year
- Returns array of { year, value, yoyGrowth }

---

## File Changes Summary

### New Files:
- `src/components/dashboard/MainNavigation.tsx` - Main 6-tab navigation
- `src/components/dashboard/MarketOverviewChart.tsx` - Dual-axis line chart
- `src/components/dashboard/DistributionDonutsRow.tsx` - Row of 5 mini donuts
- `src/pages/tabs/MarketOverviewTab.tsx` - Market Overview content
- `src/pages/tabs/SegmentDetailTab.tsx` - Reusable segment detail view

### Modified Files:
- `src/pages/Index.tsx` - Add navigation, restructure layout
- `src/hooks/useMarketData.ts` - Add YoY calculation helper

### Files to Remove/Deprecate:
- `src/components/dashboard/SegmentTabs.tsx` - Replaced by MainNavigation

---

## Technical Details

### Dual-Axis Line Chart Implementation

```text
Recharts ComposedChart with:
- Line (dataKey="value") for market size
- Line (dataKey="yoyGrowth") for YoY %
- YAxis yAxisId="left" for market size ($B)
- YAxis yAxisId="right" for growth (%)
- Custom tooltip showing both metrics
```

### YoY Growth Calculation

```text
For each year:
  yoyGrowth = ((currentYearValue - previousYearValue) / previousYearValue) * 100

Year 2016 will show N/A or 0% (no previous year data)
```

### Navigation State Management

Use React useState for tab state (no routing needed):
- `activeTab: "overview" | "endUser" | "aircraft" | "region" | "application" | "equipment"`
- Tab changes update state and render appropriate content

### Responsive Layout

- Donut charts row: 5 columns on desktop, 3 on tablet, 1-2 on mobile
- Navigation tabs: horizontal scroll on mobile if needed
- KPI boxes: grid layout, stacks on smaller screens

---

## Component Reuse

Existing components that will be reused:
- `KPICard` - For all metric boxes
- `SegmentPieChart` - For individual segment views
- `RegionalBarChart` - For bar charts (rename to generic SegmentBarChart)
- `MarketTrendChart` - For segment trend views
- `ComparisonTable` - For growth analysis
- `YearSelector` - For year selection
- `DashboardHeader` - Header remains unchanged
- `DrillDownModal` - Drill-down functionality preserved

