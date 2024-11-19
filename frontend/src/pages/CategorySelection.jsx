import React, { useState } from 'react';
import { X, Plus, ArrowRight, ArrowLeft } from 'lucide-react';

const defaultCategories = [
  { "id": 1, "name": "🛒 Groceries", essential: true },
  { "id": 2, "name": "🏠 Rent", essential: true },
  { "id": 3, "name": "💡 Utilities", essential: true },
  { "id": 4, "name": "🍽️ Dining Out", essential: false },
  { "id": 5, "name": "🎭 Entertainment", essential: false },
  { "id": 6, "name": "🛍️ Shopping", essential: false },
  { "id": 7, "name": "🚗 Transportation", essential: true },
  { "id": 8, "name": "💪🏼 Health", essential: true },
  { "id": 9, "name": "📚 Education", essential: true },
  { "id": 10, "name": "✈️ Travel", essential: false },
  { "id": 11, "name": "📱 Cell Phone", essential: true },
  { "id": 12, "name": "💊 Insurance", essential: true },
  { "id": 13, "name": "🐾 Pet Care", essential: false },
  { "id": 14, "name": "🔧 Repairs", essential: true },
  { "id": 15, "name": "👗 Clothing", essential: false },
  { "id": 16, "name": "📦 Subscriptions", essential: false }
];



const CategorySelection = ({ availableCategories = defaultCategories, onSend }) => {
  const [categories, setCategories] = useState(availableCategories);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isEssential, setIsEssential] = useState(true);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.some((c) => c.id === category.id)
        ? prev.filter((c) => c.id !== category.id)
        : [...prev, category]
    );
  };

  const moveCategory = (category, toEssential) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === category.id ? { ...c, essential: toEssential } : c
      )
    );
  };

  const addCustomCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        name: newCategoryName.trim(),
        essential: isEssential,
      };
      setCategories((prev) => [...prev, newCategory]);
      setNewCategoryName('');
    }
  };

  const deleteCategory = (category) => {
    setCategories((prev) => prev.filter((c) => c.id !== category.id));
    setSelectedCategories((prev) =>
      prev.filter((c) => c.id !== category.id)
    );
  }

  const handleSend = () => {
    if (onSend) {
      onSend(selectedCategories);
    } else {
      console.log('Selected categories:', selectedCategories);
    }
  };


  const renderCategoryList = (isEssential) => (
    <div className="space-y-3">
      {categories
        .filter((category) => category.essential === isEssential)
        .map((category) => (
          <div key={category.id} className="flex items-center space-x-2">
            <button
              onClick={() => toggleCategory(category)}
              className={`flex-grow px-4 py-2 text-left rounded ${
                selectedCategories.some((c) => c.id === category.id)
                  ? isEssential
                    ? 'bg-green-500 text-white'
                    : 'bg-yellow-500 text-white'
                  : isEssential
                  ? 'bg-transparent outline outline-1 outline-stone-200 text-green-700 hover:bg-green-100'
                  : 'bg-transparent outline outline-1 outline-stone-200 text-yellow-700 hover:bg-yellow-100'
              } transition-colors duration-200`}
            >
              {category.name}
            </button>
            <button
              onClick={() => moveCategory(category, !isEssential)}
              className="p-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
            >
              {isEssential ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            </button>
            <button
              onClick={() => deleteCategory(category)}
              className="p-2 rounded bg-gray-200 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors duration-200"
            >
              <X size={16} />
            </button>
          </div>
        ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Categorize Your Transactions</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">Selected Categories:</h2>
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <span
              key={category.id}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                category.essential ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
              }`}
            >
              {category.name}
              <button
                onClick={() => toggleCategory(category)}
                className="ml-2 focus:outline-none"
              >
                <X size={16} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">Add Custom Category:</h2>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name"
            className="flex-grow px-4 py-2 rounded border border-stone-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            onClick={addCustomCategory}
            className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-2 text-green-700">Essential Categories</h2>
          {renderCategoryList(true)}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2 text-yellow-700">Non-Essential Categories</h2>
          {renderCategoryList(false)}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSend}
          disabled={selectedCategories.length === 0}
          className={`px-6 py-3 rounded-lg text-white font-medium ${
            selectedCategories.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          } transition-colors duration-200`}
        >
          Send Selected Categories
        </button>
      </div>
    </div>
  );
};

export default CategorySelection;