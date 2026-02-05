import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { YearlyData, calculateCAGR } from "@/hooks/useMarketData";
import { useRef } from "react";
import { useChartDownload } from "@/hooks/useChartDownload";
import { ChartDownloadButton } from "./ChartDownloadButton";

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentName: string;
  segmentData: YearlyData[];
  color: string;
}

export function DrillDownModal({
  isOpen,
  onClose,
  segmentName,
  segmentData,
  color,
}: DrillDownModalProps) {
  const trendChartRef = useRef<HTMLDivElement>(null);
  const { downloadChart } = useChartDownload();

  const currentValue = segmentData?.find((d) => d.year === 2025)?.value ?? 0;
  const forecastValue = segmentData?.find((d) => d.year === 2034)?.value ?? 0;
  const cagr = calculateCAGR(currentValue, forecastValue, 9);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
          <p className="mb-1 font-semibold text-foreground">{payload[0].payload?.year}</p>
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: color }}
            />
            <DialogTitle className="text-xl">
              {segmentName} - Deep Dive
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* KPI Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-secondary/30 p-4"
            >
              <p className="text-xs text-muted-foreground">2025 Market Size</p>
              <p className="text-xl font-bold text-foreground">
                ${(currentValue / 1000).toFixed(2)}B
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
                ${(forecastValue / 1000).toFixed(2)}B
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg border border-border bg-secondary/30 p-4"
            >
              <p className="text-xs text-muted-foreground">CAGR through 2034</p>
              <div className="flex items-center gap-1">
                <p className="text-xl font-bold text-chart-4">{cagr.toFixed(1)}%</p>
                <TrendingUp className="h-4 w-4 text-chart-4" />
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
                onClick={() => downloadChart(trendChartRef, `${segmentName}-trend`.toLowerCase().replace(/\s+/g, "-"))}
              />
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={segmentData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="drillGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={color}
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor={color}
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
                    stroke={color}
                    fill="url(#drillGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Year-over-Year Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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
                  {(segmentData ?? []).map((item, idx, arr) => {
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
