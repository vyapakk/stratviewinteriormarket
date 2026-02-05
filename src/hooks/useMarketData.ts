/**
 * useMarketData Hook
 * 
 * Fetches and transforms market data from /data/marketData.json
 * 
 * DATA FORMAT:
 * The JSON file uses a compact format where each segment stores values as arrays
 * that correspond 1:1 with the "years" array. This hook transforms that into
 * the expanded format used by charts.
 * 
 * To update data: Edit public/data/marketData.json
 * - The "years" array defines all years (2016-2034)
 * - Each segment's values array must match the length of years array
 * - Values are in order: [2016, 2017, 2018, ..., 2034]
 */

import { useState, useEffect, useCallback } from "react";

// Types for the compact JSON format (what's stored in the file)
interface CompactMarketData {
  years: number[];
  totalMarket: number[];
  endUser: Record<string, number[]>;
  aircraftType: Record<string, number[]>;
  region: Record<string, number[]>;
  application: Record<string, number[]>;
  furnishedEquipment: Record<string, number[]>;
  countryDataByRegion: Record<string, Record<string, number[]>>;
  endUserByAircraftType: Record<string, Record<string, number[]>>;
  endUserByRegion: Record<string, Record<string, number[]>>;
  aircraftTypeByRegion: Record<string, Record<string, number[]>>;
  applicationByRegion: Record<string, Record<string, number[]>>;
  equipmentByRegion: Record<string, Record<string, number[]>>;
}

// Types for the expanded format (what charts consume)
export interface YearlyData {
  year: number;
  value: number;
}

export interface SegmentData {
  name: string;
  data: YearlyData[];
}

export interface MarketData {
  years: number[];
  totalMarket: YearlyData[];
  endUser: SegmentData[];
  aircraftType: SegmentData[];
  region: SegmentData[];
  application: SegmentData[];
  furnishedEquipment: SegmentData[];
  countryDataByRegion: Record<string, SegmentData[]>;
  endUserByAircraftType: Record<string, SegmentData[]>;
  endUserByRegion: Record<string, SegmentData[]>;
  aircraftTypeByRegion: Record<string, SegmentData[]>;
  applicationByRegion: Record<string, SegmentData[]>;
  equipmentByRegion: Record<string, SegmentData[]>;
}

interface UseMarketDataResult {
  data: MarketData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Data source URL - change this to point to your API endpoint if needed
const DATA_URL = "/data/marketData.json";

/**
 * Transforms compact value arrays into YearlyData format
 */
function expandValues(years: number[], values: number[]): YearlyData[] {
  return years.map((year, index) => ({
    year,
    value: values[index] ?? 0,
  }));
}

/**
 * Transforms a compact segment object into SegmentData array
 */
function expandSegment(years: number[], segment: Record<string, number[]>): SegmentData[] {
  return Object.entries(segment).map(([name, values]) => ({
    name,
    data: expandValues(years, values),
  }));
}

/**
 * Transforms nested compact data (e.g., endUserByRegion)
 */
function expandNestedSegment(
  years: number[],
  nested: Record<string, Record<string, number[]>>
): Record<string, SegmentData[]> {
  const result: Record<string, SegmentData[]> = {};
  for (const [key, segment] of Object.entries(nested)) {
    result[key] = expandSegment(years, segment);
  }
  return result;
}

/**
 * Main hook to fetch and transform market data
 */
export function useMarketData(): UseMarketDataResult {
  const [data, setData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(DATA_URL, {
        cache: "no-store", // Always fetch fresh data
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch market data: ${response.statusText}`);
      }

      const compact: CompactMarketData = await response.json();
      const { years } = compact;

      // Transform compact format to expanded format
      const expanded: MarketData = {
        years,
        totalMarket: expandValues(years, compact.totalMarket),
        endUser: expandSegment(years, compact.endUser),
        aircraftType: expandSegment(years, compact.aircraftType),
        region: expandSegment(years, compact.region),
        application: expandSegment(years, compact.application),
        furnishedEquipment: expandSegment(years, compact.furnishedEquipment),
        countryDataByRegion: expandNestedSegment(years, compact.countryDataByRegion),
        endUserByAircraftType: expandNestedSegment(years, compact.endUserByAircraftType),
        endUserByRegion: expandNestedSegment(years, compact.endUserByRegion),
        aircraftTypeByRegion: expandNestedSegment(years, compact.aircraftTypeByRegion),
        applicationByRegion: expandNestedSegment(years, compact.applicationByRegion),
        equipmentByRegion: expandNestedSegment(years, compact.equipmentByRegion),
      };

      setData(expanded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load market data");
      console.error("Error fetching market data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// ============================================
// HELPER FUNCTIONS FOR CHART COMPONENTS
// ============================================

/**
 * Get value for a specific year from yearly data array
 */
export function getValueForYear(data: YearlyData[], year: number): number {
  return data.find((d) => d.year === year)?.value ?? 0;
}

/**
 * Calculate Compound Annual Growth Rate
 */
export function calculateCAGR(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0 || years <= 0) return 0;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

/**
 * Format currency value for display
 */
export function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}B`;
  }
  return `$${value.toFixed(0)}M`;
}

/**
 * Format percentage value for display
 */
export function formatPercentage(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}
