import React, { useState, useEffect } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { api } from '../axios';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [categoryPercentages, setCategoryPercentages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    api.get('/transactions')
      .then(response => {
        setTransactions(response.data.transactions)
      })
      .catch(error => console.error('Error fetching transactions:', error));

    api.get('/categories/percentages')
      .then(response => {
        console.log(response.data)
        setCategoryPercentages(response.data.categories)
      })
      .catch(error => console.error('Error fetching category percentages:', error));
  }, []);

  function generateRandomColors(numColors) {
    return Array.from({ length: numColors }, () => 
      `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
    );
  }

  const doughnutData = (categoryPerc) => {
    const colors = generateRandomColors(categoryPerc.length)

    return {
      labels: categoryPerc.map(category => category.label),
      datasets: [
        {
          data: categoryPerc.map(category => category.value),
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
        },
      ],
    }
  };

  const barData = {
    labels: ['Sep'],
    datasets: [
      {
        label: 'Revenue',
        data: [65],
        backgroundColor: 'rgba(0, 214, 180, 0.6)',
      },
      {
        label: 'Expenses',
        data: [45],
        backgroundColor: 'rgba(51, 51, 51, 0.6)',
      },
    ]
  };

  const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'This Week',
        data: [12, 19, 3, 5, 2, 3, 9],
        borderColor: '#00D6B4',
        backgroundColor: 'rgba(0, 214, 180, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Last Week',
        data: [8, 15, 5, 7, 4, 5, 7],
        borderColor: '#333333',
        backgroundColor: 'rgba(51, 51, 51, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const barOptions = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Revenue vs Expenses',
      },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Daily Performance',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };


  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen}/>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-500 hover:text-gray-800">
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">John Doe</span>
              <div className="h-8 w-8 rounded-full bg-gray-300"></div>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Category Breakdown</h2>
                <div className="aspect-square">
                  <Doughnut data={doughnutData(categoryPercentages)} options={{ plugins: { legend: { position: 'bottom' } } }} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Revenue vs Expenses</h2>
                <div className="aspect-square">
                  <Bar data={barData} options={barOptions} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Performance Trend</h2>
                <div className="aspect-square">
                  <Line data={lineData} options={lineOptions} />
                </div>
              </div>
            </div>
            
            {/* Additional content */}
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Recent Transactions</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${transaction.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800`}>
                            {transaction.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;