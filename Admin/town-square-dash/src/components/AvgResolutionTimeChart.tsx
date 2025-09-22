import React from 'react';
import { Bar } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';

export const AvgResolutionTimeChart = ({ data }) => {
  if (!data) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const chartData: ChartData<'bar'> = {
    labels: data.map((d: { category: string }) => d.category),
    datasets: [{
      label: 'Average Hours to Resolve',
      data: data.map((d: { avg_hours: string }) => parseFloat(d.avg_hours)),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }]
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, title: { display: true, text: 'Hours' } } }
  };

  return <Bar data={chartData} options={options} />;
};
