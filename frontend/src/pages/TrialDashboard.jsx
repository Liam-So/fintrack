import React, { useState, useEffect } from 'react'
import { postCalculateCategoryPercentages } from '../api/dashboardApi';
import DashboardUI from '../components/DashboardUI';

// TODO: refactor to optimize performance AND calculate percentages on the frontend (since it's a trial)
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
    return JSON.parse(window.sessionStorage.getItem("transactions"), (key, value) => {
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

  const groupedTransactions = () => {
    const transactions = getStoredTransactions();
    const groups = transactions.reduce((acc, transaction) => {
      // Extract YYYY-MM from the date
      const monthKey = transaction.date.substring(0, 7); // Format: YYYY-MM
      
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
  
      acc[monthKey].push(transaction);
      return acc;
    }, {});
  
    // Helper function to format YYYY-MM to 'MMM YYYY'
    const formatMonthKey = (monthKey) => {
      const [year, month] = monthKey.split("-");
      const date = new Date(year, month - 1); // Month is 0-based
      return date.toLocaleString("en-US", { month: "short", year: "numeric" });
    };
  
    // Sort months in descending order and format them
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a)) // Sort keys descending
      .reduce((acc, [key, value]) => {
        const formattedKey = formatMonthKey(key); // Format key
        acc[formattedKey] = value.sort((a, b) => b.date.localeCompare(a.date)); // Sort transactions by date descending
        return acc;
      }, {});
  };

  const filterTransactionsByPeriod = (transactions, periodInDays) => {
    const today = new Date();
    const cutoffDate = new Date(today.setDate(today.getDate() - periodInDays));
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= cutoffDate;
    });
  };
  

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const categories = JSON.parse(window.sessionStorage.getItem("categories"));
        const transactions = getStoredTransactions();
        const transactionsGroupedByMonth = groupedTransactions();
        
        setTransactionDates(Object.keys(transactionsGroupedByMonth));

        let newTransactions;

        if (["1M", "3M", "6M", "1Y"].includes(date)) {
          if (date === "1M") {
            newTransactions = filterTransactionsByPeriod(transactions, 30);
          }
          if (date === "3M") {
            newTransactions = filterTransactionsByPeriod(transactions, 90);
          }
          if (date === "6M") {
            newTransactions = filterTransactionsByPeriod(transactions, 180);
          }
          if (date === "1Y") {
            newTransactions = filterTransactionsByPeriod(transactions, 365);
          }
        } else {
          newTransactions = transactionsGroupedByMonth[date];
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