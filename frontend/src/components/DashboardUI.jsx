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

const DashboardUI = ({ transactions, categoryPercentages, amountSpent, monthlyRevenue, userData, logout, setMonth, month, handleSaveAction, handleDeleteAction, handleAddAction }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} userId={userData?.id} />
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} logout={logout} />

        {/* Dashboard content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <DashboardContent 
              transactions={transactions}
              categoryPercentages={categoryPercentages}
              amountSpent={amountSpent}
              monthlyRevenue={monthlyRevenue}
              month={month}
              setMonth={setMonth}
              handleSaveAction={handleSaveAction}
              handleDeleteAction={handleDeleteAction}
              handleAddAction={handleAddAction}
            />
        </main>
      </div>
    </div>
  )
}

const DashboardContent = ({ transactions, categoryPercentages, amountSpent, monthlyRevenue, month, setMonth, handleSaveAction, handleDeleteAction, handleAddAction }) => (
  <div className="container mx-auto px-6 py-8">
    <div className="flex pb-4">
      <select
          id="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="p-0.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <option value="">Month</option>
        <option value="01">January</option>
        <option value="02">February</option>
        <option value="03">March</option>
        <option value="04">April</option>
        <option value="05">May</option>
        <option value="06">June</option>
        <option value="07">July</option>
        <option value="08">August</option>
        <option value="09">September</option>
        <option value="10">October</option>
        <option value="11">November</option>
        <option value="12">December</option>
      </select>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Basic monthly stats */}
      <div className="flex flex-col gap-6">
        <StatCard title="Total Revenue" value={monthlyRevenue} percentage="5.4%" />
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
      categories={Object.keys(categoryPercentages)}
      handleSaveAction={handleSaveAction}
      handleDeleteAction={handleDeleteAction}
      handleAddAction={handleAddAction}
    />
  </div>
)

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

const Header = ({ setSidebarOpen, logout }) => (
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
);

export default DashboardUI