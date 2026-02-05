# Aircraft Interiors Market Dashboard

A React-based interactive dashboard for visualizing Aircraft Interiors Market research data (2016-2034).

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
├── public/
│   └── data/
│       └── marketData.json     # 📊 ALL MARKET DATA - Edit this file to update data
├── src/
│   ├── assets/                 # Logo images
│   ├── components/
│   │   ├── dashboard/          # Dashboard-specific components
│   │   └── ui/                 # Reusable UI components (shadcn/ui)
│   ├── hooks/
│   │   └── useMarketData.ts    # Data fetching and transformation hook
│   ├── pages/
│   │   ├── tabs/               # Tab content components
│   │   ├── Index.tsx           # Main dashboard page
│   │   └── NotFound.tsx        # 404 page
│   └── index.css               # Global styles and design tokens
└── tailwind.config.ts          # Tailwind configuration
```

## Updating Market Data

**All market data is stored in a single file:** `public/data/marketData.json`

### Data Format

The data uses a compact, non-repetitive format:

```json
{
  "years": [2016, 2017, 2018, ..., 2034],
  
  "totalMarket": [12894.9, 13768.0, ...],  // Values align with years array
  
  "endUser": {
    "OE (Original Equipment)": [8448.8, 8765.3, ...],
    "Aftermarket": [4446.2, 5002.6, ...]
  },
  
  "region": {
    "North America": [6088.8, 6536.3, ...],
    "Europe": [3781.1, 3974.0, ...],
    ...
  }
}
```

### How to Update Values

1. Open `public/data/marketData.json`
2. Find the segment you want to update
3. Modify the values array - each position corresponds to the same position in the `years` array
   - Index 0 = 2016
   - Index 1 = 2017
   - ...
   - Index 18 = 2034

### Adding New Segments

To add a new segment category:

1. Add the data to `marketData.json` following the existing pattern
2. Update the TypeScript interfaces in `src/hooks/useMarketData.ts`
3. Add the UI component to display it

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **shadcn/ui** - UI component library

## Embedding in Your Website

### Option 1: iframe Embed

```html
<iframe 
  src="https://your-deployed-url.com" 
  width="100%" 
  height="800px"
  style="border: none;"
></iframe>
```

### Option 2: Build and Host

1. Run `npm run build`
2. Copy the `dist/` folder contents to your web server
3. Serve as static files

### Option 3: Component Integration

If integrating into an existing React app:

1. Copy the `src/components/dashboard/` folder
2. Copy `public/data/marketData.json` to your public folder
3. Copy `src/hooks/useMarketData.ts`
4. Import and use the components

## Configuration

### Changing Data Source URL

In `src/hooks/useMarketData.ts`, modify the `DATA_URL` constant:

```typescript
const DATA_URL = "/data/marketData.json";  // Default: local file
// const DATA_URL = "https://api.example.com/market-data";  // Your API
```

### Customizing Colors

Edit the CSS variables in `src/index.css`:

```css
:root {
  --primary: 220 90% 45%;
  --chart-1: 220 90% 45%;
  --chart-2: 160 60% 45%;
  /* ... */
}
```

## All Values Are in US$ Million

Unless otherwise specified, all monetary values in the dashboard are in US$ Million.
