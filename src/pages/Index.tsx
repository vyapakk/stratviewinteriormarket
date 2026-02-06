import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import stratviewLogoColor from "@/assets/stratview-logo-color.png";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MainNavigation, MainTabType } from "@/components/dashboard/MainNavigation";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { MarketOverviewTab } from "@/pages/tabs/MarketOverviewTab";
import { SegmentDetailTab } from "@/pages/tabs/SegmentDetailTab";
import { useMarketData } from "@/hooks/useMarketData";
import { Button } from "@/components/ui/button";
import { ScrollToTop } from "@/components/dashboard/ScrollToTop";
const Index = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [activeTab, setActiveTab] = useState<MainTabType>("overview");

  // Fetch market data from external JSON
  const {
    data: marketData,
    isLoading,
    error,
    refetch
  } = useMarketData();

  // Show loading skeleton while fetching data
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state if fetch failed
  if (error || !marketData) {
    return <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">Failed to Load Data</h1>
        <p className="text-muted-foreground">{error || "Unable to load market data"}</p>
        <Button onClick={refetch} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>;
  }

  // Get segment data and title based on active tab
  const getSegmentInfo = () => {
    switch (activeTab) {
      case "endUser":
        return {
          data: marketData.endUser,
          title: "End User"
        };
      case "aircraft":
        return {
          data: marketData.aircraftType,
          title: "Aircraft Type"
        };
      case "region":
        return {
          data: marketData.region,
          title: "Region"
        };
      case "application":
        return {
          data: marketData.application,
          title: "Application"
        };
      case "equipment":
        return {
          data: marketData.furnishedEquipment,
          title: "Equipment"
        };
      default:
        return {
          data: marketData.endUser,
          title: "End User"
        };
    }
  };
  const renderTabContent = () => {
    if (activeTab === "overview") {
      return <MarketOverviewTab marketData={marketData} selectedYear={selectedYear} onYearChange={setSelectedYear} onNavigateToTab={setActiveTab} />;
    }
    const segmentInfo = getSegmentInfo();
    return <SegmentDetailTab segmentType={activeTab} segmentData={segmentInfo.data} totalMarket={marketData.totalMarket} marketData={marketData} title={segmentInfo.title} selectedYear={selectedYear} />;
  };
  return <div className="min-h-screen">
      <ScrollToTop />
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Main Navigation */}
        <div className="mb-8">
          <MainNavigation value={activeTab} onChange={setActiveTab} selectedYear={selectedYear} onYearChange={setSelectedYear} showYearSelector />
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Footer */}
        <motion.footer initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.8
      }} className="mt-12 border-t border-border pt-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <div>
              <p className="text-sm text-muted-foreground">
                Aircraft Interiors Market Research Report
              </p>
              <p className="text-xs text-muted-foreground/70">All values in US$ Million unless otherwise specified</p>
            </div>
            <div className="flex items-center gap-3">
              <img src={stratviewLogoColor} alt="Stratview Research" className="h-10 w-auto" />
            </div>
          </div>
        </motion.footer>
      </main>
    </div>;
};
export default Index;