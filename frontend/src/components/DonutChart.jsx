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
    const colors = generateRandomColors(categoryPercentages.length);

    return {
      labels: categoryPercentages.map((category) => category.label),
      datasets: [
        {
          data: categoryPercentages.map((category) => category.value),
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <Doughnut
      data={doughnutData(categoryPercentages)}
      options={{
        plugins: {
          legend: { position: "bottom" },
          datalabels: {
            display: true,
            color: "#fff",
            formatter: (_, context) => {
              const categoryValues = categoryPercentages.map(
                (category) => category.value,
              ); // should we extract this?
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
  );
};

export default DonutChart;
