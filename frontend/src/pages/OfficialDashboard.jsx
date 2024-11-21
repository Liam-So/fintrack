import React, { useState, useEffect } from 'react';
import { deleteTransaction, fetchCategoryPercentages, fetchTransactionDates, fetchTransactions, postTransactions, updateTransaction } from '../api/dashboardApi';
import { useUser } from '../context/UserContext';
import DashboardUI from '../components/DashboardUI';

const OfficialDashboard = () => {
  const { user } = useUser();

  // Data to pass to DashboardUI component
  const [date, setDate] = useState({ type: 'preset_period', period: 30 });
  const [isTransactionsUpdated, setIsTransactionsUpdated] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    transactions: [],
    categoryPercentages: {},
    monthlyExpenses: 0,
    transactionDates: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user && user?.id) {
        try {
          const { data: getTransactions } = await fetchTransactions(user.id, date.type, date.period);
          const { transactions: fetchedTransactions } = getTransactions;
          const { data: getCategoryPercentages } = await fetchCategoryPercentages(user.id, fetchedTransactions);
          const totalAmount = Object.values(getCategoryPercentages).reduce((acc, curr) => acc + curr, 0).toFixed(2);
          const { data: dates } = await fetchTransactionDates(user.id);
          
          setDashboardData({
            transactions: fetchedTransactions,
            categoryPercentages: getCategoryPercentages,
            monthlyExpenses: totalAmount,
            transactionDates: dates,
          });
        } catch (error) {
          console.error('Error fetching transactions:', error);
        }
      }
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user, date, isTransactionsUpdated]);

  const deleteUserTransaction = async (id) => {
    try {
      const response = await deleteTransaction(id);
      setIsTransactionsUpdated(prev => !prev);
      if (response.status === 200) {
        console.log('Transaction deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  }

  const updateUserTransaction = async (id, updatedAttributes) => {
    try {
      const response = await updateTransaction(id, updatedAttributes);
      setIsTransactionsUpdated(prev => !prev);
      if (response.status === 200) {
        console.log('Transaction updated successfully');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  }

  const addUserTransaction = async (newTransaction) => {
    try {
      const response = await postTransactions([newTransaction], user.id);
      setIsTransactionsUpdated(prev => !prev);
      if (response.status === 200) {
        console.log('Transaction added successfully');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  }

  return (
    <>
      <DashboardUI
        transactions={dashboardData?.transactions}
        categoryPercentages={dashboardData?.categoryPercentages}
        amountSpent={dashboardData?.monthlyExpenses}
        date={date}
        setDate={setDate}
        handleSaveAction={updateUserTransaction}
        handleDeleteAction={deleteUserTransaction}
        handleAddAction={addUserTransaction}
        transactionDates={dashboardData?.transactionDates}
      />
    </>
  )
}

export default OfficialDashboard