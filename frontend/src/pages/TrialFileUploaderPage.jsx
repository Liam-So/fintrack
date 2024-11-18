import { useState } from 'react'
import FileUploader from '../components/FileUploader';
import TransactionTable from '../components/TransactionTable';
import { useNavigate } from 'react-router-dom';

const TrialFileUploaderPage = () => {
  const [transactions, setTransactions] = useState([]);
  const session = window.sessionStorage.getItem("session");
  const categories = JSON.parse(window.sessionStorage.getItem("categories"));
  const navigate = useNavigate();

  const handleSubmit = () => {
    window.sessionStorage.setItem("transactions", JSON.stringify(transactions));
    navigate(`/trial/dashboard`);
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
    <div className='bg-custom py-4'>
      {session && (
        transactions.length > 0 ? (
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
        )
      )}
    </div>
  )
}

export default TrialFileUploaderPage