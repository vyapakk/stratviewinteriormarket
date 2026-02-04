import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Plane, Globe, Layers, Settings } from "lucide-react";

export type MainTabType = "overview" | "endUser" | "aircraft" | "region" | "application" | "equipment";

interface MainNavigationProps {
  value: MainTabType;
  onChange: (value: MainTabType) => void;
}

const tabs = [
  { id: "overview" as const, label: "Market Overview", icon: BarChart3 },
  { id: "endUser" as const, label: "End-User", icon: Users },
  { id: "aircraft" as const, label: "Aircraft-Type", icon: Plane },
  { id: "region" as const, label: "Region", icon: Globe },
  { id: "application" as const, label: "Application", icon: Layers },
  { id: "equipment" as const, label: "Equipment", icon: Settings },
];

export function MainNavigation({ value, onChange }: MainNavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="w-full"
    >
      <Tabs value={value} onValueChange={(v) => onChange(v as MainTabType)} className="w-full">
        <TabsList className="bg-secondary/50 border border-border p-1 w-full flex flex-wrap justify-start gap-1 h-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 px-4 py-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split("-")[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </motion.div>
  );
}
