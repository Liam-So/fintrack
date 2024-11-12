import React, { useState, useEffect } from 'react';
import { deleteTransaction, fetchCategoryPercentages, fetchTransactionDates, fetchTransactions, postTransactions, updateTransaction } from '../api/dashboardApi';
import { useUser } from '../context/UserContext';
import NewDashboard from './NewDashboard';

const OfficialDashboard = () => {
  const { user } = useUser();

  // Data to pass to DashboardUI component
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [categoryPercentages, setCategoryPercentages] = useState([]);
  const [date, setDate] = useState("1M");
  const [isTransactionsUpdated, setIsTransactionsUpdated] = useState(false);
  const [transactionDates, setTransactionDates] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user && user?.id) {
        try {
          const { data: getTransactions } = await fetchTransactions(user.id, date);
          const { transactions: fetchedTransactions } = getTransactions;
          setTransactions(fetchedTransactions);

          const { data: getCategoryPercentages } = await fetchCategoryPercentages(user.id, fetchedTransactions);
          setCategoryPercentages(getCategoryPercentages);

          const totalAmount = Object.values(getCategoryPercentages).reduce((acc, curr) => acc + curr, 0).toFixed(2);
          setMonthlyExpenses(totalAmount);

          const { data: dates } = await fetchTransactionDates(user.id);
          setTransactionDates(dates);
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
      <NewDashboard
        transactions={transactions}
        categoryPercentages={categoryPercentages}
        amountSpent={monthlyExpenses}
        date={date}
        setDate={setDate}
        handleSaveAction={updateUserTransaction}
        handleDeleteAction={deleteUserTransaction}
        handleAddAction={addUserTransaction}
        transactionDates={transactionDates}
      />
    </>
  )
}

export default OfficialDashboard