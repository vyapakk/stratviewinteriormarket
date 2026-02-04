import { motion } from "framer-motion";
import { SegmentData, YearlyData } from "@/hooks/useMarketData";
import { MousePointer2, ArrowRight } from "lucide-react";

interface ComparisonTableProps {
  data: SegmentData[];
  startYear: number;
  endYear: number;
  title: string;
  onRowClick?: (segmentName: string, segmentData: YearlyData[], color: string) => void;
}

const rowColors = [
  "hsl(192, 95%, 55%)",
  "hsl(38, 92%, 55%)",
  "hsl(262, 83%, 58%)",
  "hsl(142, 71%, 45%)",
  "hsl(346, 77%, 50%)",
  "hsl(199, 89%, 48%)",
  "hsl(280, 65%, 60%)",
  "hsl(60, 70%, 50%)",
];

export function ComparisonTable({
  data,
  startYear,
  endYear,
  title,
  onRowClick,
}: ComparisonTableProps) {
  const tableData = data.map((segment, index) => {
    const startValue = segment.data.find((d) => d.year === startYear)?.value ?? 0;
    const endValue = segment.data.find((d) => d.year === endYear)?.value ?? 0;
    const cagr = startValue > 0 
      ? (Math.pow(endValue / startValue, 1 / (endYear - startYear)) - 1) * 100 
      : 0;
    const growth = startValue > 0 ? ((endValue - startValue) / startValue) * 100 : 0;

    return {
      name: segment.name,
      startValue,
      endValue,
      cagr,
      growth,
      fullData: segment.data,
      color: rowColors[index % rowColors.length],
    };
  });

  const handleRowClick = (row: typeof tableData[0]) => {
    if (onRowClick) {
      onRowClick(row.name, row.fullData, row.color);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {startYear} vs {endYear} Comparison
            </p>
          </div>
          {onRowClick && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MousePointer2 className="h-3 w-3" />
              <span>Click rows to drill down</span>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Segment
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {startYear}
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {endYear}
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                CAGR
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Growth
              </th>
              {onRowClick && (
                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tableData.map((row, idx) => (
              <motion.tr
                key={row.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.05 }}
                onClick={() => handleRowClick(row)}
                className={`transition-colors ${
                  onRowClick ? "cursor-pointer hover:bg-secondary/40" : "hover:bg-secondary/20"
                }`}
              >
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: row.color }}
                    />
                    {row.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-mono text-sm text-muted-foreground">
                  ${row.startValue.toLocaleString()}M
                </td>
                <td className="px-6 py-4 text-right font-mono text-sm text-foreground">
                  ${row.endValue.toLocaleString()}M
                </td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={`font-mono text-sm font-medium ${
                      row.cagr >= 0 ? "text-chart-4" : "text-destructive"
                    }`}
                  >
                    {row.cagr >= 0 ? "+" : ""}
                    {row.cagr.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={`font-mono text-sm font-medium ${
                      row.growth >= 0 ? "text-chart-4" : "text-destructive"
                    }`}
                  >
                    {row.growth >= 0 ? "+" : ""}
                    {row.growth.toFixed(0)}%
                  </span>
                </td>
                {onRowClick && (
                  <td className="px-6 py-4 text-right">
                    <ArrowRight className="h-4 w-4 text-muted-foreground inline-block" />
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
