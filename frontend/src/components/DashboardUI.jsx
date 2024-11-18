import { useState } from 'react'
import { useUser } from '../context/UserContext';
import Card from './Card';
import TransactionTable from './TransactionTable';
import DonutChart from './DonutChart';
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
import LineChart from './LineChart';
import SelectTransaction from './SelectTransaction';
import { formatCurrency } from '../utils/util';
import { GROUP_BY_MONTHS } from '../utils/constants';
import Sidebar from './Sidebar';

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


const NewDashboard = ({ transactions, transactionDates, categoryPercentages, amountSpent, date, setDate, handleSaveAction, handleDeleteAction, handleAddAction }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();

  const dateMultipliers = {
    "3M": 3,
    "6M": 6,
    "1Y": 12,
  };

  const getMonthlyRevenue = () => {
    let monthlyRevenue = user?.income ?? window.sessionStorage.getItem("income");
    
    if (GROUP_BY_MONTHS.includes(date)) {
      monthlyRevenue *= dateMultipliers[date];
    }

    return monthlyRevenue;
  }

  const monthlyRevenue = getMonthlyRevenue();
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
            <SelectTransaction 
              availableMonths={transactionDates}
              setDate={setDate} 
              date={date}
            />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row justify-around gap-6">
              <Card>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">{"Total Saved"}</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-700">{formatCurrency(amountSaved)}</p>
                    <p className="text-sm text-gray-500">vs last month</p>
                  </div>
                </div>
              </Card>
              <Card>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">{"Total Expenses"}</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-700">{formatCurrency(amountSpent)}</p>
                    <p className="text-sm text-gray-500">vs last month</p>
                  </div>
                </div>
              </Card>
              <Card>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">{"Revenue Expense Breakdown"}</h2>
                  <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-gray-700 dark:text-white">Total Revenue</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-white">{formatCurrency(monthlyRevenue)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                    <div className="bg-slate-700 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{width: `${amountSpentPercentage || 0}%`}}> {amountSpentPercentage}%</div>
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
            {/* To prevent having a huge table. We can do pagination down the line */}
            {!GROUP_BY_MONTHS.includes(date) && (
              <TransactionTable 
                postedTransactions={transactions} 
                handleSaveAction={handleSaveAction}
                handleDeleteAction={handleDeleteAction}
                handleAddAction={handleAddAction}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default NewDashboard