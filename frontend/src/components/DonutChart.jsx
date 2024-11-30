import React from "react";
import { Doughnut } from 'react-chartjs-2';
import { useUser } from "../context/UserContext";

const DonutChart = ({ categoryPercentages }) => {
  const { user } = useUser();
  const { categories } = user;

  function generateRandomColors(numColors) {
    return Array.from({ length: numColors }, () => {
      const hue = Math.floor(Math.random() * 360);
      const saturation = Math.floor(Math.random() * 25) + 70; // 70-95%
      const lightness = Math.floor(Math.random() * 15) + 75; // 75-90%
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });
  }

  const doughnutData = (categoryPercentages) => {
    const colors = generateRandomColors(Object.entries(categoryPercentages).length);
  
    return {
      labels: Object.keys(categoryPercentages).map(
        (category_id) => categories[category_id]?.name ?? 'Uncategorized'
      ),
      datasets: [
        {
          data: Object.values(categoryPercentages),
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <>
      {categoryPercentages && (
        <Doughnut
          data={doughnutData(categoryPercentages)}
          options={{
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  padding: 12,
                  usePointStyle: true,
                  pointStyle: 'circle',
                  font: {
                    size: 12,
                    weight: 500
                  }
                }
              },
              datalabels: {
                display: true,
                color: "#fff",
                formatter: (_, context) => {
                  const categoryValues = Object.values(categoryPercentages);
                  const total = categoryValues.reduce((acc, curr) => acc + curr, 0);
                  const staticLabels = categoryValues.map(
                    (value) => `${Math.round((value / total) * 100)}%`,
                  );
                  return staticLabels[context.dataIndex];
                },
                font: {
                  size: 13,
                  weight: 500,
                },
              },
            },
            cutout: "70%",
            maintainAspectRatio: false,
          }}
        />
      )}
    </>
  );
};

export default DonutChart;
