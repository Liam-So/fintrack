import React from "react";
import { Doughnut } from 'react-chartjs-2';

const DonutChart = ({ categoryPercentages }) => {
  function generateRandomColors(numColors) {
    return Array.from(
      { length: numColors },
      () =>
        `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`,
    );
  }

  const doughnutData = (categoryPercentages) => {
    const colors = generateRandomColors(Object.entries(categoryPercentages).length);

    return {
      labels: Object.keys(categoryPercentages),
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
    {categoryPercentages ? (
      <Doughnut
        data={doughnutData(categoryPercentages)}
        options={{
          plugins: {
            legend: { position: "bottom" },
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
    ) : (
      <p className="text-md">
      No data 💀
      </p>
    )}
    </>
  );
};

export default DonutChart;
