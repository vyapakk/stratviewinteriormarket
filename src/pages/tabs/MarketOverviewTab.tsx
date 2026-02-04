import { DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { MarketOverviewChart } from "@/components/dashboard/MarketOverviewChart";
import { DistributionDonutsRow } from "@/components/dashboard/DistributionDonutsRow";
import { DrillDownModal } from "@/components/dashboard/DrillDownModal";
import { MarketData, calculateCAGR, SegmentData, YearlyData } from "@/hooks/useMarketData";
import { MainTabType } from "@/components/dashboard/MainNavigation";
import { useDrillDown } from "@/hooks/useDrillDown";

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
  const { drillDownState, openDrillDown, closeDrillDown } = useDrillDown();

  // Calculate KPI values
  const currentMarketValue = marketData.totalMarket.find((d) => d.year === selectedYear)?.value ?? 0;
  const value2024 = marketData.totalMarket.find((d) => d.year === 2024)?.value ?? 0;
  const value2034 = marketData.totalMarket.find((d) => d.year === 2034)?.value ?? 0;
  const cagr2024to2034 = calculateCAGR(value2024, value2034, 10);

  // Handle slice click for drill-down modal
  const handleSliceClick = (
    segmentName: string,
    segmentData: YearlyData[],
    color: string,
    donutType: MainTabType
  ) => {
    // Determine related segments based on donut type
    let relatedSegments: { title: string; data: SegmentData[] } | undefined;
    
    switch (donutType) {
      case "endUser":
        relatedSegments = { title: "By Region", data: marketData.region };
        break;
      case "aircraft":
        relatedSegments = { title: "By Application", data: marketData.application };
        break;
      case "region":
        relatedSegments = { title: "By End User", data: marketData.endUser };
        break;
      case "application":
        relatedSegments = { title: "By Aircraft Type", data: marketData.aircraftType };
        break;
      case "equipment":
        relatedSegments = { title: "By End User", data: marketData.endUser };
        break;
    }

    openDrillDown(segmentName, segmentData, color, relatedSegments);
  };

  return (
    <div className="space-y-8">
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
          Click any slice to see detailed analysis
        </p>
        <DistributionDonutsRow
          endUserData={marketData.endUser}
          aircraftData={marketData.aircraftType}
          regionData={marketData.region}
          applicationData={marketData.application}
          equipmentData={marketData.furnishedEquipment}
          year={selectedYear}
          onDonutClick={onNavigateToTab}
          onSliceClick={handleSliceClick}
        />
      </div>

      {/* Drill-Down Modal */}
      <DrillDownModal
        isOpen={drillDownState.isOpen}
        onClose={closeDrillDown}
        segmentName={drillDownState.segmentName}
        segmentData={drillDownState.segmentData}
        color={drillDownState.color}
        relatedSegments={drillDownState.relatedSegments}
      />
    </div>
  );
}
