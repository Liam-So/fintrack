import React, { useState, useEffect } from "react";
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
import { Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ChartDataLabels from "chartjs-plugin-datalabels";
import DonutChart from "../components/DonutChart";
import HorizontalBarChart from "../components/HorizontalBarChart";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { fetchCategoryPercentages, fetchTransactions, fetchTrialTransactions, fetchUserData, postCalculateCategoryPercentages, postNewUser } from "../api/dashboardApi";
import { formattedDate } from '../utils/util';

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

const Dashboard = ({ isTrialDashboard }) => {
  const [transactions, setTransactions] = useState([]);
  const [categoryPercentages, setCategoryPercentages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [amountSpent, setAmountSpent] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const { user, isAuthenticated, logout, isLoading } = useAuth0();
  const [isUserOnboarded, setIsUserOnboarded] = useState(true);

  // Add one to month because it is zero indexed
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);

  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  // Access the state
  const { state } = location;

  const verifyUserHasOnboarded = async (user, userData) => {
    if (userData.status === 200) {
      const { data } = userData;
      const hasMonthlyIncome = true ? "monthly_income" in data : false;
      setIsUserOnboarded(hasMonthlyIncome);
      setUserId(data.id);
      setMonthlyRevenue(data?.monthly_income);
    } else {
      // create user if they do not exist
      const postUser = await postNewUser(user);
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated && user) {
        try {
          const { data: userData } = await fetchUserData(user);
          setUserData(userData);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    const fetchTrialUser = async () => {
      const isStateSet = state ? true : false;
      setUserData(isStateSet);
      // setTransactions(state?.transactions || []);

      // const { data: postCategoryPercentages } = await postCalculateCategoryPercentages(
      //   state?.transactions || [],
      // );
      // setCategoryPercentages(postCategoryPercentages);

      // const totalAmount = Object.values(postCategoryPercentages)
      //   .reduce((acc, curr) => acc + curr, 0)
      //   .toFixed(2);

      // setAmountSpent(totalAmount);
      // setMonthlyRevenue(state?.income || 0);
    }

    // Only fetch if not trial dashboard
    if (!isLoading && !isTrialDashboard) {
      fetchUser();
    }  else {
      fetchTrialUser()
    }
  }, [isAuthenticated, isLoading, user]);


  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isTrialDashboard) {
        setMonthlyRevenue(userData?.monthly_income);
        
        try {
          const { data: getTransactions } = await fetchTransactions(userData.id, month);
          setTransactions(getTransactions.transactions);
          
          const { data: getCategoryPercentages } = await fetchCategoryPercentages(userData.id, getTransactions.transactions);
          setCategoryPercentages(getCategoryPercentages);

          const totalAmount = Object.values(getCategoryPercentages).reduce((acc, curr) => acc + curr, 0).toFixed(2);
          setAmountSpent(totalAmount);
        } catch (err) {
          console.error(err)
        }
      } else {
        const { data: newTransactions } = await fetchTrialTransactions(state?.transactions || [], month);
        setTransactions(newTransactions.transactions || []);
        console.log(state)

        const { data: postCategoryPercentages } = await postCalculateCategoryPercentages(
          newTransactions.transactions || [],
        );
        setCategoryPercentages(postCategoryPercentages);
  
        const totalAmount = Object.values(postCategoryPercentages)
          .reduce((acc, curr) => acc + curr, 0)
          .toFixed(2);
  
        setAmountSpent(totalAmount);
        setMonthlyRevenue(state?.income || 0);
      }
    }
    
    if (userData) {
      fetchDashboardData();
    }
  }, [userData, isTrialDashboard, month]);


  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} userId={userData?.id} />
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} logout={logout} />

        {/* Dashboard content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {isUserOnboarded ? (
            <DashboardContent 
              transactions={transactions}
              categoryPercentages={categoryPercentages}
              amountSpent={amountSpent}
              monthlyRevenue={monthlyRevenue}
              month={month}
              setMonth={setMonth}
            />
          ) : (
            <>
            <div className="flex flex-col items-center justify-center pt-8 gap-2">
              No data. Upload data to continue...
              <button onClick={() => navigate(`/onboard/${userId}`)} className="p-1 bg-gray-800 text-white rounded-md">Upload</button>
            </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const DashboardContent = ({ transactions, categoryPercentages, amountSpent, monthlyRevenue, month, setMonth }) => (
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
      <TransactionTable transactions={transactions} />
    </div>
)

const StatCard = ({ title, value, percentage }) => (
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

const TransactionTable = ({ transactions }) => (
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
                {formattedDate(new Date(transaction.date))}
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
)

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
        <button
          className="p-2 bg-gray-50 font-semibold rounded-xs shadow-sm text-sm"
          onClick={() => logout()}
        >
          Sign Out
        </button>
      </div>
    </div>
  </header>
);

export default Dashboard;
