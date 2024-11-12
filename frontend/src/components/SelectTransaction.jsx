import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

const SelectTransaction = ({ availableMonths, setDate, date }) => {
  const [selectedOption, setSelectedOption] = useState(date);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customType, setCustomType] = useState('month');
  const popoverRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsCustomOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const periods = [
    { label: '1M', value: '1M', description: 'Last month' },
    { label: '3M', value: '3M', description: 'Last 3 months' },
    { label: '6M', value: '6M', description: 'Last 6 months' },
    { label: '1Y', value: '1Y', description: 'Last year' },
    { label: 'Custom', value: 'custom', description: 'Select custom period' }
  ];

  const handlePeriodClick = (value) => {
    if (value === 'custom') {
      setIsCustomOpen(true);
    } else {
      setIsCustomOpen(false);
      setSelectedOption(value);
      setDate(value);
    }
  };

  const getCustomDropdownText = () => {
    if (customType === 'month') {
      if (date && selectedOption === 'custom') {
        return date;
      } else {
        return "Select Month"
      }
    }

    // You'll have to add custom logic down the line...
    if (customType === 'range') {
      return "Date Range"
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Main period selector */}
      <div className="bg-gray-100 p-1 rounded-lg inline-flex">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => handlePeriodClick(period.value)}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${selectedOption === period.value && !isCustomOpen
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
            title={period.description}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Custom date selection dropdown */}
      <div className="relative" ref={popoverRef}>
        <button
          onClick={() => setIsCustomOpen(!isCustomOpen)}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${isCustomOpen 
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          <Calendar className="w-4 h-4" />
          {/* {customType === 'month' ? 'Select Month' : 'Date Range'} */}
          {getCustomDropdownText()}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCustomOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown content */}
        {isCustomOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
            {/* Toggle between month and range selection */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-md mb-4">
              <button
                onClick={() => setCustomType('month')}
                className={`
                  flex-1 px-3 py-1.5 rounded text-sm font-medium transition-all duration-200
                  ${customType === 'month'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                Month
              </button>
              <button
                onClick={() => setCustomType('range')}
                className={`
                  flex-1 px-3 py-1.5 rounded text-sm font-medium transition-all duration-200
                  ${customType === 'range'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                Date Range
              </button>
            </div>

            {/* Month selector */}
            {customType === 'month' && (
              <select 
                className="w-full rounded-md border border-gray-300 py-2 px-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  setDate(e.target.value);
                  setIsCustomOpen(false);
                  setSelectedOption("custom")
                }}
                value={date || ""}
              >
                <option value="">Select month...</option>
                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            )}

            {/* Date range selector */}
            {customType === 'range' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 px-3 py-2"
                    />
                  </div>
                </div>
                <button
                  className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Apply Range
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectTransaction;