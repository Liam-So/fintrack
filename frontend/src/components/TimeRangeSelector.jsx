import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const TimeRangeSelector = ({ setSelectedRange, setStartDate, setEndDate, selectedRange, startDate, endDate }) => {
  const [showCustomDate, setShowCustomDate] = useState(false);

  const timeRanges = [
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '6M', value: '6M' },
    { label: '1Y', value: '1Y' },
    { label: 'ALL', value: 'ALL' },
  ];

  const handleCustomDateSubmit = (e) => {
    e.preventDefault();
    setSelectedRange('custom');
    setShowCustomDate(false);
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      {/* Time range buttons */}
      <div className="flex space-x-2">
        {timeRanges.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setSelectedRange(value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors
              ${selectedRange === value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
          >
            {label}
          </button>
        ))}
        
        {/* Custom date button */}
        <button
          onClick={() => setShowCustomDate(!showCustomDate)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2
            ${selectedRange === 'custom'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
        >
          <Calendar size={16} />
          <span>Custom</span>
        </button>
      </div>

      {/* Custom date picker */}
      {showCustomDate && (
        <form onSubmit={handleCustomDateSubmit} className="flex flex-col space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex space-x-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowCustomDate(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TimeRangeSelector;