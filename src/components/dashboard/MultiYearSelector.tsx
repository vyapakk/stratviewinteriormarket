import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { years } from "@/data/marketData";
import { CalendarRange, X } from "lucide-react";

interface MultiYearSelectorProps {
  selectedYears: number[];
  onChange: (years: number[]) => void;
  maxSelection?: number;
}

export function MultiYearSelector({ 
  selectedYears, 
  onChange,
  maxSelection = 4 
}: MultiYearSelectorProps) {
  const toggleYear = (year: number) => {
    if (selectedYears.includes(year)) {
      // Always keep at least one year selected
      if (selectedYears.length > 1) {
        onChange(selectedYears.filter((y) => y !== year));
      }
    } else {
      if (selectedYears.length < maxSelection) {
        onChange([...selectedYears, year].sort((a, b) => a - b));
      }
    }
  };

  const removeYear = (year: number) => {
    if (selectedYears.length > 1) {
      onChange(selectedYears.filter((y) => y !== year));
    }
  };

  const isCompareMode = selectedYears.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2"
    >
      <span className="text-sm font-medium text-muted-foreground">
        {isCompareMode ? "Compare Years" : "Select Year"}
      </span>
      
      {/* Selected years badges */}
      <div className="flex flex-wrap gap-1">
        {selectedYears.map((year) => (
          <Badge
            key={year}
            variant="secondary"
            className="gap-1 bg-primary/20 text-primary hover:bg-primary/30"
          >
            {year}
            {selectedYears.length > 1 && (
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => removeYear(year)}
              />
            )}
          </Badge>
        ))}
      </div>

      {/* Year picker popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <CalendarRange className="h-4 w-4" />
            {selectedYears.length < maxSelection ? "Add Year" : "Edit"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] border-border bg-popover p-4" align="end">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Select Years to Compare</h4>
              <span className="text-xs text-muted-foreground">
                {selectedYears.length}/{maxSelection}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Select up to {maxSelection} years to compare side by side
            </p>
            <div className="grid grid-cols-4 gap-2">
              {years.map((year) => {
                const isSelected = selectedYears.includes(year);
                const isDisabled = !isSelected && selectedYears.length >= maxSelection;
                return (
                  <button
                    key={year}
                    onClick={() => !isDisabled && toggleYear(year)}
                    disabled={isDisabled}
                    className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : isDisabled
                        ? "cursor-not-allowed bg-secondary/30 text-muted-foreground/50"
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
            {selectedYears.length > 1 && (
              <div className="pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => onChange([selectedYears[0]])}
                >
                  Reset to single year
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {isCompareMode && (
        <Badge variant="outline" className="border-chart-4 text-chart-4">
          Compare Mode
        </Badge>
      )}
    </motion.div>
  );
}

