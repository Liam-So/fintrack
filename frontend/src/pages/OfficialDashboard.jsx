import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { fetchCategoryPercentages, fetchTransactions, fetchUserData } from '../api/dashboardApi';
import DashboardUI from '../components/DashboardUI';

const OfficialDashboard = () => {
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, logout, isLoading } = useAuth0();
  const [userData, setUserData] = useState({});

  // Data to pass to DashboardUI component
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [categoryPercentages, setCategoryPercentages] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1); // pass this to DashboardUI

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated && user) {
        try {
          const { data: userData } = await fetchUserData(user);
          setUserData(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    if (!isLoading) {
      fetchUser();
    } 

  }, [isAuthenticated, isLoading, user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (userData && userData?.id) {
        setMonthlyIncome(userData.monthly_income);
        const { id: userId } = userData;

        try {
          const { data: getTransactions } = await fetchTransactions(userId, month);
          const { transactions: fetchedTransactions } = getTransactions;
          setTransactions(fetchedTransactions);

          const { data: getCategoryPercentages } = await fetchCategoryPercentages(userId, fetchedTransactions);
          console.log(getCategoryPercentages);
          
          setCategoryPercentages(getCategoryPercentages);

          const totalAmount = Object.values(getCategoryPercentages).reduce((acc, curr) => acc + curr, 0).toFixed(2);
          setMonthlyExpenses(totalAmount);
        } catch (error) {
          console.error('Error fetching transactions:', error);
        }
      }
    }

    if (userData) {
      fetchDashboardData();
    }
  }, [userData, month]);

  return (
    <>
    {loading ? (
      <div>Loading...</div>
    ): (
      <DashboardUI 
        transactions={transactions}
        categoryPercentages={categoryPercentages}
        amountSpent={monthlyExpenses}
        monthlyRevenue={monthlyIncome}
        userData={userData}
        logout={logout}
        month={month}
        setMonth={setMonth}
      />
    )}
    </>
  )
}

export default OfficialDashboard