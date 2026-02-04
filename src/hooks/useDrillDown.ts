import { useState, useCallback } from "react";
import { SegmentData, YearlyData } from "@/hooks/useMarketData";

export interface DrillDownState {
  isOpen: boolean;
  segmentName: string;
  segmentData: YearlyData[];
  color: string;
  relatedSegments?: {
    title: string;
    data: SegmentData[];
  };
}

const initialState: DrillDownState = {
  isOpen: false,
  segmentName: "",
  segmentData: [],
  color: "hsl(192, 95%, 55%)",
};

export function useDrillDown() {
  const [drillDownState, setDrillDownState] = useState<DrillDownState>(initialState);

  const openDrillDown = useCallback(
    (
      segmentName: string,
      segmentData: YearlyData[],
      color: string,
      relatedSegments?: { title: string; data: SegmentData[] }
    ) => {
      setDrillDownState({
        isOpen: true,
        segmentName,
        segmentData,
        color,
        relatedSegments,
      });
    },
    []
  );

  const closeDrillDown = useCallback(() => {
    setDrillDownState(initialState);
  }, []);

  return {
    drillDownState,
    openDrillDown,
    closeDrillDown,
  };
}
