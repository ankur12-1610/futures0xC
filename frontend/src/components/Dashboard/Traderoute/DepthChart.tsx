import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Provider, Network } from "aptos";

interface Order {
  lvg: string;
  qty: string;
  stock_price: string;
  user_address: string;
}
interface Depth {
  key: string;
  value: string;
}
const DepthChart = ({
  side,
  data,
}: {
  side: "bids" | "asks";
  data: Depth[];
}) => {
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<Chart<"bar"> | null>(null);

  useEffect(() => {
    const quantities = data.map((item) => item.value);
    const labels = data.map((item) => item.key);
    if (chartInstance) {
      chartInstance.destroy(); // Destroy the previous Chart instance
    }

    const ctx = barChartRef.current.getContext("2d");
    const barOptions = {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            barPercentage: 1,
            maxBarThickness: 20,
            // BarThickness: 20,
            label: side === "bids" ? "Bids" : "Asks",
            data: quantities,
            backgroundColor:
              side === "bids"
                ? "rgba(34, 197, 94, 0.5)"
                : "rgba(239, 68, 68, 0.5)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y",
        animation: {
          duration: 0, // Set duration to 0 to disable animation
        },
        scales: {
          x: {
            reverse: true, // Display bars from right to left
            beginAtZero: true,
            position: side === "bids" ? "bottom" : "top",
            ticks: {
              color: "teal",
            },
            grid: {
              display: false,
            },
          },
          y: {
            stacked: true, // Stack the bars
            ticks: {
              color: "teal",
            },
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => `${context.label}: ${context.parsed.x}`, // Show price on top of the bars in tooltips
            },
          },
        },
      },
    };
    const myChart = new Chart(ctx, barOptions);

    // Function to resize the chart canvas to match its parent height
    const resizeChart = () => {
      const parent = barChartRef?.current?.parentElement;
      const computedStyle = getComputedStyle(parent);
      const height = parseInt(computedStyle.height);

      myChart.resize(parent?.clientWidth, height);
    };

    // Initial resize and event listener for window resize
    resizeChart();
    window.addEventListener("resize", resizeChart);

    () => window.removeEventListener("resize", resizeChart);
    setChartInstance((curr) => (curr = myChart));
  }, [data]);

  return <canvas ref={barChartRef} style={{ width: "100%", height: "100%" }} />;
};

export default DepthChart;
