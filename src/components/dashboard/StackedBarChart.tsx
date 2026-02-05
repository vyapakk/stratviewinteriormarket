import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useRef, useState } from "react";
import { useChartDownload } from "@/hooks/useChartDownload";
import { ChartDownloadButton } from "./ChartDownloadButton";
import { YearlyData } from "@/hooks/useMarketData";

interface SegmentBreakdown {
  name: string;
  value: number;
  fullData?: YearlyData[];
}

interface StackedBarData {
  name: string; // "OE" or "Aftermarket"
  segments: SegmentBreakdown[];
  total: number;
}

interface StackedBarChartProps {
  data: StackedBarData[];
  year: number;
  title: string;
  subtitle?: string;
  segmentColors: string[];
  segmentNames: string[];
  onSegmentClick?: (
    endUserType: string,
    segmentName: string,
    value: number,
    fullData?: YearlyData[]
  ) => void;
}

export function StackedBarChart({
  data,
  year,
  title,
  subtitle,
  segmentColors,
  segmentNames,
  onSegmentClick,
}: StackedBarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { downloadChart } = useChartDownload();
  const [activeSegment, setActiveSegment] = useState<{ barIndex: number; segmentIndex: number; segmentName: string } | null>(null);

  // Transform data for Recharts - each segment becomes a dataKey
  const chartData = data.map((bar) => {
    const result: Record<string, any> = { name: bar.name, total: bar.total };
    bar.segments.forEach((seg) => {
      result[seg.name] = seg.value;
      result[`${seg.name}_fullData`] = seg.fullData;
    });
    return result;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && activeSegment) {
      // Find the specific segment being hovered
      const hoveredEntry = payload.find((p: any) => p.name === activeSegment.segmentName);
      if (!hoveredEntry) return null;

      // Get the bar total from the data entry
      const dataEntry = chartData.find((d) => d.name === label);
      const barTotal = dataEntry?.total ?? payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0);
      const percent = barTotal > 0 ? ((hoveredEntry.value / barTotal) * 100).toFixed(1) : "0";

      return (
        <div className="rounded-lg border border-border bg-popover p-4 shadow-lg">
          <p className="font-semibold text-foreground">{label} - {activeSegment.segmentName} ({year})</p>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: hoveredEntry.fill }}
              />
              <span className="font-mono font-medium text-foreground">
                ${hoveredEntry.value?.toLocaleString()}M
              </span>
              <span className="text-muted-foreground">({percent}% of {label})</span>
            </div>
            <div className="mt-1 pt-1 border-t border-border flex items-center gap-2 text-muted-foreground">
              <span>Bar Total:</span>
              <span className="font-mono font-medium text-foreground">
                ${barTotal.toLocaleString()}M
              </span>
            </div>
          </div>
          {onSegmentClick && (
            <p className="mt-2 text-xs text-primary">Click to drill down</p>
          )}
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (segmentName: string, entry: any) => {
    if (onSegmentClick) {
      const value = entry[segmentName];
      const fullData = entry[`${segmentName}_fullData`];
      onSegmentClick(entry.name, segmentName, value, fullData);
    }
  };

  const renderLegend = () => {
    return (
      <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1.5 sm:gap-4">
        {segmentNames.map((name, index) => (
          <div key={name} className="flex items-center gap-1.5 sm:gap-2">
            <div
              className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: segmentColors[index % segmentColors.length] }}
            />
            <span className="text-xs sm:text-sm text-muted-foreground">{name}</span>
          </div>
        ))}
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

      <div className="h-[200px] w-full -mx-2 sm:mx-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 15, left: 60, bottom: 10 }}
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
              width={95}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted)/0.1)" }} />
            {segmentNames.map((segmentName, index) => (
              <Bar
                key={segmentName}
                dataKey={segmentName}
                stackId="stack"
                fill={segmentColors[index % segmentColors.length]}
                radius={index === segmentNames.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
                onClick={(entry) => handleBarClick(segmentName, entry)}
                style={{ cursor: onSegmentClick ? "pointer" : "default" }}
              >
                {chartData.map((entry, barIndex) => (
                  <Cell
                    key={`${segmentName}-${barIndex}`}
                    fill={segmentColors[index % segmentColors.length]}
                    opacity={
                      activeSegment === null
                        ? 1
                        : activeSegment.barIndex === barIndex && activeSegment.segmentIndex === index
                        ? 1
                        : 0.6
                    }
                    onMouseEnter={() => setActiveSegment({ barIndex, segmentIndex: index, segmentName })}
                    onMouseLeave={() => setActiveSegment(null)}
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {renderLegend()}
    </motion.div>
  );
}
