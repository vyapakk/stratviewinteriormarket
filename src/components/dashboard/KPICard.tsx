import { motion } from "framer-motion";
import { LucideIcon, MousePointer2 } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  delay?: number;
  accentColor?: "primary" | "accent" | "chart-3" | "chart-4";
  onClick?: () => void;
}

const accentColors = {
  primary: "from-primary/20 to-transparent border-primary/30",
  accent: "from-accent/20 to-transparent border-accent/30",
  "chart-3": "from-chart-3/20 to-transparent border-chart-3/30",
  "chart-4": "from-chart-4/20 to-transparent border-chart-4/30",
};

const iconColors = {
  primary: "text-primary",
  accent: "text-accent",
  "chart-3": "text-chart-3",
  "chart-4": "text-chart-4",
};

export function KPICard({
  title,
  value,
  prefix = "$",
  suffix = "B",
  decimals = 1,
  change,
  changeLabel,
  icon: Icon,
  delay = 0,
  accentColor = "primary",
  onClick,
}: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      onClick={onClick}
      className={`stat-card rounded-xl bg-gradient-to-br ${accentColors[accentColor]} border p-6 backdrop-blur-sm ${
        onClick ? "cursor-pointer hover:shadow-lg transition-shadow" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {onClick && (
              <MousePointer2 className="h-3 w-3 text-muted-foreground/50" />
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <AnimatedCounter
              value={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
              className="text-3xl font-bold text-foreground"
            />
          </div>
          {change !== undefined && (
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium ${
                  change >= 0 ? "text-chart-4" : "text-destructive"
                }`}
              >
                {change >= 0 ? "+" : ""}
                {change.toFixed(1)}%
              </span>
              {changeLabel && (
                <span className="text-xs text-muted-foreground">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div
          className={`rounded-lg bg-secondary/50 p-3 ${iconColors[accentColor]}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}
