import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Globe, DollarSign, BarChart3 } from "lucide-react";
import stratviewLogoColor from "@/assets/stratview-logo-color.png";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { MarketTrendChart } from "@/components/dashboard/MarketTrendChart";
import { SegmentPieChart } from "@/components/dashboard/SegmentPieChart";
import { RegionalBarChart } from "@/components/dashboard/RegionalBarChart";
import { YearSelector } from "@/components/dashboard/YearSelector";
import { MultiYearSelector } from "@/components/dashboard/MultiYearSelector";
import { YearComparisonChart } from "@/components/dashboard/YearComparisonChart";
import { SegmentTabs, SegmentType } from "@/components/dashboard/SegmentTabs";
import { ComparisonTable } from "@/components/dashboard/ComparisonTable";
import { DrillDownModal } from "@/components/dashboard/DrillDownModal";
import { useDrillDown } from "@/hooks/useDrillDown";

import {
  totalMarketData,
  endUserData,
  aircraftTypeData,
  regionData,
  applicationData,
  furnishedEquipmentData,
  countryDataByRegion,
  calculateCAGR,
  YearlyData,
} from "@/data/marketData";

const Index = () => {
  const [selectedYears, setSelectedYears] = useState<number[]>([2024]);
  const [segmentType, setSegmentType] = useState<SegmentType>("endUser");
  const { drillDownState, openDrillDown, closeDrillDown } = useDrillDown();

  // Use the first selected year for single-year views
  const primaryYear = selectedYears[0];
  const isCompareMode = selectedYears.length > 1;

  // Calculate KPI values
  const currentMarketValue = totalMarketData.find((d) => d.year === primaryYear)?.value ?? 0;
  const previousYearValue = totalMarketData.find((d) => d.year === primaryYear - 1)?.value ?? 0;
  const yoyChange = previousYearValue > 0 ? ((currentMarketValue - previousYearValue) / previousYearValue) * 100 : 0;
  
  const value2024 = totalMarketData.find((d) => d.year === 2024)?.value ?? 0;
  const value2034 = totalMarketData.find((d) => d.year === 2034)?.value ?? 0;
  const cagr2024to2034 = calculateCAGR(value2024, value2034, 10);

  // Get current segment data
  const getSegmentData = () => {
    switch (segmentType) {
      case "endUser":
        return { data: endUserData, title: "By End User Type" };
      case "aircraft":
        return { data: aircraftTypeData, title: "By Aircraft Type" };
      case "region":
        return { data: regionData, title: "By Region" };
      case "application":
        return { data: applicationData, title: "By Application" };
      case "equipment":
        return { data: furnishedEquipmentData, title: "By Equipment Type" };
      default:
        return { data: endUserData, title: "By End User Type" };
    }
  };

  const currentSegment = getSegmentData();

  // Get related segments for drill-down based on current context
  const getRelatedSegmentsForDrillDown = (segmentName: string) => {
    // For regions, show country breakdown
    if (segmentType === "region" && countryDataByRegion[segmentName]) {
      return { title: `Countries in ${segmentName}`, data: countryDataByRegion[segmentName] };
    }
    if (segmentType === "aircraft") {
      return { title: "Applications for this Aircraft Type", data: applicationData };
    }
    if (segmentType === "endUser") {
      return { title: "Regions for this End User", data: regionData };
    }
    if (segmentType === "application") {
      return { title: "Aircraft Types by Application", data: aircraftTypeData };
    }
    if (segmentType === "equipment") {
      return { title: "End Users by Equipment", data: endUserData };
    }
    return undefined;
  };

  // Handle drill-down for pie chart segments
  const handlePieSegmentClick = (segmentName: string, segmentData: YearlyData[], color: string) => {
    openDrillDown(segmentName, segmentData, color, getRelatedSegmentsForDrillDown(segmentName));
  };

  // Handle drill-down for bar chart segments (Regional Distribution)
  const handleBarClick = (segmentName: string, segmentData: YearlyData[], color: string) => {
    // For regional bar, show country breakdown
    const countryData = countryDataByRegion[segmentName];
    if (countryData) {
      openDrillDown(segmentName, segmentData, color, { title: `Countries in ${segmentName}`, data: countryData });
    } else {
      openDrillDown(segmentName, segmentData, color, { title: "Related Applications", data: applicationData });
    }
  };

  // Handle drill-down for aircraft type bar
  const handleAircraftBarClick = (segmentName: string, segmentData: YearlyData[], color: string) => {
    openDrillDown(segmentName, segmentData, color, { title: "Applications", data: applicationData });
  };

  // Handle drill-down for area chart legend
  const handleTrendSegmentClick = (segmentName: string, segmentData: YearlyData[], color: string) => {
    openDrillDown(segmentName, segmentData, color, getRelatedSegmentsForDrillDown(segmentName));
  };

  // Handle drill-down for comparison table rows
  const handleTableRowClick = (segmentName: string, segmentData: YearlyData[], color: string) => {
    openDrillDown(segmentName, segmentData, color, getRelatedSegmentsForDrillDown(segmentName));
  };

  // Handle KPI card clicks for drill-down
  const handleMarketSizeClick = () => {
    openDrillDown("Total Market", totalMarketData, "hsl(192, 95%, 55%)", { title: "By Region", data: regionData });
  };

  const handleForecastClick = () => {
    openDrillDown("2034 Forecast", totalMarketData, "hsl(38, 92%, 55%)", { title: "By Aircraft Type", data: aircraftTypeData });
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SegmentTabs value={segmentType} onChange={setSegmentType} />
          <MultiYearSelector selectedYears={selectedYears} onChange={setSelectedYears} />
        </div>

        {/* KPI Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Market Size"
            value={currentMarketValue / 1000}
            suffix="B"
            change={yoyChange}
            changeLabel="YoY"
            icon={DollarSign}
            delay={0}
            accentColor="primary"
            onClick={handleMarketSizeClick}
          />
          <KPICard
            title="2034 Forecast"
            value={value2034 / 1000}
            suffix="B"
            icon={TrendingUp}
            delay={0.1}
            accentColor="accent"
            onClick={handleForecastClick}
          />
          <KPICard
            title="10-Year CAGR"
            value={cagr2024to2034}
            prefix=""
            suffix="%"
            icon={BarChart3}
            delay={0.2}
            accentColor="chart-4"
          />
          <KPICard
            title="Regions Covered"
            value={4}
            prefix=""
            suffix=""
            decimals={0}
            icon={Globe}
            delay={0.3}
            accentColor="chart-3"
          />
        </div>

        {/* Main Charts Row */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MarketTrendChart
              data={totalMarketData}
              segments={currentSegment.data}
              title="Market Size Trend"
              subtitle="Historical and forecast data (US$ Millions) - Click legend to drill down"
              showSegments
              onSegmentClick={handleTrendSegmentClick}
            />
          </div>
          <SegmentPieChart
            data={currentSegment.data}
            year={primaryYear}
            title={currentSegment.title}
            onSegmentClick={handlePieSegmentClick}
          />
        </div>

        {/* Year Comparison Chart - Shows when multiple years selected */}
        {isCompareMode && (
          <div className="mb-8">
            <YearComparisonChart
              data={currentSegment.data}
              years={selectedYears}
              title={`${currentSegment.title} - Year Comparison`}
              subtitle={`Comparing ${selectedYears.join(", ")} market sizes`}
            />
          </div>
        )}

        {/* Secondary Charts */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RegionalBarChart
            data={regionData}
            year={primaryYear}
            title="Regional Distribution"
            subtitle={`Market size by region in ${primaryYear}`}
            onBarClick={handleBarClick}
          />
          <RegionalBarChart
            data={aircraftTypeData}
            year={primaryYear}
            title="Aircraft Type Breakdown"
            subtitle={`Market size by aircraft type in ${primaryYear}`}
            onBarClick={handleAircraftBarClick}
          />
        </div>

        {/* Comparison Table */}
        <ComparisonTable
          data={currentSegment.data}
          startYear={2024}
          endYear={2034}
          title={`${currentSegment.title} - Growth Analysis`}
          onRowClick={handleTableRowClick}
        />

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 border-t border-border pt-6"
        >
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <div>
              <p className="text-sm text-muted-foreground">
                Aircraft Interiors Market Research Report
              </p>
              <p className="text-xs text-muted-foreground/70">
                All values in US$ Millions unless otherwise specified
              </p>
            </div>
            <div className="flex items-center gap-3">
              <img 
                src={stratviewLogoColor} 
                alt="Stratview Research" 
                className="h-10 w-auto"
              />
            </div>
          </div>
        </motion.footer>
      </main>

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
};

export default Index;
