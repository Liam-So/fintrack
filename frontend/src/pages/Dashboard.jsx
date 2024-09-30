import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Menu, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { api } from '../axios';
import ChartDataLabels from "chartjs-plugin-datalabels";
import DonutChart from '../components/DonutChart';
import HorizontalBarChart from '../components/HorizontalBarChart';
import { useLocation } from 'react-router-dom';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ChartDataLabels);

const Dashboard = ({ isTrialDashboard }) => {
  const [transactions, setTransactions] = useState([]);
  const [categoryPercentages, setCategoryPercentages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [amountSpent, setAmountSpent] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  const location = useLocation();

  // Access the state
  const { state } = location;

  useEffect(() => {
    if (!isTrialDashboard) {
      api
        .get("/transactions")
        .then((response) => {
          setTransactions(response.data.transactions);
        })
        .catch((error) => console.error("Error fetching transactions:", error));

      api
        .get("/categories/percentages")
        .then((response) => {
          console.log(response.data);
          setCategoryPercentages(response.data.categories);
        })
        .catch((error) =>
          console.error("Error fetching category percentages:", error),
        );
    } else {
      setTransactions(state?.transactions || []);

      api.post("/trial/categories/percentages", { transactions: state?.transactions || [] })
        .then((response) => {
          const { data } = response;
          setCategoryPercentages(data);

          const totalAmount = Object.values(data).reduce((acc, curr) => acc + curr, 0).toFixed(2);

          setAmountSpent(totalAmount);
          setMonthlyRevenue(state?.income || 0);
        })
        .catch((error) =>
          console.error("Error fetching category percentages:", error),
        );
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-500 hover:text-gray-800"
            >
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Basic monthly stats */}
              <div className="flex flex-col gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6 flex-grow flex flex-col justify-center">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">
                    Monthly Income
                  </h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">
                        ${state?.income || 0}
                      </p>
                      <p className="text-sm text-gray-500">vs last month</p>
                    </div>
                    <div className="flex items-center text-green-500">
                      <ArrowUpIcon size={20} />
                      <span className="text-lg font-semibold ml-1">8.2%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 flex-grow flex flex-col justify-center">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">
                    Amount Spent
                  </h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">${amountSpent}</p>
                      <p className="text-sm text-gray-500">vs last month</p>
                    </div>
                    <div className="flex items-center text-red-500">
                      <ArrowDownIcon size={20} />
                      <span className="text-lg font-semibold ml-1">3.5%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Category Breakdown
                </h2>
                <div className="flex-grow flex items-center justify-center">
                  <div className="aspect-square">
                    <DonutChart categoryPercentages={categoryPercentages} />
                  </div>
                </div>
              </div>
              
              {/* Revenue vs Expenses */}
              <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Revenue vs Expenses
                </h2>
                <div className="flex-grow">
                  <HorizontalBarChart amountSpent={amountSpent} monthlyRevenue={monthlyRevenue} />
                </div>
              </div>

            </div>

            {/* Additional content */}
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Recent Transactions
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${transaction.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800`}
                          >
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