// In src/components/CaseStatusPieChart.tsx
import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";

// ✅ Register chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// ✅ FIX: The component now accepts a 'data' prop and no longer fetches its own data.
export const CaseStatusPieChart = ({ data }) => {
  // ✅ FIX: Handle the loading state if data is not yet available from the parent.
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading...
      </div>
    );
  }

  // ✅ FIX: Data processing is now in the main body, using the 'data' prop.
  const chartData: ChartData<"pie"> = {
    labels: ["Pending", "In Progress", "Resolved"],
    datasets: [
      {
        label: "Cases",
        data: [
          data.pending || 0,
          data.inProgress || 0,
          data.resolved || 0,
        ],
        backgroundColor: ["#FF9F40", "#36A2EB", "#4BC0C0"],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default CaseStatusPieChart;