import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SegmentData, YearlyData, calculateCAGR } from "@/data/marketData";
import { useState, useRef } from "react";
import { useChartDownload } from "@/hooks/useChartDownload";
import { ChartDownloadButton } from "./ChartDownloadButton";

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentName: string;
  segmentData: YearlyData[];
  color: string;
  relatedSegments?: {
    title: string;
    data: SegmentData[];
  };
}

export function DrillDownModal({
  isOpen,
  onClose,
  segmentName,
  segmentData,
  color,
  relatedSegments,
}: DrillDownModalProps) {
  const [drillLevel, setDrillLevel] = useState(0);
  const [selectedSubSegment, setSelectedSubSegment] = useState<{
    name: string;
    data: YearlyData[];
    color: string;
  } | null>(null);
  
  const trendChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const { downloadChart } = useChartDownload();

  const currentValue = segmentData.find((d) => d.year === 2024)?.value ?? 0;
  const forecastValue = segmentData.find((d) => d.year === 2034)?.value ?? 0;
  const cagr = calculateCAGR(currentValue, forecastValue, 10);
  const yoyChange = (() => {
    const v2024 = segmentData.find((d) => d.year === 2024)?.value ?? 0;
    const v2023 = segmentData.find((d) => d.year === 2023)?.value ?? 0;
    return v2023 > 0 ? ((v2024 - v2023) / v2023) * 100 : 0;
  })();

  const historicalData = segmentData.filter((d) => d.year <= 2024);
  const forecastData = segmentData.filter((d) => d.year >= 2024);

  const subSegmentColors = [
    "hsl(192, 95%, 55%)",
    "hsl(38, 92%, 55%)",
    "hsl(262, 83%, 58%)",
    "hsl(142, 71%, 45%)",
    "hsl(346, 77%, 50%)",
    "hsl(199, 89%, 48%)",
    "hsl(280, 65%, 60%)",
    "hsl(60, 70%, 50%)",
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
          <p className="mb-1 font-semibold text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">
            Value:{" "}
            <span className="font-mono font-medium text-foreground">
              ${payload[0].value.toLocaleString()}M
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const handleSubSegmentClick = (item: { name: string; value: number }, index: number) => {
    if (!relatedSegments) return;
    const segment = relatedSegments.data.find((s) => s.name === item.name);
    if (segment) {
      setSelectedSubSegment({
        name: segment.name,
        data: segment.data,
        color: subSegmentColors[index % subSegmentColors.length],
      });
      setDrillLevel(1);
    }
  };

  const handleBack = () => {
    setDrillLevel(0);
    setSelectedSubSegment(null);
  };

  const handleClose = () => {
    setDrillLevel(0);
    setSelectedSubSegment(null);
    onClose();
  };

  // Prepare sub-segment bar data
  const subSegmentBarData = relatedSegments?.data.map((seg) => ({
    name: seg.name,
    value: seg.data.find((d) => d.year === 2024)?.value ?? 0,
  })) ?? [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {drillLevel > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: drillLevel === 0 ? color : selectedSubSegment?.color }}
            />
            <DialogTitle className="text-xl">
              {drillLevel === 0 ? segmentName : selectedSubSegment?.name} - Deep Dive
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* KPI Summary */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-secondary/30 p-4"
            >
              <p className="text-xs text-muted-foreground">2024 Value</p>
              <p className="text-xl font-bold text-foreground">
                ${((drillLevel === 0 ? currentValue : selectedSubSegment?.data.find(d => d.year === 2024)?.value ?? 0) / 1000).toFixed(2)}B
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg border border-border bg-secondary/30 p-4"
            >
              <p className="text-xs text-muted-foreground">2034 Forecast</p>
              <p className="text-xl font-bold text-foreground">
                ${((drillLevel === 0 ? forecastValue : selectedSubSegment?.data.find(d => d.year === 2034)?.value ?? 0) / 1000).toFixed(2)}B
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg border border-border bg-secondary/30 p-4"
            >
              <p className="text-xs text-muted-foreground">10Y CAGR</p>
              <div className="flex items-center gap-1">
                <p className="text-xl font-bold text-chart-4">
                  {drillLevel === 0 
                    ? cagr.toFixed(1) 
                    : calculateCAGR(
                        selectedSubSegment?.data.find(d => d.year === 2024)?.value ?? 0,
                        selectedSubSegment?.data.find(d => d.year === 2034)?.value ?? 0,
                        10
                      ).toFixed(1)}%
                </p>
                <TrendingUp className="h-4 w-4 text-chart-4" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-lg border border-border bg-secondary/30 p-4"
            >
              <p className="text-xs text-muted-foreground">YoY Growth</p>
              <div className="flex items-center gap-1">
                {(() => {
                  const change = drillLevel === 0 
                    ? yoyChange 
                    : (() => {
                        const v24 = selectedSubSegment?.data.find(d => d.year === 2024)?.value ?? 0;
                        const v23 = selectedSubSegment?.data.find(d => d.year === 2023)?.value ?? 0;
                        return v23 > 0 ? ((v24 - v23) / v23) * 100 : 0;
                      })();
                  return (
                    <>
                      <p className={`text-xl font-bold ${change >= 0 ? "text-chart-4" : "text-destructive"}`}>
                        {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                      </p>
                      {change >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-chart-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      )}
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </div>

          {/* Trend Chart */}
          <motion.div
            ref={trendChartRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border border-border bg-secondary/20 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Historical & Forecast Trend</h4>
              <ChartDownloadButton
                onClick={() => downloadChart(trendChartRef, `${drillLevel === 0 ? segmentName : selectedSubSegment?.name}-trend`.toLowerCase().replace(/\s+/g, "-"))}
              />
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={drillLevel === 0 ? segmentData : selectedSubSegment?.data ?? []}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="drillGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={drillLevel === 0 ? color : selectedSubSegment?.color ?? color}
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor={drillLevel === 0 ? color : selectedSubSegment?.color ?? color}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" />
                  <XAxis
                    dataKey="year"
                    stroke="hsl(215, 20%, 55%)"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="hsl(215, 20%, 55%)"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(1)}B`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={drillLevel === 0 ? color : selectedSubSegment?.color ?? color}
                    fill="url(#drillGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Related Segments (only on first drill level) */}
          {drillLevel === 0 && relatedSegments && relatedSegments.data.length > 0 && (
            <motion.div
              ref={barChartRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-lg border border-border bg-secondary/20 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">
                  {relatedSegments.title} - Click to drill down further
                </h4>
                <ChartDownloadButton
                  onClick={() => downloadChart(barChartRef, `${segmentName}-${relatedSegments.title}`.toLowerCase().replace(/\s+/g, "-"))}
                />
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={subSegmentBarData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" horizontal vertical={false} />
                    <XAxis
                      type="number"
                      stroke="hsl(215, 20%, 55%)"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(1)}B`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="hsl(215, 20%, 55%)"
                      fontSize={11}
                      tickLine={false}
                      width={75}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="value"
                      radius={[0, 4, 4, 0]}
                      cursor="pointer"
                      onClick={(data, index) => handleSubSegmentClick(data, index)}
                    >
                      {subSegmentBarData.map((_, index) => (
                        <motion.rect
                          key={`bar-${index}`}
                          fill={subSegmentColors[index % subSegmentColors.length]}
                          whileHover={{ opacity: 0.8 }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Click any bar to see detailed trends
              </p>
            </motion.div>
          )}

          {/* Year-over-Year Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-lg border border-border bg-secondary/20 p-4"
          >
            <h4 className="mb-4 text-sm font-semibold text-foreground">Year-over-Year Data</h4>
            <div className="max-h-[200px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-secondary">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-muted-foreground">Year</th>
                    <th className="px-3 py-2 text-right text-muted-foreground">Value</th>
                    <th className="px-3 py-2 text-right text-muted-foreground">YoY Change</th>
                  </tr>
                </thead>
                <tbody>
                  {(drillLevel === 0 ? segmentData : selectedSubSegment?.data ?? []).map((item, idx, arr) => {
                    const prevValue = idx > 0 ? arr[idx - 1].value : null;
                    const change = prevValue ? ((item.value - prevValue) / prevValue) * 100 : null;
                    return (
                      <tr key={item.year} className="border-b border-border/50 hover:bg-secondary/50">
                        <td className="px-3 py-2 font-medium text-foreground">{item.year}</td>
                        <td className="px-3 py-2 text-right font-mono text-foreground">
                          ${item.value.toLocaleString()}M
                        </td>
                        <td className={`px-3 py-2 text-right font-mono ${
                          change === null ? "text-muted-foreground" : change >= 0 ? "text-chart-4" : "text-destructive"
                        }`}>
                          {change === null ? "—" : `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
