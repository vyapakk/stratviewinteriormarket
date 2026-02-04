// Aircraft Interiors Market Research Data Types
// This file now only contains type definitions and helper functions
// The actual data is fetched from /data/marketData.json

export interface YearlyData {
  year: number;
  value: number;
}

export interface SegmentData {
  name: string;
  data: YearlyData[];
}

export interface RegionalSegmentData {
  segment: string;
  regions: {
    name: string;
    data: YearlyData[];
  }[];
}

// Helper functions
export function getValueForYear(data: YearlyData[], year: number): number {
  return data.find(d => d.year === year)?.value ?? 0;
}

export function calculateCAGR(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0 || years <= 0) return 0;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

export function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}B`;
  }
  return `$${value.toFixed(0)}M`;
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}
