

# Dashboard Font & End User Tab Updates

## Overview

This plan implements two changes:
1. Switch the entire dashboard font from Inter to Poppins
2. Update the stacked bar chart tooltips to show the year, and remove KPI cards from the End User tab

---

## Part 1: Poppins Font for Entire Dashboard

### Current State
- The dashboard uses `Inter` as the primary font and `JetBrains Mono` for monospaced numbers
- Font is imported via Google Fonts in `src/index.css`

### Changes Required

**File: `src/index.css`**
- Update the Google Fonts import to include Poppins instead of Inter
- Change the `html` font-family from `'Inter'` to `'Poppins'`

```css
/* Before */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700...');

html {
  font-family: 'Inter', system-ui, sans-serif;
}

/* After */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700...');

html {
  font-family: 'Poppins', system-ui, sans-serif;
}
```

---

## Part 2: Stacked Bar Chart Tooltip with Year

### Current Tooltip Display
```
OE - North America
$1,234M (35% of OE)
```

### Updated Tooltip Display
```
OE - North America (2024)
$1,234M (35% of OE)
```

**File: `src/components/dashboard/StackedBarChart.tsx`**
- Update the `CustomTooltip` component to include the `year` prop in the display
- Change the tooltip title from `{label} - {segmentName}` to `{label} - {segmentName} ({year})`

---

## Part 3: Remove KPI Cards from End User Tab

### Current State
- The End User tab displays 3 KPI cards at the top (same as other segment tabs)

### Changes Required

**File: `src/pages/tabs/SegmentDetailTab.tsx`**
- Wrap the KPI Cards section in a conditional that excludes `segmentType === "endUser"`
- Keep KPI cards for all other segment types (overview, aircraft, region, application, equipment)

---

## File Changes Summary

| File | Change |
|------|--------|
| `src/index.css` | Replace Inter font with Poppins in import and html selector |
| `src/components/dashboard/StackedBarChart.tsx` | Add year to tooltip title display |
| `src/pages/tabs/SegmentDetailTab.tsx` | Conditionally hide KPI cards for endUser segment |

