import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Sidebar from '../components/Sidebar';
import { Edit2, Plus } from 'lucide-react';
import Card from "../components/Card";
import { useUser } from "../context/UserContext";
import { formatCurrency } from "../utils/util";

const Profile = () => {
  const { isLoading } = useAuth0();
  const { user, updateUserIncome, deleteUserCategory, updateUserCategories } = useUser();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [newIncome, setNewIncome] = useState(user.income);
  const [newCategory, setNewCategory] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState({});
  const [isEssential, setIsEssential] = useState(true);

  const handleIncomeSubmit = () => {
    try {
      updateUserIncome(newIncome);
      setIsEditingIncome(false);
    } catch (error) {
      console.error('Error updating user income:', error);
    }
  };

  const handleAddCategory = () => {
    try {
      updateUserCategories([{
        name: newCategory,
        essential: isEssential
      }]);
      setNewCategory('');
    } catch (error) {
      console.error('Error adding category:', error);
    }
  }

  const handleRemoveCategory = (category) => {
    try {
      deleteUserCategory(category);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }

  useEffect(() => {
    setCategories(user.categories);
  }, [user]);
  

  return (
    <div className='flex min-h-screen bg-custom'>
      <Sidebar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between py-4">
            <h2 className='text-2xl italic font-semibold text-gray-800'>
              Profile
            </h2>
          </div>
          
          {/* Profile Content */}
          <Card>
            {/* Profile Picture Section */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img 
                    src={user.picture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* User Info Section */}
            <div className="space-y-6">
              <div className="flex flex-col">
                <label className="text-sm text-gray-500">Email</label>
                <p className="text-lg font-medium">{user.email}</p>
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-500">Monthly Income</label>
                {isEditingIncome ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={newIncome}
                      onChange={(e) => setNewIncome(e.target.value)}
                      className="border rounded p-2 w-48"
                    />
                    <button
                      onClick={handleIncomeSubmit}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingIncome(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-medium">
                      {formatCurrency(user.income)}
                    </p>
                    <button
                      onClick={() => setIsEditingIncome(true)}
                      className="p-1 text-blue-500 hover:text-blue-600"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Categories Section */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-500 mb-2">Transaction Categories</label>
                <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(categories).map(([key, value]) => (
                  <div
                    key={key}
                    className={`px-3 py-1 rounded-full flex items-center gap-2 ${value.essential ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}
                  >
                    <span>{value.name}</span>
                    <button
                      onClick={() => handleRemoveCategory(Number(key))}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Add new category"
                    className="border rounded p-2 flex-1"
                  />
                  <select
                    value={isEssential}
                    onChange={(e) => setIsEssential(e.target.value === 'true')}
                    className="px-4 py-2 rounded border bg-transparent border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Essential</option>
                    <option value="false">Non-Essential</option>
                  </select>
                  <button
                    onClick={handleAddCategory}
                    className={`p-2 text-white rounded bg-slate-300 ${newCategory && ('bg-gray-900 hover:bg-gray-600 ')}`}
                    disabled={!newCategory}
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;