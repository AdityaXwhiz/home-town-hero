// In src/components/MonthlyTrendsChart.tsx
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

// This component now receives the raw 'recentReports' array as 'data'
export const MonthlyTrendsChart = ({ data: recentReports }) => {
  if (!recentReports) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  // ✅ FIX: Process the raw report data into the format needed by the chart.
  // This logic groups reports by month and counts created vs. resolved.
  const processDataForChart = () => {
    const trends = {}; // e.g., { 'September 2025': { created: 5, resolved: 2 } }

    recentReports.forEach(report => {
      const date = new Date(report.created_at);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

      if (!trends[monthYear]) {
        trends[monthYear] = { created: 0, resolved: 0 };
      }

      trends[monthYear].created += 1;
      if (report.status === 'Resolved') {
        trends[monthYear].resolved += 1;
      }
    });

    const labels = Object.keys(trends).reverse();
    const createdData = labels.map(label => trends[label].created);
    const resolvedData = labels.map(label => trends[label].resolved);

    return { labels, createdData, resolvedData };
  };

  const { labels, createdData, resolvedData } = processDataForChart();

  const chartData: ChartData<'bar'> = {
    labels: labels,
    datasets: [
      {
        label: 'Cases Created',
        data: createdData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderRadius: 4,
      },
      {
        label: 'Cases Resolved',
        data: resolvedData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderRadius: 4,
      },
    ],
  };

  return <Bar options={{ responsive: true, maintainAspectRatio: false }} data={chartData} />;
};