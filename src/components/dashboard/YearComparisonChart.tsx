import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { SegmentData } from "@/data/marketData";
import { useRef } from "react";
import { useChartDownload } from "@/hooks/useChartDownload";
import { ChartDownloadButton } from "./ChartDownloadButton";

interface YearComparisonChartProps {
  data: SegmentData[];
  years: number[];
  title: string;
  subtitle?: string;
}

const yearColors: Record<number, string> = {
  2016: "hsl(192, 95%, 55%)",
  2017: "hsl(199, 89%, 48%)",
  2018: "hsl(205, 84%, 50%)",
  2019: "hsl(38, 92%, 55%)",
  2020: "hsl(346, 77%, 50%)",
  2021: "hsl(0, 72%, 55%)",
  2022: "hsl(262, 83%, 58%)",
  2023: "hsl(280, 65%, 60%)",
  2024: "hsl(142, 71%, 45%)",
  2025: "hsl(160, 60%, 45%)",
  2026: "hsl(175, 55%, 45%)",
  2027: "hsl(38, 70%, 50%)",
  2028: "hsl(25, 80%, 55%)",
  2029: "hsl(15, 85%, 55%)",
  2030: "hsl(262, 70%, 55%)",
  2031: "hsl(280, 60%, 55%)",
  2032: "hsl(300, 55%, 55%)",
  2033: "hsl(320, 65%, 55%)",
  2034: "hsl(340, 75%, 55%)",
};

export function YearComparisonChart({
  data,
  years,
  title,
  subtitle,
}: YearComparisonChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { downloadChart } = useChartDownload();

  // Transform data for grouped bar chart
  const chartData = data.map((segment) => {
    const entry: Record<string, string | number> = { name: segment.name };
    years.forEach((year) => {
      entry[year.toString()] = segment.data.find((d) => d.year === year)?.value ?? 0;
    });
    return entry;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-popover p-4 shadow-lg">
          <p className="mb-2 font-semibold text-foreground">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
                <span className="font-mono font-medium text-foreground">
                  ${entry.value.toLocaleString()}M
                </span>
              </div>
            ))}
          </div>
          {payload.length > 1 && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Change ({years[0]}→{years[years.length - 1]})</span>
                <span className={`font-mono ${
                  payload[payload.length - 1].value > payload[0].value 
                    ? "text-chart-4" 
                    : "text-destructive"
                }`}>
                  {((payload[payload.length - 1].value - payload[0].value) / payload[0].value * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      ref={chartRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
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
          onClick={() => downloadChart(chartRef, `year-comparison-${years.join("-")}`)}
        />
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(217, 33%, 18%)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="hsl(215, 20%, 55%)"
              fontSize={11}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis
              stroke="hsl(215, 20%, 55%)"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(1)}B`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => <span className="text-muted-foreground text-xs">{value}</span>}
            />
            {years.map((year) => (
              <Bar
                key={year}
                dataKey={year.toString()}
                name={year.toString()}
                fill={yearColors[year] || "hsl(192, 95%, 55%)"}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
