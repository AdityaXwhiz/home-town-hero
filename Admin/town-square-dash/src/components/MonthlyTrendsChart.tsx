import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import type { ChartData } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const MonthlyTrendsChart = ({ data }) => {
  if (!data || !data.labels || !data.datasets) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const chartData: ChartData<'bar'> = {
    labels: data.labels,
    datasets: [
      {
        label: 'Cases Created',
        data: data.datasets[0].data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderRadius: 4,
      },
      {
        label: 'Cases Resolved',
        data: data.datasets[1].data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderRadius: 4,
      },
    ],
  };

  return <Bar options={{ responsive: true, maintainAspectRatio: false }} data={chartData} />;
};
