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

  const SEGMENT_COLORS = [
    "hsl(192, 95%, 55%)",
    "hsl(38, 92%, 55%)",
    "hsl(262, 83%, 58%)",
    "hsl(142, 71%, 45%)",
    "hsl(346, 77%, 50%)",
    "hsl(199, 89%, 48%)",
    "hsl(28, 80%, 52%)",
    "hsl(180, 70%, 45%)",
  ];

  // Segment name arrays for reuse
  const aircraftTypeNames = marketData.aircraftType.map((s) => s.name);
  const regionNames = marketData.region.map((s) => s.name);
  const applicationNames = marketData.application.map((s) => s.name);
  const equipmentNames = marketData.furnishedEquipment.map((s) => s.name);
  const endUserNames = ["OE", "Aftermarket"];

  // Get all countries from all regions
  const getAllCountries = (): SegmentData[] => {
    const allCountries: SegmentData[] = [];
    Object.values(marketData.countryDataByRegion).forEach((countries) => {
      allCountries.push(...countries);
    });
    return allCountries;
  };

  // Generic stacked bar data generator
  const getStackedBarData = (
    primarySegments: SegmentData[],
    stackSegments: SegmentData[]
  ) => {
    const totalMarketData = marketData.totalMarket;
    const totalMarketValue = totalMarketData.find((d) => d.year === selectedYear)?.value ?? 1;

    return primarySegments.map((primary) => {
      const primaryValue = primary.data.find((d) => d.year === selectedYear)?.value ?? 0;

      const segments = stackSegments.map((stack) => {
        const stackValue = stack.data.find((d) => d.year === selectedYear)?.value ?? 0;
        const stackRatio = stackValue / totalMarketValue;
        const segmentValue = primaryValue * stackRatio;

        const fullData = primary.data.map((d) => {
          const yearTotal = totalMarketData.find((t) => t.year === d.year)?.value ?? 1;
          const yearStack = stack.data.find((s) => s.year === d.year)?.value ?? 0;
          return { year: d.year, value: d.value * (yearStack / yearTotal) };
        });

        return { name: stack.name, value: segmentValue, fullData };
      });

      return {
        name: primary.name,
        segments,
        total: segments.reduce((sum, s) => sum + s.value, 0),
      };
    });
  };

  // End User specific: OE/Aftermarket as primary bars
  const getEndUserStackedData = (stackSegments: SegmentData[]) => {
    const oeData = marketData.endUser.find((s) => s.name.includes("OE"))?.data ?? [];
    const aftermarketData = marketData.endUser.find((s) => s.name === "Aftermarket")?.data ?? [];
    const totalMarketData = marketData.totalMarket;
    const totalMarketValue = totalMarketData.find((d) => d.year === selectedYear)?.value ?? 1;

    const oeRatio = (oeData.find((d) => d.year === selectedYear)?.value ?? 0) / totalMarketValue;
    const aftermarketRatio = (aftermarketData.find((d) => d.year === selectedYear)?.value ?? 0) / totalMarketValue;

    const createSegments = (ratio: number, endUserData: YearlyData[]) => {
      return stackSegments.map((segment) => {
        const segmentValue = segment.data.find((d) => d.year === selectedYear)?.value ?? 0;
        const value = segmentValue * ratio;

        const fullData = segment.data.map((d) => {
          const yearTotal = totalMarketData.find((t) => t.year === d.year)?.value ?? 1;
          const yearEndUser = endUserData.find((e) => e.year === d.year)?.value ?? 0;
          return { year: d.year, value: d.value * (yearEndUser / yearTotal) };
        });

        return { name: segment.name, value, fullData };
      });
    };

    const oeSegments = createSegments(oeRatio, oeData);
    const aftermarketSegments = createSegments(aftermarketRatio, aftermarketData);

    return [
      { name: "OE (Original Equipment)", segments: oeSegments, total: oeSegments.reduce((sum, s) => sum + s.value, 0) },
      { name: "Aftermarket", segments: aftermarketSegments, total: aftermarketSegments.reduce((sum, s) => sum + s.value, 0) },
    ];
  };

  // Prepare data based on tab type
  const aircraftTypeStackedData = segmentType === "endUser" ? getEndUserStackedData(marketData.aircraftType) : [];
  const regionStackedDataForEndUser = segmentType === "endUser" ? getEndUserStackedData(marketData.region) : [];

  const aircraftByRegionData = segmentType === "aircraft" ? getStackedBarData(marketData.aircraftType, marketData.region) : [];
  const aircraftByEndUserData = segmentType === "aircraft" ? getStackedBarData(marketData.aircraftType, marketData.endUser) : [];

  const regionByAircraftData = segmentType === "region" ? getStackedBarData(marketData.region, marketData.aircraftType) : [];
  const regionByApplicationData = segmentType === "region" ? getStackedBarData(marketData.region, marketData.application) : [];
  const regionByEndUserData = segmentType === "region" ? getStackedBarData(marketData.region, marketData.endUser) : [];
  const regionByEquipmentData = segmentType === "region" ? getStackedBarData(marketData.region, marketData.furnishedEquipment) : [];

  const applicationByRegionData = segmentType === "application" ? getStackedBarData(marketData.application, marketData.region) : [];

  const equipmentByRegionData = segmentType === "equipment" ? getStackedBarData(marketData.furnishedEquipment, marketData.region) : [];

  const allCountries = segmentType === "region" ? getAllCountries() : [];

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
    const allSegmentNames = [...aircraftTypeNames, ...regionNames, ...applicationNames, ...equipmentNames, ...endUserNames];
    const segmentIndex = allSegmentNames.indexOf(segmentName);
    const color = SEGMENT_COLORS[segmentIndex % SEGMENT_COLORS.length] || "hsl(192, 95%, 55%)";
    const displayName = `${segmentName} (${endUserType})`;
    if (fullData) {
      openDrillDown(displayName, fullData, color, undefined);
    }
  };

  // Tabs that hide KPI cards
  const hideKPIs = segmentType === "endUser" || segmentType === "aircraft" || segmentType === "region" || segmentType === "application" || segmentType === "equipment";

  return (
    <div className="space-y-8">
      {/* KPI Cards - Hidden for specialized tabs */}
      {!hideKPIs && (
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
      )}

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

      {/* Region Tab: Country Line Chart */}
      {segmentType === "region" && allCountries.length > 0 && (
        <MarketTrendChart
          data={totalMarket}
          segments={allCountries}
          title="Countries - Market Trend"
          subtitle="All countries historical and forecast data (US$ Millions)"
          showSegments
          onSegmentClick={handleTrendSegmentClick}
        />
      )}

      {/* End User Specific: Stacked Bar Charts */}
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
            data={regionStackedDataForEndUser}
            year={selectedYear}
            title="OE vs Aftermarket by Region"
            subtitle={`${selectedYear} breakdown - bars represent OE/Aftermarket, stacks show regions`}
            segmentColors={SEGMENT_COLORS}
            segmentNames={regionNames}
            onSegmentClick={handleStackedBarClick}
          />
        </>
      )}

      {/* Aircraft Type Specific: Stacked Bar Charts */}
      {segmentType === "aircraft" && (
        <>
          <StackedBarChart
            data={aircraftByRegionData}
            year={selectedYear}
            title="Aircraft Type by Region"
            subtitle={`${selectedYear} breakdown - bars represent aircraft types, stacks show regions`}
            segmentColors={SEGMENT_COLORS}
            segmentNames={regionNames}
            onSegmentClick={handleStackedBarClick}
          />
          <StackedBarChart
            data={aircraftByEndUserData}
            year={selectedYear}
            title="Aircraft Type by End User"
            subtitle={`${selectedYear} breakdown - bars represent aircraft types, stacks show OE/Aftermarket`}
            segmentColors={SEGMENT_COLORS}
            segmentNames={endUserNames.map((n, i) => marketData.endUser[i]?.name || n)}
            onSegmentClick={handleStackedBarClick}
          />
        </>
      )}

      {/* Region Specific: Stacked Bar Charts */}
      {segmentType === "region" && (
        <>
          <StackedBarChart
            data={regionByAircraftData}
            year={selectedYear}
            title="Region by Aircraft Type"
            subtitle={`${selectedYear} breakdown - bars represent regions, stacks show aircraft types`}
            segmentColors={SEGMENT_COLORS}
            segmentNames={aircraftTypeNames}
            onSegmentClick={handleStackedBarClick}
          />
          <StackedBarChart
            data={regionByApplicationData}
            year={selectedYear}
            title="Region by Application"
            subtitle={`${selectedYear} breakdown - bars represent regions, stacks show applications`}
            segmentColors={SEGMENT_COLORS}
            segmentNames={applicationNames}
            onSegmentClick={handleStackedBarClick}
          />
          <StackedBarChart
            data={regionByEndUserData}
            year={selectedYear}
            title="Region by End User"
            subtitle={`${selectedYear} breakdown - bars represent regions, stacks show OE/Aftermarket`}
            segmentColors={SEGMENT_COLORS}
            segmentNames={endUserNames.map((n, i) => marketData.endUser[i]?.name || n)}
            onSegmentClick={handleStackedBarClick}
          />
          <StackedBarChart
            data={regionByEquipmentData}
            year={selectedYear}
            title="Region by Equipment Type"
            subtitle={`${selectedYear} breakdown - bars represent regions, stacks show BFE/SFE`}
            segmentColors={SEGMENT_COLORS}
            segmentNames={equipmentNames}
            onSegmentClick={handleStackedBarClick}
          />
        </>
      )}

      {/* Application Specific: Stacked Bar Charts */}
      {segmentType === "application" && (
        <StackedBarChart
          data={applicationByRegionData}
          year={selectedYear}
          title="Applications by Region"
          subtitle={`${selectedYear} breakdown - bars represent applications, stacks show regions`}
          segmentColors={SEGMENT_COLORS}
          segmentNames={regionNames}
          onSegmentClick={handleStackedBarClick}
        />
      )}

      {/* Equipment Specific: Stacked Bar Charts */}
      {segmentType === "equipment" && (
        <StackedBarChart
          data={equipmentByRegionData}
          year={selectedYear}
          title="Equipment Type by Region"
          subtitle={`${selectedYear} breakdown - bars represent BFE/SFE, stacks show regions`}
          segmentColors={SEGMENT_COLORS}
          segmentNames={regionNames}
          onSegmentClick={handleStackedBarClick}
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
