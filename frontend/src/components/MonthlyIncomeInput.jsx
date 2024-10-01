import React, { useState } from 'react';
import { DollarSign, ArrowRight } from 'lucide-react';

const MonthlyIncomeInput = ({ onNext }) => {
  const [income, setIncome] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(parseFloat(income));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white bg-opacity-10 p-10 rounded-2xl shadow-lg backdrop-blur-lg">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-extrabold text-white">Welcome aboard!</h2>
          <p className="mt-2 text-sm text-white text-opacity-80">Let's kickstart your financial journey</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <div className="relative">
              <label htmlFor="income" className="sr-only">Monthly Income</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-white text-opacity-80" aria-hidden="true" />
              </div>
              <input
                id="income"
                name="income"
                type="number"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border-2 border-white border-opacity-50 placeholder-white placeholder-opacity-70 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-lg"
                placeholder="Estimated monthly income"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-purple-600 bg-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition duration-150 ease-in-out"
            >
              Next
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MonthlyIncomeInput;