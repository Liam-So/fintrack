import React, { useState } from 'react';

const TransactionReview = ({ transactions: initialTransactions, onSubmit }) => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [editingId, setEditingId] = useState(null);

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleSave = (id) => {
    setEditingId(null);
  };

  const handleChange = (id, field, value) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const handleSubmit = () => {
    onSubmit(transactions);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Review Transactions</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
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
                    transaction.date
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
                      value={transaction.category}
                      onChange={(e) => handleChange(transaction.id, 'category', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="food">Food</option>
                      <option value="transport">Transport</option>
                      <option value="utilities">Utilities</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    transaction.category
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
                    <button 
                      onClick={() => handleEdit(transaction.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <button 
          onClick={handleSubmit} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Submit Transactions
        </button>
      </div>
    </div>
  );
};

export default TransactionReview;