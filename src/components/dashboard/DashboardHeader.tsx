import { motion } from "framer-motion";
import stratviewLogoWhite from "@/assets/stratview-logo-white.png";

export function DashboardHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden border-b border-border bg-card/50 backdrop-blur-sm"
    >
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />

      <div className="container relative mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <img 
                src={stratviewLogoWhite} 
                alt="Stratview Research" 
                className="h-12 w-auto"
              />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                Aircraft Interiors Market
              </h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Global Market Research Dashboard • 2016-2034
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 rounded-lg bg-secondary/50 px-4 py-2 border border-border"
          >
            <div className="h-2 w-2 rounded-full bg-chart-4 animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Data updated: Q4 2024
            </span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
