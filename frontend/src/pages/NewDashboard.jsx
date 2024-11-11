import { useState } from 'react'
import { Home, Settings, User, Upload, LogOut, PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Card from '../components/Card';
import TransactionTable from '../components/TransactionTable';
import DonutChart from '../components/DonutChart';
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
  Filler
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import LineChart from '../components/LineChart';
import SelectTransaction from '../components/SelectTransaction';

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
  Filler
);

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useUser();

  return (
    <>
      {/* Mobile Menu Button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 text-gray-500 hover:text-gray-800"
        >
          <PanelLeftOpen size={24} />
        </button>
      )}

      {/* Sidebar */}
      <aside className={`text-gray-800 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out border-r border-gray-200`}>
        <nav className="space-y-3 px-4">
          <div className="flex flex-col items-center justify-between mb-6 gap-4">
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-800">
              <PanelRightOpen size={24} />
            </button>
            <span className="text-4xl font-bold text-gray-800">💸</span>
          </div>
          <ul>
            <SidebarItem icon={Home} />
            <SidebarItem icon={Upload} link={`/upload/${user?.id}`} />
            <SidebarItem icon={Settings} />
            <SidebarItem icon={User} link={"/profile"} />
            <div onClick={() => logout()}>
              <SidebarItem icon={LogOut} />
            </div>
          </ul>
        </nav>
      </aside>
    </>
  )
}

const SidebarItem = ({ icon: Icon, link = "#" }) => (
  <li className="mb-6">
    <Link to={link} className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200">
      <Icon size={24} />
    </Link>
  </li>
);


const NewDashboard = ({ transactions, transactionDates, categoryPercentages, amountSpent, month, setMonth, handleSaveAction, handleDeleteAction, handleAddAction }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user } = useUser();
  const monthlyRevenue = user?.income || window.sessionStorage.getItem("income");
  const amountSaved = Math.round((monthlyRevenue - amountSpent) * 100)/100;
  const amountSpentPercentage = Math.round(amountSpent / monthlyRevenue * 100);
  
  return (
    <div className='flex min-h-screen bg-custom'>
      <Sidebar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col">
        {/* Main content */}
        <div className="container mx-auto px-6 py-8">
          {/* Insert Header here */}
          <div className="flex justify-between py-4">
            <h2 className='text-2xl italic font-semibold text-gray-800'>
              Income Tracking
            </h2>

            {/* TODO: Make this cleaner */}
            {/* <SelectTransaction /> */}
            <select
              id="month"
              value={month || ""}
              onChange={(e) => setMonth(e.target.value)}
              className="p-0.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Date</option>
              {transactionDates.map((date, index) => (
                <option key={index} value={date}>{date}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row justify-around gap-6">
              <Card>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">{"Total Saved"}</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-700">${amountSaved}</p>
                    <p className="text-sm text-gray-500">vs last month</p>
                  </div>
                </div>
              </Card>
              <Card>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">{"Total Expenses"}</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-700">${amountSpent}</p>
                    <p className="text-sm text-gray-500">vs last month</p>
                  </div>
                </div>
              </Card>
              <Card>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">{"Revenue Expense Breakdown"}</h2>
                  <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-gray-700 dark:text-white">Monthly Revenue</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-white">${monthlyRevenue}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                    <div className="bg-slate-700 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{width: `${amountSpentPercentage}%`}}> {amountSpentPercentage}%</div>
                  </div>
              </Card>
            </div>

            <div className="flex flex-col lg:flex-row justify-around gap-6">

              <Card>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">{"Category Breakdown"}</h2>
                {/* Lock the chart in the card */}
                <div className="flex-grow flex items-center justify-center">
                  <div className="aspect-square">
                    <DonutChart categoryPercentages={categoryPercentages} />
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">{"Transaction Trend"}</h2>
                <LineChart transactions={transactions} />
              </Card>

            </div>

            <TransactionTable 
              postedTransactions={transactions} 
              handleSaveAction={handleSaveAction}
              handleDeleteAction={handleDeleteAction}
              handleAddAction={handleAddAction}
            />
          </div>
        </div>

      </div>
    </div>
  )
}

export default NewDashboard