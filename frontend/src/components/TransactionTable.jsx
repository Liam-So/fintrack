import React, { useState, useEffect } from 'react';
import { PlusCircle, Send, Pencil, Trash2 } from 'lucide-react';
import AddTransactionModal from './AddTransactionModal';
import { formattedDate } from '../utils/util';
import { useUser } from '../context/UserContext';

// Assign these colours to higher-order components
const CategoryBadge = ({ category }) => {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-semibold";
  const categoryColors = {
    food: "bg-green-100 text-green-800",
    transport: "bg-blue-100 text-blue-800",
    utilities: "bg-yellow-100 text-yellow-800",
    entertainment: "bg-purple-100 text-purple-800",
    other: "bg-gray-100 text-gray-800"
  };

  return (
    <span className={`${baseClasses} ${categoryColors[category] || categoryColors.other}`}>
      {category}
    </span>
  );
};

const TransactionTable = ({ postedTransactions = [], handleSubmit, handleSaveAction = () => {}, handleDeleteAction = () => {}, handleAddAction = () => {}}) => {
  const [editingId, setEditingId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactions, setTransactions] = useState(postedTransactions);

  const { user } = useUser();
  
  const categories = Object.keys(user?.categories).length > 0 
    ? user.categories 
    : JSON.parse(window.sessionStorage.getItem('categories'));
  

  useEffect(() => {
    setTransactions(postedTransactions);
  }, [postedTransactions]);

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
    handleDeleteAction(id);
  }

  const handleSave = (id) => {
    setEditingId(null);
    const newTransaction = transactions.find(t => t.id === id);
    handleSaveAction(id, newTransaction);
  };

  const handleChange = (id, field, value) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const handleAddTransaction = (newTransaction) => {
    const newDate = new Date(newTransaction.date).toISOString().split('T')[0];
    newTransaction.date = newDate;
    setTransactions([...transactions, newTransaction]);
    handleAddAction(newTransaction);
    setIsAddModalOpen(false);
  };

  return (
    <div className="container mx-auto p-6 mt-4 rounded-lg shadow-sm outline outline-1 outline-stone-200">
      <div className='flex justify-between pb-2 h-10'>
        <h1 className="text-2xl font-semibold mb-4 text-gray-700">Review Transactions</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircle className="mr-2 h- w-4" /> Add Transaction
        </button>
      </div>
      <div className="overflow-x-auto pt-2">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map(transaction => (
              <tr key={transaction.id}> 
                <td className="px-6 py-4 whitespace-nowrap border-b">
                  {editingId === transaction.id ? (
                    <input 
                      type="date" 
                      value={transaction.date} 
                      onChange={(e) => handleChange(transaction.id, 'date', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    formattedDate(new Date(transaction?.date))
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b">
                  {editingId === transaction.id ? (
                    <input 
                      type="text"
                      value={transaction.description} 
                      onChange={(e) => handleChange(transaction.id, 'description', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    transaction.description
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b">
                  {editingId === transaction.id ? (
                    <input 
                      type="number" 
                      value={transaction.amount} 
                      onChange={(e) => handleChange(transaction.id, 'amount', parseFloat(e.target.value))}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    `$${transaction.amount}`
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b">
                  {editingId === transaction.id ? (
                    <select 
                      value={transaction.category_id}
                      onChange={(e) => handleChange(transaction.id, 'category_id', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.keys(categories).map((category_id) => (
                        <option key={category_id} value={category_id}>
                          {categories[category_id]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <CategoryBadge category={categories[transaction.category_id]} />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium border-b">
                  {editingId === transaction.id ? (
                    <button 
                      onClick={() => handleSave(transaction.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Save
                    </button>
                  ) : (
                    <div className='flex justify-between'>
                      <button 
                        onClick={() => handleEdit(transaction.id)}
                        className="inline-flex items-center text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(transaction.id)}
                        className="inline-flex items-center text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTransaction}
        categories={categories}
      />

      {handleSubmit && (
        <div className="flex pt-8">
          <button
            onClick={handleSubmit}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Send className="mr-2 h-4 w-4" /> Send Transactions
          </button>
        </div>
      )}
    </div>
  )
}

export default TransactionTable