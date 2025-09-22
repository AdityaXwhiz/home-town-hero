import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export const CaseStatusPieChart = ({ data }) => {
  if (!data) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const chartData: ChartData<"pie"> = {
    labels: ["Pending", "In Progress", "Resolved", "Rejected"],
    datasets: [
      {
        label: "Cases",
        data: [
          data.pending || 0,
          data.inProgress || 0,
          data.resolved || 0,
          data.rejected || 0,
        ],
        backgroundColor: ["#FFC107", "#03A9F4", "#4CAF50", "#F44336"],
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
