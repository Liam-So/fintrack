import React, { useState, useEffect } from 'react'
import { fetchTrialTransactions, postCalculateCategoryPercentages } from '../api/dashboardApi';
import DashboardUI from '../components/DashboardUI';

const TrialDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [categoryPercentages, setCategoryPercentages] = useState([]);
  const [amountSpent, setAmountSpent] = useState(0);
  const [shouldRefetchData, setShouldRefetchData] = useState(0);

  // Add one to month because it is zero indexed
  const [date, setDate] = useState("1M");
  const [transactionDates, setTransactionDates] = useState([]);

  // Create a reviver function to parse the amount as a float
  const getStoredTransactions = () => {
    return JSON.parse(sessionStorage.getItem("transactions"), (key, value) => {
      if (key === "amount") {
        return parseFloat(value);
      }
      return value;
    });
  }

  const handleDeleteAction = (id) => {
    const transactions = getStoredTransactions();
    window.sessionStorage.setItem("transactions", JSON.stringify(transactions.filter(t => t.id !== id)));
    setShouldRefetchData(prev => prev + 1);
  }

  const handleSaveAction = (id, transaction) => {
    // NOTE: There seems to be a casting issue with the transaction
    const transactions = getStoredTransactions();
    const newTransactions = transactions.map(t => t.id === id ? { ...t, ...transaction } : t);
    window.sessionStorage.setItem("transactions", JSON.stringify(newTransactions));
    setShouldRefetchData(prev => prev + 1);
  }

  const handleAddAction = (transaction) => {
    const transactions = getStoredTransactions();
    window.sessionStorage.setItem("transactions", JSON.stringify([...transactions, transaction]));
    setShouldRefetchData(prev => prev + 1);
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const categories = JSON.parse(window.sessionStorage.getItem("categories"));
        const transactions = getStoredTransactions();
        const { data: sampleTransactions } = await fetchTrialTransactions(transactions, date);
        
        setTransactionDates(Object.keys(sampleTransactions));

        let newTransactions;

        if (["1M", "3M", "6M", "1Y"].includes(date)) {
          newTransactions = [].concat.apply([], Object.values(sampleTransactions));
        } else {
          newTransactions = sampleTransactions[date];
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
  }, [date, shouldRefetchData]);
  

  return (
    <DashboardUI 
      transactions={transactions}
      categoryPercentages={categoryPercentages}
      amountSpent={amountSpent}
      date={date}
      setDate={setDate}
      transactionDates={transactionDates}
      handleSaveAction={handleSaveAction}
      handleDeleteAction={handleDeleteAction}
      handleAddAction={handleAddAction}
    />
  )
}

export default TrialDashboard