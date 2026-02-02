import { useCallback, RefObject } from "react";
import { toPng } from "html-to-image";
import stratviewLogoWhite from "@/assets/stratview-logo-white.png";

export function useChartDownload() {
  const downloadChart = useCallback(
    async (ref: RefObject<HTMLDivElement>, filename: string) => {
      if (!ref.current) return;

      try {
        // First capture the chart
        const chartDataUrl = await toPng(ref.current, {
          backgroundColor: "#0d3d3d",
          quality: 1,
          pixelRatio: 2,
        });

        // Create a canvas to add the watermark
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Load the chart image
        const chartImg = new Image();
        chartImg.src = chartDataUrl;

        await new Promise((resolve) => {
          chartImg.onload = resolve;
        });

        // Set canvas size to match chart
        canvas.width = chartImg.width;
        canvas.height = chartImg.height;

        // Draw the chart
        ctx.drawImage(chartImg, 0, 0);

        // Load and draw the logo watermark
        const logoImg = new Image();
        logoImg.src = stratviewLogoWhite;

        await new Promise((resolve) => {
          logoImg.onload = resolve;
        });

        // Calculate logo size (max 150px wide, proportional height)
        const maxLogoWidth = 200;
        const logoScale = maxLogoWidth / logoImg.width;
        const logoWidth = maxLogoWidth;
        const logoHeight = logoImg.height * logoScale;

        // Position logo in bottom-right corner with padding
        const padding = 20;
        const logoX = canvas.width - logoWidth - padding;
        const logoY = canvas.height - logoHeight - padding;

        // Draw semi-transparent background for logo
        ctx.fillStyle = "rgba(13, 61, 61, 0.8)";
        ctx.fillRect(logoX - 10, logoY - 10, logoWidth + 20, logoHeight + 20);

        // Draw the logo
        ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);

        // Add "Stratview Research" text below logo
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.font = "bold 16px system-ui, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("stratviewresearch.com", canvas.width - padding, canvas.height - padding + 5);

        // Convert canvas to data URL and download
        const finalDataUrl = canvas.toDataURL("image/png", 1);
        const link = document.createElement("a");
        link.download = `${filename}.png`;
        link.href = finalDataUrl;
        link.click();
      } catch (error) {
        console.error("Failed to download chart:", error);
      }
    },
    []
  );

  return { downloadChart };
}
