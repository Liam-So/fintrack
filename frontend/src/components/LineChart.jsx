import React, { useMemo } from 'react';
import { Line } from "react-chartjs-2";
import { formatCurrency, toLocaleDateString } from '../utils/util';

const LineChart = ({ transactions }) => {
  // Aggregate data by date
  const aggregatedData = useMemo(() => {
    const grouped = transactions.reduce((acc, transaction) => {
      const dateKey = toLocaleDateString(transaction.date);
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          amount: 0,
          count: 0
        };
      }
      
      acc[dateKey].amount += transaction.amount;
      acc[dateKey].count += 1;
      return acc;
    }, {});

    // Convert to array and sort by date (ascending order)
    return Object.values(grouped)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [transactions]);

  const data = {
    labels: aggregatedData.map(item => item.date),
    datasets: [
      {
        label: "Daily Spending Total",
        data: aggregatedData.map(item => Number(item.amount.toFixed(2))), // Round to 2 decimal places
        fill: true,
        backgroundColor: "rgba(30,130,76,0.15)",
        borderColor: "rgba(30,130,76,0.8)",
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        datalabels: { display: false } // we can remove this if we want later...
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    scales: {
      y: {
        grid: {
          display: false
        },
        ticks: {
          callback: (value) => formatCurrency(value),
          maxTicksLimit: 8
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxTicksLimit: 12,
          maxRotation: 45,
          minRotation: 45,
          callback: (value, index, values) => {
            // if there are more than 20 labels, only display every 3rd label
            if (values.length > 20) {
              return index % 3 === 0 ? data.labels[index] : ''
            }
            return data.labels[index];
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const dataPoint = aggregatedData[context.dataIndex];
            return [
              `Total: ${formatCurrency(dataPoint.amount)}`,
              `Transactions: ${dataPoint.count}`
            ];
          },
          title: (tooltipItems) => {
            return new Date(tooltipItems[0].label).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              timeZone: 'UTC'  // Ensure consistent timezone rendering
            });
          }
        }
      },
      legend: {
        display: false
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="w-full p-4">
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;