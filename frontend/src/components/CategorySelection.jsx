import React, { useState, useEffect } from 'react';
import { Check, Plus, X } from 'lucide-react';

const initialCategories = [
  { id: 1, name: 'Rent', icon: '🏠' },
  { id: 2, name: 'Restaurants', icon: '🍽️' },
  { id: 3, name: 'Drinks', icon: '🍷' },
  { id: 4, name: 'Groceries', icon: '🛒' },
  { id: 5, name: 'Transportation', icon: '🚗' },
  { id: 6, name: 'Utilities', icon: '💡' },
  { id: 7, name: 'Entertainment', icon: '🎭' },
  { id: 8, name: 'Shopping', icon: '🛍️' },
  { id: 9, name: 'Health', icon: '💪' },
  { id: 10, name: 'Travel', icon: '✈️' },
  { id: 11, name: 'Education', icon: '📚' },
];

const CategorySelection = ({ onComplete }) => {
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    console.log(selectedCategories);
  }, [selectedCategories])

  const toggleCategory = (categoryId, categoryName) => {
    setSelectedCategories(prevCategories => {
      const isCategorySelected = !!prevCategories[categoryId];
  
      if (isCategorySelected) {
        // remove category from selectedCategories
        const { [categoryId]: _, ...remainingCategories } = prevCategories;
        return remainingCategories;
      }
  
      return { ...prevCategories, [categoryId]: categoryName };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(selectedCategories);
  };

  const addCustomCategory = () => {
    // TODO: Ensure no duplicates
    const customCategory = newCategory.trim();
    if (customCategory) {
      const newId = customCategory;
      setCategories([...categories, { id: newId, name: newId, icon: '🔹' }]);
      setSelectedCategories([...selectedCategories, newId]);
      setNewCategory('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full space-y-8 bg-white bg-opacity-10 p-10 rounded-2xl shadow-lg backdrop-blur-lg">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-extrabold text-white">Customize Your Expense Tracking</h2>
          <p className="mt-2 text-sm text-white text-opacity-80">Select or add categories you'd like to monitor</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id, category.name)}
                className={`relative px-6 py-4 border-2 rounded-lg text-left focus:outline-none transition-all duration-200 ease-in-out ${
                  category.id in selectedCategories
                    ? 'bg-white bg-opacity-20 border-white text-white'
                    : 'border-white border-opacity-30 text-white text-opacity-70 hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <span className="text-2xl mr-2">{category.icon}</span>
                {category.name}
                {category.id in selectedCategories && (
                  <Check className="absolute top-2 right-2 h-5 w-5 text-white" />
                )}
              </button>
            ))}
            <div className="relative">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add custom category"
                className="w-full px-6 py-4 border-2 border-white border-opacity-30 rounded-lg bg-transparent text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-white"
              />
              <button
                type="button"
                onClick={addCustomCategory}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white opacity-70 hover:opacity-100"
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-purple-600 bg-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition duration-150 ease-in-out"
            >
              Complete Setup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategorySelection;