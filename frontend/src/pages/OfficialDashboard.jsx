import React, { useState, useEffect } from 'react';
import { deleteTransaction, fetchCategoryPercentages, fetchTransactions, postTransactions, updateTransaction } from '../api/dashboardApi';
import DashboardUI from '../components/DashboardUI';
import { useUser } from '../context/UserContext';

const OfficialDashboard = () => {
  const { user } = useUser();

  // Data to pass to DashboardUI component
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [categoryPercentages, setCategoryPercentages] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1); // pass this to DashboardUI

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user && user?.id) {
        try {
          const { data: getTransactions } = await fetchTransactions(user.id, month);
          const { transactions: fetchedTransactions } = getTransactions;
          setTransactions(fetchedTransactions);

          const { data: getCategoryPercentages } = await fetchCategoryPercentages(user.id, fetchedTransactions);
          setCategoryPercentages(getCategoryPercentages);

          const totalAmount = Object.values(getCategoryPercentages).reduce((acc, curr) => acc + curr, 0).toFixed(2);
          setMonthlyExpenses(totalAmount);
        } catch (error) {
          console.error('Error fetching transactions:', error);
        }
      }
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user, month]);

  const deleteUserTransaction = async (id) => {
    try {
      const response = await deleteTransaction(id);
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
        transactions={transactions}
        categoryPercentages={categoryPercentages}
        amountSpent={monthlyExpenses}
        month={month}
        setMonth={setMonth}
        handleSaveAction={updateUserTransaction}
        handleDeleteAction={deleteUserTransaction}
        handleAddAction={addUserTransaction}
      />
    </>
  )
}

export default OfficialDashboard