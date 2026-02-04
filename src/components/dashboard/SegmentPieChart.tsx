import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Sector,
} from "recharts";
import { SegmentData, YearlyData } from "@/hooks/useMarketData";
import { useState, useRef } from "react";
import { MousePointer2 } from "lucide-react";
import { useChartDownload } from "@/hooks/useChartDownload";
import { ChartDownloadButton } from "./ChartDownloadButton";

interface SegmentPieChartProps {
  data: SegmentData[];
  year: number;
  title: string;
  onSegmentClick?: (segmentName: string, segmentData: YearlyData[], color: string) => void;
}

const chartColors = [
  "hsl(192, 95%, 55%)",
  "hsl(38, 92%, 55%)",
  "hsl(262, 83%, 58%)",
  "hsl(142, 71%, 45%)",
  "hsl(346, 77%, 50%)",
  "hsl(199, 89%, 48%)",
  "hsl(280, 65%, 60%)",
  "hsl(60, 70%, 50%)",
];

export function SegmentPieChart({ data, year, title, onSegmentClick }: SegmentPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const { downloadChart } = useChartDownload();

  const pieData = data.map((segment, index) => ({
    name: segment.name,
    value: segment.data.find((d) => d.year === year)?.value ?? 0,
    fullData: segment.data,
    color: chartColors[index % chartColors.length],
  }));

  const total = pieData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="rounded-lg border border-border bg-popover p-4 shadow-lg">
          <p className="font-semibold text-foreground">{data.name}</p>
          <div className="mt-1 space-y-1 text-sm">
            <p className="text-muted-foreground">
              Value:{" "}
              <span className="font-mono font-medium text-foreground">
                ${data.value.toLocaleString()}M
              </span>
            </p>
            <p className="text-muted-foreground">
              Share:{" "}
              <span className="font-mono font-medium text-foreground">
                {percentage}%
              </span>
            </p>
          </div>
          <p className="mt-2 text-xs text-primary flex items-center gap-1">
            <MousePointer2 className="h-3 w-3" /> Click to drill down
          </p>
        </div>
      );
    }
    return null;
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.3))", cursor: "pointer" }}
        />
      </g>
    );
  };

  const handlePieClick = (data: any, index: number) => {
    if (onSegmentClick) {
      const segment = pieData[index];
      onSegmentClick(segment.name, segment.fullData, segment.color);
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
            onClick={() => handlePieClick(entry, index)}
          >
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      ref={chartRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{year} Distribution</p>
        </div>
        <ChartDownloadButton
          onClick={() => downloadChart(chartRef, `${title.toLowerCase().replace(/\s+/g, "-")}-${year}`)}
        />
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              stroke="hsl(222, 47%, 6%)"
              strokeWidth={2}
              activeIndex={activeIndex ?? undefined}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={handlePieClick}
              style={{ cursor: "pointer" }}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Click any segment to see detailed trends
      </p>
    </motion.div>
  );
}
