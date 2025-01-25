import React, { useState } from 'react';
import { X, Plus, ArrowRight, ArrowLeft, Search } from 'lucide-react';

const defaultCategories = [
  { "id": 1, "name": "Groceries", "essential": true, "color": "hsl(221, 92%, 68%)" },
  { "id": 2, "name": "Rent", "essential": true, "color": "hsl(234, 74%, 70%)" },
  { "id": 3, "name": "Utilities", "essential": true, "color": "hsl(238, 90%, 66%)" },
  { "id": 4, "name": "Dining Out", "essential": false, "color": "hsl(359, 84%, 75%)" },
  { "id": 5, "name": "Drinks", "essential": false, "color": "hsl(204, 70%, 79%)" },
  { "id": 6, "name": "Entertainment", "essential": false, "color": "hsl(350, 76%, 70%)" },
  { "id": 7, "name": "Shopping", "essential": false, "color": "hsl(16, 82%, 76%)" },
  { "id": 8, "name": "Transportation", "essential": true, "color": "hsl(39, 86%, 79%)" },
  { "id": 9, "name": "Health", "essential": true, "color": "hsl(29, 85%, 68%)" },
  { "id": 10, "name": "Education", "essential": true, "color": "hsl(341, 75%, 70%)" },
  { "id": 11, "name": "Travel", "essential": false, "color": "hsl(219, 71%, 64%)" },
  { "id": 12, "name": "Cell Phone", "essential": true, "color": "hsl(72, 93%, 77%)" },
  { "id": 13, "name": "Insurance", "essential": true, "color": "hsl(59, 85%, 73%)" },
  { "id": 14, "name": "Pet Care", "essential": false, "color": "hsl(72, 70%, 79%)" },
  { "id": 15, "name": "Repairs", "essential": true, "color": "hsl(25, 83%, 66%)" },
  { "id": 16, "name": "Clothing", "essential": false, "color": "hsl(260, 92%, 80%)" },
  { "id": 17, "name": "Subscriptions", "essential": false, "color": "hsl(43, 87%, 72%)" }
]


const CategorySelection = ({ availableCategories = defaultCategories, onSend, isTrial }) => {
  const [categories, setCategories] = useState(availableCategories);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isEssential, setIsEssential] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        id: Math.max(...categories.map(c => c.id)) + 1,
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
  };

  const renderCategoryList = (isEssential) => {
    const filteredList = filteredCategories.filter((category) => category.essential === isEssential);
    
    if (filteredList.length === 0) {
      return (
        <div className="bg-gray-50 p-4 rounded-lg text-gray-500 text-center">
          No {isEssential ? 'essential' : 'non-essential'} categories found
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {filteredList.map((category) => (
          <div key={category.id} className="flex items-center gap-2">
            <button
              className={`flex-grow text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedCategories.some((c) => c.id === category.id)
                  ? isEssential
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : isEssential
                  ? 'border border-gray-200 hover:bg-green-50 text-green-700'
                  : 'border border-gray-200 hover:bg-yellow-50 text-yellow-700'
              }`}
              onClick={() => toggleCategory(category)}
            >
              {category.name}
            </button>
            <button
              onClick={() => moveCategory(category, !isEssential)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {isEssential ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={() => deleteCategory(category)}
              className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-700">Select Your Categories</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Selected Categories</h2>
        <div className="flex flex-wrap gap-2">
          {selectedCategories.length === 0 ? (
            <p className="text-gray-500">No categories selected</p>
          ) : (
            selectedCategories.map((category) => (
              <span
                key={category.id}
                onClick={() => toggleCategory(category)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors duration-200 ${
                  category.essential 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                {category.name}
                <X className="ml-1.5 w-3 h-3" />
              </span>
            ))
          )}
        </div>
      </div>

      {!isTrial && (
        <div className="rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Add Custom Category</h2>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              className="flex-grow px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={isEssential.toString()}
              onChange={(e) => setIsEssential(e.target.value === 'true')}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="true">Essential</option>
              <option value="false">Non-Essential</option>
            </select>
            <button
              onClick={addCustomCategory}
              className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-green-700">Essential Categories</h2>
          {renderCategoryList(true)}
        </div>

        <div className="rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-yellow-700">Non-Essential Categories</h2>
          {renderCategoryList(false)}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => onSend(selectedCategories)}
          disabled={selectedCategories.length === 0}
          className={`px-8 py-3 rounded-2xl font-medium transition-colors duration-200 ${
            selectedCategories.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-700 text-white hover:bg-gray-800'
          }`}
        >
          Send Selected Categories
        </button>
      </div>
    </div>
  );
};

export default CategorySelection;