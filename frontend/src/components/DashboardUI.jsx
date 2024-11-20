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
import TimePeriodSelector from './TimePeriodSelector';
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
    30: 1,
    90: 3,
    180: 6,
    365: 12,
  };

  const getMonthlyRevenue = () => {
    let monthlyRevenue = user?.income ?? window.sessionStorage.getItem("income");
    
    if (GROUP_BY_MONTHS.includes(date.period)) {
      monthlyRevenue *= dateMultipliers[date.period];
    } else if (date.type === 'range') {
      const [startDate, endDate] = date.period.split(",");
      const monthsBetween = calculateMonthsBetween(startDate, endDate);
      monthlyRevenue *= monthsBetween;
    }

    return monthlyRevenue;
  }

  const calculateMonthsBetween = (startDate, endDate) => {
    // Ensure startDate and endDate are Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the total number of months
    const yearsDifference = end.getFullYear() - start.getFullYear();
    const monthsDifference = end.getMonth() - start.getMonth();

    // Combine years and months
    const totalMonths = yearsDifference * 12 + monthsDifference;

    return totalMonths;
  }

  const monthlyRevenue = getMonthlyRevenue();
  const amountSaved = (monthlyRevenue - amountSpent).toFixed(2);
  const amountSpentPercentage = (amountSpent / monthlyRevenue * 100).toFixed(2);

  // Initialize totals
  let essentialSum = 0;
  let nonEssentialSum = 0;

  // Iterate through the amounts
  for (const [id, amount] of Object.entries(categoryPercentages)) {
    const isEssential = user.categories[id]?.essential;
    if (isEssential === true) {
      essentialSum += amount;
    } else {
      nonEssentialSum += amount;
    }
  }

  const essentialPercentages = ((essentialSum/amountSaved)* 100).toFixed(2);
  const nonEssentialPercentages = ((nonEssentialSum/amountSaved)* 100).toFixed(2);

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
            <TimePeriodSelector 
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
                    <p className="text-sm text-gray-500">(Approximation based on monthly income)</p>
                  </div>
                </div>
              </Card>
              <Card>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">{"Total Expenses"}</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-700">{formatCurrency(amountSpent)}</p>
                    <p className="text-sm text-gray-500">({amountSpentPercentage}% of income)</p>
                  </div>
                </div>
              </Card>
              <Card>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">{"Revenue Expense Breakdown"}</h2>
                  <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-gray-700 dark:text-white">Essentials</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-white">{formatCurrency(essentialSum)} ({essentialPercentages}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                    <div className="bg-slate-700 text-xs font-medium text-blue-100 text-center p-1 leading-none rounded-full" style={{width: `${essentialPercentages || 0}%`}}></div>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-gray-700 dark:text-white">Non-Essentials</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-white">{formatCurrency(nonEssentialSum)} ({nonEssentialPercentages}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                    <div className="bg-slate-700 text-xs font-medium text-blue-100 text-center p-1 leading-none rounded-full" style={{width: `${nonEssentialPercentages || 0}%`}}></div>
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
            {(![90, 180, 365].includes(date.period) && date.type !== 'range') && (
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