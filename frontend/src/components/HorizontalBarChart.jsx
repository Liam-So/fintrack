import React from 'react';
import { Bar } from 'react-chartjs-2';

const HorizontalBarChart = ({ amountSpent }) => {
  const barData = {
    labels: ["Sep"],
    datasets: [
      {
        label: "Revenue",
        data: [6000],
        backgroundColor: "rgba(0, 214, 180, 0.6)",
        borderRadius: 10
      },
      {
        label: "Expenses",
        data: [amountSpent],
        backgroundColor: "rgba(51, 51, 51, 0.6)",
        borderRadius: 10
      },
    ],
  };

  const barOptions = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Revenue vs Expenses",
      },
    },
    barPercentage: 0.8,  // Adjust this value to control bar width
    categoryPercentage: 0.3  // Adjust this value to control category width
  };



  return (
    <Bar
      data={barData}
      options={{ ...barOptions, maintainAspectRatio: false }}
    />
  )
}

export default HorizontalBarChart