import React from 'react';
import { Bar } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';

// ChartJS registration is handled in other components, assuming they load first.
// For standalone safety, you would register components here too.

export const TopCategoriesChart = ({ data }) => {
  if (!data) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const chartData: ChartData<'bar'> = {
    labels: data.map((d: { category: string }) => d.category),
    datasets: [{
      label: 'Number of Reports',
      data: data.map((d: { count: number }) => d.count),
      backgroundColor: 'rgba(255, 159, 64, 0.6)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1,
    }]
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true } }
  };

  return <Bar data={chartData} options={options} />;
};
