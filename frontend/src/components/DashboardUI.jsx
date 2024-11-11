import React, { useState } from 'react';
import Sidebar from "../components/Sidebar";
import { Menu } from "lucide-react";
import DonutChart from "../components/DonutChart";
import HorizontalBarChart from "../components/HorizontalBarChart";
import { formattedDate } from '../utils/util';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import TransactionTable from './TransactionTable';
import { useUser } from '../context/UserContext';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

const DashboardUI = ({ transactions, categoryPercentages, amountSpent, setMonth, month, handleSaveAction, handleDeleteAction, handleAddAction, transactionDates=[] }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />

        {/* Dashboard content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <DashboardContent 
              transactions={transactions}
              categoryPercentages={categoryPercentages}
              amountSpent={amountSpent}
              month={month}
              setMonth={setMonth}
              handleSaveAction={handleSaveAction}
              handleDeleteAction={handleDeleteAction}
              handleAddAction={handleAddAction}
              transactionDates={transactionDates}
            />
        </main>
      </div>
    </div>
  )
}

const DashboardContent = ({ transactions, transactionDates, categoryPercentages, amountSpent, month, setMonth, handleSaveAction, handleDeleteAction, handleAddAction }) => {
  const { user } = useUser();

  const monthlyRevenue = user?.income || window.sessionStorage.getItem("income");
  const amountSaved = Math.round((monthlyRevenue - amountSpent) * 100)/100;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex pb-4">
        <select
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="p-0.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
          <option value="">Date</option>
          {transactionDates.map((date, index) => (
            <option key={index} value={date}>{date}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic monthly stats */}
        <div className="flex flex-col gap-6">
          <StatCard title="Total Saved" value={amountSaved} percentage="5.4%" />
          <StatCard title="Total Expenses" value={amountSpent} percentage="3.5%"  />
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
            <HorizontalBarChart
              amountSpent={amountSpent}
              monthlyRevenue={monthlyRevenue}
            />
          </div>
        </div>
      </div>

      {/* Additional content */}
      <TransactionTable 
        postedTransactions={transactions} 
        handleSaveAction={handleSaveAction}
        handleDeleteAction={handleDeleteAction}
        handleAddAction={handleAddAction}
      />
    </div>
  )
}

const StatCard = ({ title, value }) => (
<div className="bg-white rounded-lg shadow-sm p-6 flex-grow flex flex-col justify-center">
  <h2 className="text-xl font-semibold mb-4 text-gray-700">{title}</h2>
  <div className="flex items-center justify-between">
    <div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">vs last month</p>
    </div>
  </div>
</div>
);

const Header = ({ setSidebarOpen }) => {
  const { logout } = useUser();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden text-gray-500 hover:text-gray-800"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 mr-4">John Doe</span>
          <div className="h-8 w-8 rounded-full bg-gray-300"></div>
          {logout && (
            <button
              className="p-2 bg-gray-50 font-semibold rounded-xs shadow-sm text-sm"
              onClick={() => logout()}
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </header>
  )
};

export default DashboardUI