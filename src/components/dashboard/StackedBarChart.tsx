import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useRef, useState } from "react";
import { useChartDownload } from "@/hooks/useChartDownload";
import { ChartDownloadButton } from "./ChartDownloadButton";
import { YearlyData } from "@/hooks/useMarketData";

interface StackedBarData {
  name: string;
  oe: number;
  aftermarket: number;
  oeFullData?: YearlyData[];
  aftermarketFullData?: YearlyData[];
}

interface StackedBarChartProps {
  data: StackedBarData[];
  year: number;
  title: string;
  subtitle?: string;
  onSegmentClick?: (
    categoryName: string,
    endUserType: "OE" | "Aftermarket",
    value: number,
    fullData?: YearlyData[]
  ) => void;
}

const OE_COLOR = "hsl(192, 95%, 55%)";
const AFTERMARKET_COLOR = "hsl(38, 92%, 55%)";

export function StackedBarChart({
  data,
  year,
  title,
  subtitle,
  onSegmentClick,
}: StackedBarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { downloadChart } = useChartDownload();
  const [activeBar, setActiveBar] = useState<{ index: number; dataKey: string } | null>(null);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const oeData = payload.find((p: any) => p.dataKey === "oe");
      const aftermarketData = payload.find((p: any) => p.dataKey === "aftermarket");
      const total = (oeData?.value || 0) + (aftermarketData?.value || 0);
      const oePercent = total > 0 ? ((oeData?.value || 0) / total * 100).toFixed(1) : "0";
      const aftermarketPercent = total > 0 ? ((aftermarketData?.value || 0) / total * 100).toFixed(1) : "0";

      return (
        <div className="rounded-lg border border-border bg-popover p-4 shadow-lg">
          <p className="font-semibold text-foreground">{label}</p>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: OE_COLOR }} />
              <span className="text-muted-foreground">OE:</span>
              <span className="font-mono font-medium text-foreground">
                ${oeData?.value?.toLocaleString()}M
              </span>
              <span className="text-muted-foreground">({oePercent}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: AFTERMARKET_COLOR }} />
              <span className="text-muted-foreground">Aftermarket:</span>
              <span className="font-mono font-medium text-foreground">
                ${aftermarketData?.value?.toLocaleString()}M
              </span>
              <span className="text-muted-foreground">({aftermarketPercent}%)</span>
            </div>
            <div className="border-t border-border pt-2">
              <span className="text-muted-foreground">Total:</span>
              <span className="ml-2 font-mono font-medium text-foreground">
                ${total.toLocaleString()}M
              </span>
            </div>
          </div>
          {onSegmentClick && (
            <p className="mt-2 text-xs text-primary">Click segment to drill down</p>
          )}
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (dataKey: "oe" | "aftermarket", entry: any) => {
    if (onSegmentClick) {
      const item = data.find((d) => d.name === entry.name);
      if (item) {
        const fullData = dataKey === "oe" ? item.oeFullData : item.aftermarketFullData;
        onSegmentClick(
          entry.name,
          dataKey === "oe" ? "OE" : "Aftermarket",
          dataKey === "oe" ? item.oe : item.aftermarket,
          fullData
        );
      }
    }
  };

  const renderLegend = () => {
    return (
      <div className="mt-4 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: OE_COLOR }} />
          <span className="text-sm text-muted-foreground">OE (Original Equipment)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: AFTERMARKET_COLOR }} />
          <span className="text-sm text-muted-foreground">Aftermarket</span>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      ref={chartRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <ChartDownloadButton
          onClick={() =>
            downloadChart(chartRef, `${title.toLowerCase().replace(/\s+/g, "-")}-${year}`)
          }
        />
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              type="number"
              tickFormatter={(value) => `$${(value / 1000).toFixed(1)}B`}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              width={75}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted)/0.1)" }} />
            <Bar
              dataKey="oe"
              stackId="stack"
              fill={OE_COLOR}
              radius={[0, 0, 0, 0]}
              onClick={(entry) => handleBarClick("oe", entry)}
              style={{ cursor: onSegmentClick ? "pointer" : "default" }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`oe-${index}`}
                  fill={OE_COLOR}
                  opacity={
                    activeBar === null
                      ? 1
                      : activeBar.index === index && activeBar.dataKey === "oe"
                      ? 1
                      : 0.5
                  }
                  onMouseEnter={() => setActiveBar({ index, dataKey: "oe" })}
                  onMouseLeave={() => setActiveBar(null)}
                />
              ))}
            </Bar>
            <Bar
              dataKey="aftermarket"
              stackId="stack"
              fill={AFTERMARKET_COLOR}
              radius={[0, 4, 4, 0]}
              onClick={(entry) => handleBarClick("aftermarket", entry)}
              style={{ cursor: onSegmentClick ? "pointer" : "default" }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`aftermarket-${index}`}
                  fill={AFTERMARKET_COLOR}
                  opacity={
                    activeBar === null
                      ? 1
                      : activeBar.index === index && activeBar.dataKey === "aftermarket"
                      ? 1
                      : 0.5
                  }
                  onMouseEnter={() => setActiveBar({ index, dataKey: "aftermarket" })}
                  onMouseLeave={() => setActiveBar(null)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {renderLegend()}
    </motion.div>
  );
}
