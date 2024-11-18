import { useState } from 'react'
import { useUser } from '../context/UserContext';
import TransactionTable from '../components/TransactionTable';
import { postTransactions } from '../api/dashboardApi';
import { useNavigate, useParams } from 'react-router-dom';
import FileUploader from '../components/FileUploader';

const OfficialFileUploader = () => {
  const [transactions, setTransactions] = useState([]);
  const { user } = useUser();
  const { id } = user;
  
  const navigate = useNavigate();

  const categories = user.categories;

  const handleSubmit = async () => {
    await postTransactions(transactions, id);
    navigate('/dashboard');
  }

  const handleDelete = (id) => {
    const filteredTransactions = transactions.filter(t => t.id !== id);
    setTransactions(filteredTransactions);
  }

  const handleSave = (id, transaction) => {
    const updatedTransactions = transactions.map(t => t.id === id ? { ...t, ...transaction } : t).sort((a, b) => new Date(b.date) - new Date(a.date));
    setTransactions(updatedTransactions);
  }

  const handleAdd = (newTransaction) => {
    const newTransactions = [...transactions, newTransaction].sort((a, b) => new Date(b.date) - new Date(a.date));
    setTransactions(newTransactions);
  }

  return (
    <>
      {transactions.length > 0 ? (
        <TransactionTable
          postedTransactions={transactions}
          handleSubmit={handleSubmit}
          handleDeleteAction={handleDelete}
          handleSaveAction={handleSave}
          handleAddAction={handleAdd}
        />
      ) : (
        <FileUploader
          categories={categories}
          setTransactions={setTransactions}
        />
      )}
    </>
  )
}

export default OfficialFileUploader