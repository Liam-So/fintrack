import React, { useState, useEffect } from 'react'
import { useLocation } from "react-router-dom";
import { fetchTrialTransactions, postCalculateCategoryPercentages } from '../api/dashboardApi';
import DashboardUI from '../components/DashboardUI';

const TrialDashboard = () => {
  const location = useLocation();
  const { state } = location;

  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [categoryPercentages, setCategoryPercentages] = useState([]);
  const [amountSpent, setAmountSpent] = useState(0);

  // Add one to month because it is zero indexed
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { income, categories, transactions } = state;
        setMonthlyIncome(income);
        const { data: newTransactions } = await fetchTrialTransactions(transactions, month);
        setTransactions(newTransactions.transactions);

        const { data: postCategoryPercentages } = await postCalculateCategoryPercentages(newTransactions.transactions, categories);
        setCategoryPercentages(postCategoryPercentages);

        const totalAmount = Object.values(postCategoryPercentages).reduce((acc, curr) => acc + curr, 0).toFixed(2);
        setAmountSpent(totalAmount);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      }
    }
    
      fetchDashboardData();
  }, [state, month]);
  

  return (
    <DashboardUI 
      transactions={transactions}
      categoryPercentages={categoryPercentages}
      amountSpent={amountSpent}
      monthlyRevenue={monthlyIncome}
      month={month}
      setMonth={setMonth}
      categories={state.categories}
    />
  )
}

export default TrialDashboard