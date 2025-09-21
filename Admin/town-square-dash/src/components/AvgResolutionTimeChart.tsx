// In src/components/AvgResolutionTimeChart.tsx
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

// ✅ FIX: Register Chart.js components. This is required for Chart.js v3+.
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// ✅ FIX: The component now accepts a 'data' prop.
// The 'useState' and 'useEffect' hooks for fetching have been removed.
export const AvgResolutionTimeChart = ({ data }) => {
  // ✅ FIX: Handle the loading state if data is not yet available from the parent.
  if (!data) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }
  
  // ✅ FIX: The data processing logic is now in the main body of the component.
  // This assumes the 'data' prop is an array of objects like { name: 'Category', value: 123 }
  // Note: The original component expected average hours, but the data provided is category counts.
  // This chart will display the counts until the backend is updated to provide average resolution times.
  const chartData: ChartData<'bar'> = {
    labels: data.map((d: { name: string }) => d.name),
    datasets: [{
      label: 'Total Reports', // Changed label to reflect the actual data being shown
      data: data.map((d: { value: number }) => d.value),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, title: { display: true, text: 'Number of Reports' } } }
  };

  return <Bar data={chartData} options={options} />;
};