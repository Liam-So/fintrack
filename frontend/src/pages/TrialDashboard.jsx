import React, { useState, useEffect } from 'react'
import { useLocation } from "react-router-dom";
import { fetchTrialTransactions, postCalculateCategoryPercentages } from '../api/dashboardApi';
import DashboardUI from '../components/DashboardUI';
import { useUser } from '../context/UserContext';

const TrialDashboard = () => {
  const location = useLocation();
  const { state } = location;
  
  const { user } = useUser();

  const [transactions, setTransactions] = useState([]);
  const [categoryPercentages, setCategoryPercentages] = useState([]);
  const [amountSpent, setAmountSpent] = useState(0);

  // Add one to month because it is zero indexed
  const [month, setMonth] = useState(null);
  const [transactionDates, setTransactionDates] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { categories } = user;
        const { transactions } = state;

        const { data: sampleTransactions } = await fetchTrialTransactions(transactions);
        setTransactionDates(Object.keys(sampleTransactions));

        let newTransactions;

        if (month) {
          newTransactions = sampleTransactions[month];
        } else {
          // truncate to 50 transactions
          newTransactions = [].concat.apply([], Object.values(sampleTransactions)).slice(0, 50);
        }

        setTransactions(newTransactions);
        const { data: postCategoryPercentages } = await postCalculateCategoryPercentages(newTransactions, categories);
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
      month={month}
      setMonth={setMonth}
      transactionDates={transactionDates}
    />
  )
}

export default TrialDashboard