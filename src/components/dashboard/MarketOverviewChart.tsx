import { motion } from "framer-motion";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { YearlyData } from "@/hooks/useMarketData";
import { useRef } from "react";
import { useChartDownload } from "@/hooks/useChartDownload";
import { ChartDownloadButton } from "./ChartDownloadButton";

interface MarketOverviewChartProps {
  data: YearlyData[];
  title: string;
  subtitle?: string;
}

export function MarketOverviewChart({
  data,
  title,
  subtitle,
}: MarketOverviewChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { downloadChart } = useChartDownload();

  // Calculate YoY growth for each year
  const chartData = data.map((d, index) => {
    const previousValue = index > 0 ? data[index - 1].value : null;
    const yoyGrowth = previousValue !== null 
      ? ((d.value - previousValue) / previousValue) * 100 
      : null;
    
    return {
      year: d.year,
      value: d.value,
      yoyGrowth: yoyGrowth,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const marketSize = payload.find((p: any) => p.dataKey === "value");
      const yoyGrowth = payload.find((p: any) => p.dataKey === "yoyGrowth");
      
      return (
        <div className="rounded-lg border border-border bg-popover p-4 shadow-lg">
          <p className="mb-2 font-semibold text-foreground">{label}</p>
          {marketSize && (
            <div className="flex items-center gap-2 text-sm">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: "hsl(192, 95%, 55%)" }}
              />
              <span className="text-muted-foreground">Market Size:</span>
              <span className="font-mono font-medium text-foreground">
                ${marketSize.value.toLocaleString()}M
              </span>
            </div>
          )}
          {yoyGrowth && yoyGrowth.value !== null && (
            <div className="flex items-center gap-2 text-sm mt-1">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: "hsl(38, 92%, 55%)" }}
              />
              <span className="text-muted-foreground">YoY Growth:</span>
              <span className={`font-mono font-medium ${yoyGrowth.value >= 0 ? "text-chart-4" : "text-destructive"}`}>
                {yoyGrowth.value >= 0 ? "+" : ""}{yoyGrowth.value.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderLegend = () => {
    return (
      <div className="mt-4 flex flex-wrap justify-center gap-6">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: "hsl(192, 95%, 55%)" }}
          />
          <span className="text-sm text-muted-foreground">Market Size (US$ Millions)</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: "hsl(38, 92%, 55%)" }}
          />
          <span className="text-sm text-muted-foreground">YoY Growth (%)</span>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      ref={chartRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <ChartDownloadButton
          onClick={() => downloadChart(chartRef, `market-overview-chart`)}
        />
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 60, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradient-market-size" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(192, 95%, 55%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(192, 95%, 55%)" stopOpacity={0} />
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
              yAxisId="left"
              stroke="hsl(215, 20%, 55%)"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(1)}B`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="hsl(215, 20%, 55%)"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              domain={[-5, 15]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="value"
              stroke="hsl(192, 95%, 55%)"
              strokeWidth={3}
              dot={{ fill: "hsl(192, 95%, 55%)", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="Market Size"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="yoyGrowth"
              stroke="hsl(38, 92%, 55%)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "hsl(38, 92%, 55%)", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              name="YoY Growth"
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
