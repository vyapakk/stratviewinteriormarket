import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { YearlyData, SegmentData } from "@/hooks/useMarketData";
import { MousePointer2 } from "lucide-react";
import { useRef } from "react";
import { useChartDownload } from "@/hooks/useChartDownload";
import { ChartDownloadButton } from "./ChartDownloadButton";

interface MarketTrendChartProps {
  data: YearlyData[];
  segments?: SegmentData[];
  title: string;
  subtitle?: string;
  showSegments?: boolean;
  onSegmentClick?: (segmentName: string, segmentData: YearlyData[], color: string) => void;
}

const chartColors = [
  "hsl(192, 95%, 55%)",
  "hsl(38, 92%, 55%)",
  "hsl(262, 83%, 58%)",
  "hsl(142, 71%, 45%)",
  "hsl(346, 77%, 50%)",
  "hsl(199, 89%, 48%)",
];

export function MarketTrendChart({
  data,
  segments,
  title,
  subtitle,
  showSegments = false,
  onSegmentClick,
}: MarketTrendChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { downloadChart } = useChartDownload();
  const chartData = data.map((d) => {
    const point: Record<string, number> = { year: d.year, total: d.value };
    if (showSegments && segments) {
      segments.forEach((seg) => {
        const segValue = seg.data.find((s) => s.year === d.year)?.value ?? 0;
        point[seg.name] = segValue;
      });
    }
    return point;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-popover p-4 shadow-lg">
          <p className="mb-2 font-semibold text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-mono font-medium text-foreground">
                ${entry.value.toLocaleString()}M
              </span>
            </div>
          ))}
          {showSegments && segments && (
            <p className="mt-2 text-xs text-primary flex items-center gap-1">
              <MousePointer2 className="h-3 w-3" /> Click legend to drill down
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const handleLegendClick = (entry: any) => {
    if (!onSegmentClick || !segments) return;
    const segment = segments.find((s) => s.name === entry.value);
    if (segment) {
      const colorIndex = segments.indexOf(segment);
      onSegmentClick(segment.name, segment.data, chartColors[colorIndex % chartColors.length]);
    }
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {payload.map((entry: any, index: number) => (
          <div
            key={index}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-secondary/50"
            onClick={() => handleLegendClick(entry)}
          >
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">{entry.value}</span>
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
          onClick={() => downloadChart(chartRef, `market-trend-${title.toLowerCase().replace(/\s+/g, "-")}`)}
        />
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              {showSegments && segments ? (
                segments.map((seg, idx) => (
                  <linearGradient
                    key={seg.name}
                    id={`gradient-${idx}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={chartColors[idx % chartColors.length]}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={chartColors[idx % chartColors.length]}
                      stopOpacity={0}
                    />
                  </linearGradient>
                ))
              ) : (
                <linearGradient id="gradient-total" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(192, 95%, 55%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(192, 95%, 55%)" stopOpacity={0} />
                </linearGradient>
              )}
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
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}B`}
            />
            <Tooltip content={<CustomTooltip />} />
            {showSegments && segments ? (
              <>
                <Legend content={renderLegend} />
                {segments.map((seg, idx) => (
                  <Area
                    key={seg.name}
                    type="monotone"
                    dataKey={seg.name}
                    stroke={chartColors[idx % chartColors.length]}
                    fill={`url(#gradient-${idx})`}
                    strokeWidth={2}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </>
            ) : (
              <Area
                type="monotone"
                dataKey="total"
                stroke="hsl(192, 95%, 55%)"
                fill="url(#gradient-total)"
                strokeWidth={2}
                name="Market Size"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {showSegments && segments && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Click any legend item to see detailed analysis
        </p>
      )}
    </motion.div>
  );
}
