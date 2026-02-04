import { DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { MarketOverviewChart } from "@/components/dashboard/MarketOverviewChart";
import { DistributionDonutsRow } from "@/components/dashboard/DistributionDonutsRow";
import { YearSelector } from "@/components/dashboard/YearSelector";
import { MarketData, calculateCAGR } from "@/hooks/useMarketData";
import { MainTabType } from "@/components/dashboard/MainNavigation";

interface MarketOverviewTabProps {
  marketData: MarketData;
  selectedYear: number;
  onYearChange: (year: number) => void;
  onNavigateToTab: (tabType: MainTabType) => void;
}

export function MarketOverviewTab({
  marketData,
  selectedYear,
  onYearChange,
  onNavigateToTab,
}: MarketOverviewTabProps) {
  // Calculate KPI values
  const currentMarketValue = marketData.totalMarket.find((d) => d.year === selectedYear)?.value ?? 0;
  const value2024 = marketData.totalMarket.find((d) => d.year === 2024)?.value ?? 0;
  const value2034 = marketData.totalMarket.find((d) => d.year === 2034)?.value ?? 0;
  const cagr2024to2034 = calculateCAGR(value2024, value2034, 10);

  return (
    <div className="space-y-8">
      {/* Year Selector */}
      <div className="flex justify-end">
        <YearSelector value={selectedYear} onChange={onYearChange} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard
          title={`${selectedYear} Market Size`}
          value={currentMarketValue / 1000}
          suffix="B"
          icon={DollarSign}
          delay={0}
          accentColor="primary"
        />
        <KPICard
          title="10-Year CAGR"
          value={cagr2024to2034}
          prefix=""
          suffix="%"
          icon={BarChart3}
          delay={0.1}
          accentColor="chart-4"
        />
        <KPICard
          title="2034 Forecast"
          value={value2034 / 1000}
          suffix="B"
          icon={TrendingUp}
          delay={0.2}
          accentColor="accent"
        />
      </div>

      {/* Dual-Axis Line Chart */}
      <MarketOverviewChart
        data={marketData.totalMarket}
        title="Market Size & YoY Growth Trend"
        subtitle="Historical (2016-2024) and Forecast (2025-2034) data"
      />

      {/* Distribution Donuts Row */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {selectedYear} Market Distribution
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Click any chart to see detailed analysis
        </p>
        <DistributionDonutsRow
          endUserData={marketData.endUser}
          aircraftData={marketData.aircraftType}
          regionData={marketData.region}
          applicationData={marketData.application}
          equipmentData={marketData.furnishedEquipment}
          year={selectedYear}
          onDonutClick={onNavigateToTab}
        />
      </div>
    </div>
  );
}
