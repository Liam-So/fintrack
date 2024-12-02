import React, { useState, useEffect } from 'react'
import DashboardUI from '../components/DashboardUI';

const TrialDashboard = () => {
  const [shouldRefetchData, setShouldRefetchData] = useState(0);

  // Add one to month because it is zero indexed
  const [date, setDate] = useState({ type: 'preset_period', period: 30 });
  const [dashboardData, setDashboardData] = useState({
    transactions: [],
    categoryPercentages: {},
    amountSpent: 0,
    transactionDates: [],
  });

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

  const filterTransactionsByRange = (transactions, startDate, endDate) => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const categories = JSON.parse(window.sessionStorage.getItem("categories"));
        const transactions = getStoredTransactions();

        if (transactions) {
          const transactionsGroupedByMonth = groupedTransactions();

          let newTransactions;

          if (date.type === 'preset_period') {
            newTransactions = filterTransactionsByPeriod(transactions, date.period);
          } else if (date.type === 'month') {
            newTransactions = transactionsGroupedByMonth[date.period];
          } else {
            // fetch custom date range
            const [startDate, endDate] = date.period.split(",").map(d => new Date(d));
            newTransactions = filterTransactionsByRange(transactions, startDate, endDate);
          }

          const calculatedSums = newTransactions.reduce((acc, curr) => {
            const category = categories.filter(cat => cat.id === curr.category_id)[0].id || 'Unknown Category';
            const amount = parseFloat(curr.amount) || 0;
          
            acc[category] = (acc[category] || 0) + amount;
          
            return acc;
          }, {});
          
          const totalAmount = Object.values(calculatedSums).reduce((acc, curr) => acc + curr, 0).toFixed(2);

          setDashboardData({
            transactions: newTransactions,
            categoryPercentages: calculatedSums,
            amountSpent: totalAmount,
            transactionDates: Object.keys(transactionsGroupedByMonth),
          });
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
      }
    }
    
    fetchDashboardData();
  }, [date, shouldRefetchData]);
  

  return (
    <DashboardUI 
      transactions={dashboardData.transactions}
      categoryPercentages={dashboardData.categoryPercentages}
      amountSpent={dashboardData.amountSpent}
      date={date}
      setDate={setDate}
      transactionDates={dashboardData.transactionDates}
      handleSaveAction={handleSaveAction}
      handleDeleteAction={handleDeleteAction}
      handleAddAction={handleAddAction}
    />
  )
}

export default TrialDashboard