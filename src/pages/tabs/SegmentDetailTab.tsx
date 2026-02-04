import { DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { MarketTrendChart } from "@/components/dashboard/MarketTrendChart";
import { SegmentPieChart } from "@/components/dashboard/SegmentPieChart";
import { RegionalBarChart } from "@/components/dashboard/RegionalBarChart";
import { ComparisonTable } from "@/components/dashboard/ComparisonTable";
import { DrillDownModal } from "@/components/dashboard/DrillDownModal";
import { StackedBarChart } from "@/components/dashboard/StackedBarChart";
import { useDrillDown } from "@/hooks/useDrillDown";
import { YearlyData, SegmentData, MarketData, calculateCAGR } from "@/hooks/useMarketData";

type SegmentType = "overview" | "endUser" | "aircraft" | "region" | "application" | "equipment";

interface SegmentDetailTabProps {
  segmentType: SegmentType;
  segmentData: SegmentData[];
  totalMarket: YearlyData[];
  marketData: MarketData;
  title: string;
  selectedYear: number;
}

export function SegmentDetailTab({
  segmentType,
  segmentData,
  totalMarket,
  marketData,
  title,
  selectedYear,
}: SegmentDetailTabProps) {
  const { drillDownState, openDrillDown, closeDrillDown } = useDrillDown();

  // Calculate KPI values
  const currentYearTotal = segmentData.reduce((sum, seg) => {
    const value = seg.data.find((d) => d.year === selectedYear)?.value ?? 0;
    return sum + value;
  }, 0);

  const value2024Total = segmentData.reduce((sum, seg) => {
    const value = seg.data.find((d) => d.year === 2024)?.value ?? 0;
    return sum + value;
  }, 0);

  const value2034Total = segmentData.reduce((sum, seg) => {
    const value = seg.data.find((d) => d.year === 2034)?.value ?? 0;
    return sum + value;
  }, 0);

  const cagr = calculateCAGR(value2024Total, value2034Total, 10);

  // Calculate OE/Aftermarket breakdown for stacked bar charts (for End User tab)
  // Returns data in format: [{ name: "OE", segments: [...], total }, { name: "Aftermarket", segments: [...], total }]
  const getStackedBarData = (segments: SegmentData[]) => {
    const oeData = marketData.endUser.find((s) => s.name.includes("OE"))?.data ?? [];
    const aftermarketData = marketData.endUser.find((s) => s.name === "Aftermarket")?.data ?? [];
    const totalMarketData = marketData.totalMarket;

    const oeRatio = (oeData.find((d) => d.year === selectedYear)?.value ?? 0) / 
                    (totalMarketData.find((d) => d.year === selectedYear)?.value ?? 1);
    const aftermarketRatio = (aftermarketData.find((d) => d.year === selectedYear)?.value ?? 0) / 
                              (totalMarketData.find((d) => d.year === selectedYear)?.value ?? 1);

    const oeSegments = segments.map((segment) => {
      const segmentValue = segment.data.find((d) => d.year === selectedYear)?.value ?? 0;
      const oeValue = segmentValue * oeRatio;
      
      // Generate full yearly data for drill-down
      const fullData = segment.data.map((d) => {
        const yearTotal = totalMarketData.find((t) => t.year === d.year)?.value ?? 1;
        const yearOE = oeData.find((o) => o.year === d.year)?.value ?? 0;
        return { year: d.year, value: d.value * (yearOE / yearTotal) };
      });

      return { name: segment.name, value: oeValue, fullData };
    });

    const aftermarketSegments = segments.map((segment) => {
      const segmentValue = segment.data.find((d) => d.year === selectedYear)?.value ?? 0;
      const aftermarketValue = segmentValue * aftermarketRatio;
      
      // Generate full yearly data for drill-down
      const fullData = segment.data.map((d) => {
        const yearTotal = totalMarketData.find((t) => t.year === d.year)?.value ?? 1;
        const yearAftermarket = aftermarketData.find((a) => a.year === d.year)?.value ?? 0;
        return { year: d.year, value: d.value * (yearAftermarket / yearTotal) };
      });

      return { name: segment.name, value: aftermarketValue, fullData };
    });

    return [
      { name: "OE (Original Equipment)", segments: oeSegments, total: oeSegments.reduce((sum, s) => sum + s.value, 0) },
      { name: "Aftermarket", segments: aftermarketSegments, total: aftermarketSegments.reduce((sum, s) => sum + s.value, 0) },
    ];
  };

  const aircraftTypeStackedData = segmentType === "endUser" ? getStackedBarData(marketData.aircraftType) : [];
  const regionStackedData = segmentType === "endUser" ? getStackedBarData(marketData.region) : [];
  const aircraftTypeNames = marketData.aircraftType.map((s) => s.name);
  const regionNames = marketData.region.map((s) => s.name);

  const SEGMENT_COLORS = [
    "hsl(192, 95%, 55%)",
    "hsl(38, 92%, 55%)",
    "hsl(262, 83%, 58%)",
    "hsl(142, 71%, 45%)",
    "hsl(346, 77%, 50%)",
    "hsl(199, 89%, 48%)",
  ];

  // Get related segments for drill-down
  const getRelatedSegmentsForDrillDown = (segmentName: string) => {
    if (segmentType === "region" && marketData.countryDataByRegion[segmentName]) {
      return { title: `Countries in ${segmentName}`, data: marketData.countryDataByRegion[segmentName] };
    }
    if (segmentType === "aircraft") {
      return { title: "Applications for this Aircraft Type", data: marketData.application };
    }
    if (segmentType === "endUser") {
      return { title: "Regions for this End User", data: marketData.region };
    }
    if (segmentType === "application") {
      return { title: "Aircraft Types by Application", data: marketData.aircraftType };
    }
    if (segmentType === "equipment") {
      return { title: "End Users by Equipment", data: marketData.endUser };
    }
    return undefined;
  };

  // Handle drill-down for pie chart segments
  const handlePieSegmentClick = (segmentName: string, data: YearlyData[], color: string) => {
    openDrillDown(segmentName, data, color, getRelatedSegmentsForDrillDown(segmentName));
  };

  // Handle drill-down for bar chart
  const handleBarClick = (segmentName: string, data: YearlyData[], color: string) => {
    if (segmentType === "region" && marketData.countryDataByRegion[segmentName]) {
      openDrillDown(segmentName, data, color, { title: `Countries in ${segmentName}`, data: marketData.countryDataByRegion[segmentName] });
    } else {
      openDrillDown(segmentName, data, color, getRelatedSegmentsForDrillDown(segmentName));
    }
  };

  // Handle drill-down for trend chart legend
  const handleTrendSegmentClick = (segmentName: string, data: YearlyData[], color: string) => {
    openDrillDown(segmentName, data, color, getRelatedSegmentsForDrillDown(segmentName));
  };

  // Handle drill-down for comparison table rows
  const handleTableRowClick = (segmentName: string, data: YearlyData[], color: string) => {
    openDrillDown(segmentName, data, color, getRelatedSegmentsForDrillDown(segmentName));
  };

  // Handle drill-down for stacked bar chart
  const handleStackedBarClick = (
    endUserType: string,
    segmentName: string,
    value: number,
    fullData?: YearlyData[]
  ) => {
    // Find the color index for this segment
    const allSegmentNames = [...aircraftTypeNames, ...regionNames];
    const segmentIndex = allSegmentNames.indexOf(segmentName);
    const color = SEGMENT_COLORS[segmentIndex % SEGMENT_COLORS.length] || "hsl(192, 95%, 55%)";
    const displayName = `${segmentName} (${endUserType})`;
    if (fullData) {
      openDrillDown(displayName, fullData, color, undefined);
    }
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard
          title={`${selectedYear} Market Size`}
          value={currentYearTotal / 1000}
          suffix="B"
          icon={DollarSign}
          delay={0}
          accentColor="primary"
        />
        <KPICard
          title="10-Year CAGR"
          value={cagr}
          prefix=""
          suffix="%"
          icon={BarChart3}
          delay={0.1}
          accentColor="chart-4"
        />
        <KPICard
          title="2034 Forecast"
          value={value2034Total / 1000}
          suffix="B"
          icon={TrendingUp}
          delay={0.2}
          accentColor="accent"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MarketTrendChart
            data={totalMarket}
            segments={segmentData}
            title={`${title} - Market Trend`}
            subtitle="Historical and forecast data (US$ Millions) - Click legend to drill down"
            showSegments
            onSegmentClick={handleTrendSegmentClick}
          />
        </div>
        <SegmentPieChart
          data={segmentData}
          year={selectedYear}
          title={title}
          onSegmentClick={handlePieSegmentClick}
        />
      </div>

      {/* End User Specific: Stacked Bar Charts for OE/Aftermarket breakdown */}
      {segmentType === "endUser" && (
        <>
          <StackedBarChart
            data={aircraftTypeStackedData}
            year={selectedYear}
            title="OE vs Aftermarket by Aircraft Type"
            subtitle={`${selectedYear} breakdown - bars represent OE/Aftermarket, stacks show aircraft types`}
            segmentColors={SEGMENT_COLORS}
            segmentNames={aircraftTypeNames}
            onSegmentClick={handleStackedBarClick}
          />
          <StackedBarChart
            data={regionStackedData}
            year={selectedYear}
            title="OE vs Aftermarket by Region"
            subtitle={`${selectedYear} breakdown - bars represent OE/Aftermarket, stacks show regions`}
            segmentColors={SEGMENT_COLORS}
            segmentNames={regionNames}
            onSegmentClick={handleStackedBarClick}
          />
        </>
      )}

      {/* Bar Chart - Show for non-End User tabs */}
      {segmentType !== "endUser" && (
        <RegionalBarChart
          data={segmentData}
          year={selectedYear}
          title={`${title} Distribution`}
          subtitle={`Market size by ${title.toLowerCase()} in ${selectedYear}`}
          onBarClick={handleBarClick}
        />
      )}

      {/* Comparison Table */}
      <ComparisonTable
        data={segmentData}
        startYear={2024}
        endYear={2034}
        title={`${title} - Growth Analysis`}
        onRowClick={handleTableRowClick}
      />

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
