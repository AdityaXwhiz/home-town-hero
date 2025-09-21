// In src/components/TopCategoriesChart.tsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartData } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// ✅ FIX: The component now accepts a 'data' prop and no longer fetches its own data.
export const TopCategoriesChart = ({ data }) => {
  
  // ✅ FIX: Handle loading state if the data prop is not yet available.
  if (!data) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const chartData: ChartData<'bar'> = {
    // ✅ FIX: Using the correct key 'name' from the data prop
    labels: data.map((d: { name: string }) => d.name),
    datasets: [{
      label: 'Number of Reports',
      // ✅ FIX: Using the correct key 'value' from the data prop
      data: data.map((d: { value: number }) => d.value),
      backgroundColor: 'rgba(255, 159, 64, 0.6)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1,
    }]
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true } }
  };

  return <Bar data={chartData} options={options} />;
};